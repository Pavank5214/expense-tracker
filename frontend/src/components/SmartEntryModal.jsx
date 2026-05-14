import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, AlertCircle, Loader2, Wand2 } from 'lucide-react';
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

  const parseLedger = (input) => {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const transactions = [];

    lines.forEach(line => {
      // 1. Handle Expenses (Lines starting with "Loan" or "-")
      if (line.toLowerCase().startsWith('loan') || line.trim().startsWith('-')) {
        const amountMatch = line.match(/-?\d+(\.\d+)?/);
        const description = line.replace(/loan|-?\d+(\.\d+)?|for/gi, '').trim();
        if (amountMatch) {
          transactions.push({
            type: 'expense',
            title: description || 'Miscellaneous Expense',
            amount: Math.abs(parseFloat(amountMatch[0])),
            category: 'Miscellaneous'
          });
        }
      } 
      // 2. Handle Lending (Lines starting with a Name)
      else {
        const nameMatch = line.match(/^[A-Za-z]+/);
        if (nameMatch) {
          const name = nameMatch[0];
          // Handle math expressions like 3000+200
          const mathParts = line.match(/(\d+(\.\d+)?)/g);
          let amount = 0;
          if (mathParts) {
            amount = mathParts.reduce((acc, curr) => acc + parseFloat(curr), 0);
          }
          
          const descriptionMatch = line.match(/\(([^)]+)\)/);
          const description = descriptionMatch ? descriptionMatch[1] : '';

          if (amount > 0) {
            transactions.push({
              type: 'lending',
              personName: name,
              amount: amount,
              lendingType: 'Lent',
              description: description || `Ledger entry for ${name}`
            });
          }
        }
      }
    });

    return transactions;
  };

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsParsing(true);
    
    try {
      const parsedData = parseLedger(text);
      setResults(parsedData);
      
      // Bulk processing (Sequential for simplicity and error tracking)
      for (const item of parsedData) {
        if (item.type === 'expense') {
          await axios.post('http://localhost:5000/api/transactions/expense', {
            title: item.title,
            amount: item.amount,
            category: item.category,
            date: new Date()
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        } else if (item.type === 'lending') {
          // 1. Find or Create Person
          const peopleRes = await axios.get('http://localhost:5000/api/lending/people', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          let person = peopleRes.data.find(p => p.name.toLowerCase() === item.personName.toLowerCase());
          
          if (!person) {
            const newPersonRes = await axios.post('http://localhost:5000/api/lending/person', {
              name: item.personName
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            person = newPersonRes.data;
          }

          // 2. Add Transaction
          await axios.post('http://localhost:5000/api/lending/transaction', {
            personId: person._id,
            type: 'Lent',
            amount: item.amount,
            description: item.description
          }, { headers: { Authorization: `Bearer ${user.token}` } });
        }
      }

      toast.success(`Successfully processed ${parsedData.length} entries!`);
      dispatch(getExpenses());
      dispatch(getPeople());
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process some entries');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-center bg-gradient-to-br from-primary-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Smart Entry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paste your raw notes below</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="relative group">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Example: &#10;Amma 1000 (gave to atthe) &#10;Loan -500 for petrol &#10;Gagan 3000+200+100"
                  className="w-full h-64 bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 text-sm font-bold tracking-tight focus:ring-4 focus:ring-primary-500/10 transition-all resize-none dark:text-white"
                />
                <div className="absolute top-4 right-4 pointer-events-none opacity-20 group-focus-within:opacity-0 transition-opacity">
                  <Wand2 size={24} className="text-primary-500" />
                </div>
              </div>

              {results && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Detected Entries ({results.length})</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {results.map((res, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${res.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {res.type === 'expense' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white">{res.type === 'expense' ? res.title : res.personName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{res.type}</p>
                          </div>
                        </div>
                        <p className="font-black text-sm text-slate-900 dark:text-white">₹{res.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-4">
              <button 
                onClick={handleProcess}
                disabled={isParsing || !text.trim()}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing & Syncing...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Auto-Process Ledger
                  </>
                )}
              </button>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                Powered by AI • Handled Securely
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SmartEntryModal;
