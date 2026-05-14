import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Bell, Lock, Database, LogOut, ChevronRight, 
  Moon, Sun, CreditCard, BadgeCheck, Zap, ArrowRight,
  ShieldCheck, HelpCircle, X, Camera, ChevronDown, Mail, Phone,
  Calendar, CheckCircle2, History
} from 'lucide-react';
import { logout, updateProfile, reset } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuccess, isError, message } = useSelector((state) => state.auth);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    gender: user?.gender || 'male',
    phoneNumber: user?.phoneNumber || ''
  });

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
    if (isSuccess && showEditModal) {
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch, showEditModal]);

  // Update local edit state when user data changes (e.g. after successful update)
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || 'male',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    setTimeout(() => {
      dispatch(logout());
      toast.success('Logged out successfully');
    }, 150);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile(editData));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
  };

  // Improved Avatar logic: Force new style unless it's a custom upload (not starting with dicebear)
  const avatarUrl = (user?.avatar && !user.avatar.includes('avataaars')) 
    ? user.avatar 
    : `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.gender === 'female' ? 'Willow' : 'Loki'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-8 pb-32 pt-4 px-4"
    >
      {/* Luxury Profile Card */}
      <motion.div variants={itemVariants} className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] border border-white/10 shadow-2xl shadow-slate-900/20">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[4rem] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/20 blur-[4rem] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar Container */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-[3px] shadow-xl">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover bg-slate-900 shadow-inner"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-indigo-500 text-white p-1 rounded-full border-[3px] border-slate-900 shadow-sm">
                <BadgeCheck size={16} strokeWidth={2.5} />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center sm:text-left space-y-4 w-full">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user?.name || 'Guest User'}</h2>
                <p className="text-slate-400 font-medium text-sm mt-0.5">{user?.email || 'guest@finance.app'}</p>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-slate-300 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-white/10 shadow-sm capitalize">
                  {user?.gender || 'male'}
                </span>
              </div>

              <div className="pt-2 sm:pt-4 border-t border-white/5 sm:border-transparent">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2.5 rounded-full text-sm font-semibold transition-all backdrop-blur-md active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-8">
        
        {/* Dynamic Account Details */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Account Details</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
            {[
              { icon: <Mail size={18}/>, label: 'Email Address', value: user?.email, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100/50 dark:bg-indigo-500/20' },
              { icon: <Phone size={18}/>, label: 'Phone Number', value: user?.phoneNumber || 'Not provided', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100/50 dark:bg-purple-500/20' },
              { icon: <Calendar size={18}/>, label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'Unknown', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100/50 dark:bg-emerald-500/20' },
              { icon: <CheckCircle2 size={18}/>, label: 'Status', value: 'Active / Verified', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100/50 dark:bg-blue-500/20' },
            ].map((item, idx, arr) => (
              <div 
                key={idx} 
                className={`w-full p-4 sm:p-5 flex items-center justify-between transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Activity Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Personal Records</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
            <button 
              onClick={() => navigate('/activity')}
              className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-amber-600 bg-amber-100/50 dark:bg-amber-500/20">
                  <History size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Recent Activity History</p>
                  <p className="text-xs text-slate-500 mt-0.5">View and manage all transactions</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div variants={itemVariants} className="pt-2">
          <button 
            onClick={handleLogout}
            className="w-full py-4 rounded-[1.25rem] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-[0.98] transition-all border border-rose-100 dark:border-rose-500/20"
          >
            <LogOut size={18} />
            Sign Out Securely
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Centered Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 z-[60] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 pointer-events-auto overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                  <p className="text-sm text-slate-500 mt-1">Keep your information up to date</p>
                </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 pb-6">
                
                {/* Editable Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-800 p-1 border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors">
                      <img src={avatarUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md group-hover:scale-110 transition-transform">
                      <Camera size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="name@domain.com"
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white"
                          value={editData.phoneNumber}
                          onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Gender</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.25rem] py-3.5 px-5 text-sm font-medium appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white"
                          value={editData.gender}
                          onChange={(e) => setEditData({...editData, gender: e.target.value})}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-sm font-bold tracking-wide shadow-lg active:scale-[0.98] transition-all">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;