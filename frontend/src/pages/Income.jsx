import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, Search, TrendingUp, Trash2, Edit2, LayoutGrid, X, 
  Coffee, Plane, ShoppingBag, Zap, Wallet, ChevronDown, Camera,
  MoreHorizontal, DollarSign, Briefcase, Gift, Heart, Sparkles,
  Users, Smartphone, MessageCircle, Check, User
} from 'lucide-react';
import { getIncomes, createIncome, deleteIncome, updateIncome } from '../store/slices/transactionSlice';
import { 
  getPeople, addPerson 
} from '../store/slices/lendingSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import CalendarGrid from '../components/CalendarGrid';

const Income = () => {
  const dispatch = useDispatch();
  const { incomes, incomePages, isLoading } = useSelector((state) => state.transactions);
  const { people } = useSelector((state) => state.lending);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [personData, setPersonData] = useState({ name: '', phoneNumber: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const initialFormState = { title: '', amount: '', source: 'Salary', date: format(new Date(), 'yyyy-MM-dd'), totalProjectAmount: '', person: '' };
  const [formData, setFormData] = useState(initialFormState);

  const categories = ['All', 'Salary', 'Freelance', 'Business', 'Investments', 'Other'];

  useEffect(() => {
    dispatch(getIncomes(1));
    dispatch(getPeople());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(getIncomes(nextPage));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return toast.error('Required fields missing');
    
    let submissionData = { ...formData };
    
    if (submissionData.source === 'Freelance' || submissionData.source === 'Business') {
      const totalAmount = parseFloat(submissionData.totalProjectAmount || 0);
      const receivedAmount = parseFloat(submissionData.amount || 0);
      
      if (totalAmount > receivedAmount) {
        submissionData.status = 'Pending';
      } else {
        submissionData.status = 'Received';
      }
    } else {
      submissionData.totalProjectAmount = 0;
      submissionData.status = 'Received';
      submissionData.person = '';
    }
    
    if (editingId) {
      dispatch(updateIncome({ id: editingId, data: submissionData }));
      toast.success('Income updated');
    } else {
      dispatch(createIncome(submissionData));
      toast.success('Income added');
    }
    
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = (inc, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    toast((t) => (
      <div className="w-full flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-white">Delete Revenue?</p>
          <p className="text-xs text-slate-400 font-medium">Remove "{inc.title}"?</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => { 
              dispatch(deleteIncome(inc._id)); 
              toast.dismiss(t.id); 
              toast((st) => (
                <div className="flex items-center gap-3 py-1">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={18} strokeWidth={3} />
                  </motion.div>
                  <div className="flex flex-col">
                    <p className="text-[13px] font-black text-white leading-none">Revenue Removed</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Cleared from books</p>
                  </div>
                </div>
              ), { duration: 3000 });
            }} 
            className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 py-2 bg-white/10 text-slate-300 rounded-lg text-xs font-semibold">Cancel</button>
        </div>
      </div>
    ));
  };

  const onPersonSubmit = (e) => {
    e.preventDefault();
    if (!personData.name) return toast.error('Name is required');
    dispatch(addPerson(personData));
    toast.success('Contact added');
    setShowPersonModal(false);
    setPersonData({ name: '', phoneNumber: '' });
  };

  const handleEdit = (inc, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setFormData({ 
      title: inc.title, 
      amount: inc.amount, 
      source: inc.source, 
      date: format(new Date(inc.date), 'yyyy-MM-dd'),
      totalProjectAmount: inc.totalProjectAmount || '',
      person: inc.person?._id || inc.person || ''
    });
    setEditingId(inc._id);
    setShowModal(true);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const filteredIncomes = incomes.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || inc.source === selectedCategory;
    const matchesDate = !selectedDate || isSameDay(new Date(inc.date), selectedDate);
    const matchesPerson = !selectedPersonId || inc.person?._id === selectedPersonId;
    return matchesSearch && matchesCategory && matchesDate && matchesPerson;
  });

  const incomeContacts = people.filter(p => 
    incomes.some(inc => (inc.person?._id === p._id || inc.person === p._id))
  );

  const totalIncome = filteredIncomes.reduce((acc, inc) => acc + inc.amount, 0);

  const groupedIncomes = filteredIncomes.reduce((groups, inc) => {
    const date = format(new Date(inc.date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(inc);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedIncomes).sort((a, b) => new Date(b) - new Date(a));

  const getCategoryTheme = (cat) => {
    switch(cat) {
      case 'Salary': return { icon: <Briefcase size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-100/50 dark:bg-emerald-500/20' };
      case 'Freelance': return { icon: <DollarSign size={20}/>, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-500/20' };
      case 'Investments': case 'Investment': return { icon: <TrendingUp size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-100/50 dark:bg-indigo-500/20' };
      case 'Business': return { icon: <Sparkles size={20}/>, color: 'text-amber-500', bg: 'bg-amber-100/50 dark:bg-amber-500/20' };
      case 'Gift': return { icon: <Gift size={20}/>, color: 'text-pink-500', bg: 'bg-pink-100/50 dark:bg-pink-500/20' };
      default: return { icon: <Heart size={20}/>, color: 'text-slate-500', bg: 'bg-slate-100/50 dark:bg-slate-500/20' };
    }
  };

  return (
    <motion.div initial="hidden" animate="show" className="space-y-6 pb-24 pt-4 max-w-3xl mx-auto px-4">
      {/* Hero Metrics Card */}
      <motion.div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-white/10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 blur-[4rem] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-max">
              <TrendingUp size={12} className="text-emerald-400" />
              <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase">Revenue</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Total Cleared</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{formatCurrency(totalIncome)}</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[120px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Pending</p>
              <p className="text-base font-black text-amber-400">
                {formatCurrency(filteredIncomes.reduce((acc, inc) => acc + (inc.totalProjectAmount > inc.amount ? (inc.totalProjectAmount - inc.amount) : 0), 0))}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[120px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Expected</p>
              <p className="text-base font-black text-emerald-400">
                {formatCurrency(filteredIncomes.reduce((acc, inc) => acc + Math.max(inc.amount, inc.totalProjectAmount || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input type="text" placeholder="Search inflows..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm outline-none text-slate-900 dark:text-white" />
        </div>
        <button onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }} className="w-[52px] h-[52px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
      </div>

      {/* People Scroll List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clients & Contacts</h3>
          {selectedPersonId && (
            <button onClick={() => setSelectedPersonId(null)} className="text-[10px] font-bold text-indigo-500 uppercase">Show All</button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {incomeContacts.map(p => (
            <button 
              key={p._id}
              onClick={() => setSelectedPersonId(selectedPersonId === p._id ? null : p._id)}
              className={`flex-shrink-0 flex items-center gap-3 bg-white dark:bg-slate-900 border rounded-2xl py-3 px-4 transition-all group ${selectedPersonId === p._id ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedPersonId === p._id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                <User size={16} />
              </div>
              <div className="text-left pr-2">
                <p className={`text-xs font-bold transition-colors ${selectedPersonId === p._id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{p.name}</p>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                  {incomes.filter(inc => (inc.person?._id === p._id || inc.person === p._id)).length} records
                </p>
              </div>
            </button>
          ))}
          {incomeContacts.length === 0 && (
            <p className="text-[10px] text-slate-500 font-medium py-3 px-2">No active clients linked yet.</p>
          )}
        </div>
      </div>

      <CalendarGrid activities={incomes} selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {/* Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedDate ? format(selectedDate, 'MMM dd') : 'Recent Inflows'}</h3>
          {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-[10px] font-bold text-emerald-500">Clear</button>}
        </div>

        {isLoading && page === 1 ? <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" /> : sortedDates.length > 0 ? (
          <>
            {sortedDates.map(date => (
              <div key={date} className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase ml-2">{isToday(new Date(date)) ? 'Today' : format(new Date(date), 'MMM dd, yyyy')}</p>
                {groupedIncomes[date].map(inc => {
                  const theme = getCategoryTheme(inc.source);
                  return (
                    <div key={inc._id} className="group bg-white dark:bg-slate-900 rounded-[1.25rem] p-4 flex items-center justify-between border border-slate-200/60 dark:border-slate-800/60 relative overflow-visible shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${theme.bg} ${theme.color} rounded-full flex items-center justify-center`}>{theme.icon}</div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{inc.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{inc.source} • {format(new Date(inc.date), 'MMM dd')}</p>
                            {inc.person && (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                <Users size={10} /> {inc.person.name}
                              </div>
                            )}
                            {inc.totalProjectAmount > inc.amount && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider">
                                Pending: {formatCurrency(inc.totalProjectAmount - inc.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <p className="font-bold text-base text-emerald-600 whitespace-nowrap">+{formatCurrency(inc.amount)}</p>
                          {inc.status === 'Pending' && inc.person && (
                            <a 
                              href={`https://wa.me/${inc.person.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${inc.person.name},\n\nFriendly reminder for the pending payment of ₹${inc.totalProjectAmount - inc.amount} for "${inc.title}".\n\nThanks!`)}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline mt-1"
                            >
                              <MessageCircle size={10} /> Remind
                            </a>
                          )}
                        </div>
                        <div className="relative">
                          <button onClick={(e) => toggleMenu(inc._id, e)} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal size={18} /></button>
                          <AnimatePresence>
                            {activeMenuId === inc._id && (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-10 z-[40] w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button onClick={(e) => handleEdit(inc, e)} className="w-full px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                                <button onClick={(e) => handleDelete(inc, e)} className="w-full px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"><Trash2 size={14} /> Delete</button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {!selectedDate && page < incomePages && (
              <button 
                onClick={handleLoadMore}
                className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 dark:border-slate-800 mt-4 shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : 'Load More'}
              </button>
            )}
          </>
        ) : <div className="py-20 text-center text-slate-500">No records found.</div>}
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200/50 pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={20} /></button>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit' : 'Record'} Income</h3>
                  <form onSubmit={onSubmit} className="space-y-6">
                    {(formData.source === 'Freelance' || formData.source === 'Business') ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Total Project Value</label>
                            <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" value={formData.totalProjectAmount} onChange={(e) => setFormData({...formData, totalProjectAmount: e.target.value})} required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Amount Received</label>
                            <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-lg font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-semibold text-slate-500">Client / Contact</label>
                            <button 
                              type="button"
                              onClick={() => { setPersonData({ name: '', phoneNumber: '' }); setShowPersonModal(true); }}
                              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600 transition-colors"
                            >
                              <Plus size={10} strokeWidth={3} /> Add New
                            </button>
                          </div>
                          <select 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                            value={formData.person} 
                            onChange={(e) => setFormData({...formData, person: e.target.value})}
                          >
                            <option value="">Select client (Optional)</option>
                            {people.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Amount</label>
                        <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-2xl font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                      </div>
                    )}
                    <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Title / Project Name</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Source</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 transition-all" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value, totalProjectAmount: '', person: ''})} required>
                          {categories.slice(1).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2"><label className="text-xs font-semibold text-slate-500">Date</label><input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required /></div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-all mt-4">Save Income</button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      {createPortal(
        <AnimatePresence>
          {showPersonModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPersonModal(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto relative">
                  <button onClick={() => setShowPersonModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={16} /></button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add Contact</h3>
                  <form onSubmit={onPersonSubmit} className="space-y-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Name</label><input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={personData.name} onChange={(e) => setPersonData({...personData, name: e.target.value})} placeholder="e.g. John Doe" required /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Phone (Optional)</label><input type="tel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={personData.phoneNumber} onChange={(e) => setPersonData({...personData, phoneNumber: e.target.value})} placeholder="+91..." /></div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all mt-4">Create Contact</button>
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

export default Income;
