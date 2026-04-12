import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',           // ✅ ensures full width
      margin: 0,    
      marginLeft:-130,            // ✅ removes default body margin
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', top: '10%', left: '5%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)', bottom: '15%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--accent), #8b80ff)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(108,99,255,0.3)' }}>🎓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to continue your study journey</p>
        </div>

        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</> : '🚀 Sign In'}
            </button>
          </form>

          <div className="divider" />

          {/* Demo hint */}
          <div style={{ background: 'rgba(108,99,255,0.08)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            <strong style={{ color: 'var(--accent)' }}>💡 Demo:</strong> Create a free account to explore all features
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>

        {/* Features preview */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
          {['🧠 AI Planner', '⏱️ Pomodoro', '📊 Analytics', '🔥 Habits'].map(f => (
            <span key={f} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}