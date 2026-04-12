import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#FF6584', '#F7971E', '#43E97B'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

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
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,233,123,0.1) 0%, transparent 70%)', top: '5%', right: '5%' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', bottom: '10%', left: '5%' }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, var(--accent-3), #43c97b)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(67,233,123,0.25)' }}>🚀</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Start Your Journey</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create your free account and boost your productivity</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" type="text" className="form-input" placeholder="Your Name" value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--border)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={handleChange} />
              {form.confirm && form.confirm !== form.password && (
                <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, display: 'block' }}>Passwords don't match</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : '✨ Create Free Account'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          {[
            { icon: '🧠', text: 'AI Study Planner' },
            { icon: '📊', text: 'Progress Analytics' },
            { icon: '🔥', text: 'Habit Builder' },
            { icon: '🎯', text: 'Focus Mode' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>{f.icon}</span>{f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}