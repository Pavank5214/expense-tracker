import React, { useState } from 'react';
import { 
  format, isToday, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths, setMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarGrid = ({ activities, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false); // Closed by default as requested
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayColor = (day) => {
    const dayActivities = activities.filter(act => isSameDay(new Date(act.date), day));
    if (dayActivities.length === 0) return null;
    
    const hasIncome = dayActivities.some(a => a.type === 'income' || a.amount > 0);
    const hasExpense = dayActivities.some(a => a.type === 'expense' || a.amount < 0);
    
    if (hasIncome && hasExpense) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
    if (hasIncome) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-3">
      {/* Premium Collapsible Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 p-4 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-indigo-600 text-white rotate-12' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400'}`}>
            <CalendarIcon size={22} strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-0.5">
              {selectedDate ? 'Viewing specific day' : 'Tap to explore history'}
            </p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-all ${isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-500/10' : ''}`}>
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="bg-white dark:bg-slate-900 rounded-[2.25rem] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-2xl shadow-slate-200/20 dark:shadow-none overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[3rem] rounded-full pointer-events-none" />
            
            {/* Calendar Controls */}
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="relative">
                <button 
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-700/50"
                >
                  <Sparkles size={14} className="text-indigo-500" />
                  {format(currentMonth, 'MMMM')} <ChevronDown size={14} strokeWidth={3} className="text-slate-400" />
                </button>
                
                <AnimatePresence>
                  {showMonthPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 12, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.9 }}
                      className="absolute top-full left-0 z-[60] mt-3 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-2 gap-1.5"
                    >
                      {months.map((m, i) => (
                        <button 
                          key={m}
                          onClick={() => { setCurrentMonth(setMonth(currentMonth, i)); setShowMonthPicker(false); }}
                          className={`text-[10px] font-bold py-2.5 rounded-xl transition-all ${currentMonth.getMonth() === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const dotColor = getDayColor(day);

                return (
                  <button
                    key={idx}
                    onClick={() => onDateSelect(isSelected ? null : day)}
                    className={`
                      relative h-12 flex flex-col items-center justify-center rounded-2xl transition-all duration-300
                      ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : 'opacity-100'}
                      ${isSelected ? 'bg-indigo-600 text-white scale-105 shadow-xl shadow-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'}
                      ${isTodayDay && !isSelected ? 'text-indigo-600 dark:text-indigo-400 font-black ring-1 ring-indigo-500/20' : ''}
                    `}
                  >
                    <span className="text-[11px] font-bold">{format(day, 'd')}</span>
                    {dotColor && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white shadow-[0_0_6px_white]' : dotColor}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarGrid;
