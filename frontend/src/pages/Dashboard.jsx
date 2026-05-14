import React, { useEffect, useState } from 'react';
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
  const [activeTrend, setActiveTrend] = useState('expenses'); // 'expenses' | 'income' | 'lending'
  const { user } = useSelector((state) => state.auth);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', amount: '', category: '', date: '' });

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats/dashboard', {
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
    if (user) fetchStats();
  }, [user]);

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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
  };

  const TrendGraph = () => {
    const data = stats?.trends?.[activeTrend] || [];
    const color = activeTrend === 'income' ? '#10b981' : activeTrend === 'lending' ? '#f59e0b' : '#6366f1';
    
    return (
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/50" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
              dy={10}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <RechartsTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 dark:bg-slate-800 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                      <p className="text-sm font-black text-white">{formatCurrency(payload[0].value)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke={color} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorTrend)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
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
        className="relative overflow-hidden bg-slate-900 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full"></div>
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Net Wealth</p>
            </div>
            <button onClick={() => setHideBalance(!hideBalance)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 border border-white/10">
              {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
            {hideBalance ? '••••••••' : formatCurrency(stats?.netBalance || 0)}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-lg font-black text-emerald-400">+{formatCurrency(stats?.totalIncome || 0)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Spent</p>
              <p className="text-lg font-black text-rose-400">-{formatCurrency(stats?.totalExpenses || 0)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Smart Entry */}
      <motion.div variants={itemVariants}>
        <button onClick={() => setIsSmartEntryOpen(true)} className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Smart Entry</h3>
              <p className="text-xs text-slate-500 font-medium">Auto-track using AI analysis</p>
            </div>
          </div>
          <Plus size={20} className="text-slate-400" />
        </button>
      </motion.div>

      {/* Interactive Trends Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 dark:border-white/10 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">Financial Trends</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time analysis</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl w-max">
              {['expenses', 'income', 'lending'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTrend(type)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeTrend === type 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <TrendGraph />
        </div>
      </motion.div>

      {/* Lending Summary */}
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
          <Link to="/expenses" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</Link>
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
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="fixed inset-0 z-[60] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/20 pointer-events-auto">
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
      </AnimatePresence>

      <SmartEntryModal isOpen={isSmartEntryOpen} onClose={() => setIsSmartEntryOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
