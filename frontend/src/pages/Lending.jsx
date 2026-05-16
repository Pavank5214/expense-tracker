import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, Search, UserPlus, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle2, AlertCircle, ChevronDown, User,
  HandCoins, ArrowRightLeft, LayoutGrid, X, MoreHorizontal,
  Edit2, Trash2, ArrowLeft, Phone, Mail, History, Notebook, MessageCircle
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
      <div className="w-[300px] flex flex-col gap-3 p-1">
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Delete Contact?</p>
          <p className="text-xs text-slate-400">All transactions for this contact will be removed.</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => {
              dispatch(deletePerson(personId));
              toast.dismiss(t.id);
              toast.success('Contact deleted');
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
    dispatch(getPersonDetails(pId));
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

  const filteredTransactions = transactions.filter(tx => 
    tx.person?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceivable = people.reduce((acc, p) => p.balance > 0 ? acc + p.balance : acc, 0);
  const totalPayable = people.reduce((acc, p) => p.balance < 0 ? acc + Math.abs(p.balance) : acc, 0);

  return (
    <div className="max-w-3xl mx-auto pb-32 pt-4 px-4 space-y-8">
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white mb-3">
            <ArrowDownRight size={20} />
          </div>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Receivable</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalReceivable)}</h2>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-[2rem] p-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white mb-3">
            <ArrowUpRight size={20} />
          </div>
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Payable</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalPayable)}</h2>
        </motion.div>
      </div>

      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Debt Center</h1>
            <p className="text-slate-400 text-sm">Managing records for {people.length} contacts</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPersonModal(true)} className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><UserPlus size={18} /> Contact</button>
            <button onClick={() => { setEditingId(null); setTxData({ personId: '', type: 'Lent', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') }); setShowTxModal(true); }} className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl bg-white text-slate-900 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg shadow-white/10"><Plus size={18} /> Entry</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Contacts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {people.map(p => (
            <button 
              key={p._id} 
              onClick={() => handlePersonClick(p._id)}
              className="flex-shrink-0 flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 hover:border-indigo-500/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <User size={20} />
              </div>
              <div className="text-left pr-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                <p className={`text-[10px] font-bold ${p.balance > 0 ? 'text-emerald-500' : p.balance < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {p.balance === 0 ? 'Settled' : formatCurrency(Math.abs(p.balance))}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">History Log</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-full py-1.5 pl-9 pr-4 text-xs font-medium outline-none w-32 focus:w-48 transition-all" />
          </div>
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
                    <div className="text-right">
                      <p className={`font-bold text-base ${(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
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
          {selectedPersonDetails && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={() => dispatch(clearSelectedPerson())} className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden relative">
                  
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 shrink-0 relative">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/30 shrink-0">{selectedPersonDetails.person.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 py-1">{selectedPersonDetails.person.name}</h2>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={(e) => handlePersonEdit(selectedPersonDetails.person, e)} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 flex items-center justify-center transition-colors"><Edit2 size={16} /></button>
                            <button onClick={(e) => handlePersonDelete(selectedPersonDetails.person._id, e)} className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"><Trash2 size={16} /></button>
                            <button onClick={() => dispatch(clearSelectedPerson())} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors ml-1"><X size={18} /></button>
                          </div>
                        </div>
                        <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedPersonDetails.person.balance > 0 ? 'bg-emerald-100 text-emerald-600' : selectedPersonDetails.person.balance < 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                          {selectedPersonDetails.person.balance === 0 ? 'Settled' : selectedPersonDetails.person.balance > 0 ? 'Owes you' : 'You owe'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</p>
                        <p className={`text-lg font-bold mt-1 ${selectedPersonDetails.person.balance > 0 ? 'text-emerald-600' : selectedPersonDetails.person.balance < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {formatCurrency(Math.abs(selectedPersonDetails.person.balance))}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity</p>
                        <p className="text-lg font-bold mt-1 text-slate-900 dark:text-white">{selectedPersonDetails.history.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 relative">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><History size={12} /> Transaction History</h3>
                    {selectedPersonDetails.history.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPersonDetails.history.map((tx) => (
                          <div key={tx._id} className="flex items-center justify-between group bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">{getStatusIcon(tx.type)}</div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.type.replace('_', ' ')}</p>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                                {tx.description && <p className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">{tx.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-xs ${(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {(tx.type === 'Lent' || tx.type === 'Repayment_Sent') ? '-' : '+'}{formatCurrency(tx.amount)}
                              </p>
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === tx._id ? null : tx._id); }} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={14} /></button>
                                <AnimatePresence>
                                  {activeMenuId === tx._id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 bottom-8 z-[100] w-28 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                      <button onClick={(e) => handleEdit(tx, e)} className="w-full px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><Edit2 size={12} /> Edit</button>
                                      <button onClick={(e) => handleDelete(tx._id, e)} className="w-full px-3 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"><Trash2 size={12} /> Delete</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-4">No history yet.</p>
                    )}
                    {/* Bottom Blur Overlay for scrollable content */}
                    <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                  </div>
                  
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                    <div className="flex gap-3">
                      <a href={`tel:${selectedPersonDetails.person.phoneNumber}`} className="flex-none w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"><Phone size={18} /></a>
                      <a href={`https://wa.me/${selectedPersonDetails.person.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selectedPersonDetails.person.name},\n\nJust a gentle reminder regarding the pending amount of ₹${Math.abs(selectedPersonDetails.person.balance)}.\n\nThanks!`)}`} target="_blank" rel="noreferrer" className="flex-none w-12 h-12 rounded-2xl bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"><MessageCircle size={18} /></a>
                      <button onClick={() => { setTxData({...txData, personId: selectedPersonDetails.person._id}); setShowTxModal(true); }} className="flex-1 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl active:scale-95 transition-all">Settle Up</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

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
                      <label className="text-xs font-semibold text-slate-500">Select Contact</label>
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
