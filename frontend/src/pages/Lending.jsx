import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, Search, UserPlus, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle2, AlertCircle, ChevronDown, User,
  HandCoins, ArrowRightLeft, LayoutGrid, X, MoreHorizontal,
  Edit2, Trash2, ArrowLeft, Phone, Mail, History, Notebook, MessageCircle, Check
} from 'lucide-react';
import { 
  getLendingTransactions, getPeople, addPerson, addLendingTransaction, 
  deleteLendingTransaction, updateLendingTransaction, getPersonDetails, clearSelectedPerson,
  updatePerson, deletePerson 
} from '../store/slices/lendingSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday } from 'date-fns';

const Lending = () => {
  const dispatch = useDispatch();
  const { transactions, totalPages, people, selectedPersonDetails, isLoading } = useSelector((state) => state.lending);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [txData, setTxData] = useState({ personId: '', type: 'Lent', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [personData, setPersonData] = useState({ name: '', phoneNumber: '', email: '' });

  useEffect(() => {
    dispatch(getLendingTransactions(1));
    dispatch(getPeople());
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [dispatch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(getLendingTransactions(nextPage));
  };

  const onTxSubmit = (e) => {
    e.preventDefault();
    if (!txData.personId || !txData.amount) return toast.error('Please fill required fields');
    
    if (editingId) {
      dispatch(updateLendingTransaction({ id: editingId, data: txData }));
      toast.success('Transaction updated');
    } else {
      dispatch(addLendingTransaction(txData));
      toast.success('Transaction added');
    }
    
    setShowTxModal(false);
    setEditingId(null);
    setTxData({ personId: '', type: 'Lent', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    // If we are in single user view, refresh it
    if (selectedPersonDetails) {
      dispatch(getPersonDetails(selectedPersonDetails.person._id));
    }
  };

  const handleEdit = (tx, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingId(tx._id);
    setTxData({
      personId: tx.person?._id || tx.person,
      type: tx.type,
      amount: tx.amount,
      description: tx.description || '',
      date: format(new Date(tx.date), 'yyyy-MM-dd')
    });
    setShowTxModal(true);
  };

  const handleDelete = (txId, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    
    toast((t) => (
      <div className="w-[300px] flex flex-col gap-3 p-1">
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Delete Transaction?</p>
          <p className="text-xs text-slate-400">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => {
              dispatch(deleteLendingTransaction(txId)).then(() => {
                if (selectedPersonDetails) {
                  dispatch(getPersonDetails(selectedPersonDetails.person._id));
                }
                toast.dismiss(t.id);
                toast.success('Deleted');
              });
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

  const handlePersonDelete = (personId, e) => {
    e?.stopPropagation();
    
    toast((t) => (
      <div className="w-full flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-white">Delete Contact?</p>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">All transactions for this contact will be removed.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              dispatch(deletePerson(personId));
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
                    <p className="text-[13px] font-black text-white leading-none">Contact Removed</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">History deleted</p>
                  </div>
                </div>
              ), { duration: 3000 });
            }} 
            className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-[11px] font-bold shadow-lg shadow-rose-500/10 hover:bg-rose-600 transition-all active:scale-[0.98]"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[11px] font-bold border border-white/5 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { 
      duration: 5000,
      style: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const onPersonSubmit = (e) => {
    e.preventDefault();
    if (!personData.name) return toast.error('Name is required');
    
    if (editingId && showPersonModal) {
      dispatch(updatePerson({ id: editingId, data: personData }));
      toast.success('Contact updated');
    } else {
      dispatch(addPerson(personData));
      toast.success('Contact added');
    }
    
    setShowPersonModal(false);
    setEditingId(null);
    setPersonData({ name: '', phoneNumber: '', email: '' });
  };

  const handlePersonEdit = (person, e) => {
    e?.stopPropagation();
    setEditingId(person._id);
    setPersonData({
      name: person.name,
      phoneNumber: person.phoneNumber || '',
      email: person.email || ''
    });
    setShowPersonModal(true);
  };

  const handlePersonClick = (pId) => {
    if (selectedPersonId === pId) {
      setSelectedPersonId(null);
      dispatch(clearSelectedPerson());
    } else {
      setSelectedPersonId(pId);
      dispatch(getPersonDetails(pId));
    }
  };

  const getStatusIcon = (type) => {
    switch(type) {
      case 'Lent': return <HandCoins className="text-rose-500" size={18} />;
      case 'Borrowed': return <ArrowRightLeft className="text-blue-500" size={18} />;
      case 'Repayment_Received': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'Repayment_Sent': return <ArrowUpRight className="text-indigo-500" size={18} />;
      default: return <Clock className="text-slate-400" size={18} />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.person?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPerson = !selectedPersonId || tx.person?._id === selectedPersonId || tx.person === selectedPersonId;
    return matchesSearch && matchesPerson;
  });

  const totalReceivable = people.reduce((acc, p) => p.balance > 0 ? acc + p.balance : acc, 0);
  const totalPayable = people.reduce((acc, p) => p.balance < 0 ? acc + Math.abs(p.balance) : acc, 0);

  return (
    <div className="max-w-3xl mx-auto pb-32 pt-4 px-4 space-y-8">
      
      <motion.div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-white/10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-max mx-auto md:mx-0">
              <HandCoins size={12} className="text-indigo-400" />
              <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase">Debt Center</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Total Balance</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{formatCurrency(totalReceivable - totalPayable)}</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[130px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Receivable</p>
              <p className="text-base font-black text-emerald-400">{formatCurrency(totalReceivable)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[130px]">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Payable</p>
              <p className="text-base font-black text-rose-400">{formatCurrency(totalPayable)}</p>
            </div>
          </div>
        </div>
      </motion.div>



      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input type="text" placeholder="Search contacts or history..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm outline-none text-slate-900 dark:text-white" />
        </div>
        <button 
          onClick={() => { setEditingId(null); setTxData({ personId: '', type: 'Lent', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') }); setShowTxModal(true); }}
          className="w-[52px] h-[52px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Contacts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {people.map(p => (
            <button 
              key={p._id} 
              onClick={() => handlePersonClick(p._id)}
              className={`flex-shrink-0 flex items-center gap-3 bg-white dark:bg-slate-900 border rounded-2xl py-3 px-4 transition-all group ${selectedPersonId === p._id ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedPersonId === p._id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                <User size={20} />
              </div>
              <div className="text-left pr-2">
                <p className={`text-sm font-bold transition-colors ${selectedPersonId === p._id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{p.name}</p>
                <p className={`text-[10px] font-bold ${p.balance > 0 ? 'text-emerald-500' : p.balance < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {p.balance === 0 ? 'Settled' : formatCurrency(Math.abs(p.balance))}
                </p>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPersonId ? 'Contact History' : 'History Log'}</h3>
        </div>
        
        <div className="space-y-3">
          {isLoading && page === 1 ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />)
          ) : filteredTransactions.length > 0 ? (
            <>
              {filteredTransactions.map((tx) => (
                <div key={tx._id} className="group bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-4 flex items-center justify-between shadow-sm relative overflow-visible">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                      {getStatusIcon(tx.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tx.person?.name || 'Unknown Contact'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {tx.type.replace('_', ' ')} • {format(new Date(tx.date), 'MMM dd')}
                      </p>

                      {tx.description && (
                        <p className="text-[10px] text-slate-400 mt-1 italic flex items-center gap-1">
                          <Notebook size={10} /> {tx.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right flex flex-col items-end">
                      <p className={`font-bold text-base whitespace-nowrap ${(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? 'text-rose-600' : 'text-emerald-600'}`}>{(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? '-' : '+'}{formatCurrency(tx.amount)}</p>
                      {tx.type === 'Lent' && tx.person && (
                        <a 
                          href={`https://wa.me/${tx.person.phoneNumber?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(`Hi ${tx.person.name},\n\nJust a friendly reminder regarding the amount of ₹${tx.amount} for "${tx.description || tx.type}".\n\nThanks!`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline mt-0.5"
                        >
                          <MessageCircle size={10} /> Remind
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === tx._id ? null : tx._id); }} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><MoreHorizontal size={18} /></button>
                      <AnimatePresence>
                        {activeMenuId === tx._id && (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-10 z-[40] w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button onClick={(e) => handleEdit(tx, e)} className="w-full px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                            <button onClick={(e) => handleDelete(tx._id, e)} className="w-full px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"><Trash2 size={14} /> Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
              {page < totalPages && (
                <button onClick={handleLoadMore} className="w-full py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 mt-2 shadow-sm">
                  {isLoading ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /> : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 font-medium">No records found.</div>
          )}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {showTxModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => { setShowTxModal(false); setEditingId(null); }} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => { setShowTxModal(false); setEditingId(null); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={20} /></button>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit' : 'New'} Record</h3>
                  <form onSubmit={onTxSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-semibold text-slate-500">Select Contact</label>
                        {!editingId && (
                          <button 
                            type="button"
                            onClick={() => { setShowPersonModal(true); setEditingPersonId(null); setPersonData({ name: '', phoneNumber: '' }); }}
                            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600 transition-colors"
                          >
                            <Plus size={10} strokeWidth={3} /> Add New
                          </button>
                        )}
                      </div>
                      <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={txData.personId} onChange={(e) => setTxData({...txData, personId: e.target.value})} required disabled={!!editingId}>
                        <option value="">Choose contact...</option>
                        {people.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Transaction Type</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={txData.type} onChange={(e) => setTxData({...txData, type: e.target.value})}>
                          <option value="Lent">Lent</option>
                          <option value="Borrowed">Borrowed</option>
                          <option value="Repayment_Sent">Repayment Sent</option>
                          <option value="Repayment_Received">Repayment Received</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Amount</label>
                        <input type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={txData.amount} onChange={(e) => setTxData({...txData, amount: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Note (Optional)</label>
                      <input type="text" placeholder="What is this for?" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium outline-none" value={txData.description} onChange={(e) => setTxData({...txData, description: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Date</label>
                      <input type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={txData.date} onChange={(e) => setTxData({...txData, date: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4.5 rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all">Save Entry</button>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => setShowPersonModal(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => { setShowPersonModal(false); setEditingId(null); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={20} /></button>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit Contact' : 'New Contact'}</h3>
                  <form onSubmit={onPersonSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Full Name</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={personData.name} onChange={(e) => setPersonData({...personData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold outline-none" value={personData.phoneNumber} onChange={(e) => setPersonData({...personData, phoneNumber: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4.5 rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all">
                      {editingId ? 'Update Contact' : 'Add Contact'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Lending;
