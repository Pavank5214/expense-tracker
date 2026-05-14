import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login, reset } from '../store/slices/authSlice';
import { Wallet, Mail, Lock, ArrowRight, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    dispatch(login(formData));
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
              <Wallet size={36} className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Manage Wealth <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Like a Pro.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed font-medium">
                The only platform you need to track personal expenses and manage peer-to-peer lending with elegant precision.
              </p>
            </div>
            
            {/* Glass Social Proof */}
            <div className="flex items-center gap-5 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[1.5rem] w-max shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img 
                    key={i} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-100" 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} 
                    alt="User" 
                  />
                ))}
              </div>
              <div className="pr-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">10k+ Users</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Join the elite</p>
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
                <Wallet size={32} />
              </div>
            </div>

            <div className="text-center lg:text-left mb-8 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-medium text-sm">Sign in to access your secure vault.</p>
            </div>

            <form className="space-y-5 relative z-10" onSubmit={onSubmit}>
              
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

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link to="#" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Recover?</Link>
                </div>
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

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full py-4 rounded-[1.25rem] bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In Securely'}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>

            <div className="mt-8 relative z-10">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/40 dark:border-slate-700/40"></div>
                </div>
                <span className="relative px-4 bg-transparent text-[10px] font-bold text-slate-500 uppercase tracking-widest backdrop-blur-sm">Or continue with</span>
              </div>

              {/* Glass Social Buttons */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-3.5 border border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-white/5 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all shadow-sm group">
                  <Globe size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Google</span>
                </button>
                <button className="flex-1 py-3.5 border border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-white/5 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all shadow-sm group">
                  <ShieldCheck size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Passkey</span>
                </button>
              </div>
            </div>

            <p className="mt-10 text-center text-sm font-medium text-slate-600 dark:text-slate-400 relative z-10">
              New here?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;