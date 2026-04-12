import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import FocusMode from './pages/FocusMode';
import Profile from './pages/Profile';
import HabitsPage from './pages/HabitsPage';
import About from './pages/About';
import Help from './pages/Help';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Loading StudyPro...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="app-layout">
      {user && <Sidebar />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/planner" element={<PrivateRoute><Planner /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
        <Route path="/focus" element={<PrivateRoute><FocusMode /></PrivateRoute>} />
        <Route path="/habits" element={<PrivateRoute><HabitsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#43E97B', secondary: '#fff' } },
            error: { iconTheme: { primary: '#FF6584', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
