import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  ChevronLeft, Search, Filter, ArrowUpRight, ArrowDownRight, 
  Calendar as CalendarIcon, Coffee, Plane, ShoppingBag, Zap, Wallet, 
  Briefcase, DollarSign, TrendingUp, Gift, Heart, MoreHorizontal,
  ChevronRight, ChevronLeft as ChevronLeftIcon, Sparkles, X, LayoutGrid,
  User as UserIcon, ArrowRightLeft, HandCoins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { 
  format, isToday, isYesterday, isSameDay 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarGrid from '../components/CalendarGrid';

const RecentActivity = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [activities, setActivities] = useState([]); // Full list for calendar dots
  const [pagedActivities, setPagedActivities] = useState([]); // Paginated list for display
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filter, setFilter] = useState('All');

  // Fetch dots (all activity but small payload or just dates)
  const fetchAllForDots = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/stats/activity?limit=2000`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setActivities(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch paginated list
  const fetchPagedActivity = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) setLoadMoreLoading(true);
    else setLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/api/stats/activity?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const newResults = response.data.results;
      if (isLoadMore) {
        setPagedActivities(prev => [...prev, ...newResults]);
      } else {
        setPagedActivities(newResults);
      }
      
      setHasMore(pageNum < response.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    fetchAllForDots();
    fetchPagedActivity(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPagedActivity(nextPage, true);
  };

  const getTheme = (tx) => {
    if (tx.type === 'income') {
      switch(tx.category) {
        case 'Salary': return { icon: <Briefcase size={18}/>, color: 'text-emerald-500', bg: 'bg-emerald-100/50 dark:bg-emerald-500/20' };
        case 'Freelance': return { icon: <DollarSign size={18}/>, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-500/20' };
        case 'Investment': return { icon: <TrendingUp size={18}/>, color: 'text-indigo-500', bg: 'bg-indigo-100/50 dark:bg-indigo-500/20' };
        case 'Gift': return { icon: <Gift size={18}/>, color: 'text-pink-500', bg: 'bg-pink-100/50 dark:bg-pink-500/20' };
        case 'Business': return { icon: <Sparkles size={18}/>, color: 'text-amber-500', bg: 'bg-amber-100/50 dark:bg-amber-500/20' };
        default: return { icon: <Heart size={18}/>, color: 'text-slate-500', bg: 'bg-slate-100/50 dark:bg-slate-500/20' };
      }
    } else if (tx.type === 'expense') {
      switch(tx.category) {
        case 'Food': return { icon: <Coffee size={18}/>, color: 'text-orange-500', bg: 'bg-orange-100/50 dark:bg-orange-500/20' };
        case 'Travel': return { icon: <Plane size={18}/>, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-500/20' };
        case 'Shopping': return { icon: <ShoppingBag size={18}/>, color: 'text-pink-500', bg: 'bg-pink-100/50 dark:bg-pink-500/20' };
        case 'Bills': return { icon: <Zap size={18}/>, color: 'text-yellow-500', bg: 'bg-yellow-100/50 dark:bg-yellow-500/20' };
        default: return { icon: <Wallet size={18}/>, color: 'text-indigo-500', bg: 'bg-indigo-100/50 dark:bg-indigo-500/20' };
      }
    } else {
      // Lending
      switch(tx.category) {
        case 'Lent': return { icon: <HandCoins size={18}/>, color: 'text-rose-500', bg: 'bg-rose-100/50 dark:bg-rose-500/20' };
        case 'Borrowed': return { icon: <ArrowRightLeft size={18}/>, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-500/20' };
        case 'Repayment_Received': return { icon: <TrendingUp size={18}/>, color: 'text-emerald-500', bg: 'bg-emerald-100/50 dark:bg-emerald-500/20' };
        default: return { icon: <UserIcon size={18}/>, color: 'text-slate-500', bg: 'bg-slate-100/50 dark:bg-slate-500/20' };
      }
    }
  };

  const getDayActivities = (day) => {
    return activities.filter(act => isSameDay(new Date(act.date), day));
  };

  const displayActivities = selectedDate 
    ? getDayActivities(selectedDate)
    : pagedActivities;

  const filteredDisplay = displayActivities.filter(act => {
    if (filter === 'All') return true;
    if (filter === 'Lending') return act.type === 'lending';
    return act.type === filter.toLowerCase();
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 pt-4 px-4 space-y-8">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activity Hub</h1>
        <div className="w-10" />
      </header>

      {/* Collapsible Calendar Grid */}
      <CalendarGrid 
        activities={activities} 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate}
      />

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        {['All', 'Income', 'Expense', 'Lending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
              filter === f 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-95' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Recent Entries'}
          </h3>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="text-[10px] font-bold text-indigo-600 hover:underline">
              Show Recents
            </button>
          )}
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] animate-pulse" />)
          ) : filteredDisplay.length > 0 ? (
            <>
              {filteredDisplay.map((act, idx) => {
                const theme = getTheme(act);
                return (
                  <motion.div 
                    key={act._id + idx}
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.bg} ${theme.color} group-hover:scale-110 transition-transform`}>
                        {theme.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{act.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {act.category.replace('_', ' ')} • {format(new Date(act.date), 'MMM dd, hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-base ${act.type === 'income' || act.category === 'Repayment_Received' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(act.type === 'income' || act.category === 'Repayment_Received' || act.category === 'Borrowed') ? '+' : '-'}{formatCurrency(act.amount)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              
              {!selectedDate && hasMore && (
                <button 
                  onClick={handleLoadMore}
                  disabled={loadMoreLoading}
                  className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 mt-4 shadow-sm flex items-center justify-center gap-2"
                >
                  {loadMoreLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : 'Load More Entries'}
                </button>
              )}
            </>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <LayoutGrid size={24} />
              </div>
              <p className="text-slate-500 font-medium">No activity found.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RecentActivity;
