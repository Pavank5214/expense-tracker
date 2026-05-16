import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster, resolveValue, toast as hotToast } from 'react-hot-toast';
import { X } from 'lucide-react';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Lending from './pages/Lending';
import Subscriptions from './pages/Subscriptions';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import RecentActivity from './pages/RecentActivity';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '1rem',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
          },
        }}
      >
        {(t) => (
          <div 
            style={{
              ...t.style,
              opacity: t.visible ? 1 : 0,
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              borderRadius: '1.25rem',
              width: '100%',
              minWidth: '280px',
              maxWidth: '380px',
            }}
            className={`${t.visible ? 'animate-in fade-in zoom-in-95 duration-300' : 'animate-out fade-out zoom-out-95 duration-300'} flex items-center gap-4 p-4 mx-auto`}
          >
            <div className="shrink-0 flex items-center justify-center">{t.icon}</div>
            <div className="flex-1 text-slate-100 font-bold tracking-tight leading-tight">
              {resolveValue(t.message, t)}
            </div>
            {(t.type === 'success' || t.type === 'error') && (
              <button 
                onClick={() => hotToast.dismiss(t.id)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </Toaster>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="income" element={<Income />} />
          <Route path="lending" element={<Lending />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activity" element={<RecentActivity />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
