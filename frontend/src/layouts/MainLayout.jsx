import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowDownUp, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search,
  Bell
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Expenses', icon: <Wallet size={20} />, path: '/expenses' },
    { name: 'Income', icon: <ArrowDownUp size={20} />, path: '/income' },
    { name: 'Lending', icon: <Users size={20} />, path: '/lending' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.gender === 'female' ? 'Aria' : 'Felix'}&backgroundColor=transparent`;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-300">
      
      {/* --- OPTIMIZED AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-transform">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] sm:blur-[140px] transform-gpu"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] sm:blur-[140px] transform-gpu"
        />
      </div>

      {/* GLASS SIDEBAR - Faster & Smoother Transition */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/40 dark:border-white/10 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden lg:flex flex-col shadow-[8px_0_32px_0_rgba(31,38,135,0.05)] transform-gpu`}>
        <div className="flex flex-col h-full relative z-10">
          
          {/* Logo Area */}
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/20 rounded-[1.25rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl shadow-lg shadow-indigo-500/10">
              F
            </div>
            <span className="text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
              FinTrack
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-5 space-y-2 overflow-y-auto scrollbar-hide">
            <p className="text-[10px] font-bold text-slate-500/80 dark:text-slate-400/80 uppercase tracking-widest mb-4 ml-3">Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/80 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5 hover:border-white/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'} transition-all duration-200`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className="p-5 mt-auto border-t border-white/40 dark:border-white/10">
            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-4 py-3.5 text-slate-500 hover:text-rose-600 bg-transparent hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:border-white/50 dark:hover:border-white/10 rounded-[1.25rem] transition-all group font-semibold tracking-wide"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* GLASS MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50 transform-gpu">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-2 flex items-center justify-around border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          {[
            { path: '/', icon: LayoutDashboard, label: 'Home' },
            { path: '/expenses', icon: Wallet, label: 'Spent' },
            { path: '/income', icon: ArrowDownUp, label: 'Income' },
            { path: '/lending', icon: Users, label: 'Lend' },
            { path: '/settings', icon: Settings, label: 'Settings' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-white/80 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-[1.25rem] -z-10 backdrop-blur-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={22} className={`transition-transform duration-200 ${isActive ? 'scale-110 mb-1 drop-shadow-sm' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 lg:pb-0 relative z-10 transform-gpu">
        
        {/* GLASS HEADER */}
        <header className="h-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/40 dark:border-white/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          
          <div className="flex items-center gap-4 lg:hidden">
            <Link to="/settings" className="flex flex-col transition-all active:scale-95">
              <span className="text-xs text-slate-500 font-semibold tracking-wide">Good Day,</span>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{user?.name?.split(' ')[0] || 'Guest'}</span>
            </Link>
          </div>

          {/* Glass Search Bar */}
          <div className="flex-1 max-w-xl hidden lg:flex items-center bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] px-5 py-3.5 group focus-within:bg-white/80 dark:focus-within:bg-white/10 transition-all border border-white/40 dark:border-white/10 shadow-sm">
            <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors drop-shadow-sm" />
            <input 
              type="text" 
              placeholder="Search transactions, contacts, or settings..." 
              className="bg-transparent border-none outline-none px-4 w-full text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500/80"
            />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-5 ml-auto">
            <button className="hidden sm:flex w-10 h-10 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white/80 dark:border-slate-800"></span>
            </button>
            
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{user?.name || 'Guest User'}</span>
            </div>
            
            <Link to="/settings" className="relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-200"></div>
              <div className="relative p-0.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-md group-active:scale-95 transition-transform">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-11 h-11 rounded-full object-cover bg-white/50 dark:bg-slate-800"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* DYNAMIC OUTLET AREA */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default MainLayout;