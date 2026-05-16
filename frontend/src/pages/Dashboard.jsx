import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Eye, EyeOff, ChevronRight, Activity, 
  CreditCard, Coffee, Plane, ShoppingBag, Zap, Wallet,
  Sparkles, Trash2, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Edit2, X, TrendingUp, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SmartEntryModal from '../components/SmartEntryModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [isSmartEntryOpen, setIsSmartEntryOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [range, setRange] = useState('week');
  const [activeTrend, setActiveTrend] = useState('expenses');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const { user } = useSelector((state) => state.auth);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', amount: '', category: '', date: '' });

  const fetchStats = async () => {
    try {
      let url = `/api/stats/dashboard?range=${range}`;
      if (range === 'custom' && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(response.data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Connection lost');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (range === 'custom') {
        if (customDates.start && customDates.end) fetchStats();
      } else {
        fetchStats();
      }
    }
  }, [user, range, customDates]);

  const getCategoryTheme = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'food': return { icon: <Coffee size={20}/>, color: 'text-orange-500', bg: 'bg-orange-100/50 dark:bg-orange-500/20' };
      case 'travel': return { icon: <Plane size={20}/>, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-500/20' };
      case 'shopping': return { icon: <ShoppingBag size={20}/>, color: 'text-pink-500', bg: 'bg-pink-100/50 dark:bg-pink-500/20' };
      case 'bills': return { icon: <Zap size={20}/>, color: 'text-yellow-500', bg: 'bg-yellow-100/50 dark:bg-yellow-500/20' };
      default: return { icon: <Wallet size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-100/50 dark:bg-indigo-500/20' };
    }
  };

  const handleEdit = (tx, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingTx(tx);
    setEditFormData({
      title: tx.title,
      amount: tx.amount,
      category: tx.category,
      date: format(new Date(tx.date), 'yyyy-MM-dd')
    });
    setShowEditModal(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingTx.type === 'income' ? 'income' : editingTx.type === 'lending' ? 'lending' : 'expenses';
      await axios.put(`/api/${endpoint}/${editingTx._id}`, editFormData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Updated successfully');
      setShowEditModal(false);
      fetchStats();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = (tx, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    toast((t) => (
      <div className="w-[300px] flex flex-col gap-3 p-1">
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Delete Record?</p>
          <p className="text-xs text-slate-400">Are you sure you want to delete "{tx.title}"?</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={async () => {
              try {
                const endpoint = tx.type === 'income' ? 'income' : tx.type === 'lending' ? 'lending' : 'expenses';
                await axios.delete(`/api/${endpoint}/${tx._id}`, {
                  headers: { Authorization: `Bearer ${user.token}` }
                });
                toast.dismiss(t.id);
                toast.success('Deleted successfully');
                fetchStats();
              } catch (err) {
                toast.error('Failed to delete');
              }
            }}
            className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-rose-600 transition-colors"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-2 bg-white/10 text-slate-300 rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { type: "spring", stiffness: 300, damping: 28 } }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 pt-6 px-4">
      <div className="h-[280px] bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse"></div>
      <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] animate-pulse"></div>
      <div className="h-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] animate-pulse"></div>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6 pb-24 pt-4 px-4"
    >
      {/* Hero Balance Card */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden bg-slate-900 dark:bg-black/40 backdrop-blur-[2rem] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full"></div>
        <div className="relative z-10 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Net Wealth</p>
            </div>
            <button onClick={() => setHideBalance(!hideBalance)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 border border-white/10">
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter truncate">
            {hideBalance ? '••••••••' : formatCurrency(stats?.netBalance || 0)}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Income</p>
              <p className="text-base sm:text-lg font-black text-emerald-400">+{formatCurrency(stats?.totalIncome || 0)}</p>
            </div>
            <div className="bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Spent</p>
              <p className="text-base sm:text-lg font-black text-rose-400">-{formatCurrency(stats?.totalExpenses || 0)}</p>
            </div>
          </div>
          
          {/* Lending/Debt Summary Row */}
          <div className="flex items-center gap-3 px-1 pt-2 border-t border-white/5">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ArrowDownRight size={12} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Receivable</p>
                <p className="text-[11px] font-bold text-slate-300">{formatCurrency(stats?.totalReceivable || 0)}</p>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ArrowUpRight size={12} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Payable</p>
                <p className="text-[11px] font-bold text-slate-300">{formatCurrency(stats?.totalPayable || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* AI Smart Entry - Redesigned with Premium Gradient */}
      <motion.div variants={itemVariants} className="relative w-full group">
  <button 
    onClick={() => setIsSmartEntryOpen(true)} 
    className="relative w-full bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 text-white overflow-hidden shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all duration-300 border border-white/10"
  >
    {/* Animated Ambient Glow */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
    
    {/* Decorative Background Icon (Moved to avoid text overlap) */}
    <div className="absolute -bottom-6 -right-6 opacity-[0.07] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
      <Sparkles size={110} />
    </div>

    {/* Sleek Shine Sweep Effect on Hover */}
    <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
    
    <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Primary Icon Container */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0 group-hover:bg-white/20 transition-colors duration-300">
          <Sparkles size={24} className="text-yellow-300 sm:w-7 sm:h-7" />
        </div>
        
        {/* Text Content */}
        <div className="text-left flex flex-col justify-center">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-0.5 sm:mb-1">
            AI Smart Entry
          </h3>
          <p className="text-indigo-100/90 text-xs sm:text-[13px] font-medium leading-relaxed max-w-[200px] sm:max-w-[240px] line-clamp-2">
            Analyze your raw financial notes instantly with Gemini.
          </p>
        </div>
      </div>
      
      {/* Action Button Container */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-purple-600 shadow-lg transition-all duration-300 shrink-0">
        <Plus size={20} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
      </div>
    </div>
  </button>
</motion.div>
      
      {/* Interactive Trends Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-600">
                  <TrendingUp size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base">Financial Trends</h3>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-10 sm:ml-13">
                {range === 'week' ? 'Past 7 Days' : range === 'month' ? 'Past 30 Days' : 'Custom Range'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex bg-slate-200/50 dark:bg-black/20 p-1 rounded-xl sm:rounded-2xl w-full sm:w-max">
                {['week', 'month', 'custom'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                      range === r 
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {range === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-right-4">
                  <input 
                    type="date" 
                    className="flex-1 sm:flex-none bg-slate-200/50 dark:bg-black/20 border-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] font-bold outline-none text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={customDates.start}
                    onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                  />
                  <span className="text-slate-400 font-bold text-[9px]">TO</span>
                  <input 
                    type="date" 
                    className="flex-1 sm:flex-none bg-slate-200/50 dark:bg-black/20 border-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] font-bold outline-none text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={customDates.end}
                    onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Period Summary Cards - Guaranteed Single Row on Mobile */}
          <div className="flex flex-nowrap items-stretch gap-2 sm:gap-5 mb-6 sm:mb-10 overflow-hidden">
            <button 
              onClick={() => setActiveTrend('income')}
              className={`flex-1 border rounded-xl sm:rounded-3xl p-2 sm:p-6 transition-all duration-300 min-w-0 ${
                activeTrend === 'income' 
                ? 'bg-emerald-500/10 border-emerald-500/30 ring-2 ring-emerald-500/20 shadow-lg' 
                : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 mb-1 sm:mb-3 text-center sm:text-left">
                <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                  activeTrend === 'income' ? 'bg-emerald-500 scale-110' : 'bg-emerald-500/50'
                }`}>
                  <ArrowDownRight size={12} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[7px] sm:text-[11px] font-black uppercase tracking-tight sm:tracking-widest truncate w-full ${
                  activeTrend === 'income' ? 'text-emerald-600' : 'text-slate-500'
                }`}>Income</span>
              </div>
              <p className="text-[9px] sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter sm:tracking-tight text-center sm:text-left truncate">{formatCurrency(stats?.periodIncome || 0)}</p>
            </button>
            
            <button 
              onClick={() => setActiveTrend('expenses')}
              className={`flex-1 border rounded-xl sm:rounded-3xl p-2 sm:p-6 transition-all duration-300 min-w-0 ${
                activeTrend === 'expenses' 
                ? 'bg-rose-500/10 border-rose-500/30 ring-2 ring-rose-500/20 shadow-lg' 
                : 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 mb-1 sm:mb-3 text-center sm:text-left">
                <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                  activeTrend === 'expenses' ? 'bg-rose-500 scale-110' : 'bg-rose-500/50'
                }`}>
                  <ArrowUpRight size={12} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[7px] sm:text-[11px] font-black uppercase tracking-tight sm:tracking-widest truncate w-full ${
                  activeTrend === 'expenses' ? 'text-rose-600' : 'text-slate-500'
                }`}>Spent</span>
              </div>
              <p className="text-[9px] sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter sm:tracking-tight text-center sm:text-left truncate">{formatCurrency(stats?.periodExpenses || 0)}</p>
            </button>

            <button 
              onClick={() => setActiveTrend('lending')}
              className={`flex-1 border rounded-xl sm:rounded-3xl p-2 sm:p-6 transition-all duration-300 min-w-0 ${
                activeTrend === 'lending' 
                ? 'bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-lg' 
                : 'bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 mb-1 sm:mb-3 text-center sm:text-left">
                <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                  activeTrend === 'lending' ? 'bg-indigo-500 scale-110' : 'bg-indigo-500/50'
                }`}>
                  <Activity size={12} className="sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[7px] sm:text-[11px] font-black uppercase tracking-tight sm:tracking-widest truncate w-full ${
                  activeTrend === 'lending' ? 'text-indigo-600' : 'text-slate-500'
                }`}>Lending</span>
              </div>
              <p className="text-[9px] sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter sm:tracking-tight text-center sm:text-left truncate">{formatCurrency(stats?.periodLending || 0)}</p>
            </button>
          </div>

          <div className="h-[220px] sm:h-[350px] w-full" key={activeTrend}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends?.[activeTrend]}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTrend === 'income' ? '#10b981' : activeTrend === 'expenses' ? '#f43f5e' : '#6366f1'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeTrend === 'income' ? '#10b981' : activeTrend === 'expenses' ? '#f43f5e' : '#6366f1'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-white/10 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{payload[0].payload.date}</p>
                          <p className="text-xs sm:text-sm font-black text-white">{formatCurrency(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={activeTrend === 'income' ? '#10b981' : activeTrend === 'expenses' ? '#f43f5e' : '#6366f1'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-white/10 p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-full flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Debt Hub</h3>
              <p className="text-xs text-slate-500 font-medium">Receivable: <span className="text-emerald-500 font-bold">{formatCurrency(stats?.totalReceivable || 0)}</span></p>
            </div>
          </div>
          <Link to="/lending" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">Manage</Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
          <Link to="/activity" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {stats?.recentTransactions?.map((tx) => {
            const theme = getCategoryTheme(tx.category);
            const isMenuOpen = activeMenuId === tx._id;
            return (
              <div key={tx._id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-4 flex items-center justify-between shadow-sm relative group overflow-visible">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.bg} ${theme.color}`}>
                    {theme.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tx.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tx.category} • {format(new Date(tx.date), 'MMM dd')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-black text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === tx._id ? null : tx._id); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </button>
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute right-0 top-10 z-[40] w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                          <button onClick={(e) => handleEdit(tx, e)} className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"><Edit2 size={14} /> Edit</button>
                          <button onClick={(e) => handleDelete(tx, e)} className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-t border-slate-100 dark:border-white/5"><Trash2 size={14} /> Delete</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {showEditModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="fixed inset-0 z-[60] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/20 pointer-events-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Adjust Entry</h3>
                    <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={20} /></button>
                  </div>
                  <form onSubmit={onEditSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                      <input type="text" className="w-full bg-white/50 dark:bg-black/20 border border-white/20 rounded-2xl py-4 px-5 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={editFormData.title} onChange={(e)=>setEditFormData({...editFormData, title:e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                      <input type="number" className="w-full bg-white/50 dark:bg-black/20 border border-white/20 rounded-2xl py-4 px-5 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={editFormData.amount} onChange={(e)=>setEditFormData({...editFormData, amount:e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Update Record</button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <SmartEntryModal isOpen={isSmartEntryOpen} onClose={() => setIsSmartEntryOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
