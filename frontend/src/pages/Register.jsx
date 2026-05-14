import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register, reset } from '../store/slices/authSlice';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', gender: 'male' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) navigate('/');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-500 p-4 sm:p-8">
      
      {/* --- AMBIENT ANIMATED BACKGROUND ORBS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-purple-400/40 dark:bg-purple-600/20 blur-[100px] sm:blur-[140px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 80, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-400/40 dark:bg-indigo-600/20 blur-[100px] sm:blur-[140px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full bg-emerald-400/30 dark:bg-emerald-600/10 blur-[100px] sm:blur-[140px] mix-blend-multiply dark:mix-blend-screen"
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10">
        
        {/* --- LEFT: FLOATING SHOWCASE (Hidden on Mobile) --- */}
        <div className="hidden lg:flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Glass Logo */}
            <div className="w-20 h-20 bg-white/40 dark:bg-white/10 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center border border-white/60 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
              <ShieldCheck size={36} className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Securely Scale <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Your Savings.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed font-medium">
                Your financial privacy is our top priority. Everything is encrypted, allowing you to track and manage wealth with peace of mind.
              </p>
            </div>
            
            {/* Glass Social Proof */}
            <div className="flex items-center gap-5 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[1.5rem] w-max shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <img 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-100" 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+30}`} 
                    alt="User" 
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+12k</div>
              </div>
              <div className="pr-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Active Savers</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Joined this month</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- RIGHT: GLASS FORM CARD --- */}
        <div className="flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-md bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            {/* Subtle inner highlight for the glass edge */}
            <div className="absolute inset-0 border border-white/40 dark:border-white/5 rounded-[2.5rem] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"></div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.25rem] shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
                <ShieldCheck size={32} />
              </div>
            </div>

            <div className="text-center lg:text-left mb-8 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-medium text-sm">Join thousands managing wealth smarter.</p>
            </div>

            <form className="space-y-5 relative z-10" onSubmit={onSubmit}>
              
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white/80 dark:focus:bg-slate-900/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white/80 dark:focus:bg-slate-900/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                    placeholder="name@fintrack.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password & Gender Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white/80 dark:focus:bg-slate-900/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-500/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {/* Gender Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Gender</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-[1.25rem] py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white/80 dark:focus:bg-slate-900/50 outline-none transition-all text-slate-900 dark:text-white appearance-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="male" className="text-slate-900">Male</option>
                      <option value="female" className="text-slate-900">Female</option>
                      <option value="other" className="text-slate-900">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full py-4 rounded-[1.25rem] bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Get Started'}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400 relative z-10">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};

export default Register;
