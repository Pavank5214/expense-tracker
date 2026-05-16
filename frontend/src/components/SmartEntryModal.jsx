import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wand2, 
  HandCoins,
  ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getExpenses } from '../store/slices/transactionSlice';
import { getPeople } from '../store/slices/lendingSlice';

const SmartEntryModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [results, setResults] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  // Lock body scroll on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsParsing(true);
    setResults(null);
    try {
      const response = await axios.post('/api/ai/parse', { text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze text. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (!results || results.length === 0) return;
    setIsSaving(true);
    try {
      for (const item of results) {
        if (item.type === 'expense') {
          await axios.post('/api/expenses', {
            title: item.title || 'AI Entry',
            amount: Number(item.amount) || 0,
            category: item.category || 'Miscellaneous',
            date: new Date()
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        } else if (item.type === 'income') {
          await axios.post('/api/income', {
            title: item.title || 'Income Entry',
            amount: Number(item.amount) || 0,
            category: item.category || 'Other',
            date: new Date()
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        } else if (item.type === 'lending') {
          const personName = item.personName || item.name;
          if (!personName) continue;

          const peopleRes = await axios.get('/api/lending/people', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          
          const cleanSearchName = personName.trim().toLowerCase();
          let person = peopleRes.data.find(p => p.name.trim().toLowerCase() === cleanSearchName);
          
          if (!person && cleanSearchName.length > 2) {
            person = peopleRes.data.find(p => {
              const existingName = p.name.trim().toLowerCase();
              return existingName.includes(cleanSearchName) || cleanSearchName.includes(existingName);
            });
          }
          
          if (!person) {
            const newPersonRes = await axios.post('/api/lending/people', {
              name: personName.trim()
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            person = newPersonRes.data;
          }

          await axios.post('/api/lending', {
            personId: person._id,
            type: item.lendingType || 'Lent',
            amount: Number(item.amount) || 0,
            description: item.description || ''
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        }
      }

      toast.success(`Saved ${results.length} entries successfully!`);
      dispatch(getExpenses());
      dispatch(getPeople());
      setTimeout(() => {
        setResults(null);
        setText('');
        onClose();
      }, 300);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex sm:items-center justify-center pointer-events-none">
          {/* Dark Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
          />
          
          {/* Modal / Bottom Sheet Container */}
          <motion.div 
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 w-full sm:relative sm:bottom-auto sm:w-[560px] bg-white dark:bg-slate-900 rounded-t-[1.5rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] pointer-events-auto overflow-hidden"
          >
            {/* Mobile Drag Handle Pill */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-transparent absolute top-0 z-10">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pt-8 sm:p-6 pb-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 z-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">AI Smart Entry</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Type naturally, AI sorts it out.</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Input State */}
              {!results ? (
                <div className="relative group flex flex-col h-full min-h-[200px]">
                  <textarea 
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="E.g.&#10;Spent ₹300 on Uber&#10;Lent ₹1500 to Sarah&#10;Got ₹500 back from Mike"
                    className="w-full h-full min-h-[200px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-base text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none placeholder:text-slate-400 shadow-sm"
                  />
                  {text && (
                    <button 
                      onClick={() => setText('')}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                /* Results State */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Detected ({results.length})
                    </span>
                    <button 
                      onClick={() => setResults(null)} 
                      className="text-[12px] flex items-center gap-1 font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <ChevronLeft size={14} /> Back to Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {results.map((res, i) => {
                      const isExpense = res.type === 'expense';
                      const isIncome = res.type === 'income';
                      
                      return (
                        <div key={i} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isExpense ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 
                              isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                              'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                            }`}>
                              {isExpense ? <AlertCircle size={18} /> : isIncome ? <CheckCircle2 size={18} /> : <HandCoins size={18} />}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {isExpense || isIncome ? res.title : (res.personName || res.name)}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 capitalize truncate">
                                {res.type} {res.category ? `• ${res.category}` : ''}
                              </p>
                            </div>
                          </div>
                          <p className={`font-bold text-[15px] shrink-0 pl-2 ${
                            isExpense ? 'text-slate-900 dark:text-white' : 
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 
                            'text-slate-900 dark:text-white'
                          }`}>
                            {isIncome ? '+' : ''}₹{res.amount}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 pb-safe sm:pb-6">
              {!results ? (
                <button 
                  onClick={handleAnalyze}
                  disabled={isParsing || !text.trim()}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 h-14 rounded-2xl text-[15px] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isParsing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Wand2 size={18} /> Parse Data</>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white h-14 rounded-2xl text-[15px] font-bold shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Save All Entries</>
                  )}
                </button>
              )}
              
              {/* iOS Home Indicator Safe Area spacing for mobile */}
              <div className="h-4 sm:hidden"></div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SmartEntryModal;