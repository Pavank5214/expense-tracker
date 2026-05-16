import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Trash2, Edit2, X, RefreshCw, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '../store/slices/subscriptionSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { subscriptions, isLoading } = useSelector((state) => state.subscriptions);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const initialFormState = { 
    title: '', 
    amount: '', 
    category: 'Bills', 
    frequency: 'Monthly', 
    nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    autoDeduct: false
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.nextBillingDate) {
      return toast.error('Required fields missing');
    }
    
    if (editingId) {
      dispatch(updateSubscription({ id: editingId, data: formData }));
      toast.success('Subscription updated');
    } else {
      dispatch(addSubscription(formData));
      toast.success('Subscription added');
    }
    
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    
    toast((t) => (
      <div className="w-[300px] flex flex-col gap-3 p-1">
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Delete Subscription?</p>
          <p className="text-xs text-slate-400">Future automated payments will stop.</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => {
              dispatch(deleteSubscription(id));
              toast.dismiss(t.id);
              toast.success('Deleted');
            }}
            className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
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
    ), { 
      duration: 4000,
      style: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const handleEdit = (sub, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setFormData({ 
      title: sub.title, 
      amount: sub.amount, 
      category: sub.category, 
      frequency: sub.frequency,
      nextBillingDate: format(new Date(sub.nextBillingDate), 'yyyy-MM-dd'),
      startDate: sub.startDate ? format(new Date(sub.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      endDate: sub.endDate ? format(new Date(sub.endDate), 'yyyy-MM-dd') : '',
      autoDeduct: !!sub.autoDeduct
    });
    setEditingId(sub._id);
    setShowModal(true);
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (!sub.isActive) return acc;
    if (sub.frequency === 'Monthly') return acc + sub.amount;
    if (sub.frequency === 'Yearly') return acc + (sub.amount / 12);
    if (sub.frequency === 'Weekly') return acc + (sub.amount * 4.33);
    return acc;
  }, 0);

  return (
    <motion.div initial="hidden" animate="show" className="space-y-6 pb-24 pt-4 max-w-3xl mx-auto px-4">
      {/* Hero Card */}
      <motion.div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-900 rounded-[2rem] p-8 shadow-2xl border border-white/10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-max">
            <RefreshCw size={14} className="text-indigo-400" />
            <p className="text-[11px] font-medium text-slate-300 tracking-wide">Monthly Commitment</p>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalMonthly)}</h1>
        </div>
      </motion.div>

      {/* Action Bar */}
      <div className="flex gap-3 justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Subscriptions</h2>
        <button onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }} className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-lg active:scale-95 transition-all gap-2 text-sm font-bold">
          <Plus size={18} /> Add New
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" /> : subscriptions.length > 0 ? (
          subscriptions.map(sub => (
            <div key={sub._id} className={`group bg-white dark:bg-slate-900 rounded-[1.25rem] p-5 flex items-center justify-between border ${sub.isActive ? 'border-slate-200/60 dark:border-slate-800/60' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'} relative overflow-visible shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100/50 dark:bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center shrink-0">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{sub.frequency}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><CalendarIcon size={10} /> Next: {format(new Date(sub.nextBillingDate), 'MMM dd')}</span>
                    {sub.autoDeduct && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                          <RefreshCw size={10} /> Auto
                        </span>
                      </>
                    )}
                    {sub.endDate && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">
                          Ends: {format(new Date(sub.endDate), 'MMM yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-base text-slate-900 dark:text-white">{formatCurrency(sub.amount)}</p>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === sub._id ? null : sub._id); }} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400"><MoreHorizontal size={18} /></button>
                  <AnimatePresence>
                    {activeMenuId === sub._id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="absolute right-0 top-10 z-[40] w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <button onClick={(e) => handleEdit(sub, e)} className="w-full px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                        <button onClick={(e) => handleDelete(sub._id, e)} className="w-full px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"><Trash2 size={14} /> Delete</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))
        ) : <div className="py-20 text-center text-slate-500">No subscriptions found.</div>}
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => setShowModal(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200/50 pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={20} /></button>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit' : 'New'} Subscription</h3>
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Amount</label><input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-4 px-6 text-2xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required /></div>
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Title</label><input type="text" placeholder="Netflix, Gym, etc." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Frequency</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} required>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Next Billing Date</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none" value={formData.nextBillingDate} onChange={(e) => setFormData({...formData, nextBillingDate: e.target.value})} required /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Start Date</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">End Date (Optional)</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Deduct</p>
                        <p className="text-[10px] text-slate-500">Automatically add as expense</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, autoDeduct: !formData.autoDeduct})}
                        className={`w-12 h-6 rounded-full transition-all relative ${formData.autoDeduct ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.autoDeduct ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4.5 rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all">Save Subscription</button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default Subscriptions;
