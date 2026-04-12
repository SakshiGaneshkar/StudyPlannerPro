import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    studyGoalHours: user?.studyGoalHours || 4,
    energyLevel: user?.energyLevel || 'medium',
    theme: user?.theme || 'dark',
    notifications: user?.notifications !== false,
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('New passwords do not match.');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setSavingPass(true);
    try {
      await API.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setSavingPass(false); }
  };

  const ENERGY_OPTS = [
    { val: 'low', label: '😴 Low Energy', desc: 'Focus on light tasks and reviews' },
    { val: 'medium', label: '😊 Medium Energy', desc: 'Balanced study schedule' },
    { val: 'high', label: '🚀 High Energy', desc: 'Tackle difficult tasks first' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">👤 Profile & Settings</h1>
      <p className="page-subtitle">Manage your account and preferences</p>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b80ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, flexShrink: 0, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🔥 {user?.streak || 0} day streak</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⏱️ {user?.totalStudyHours?.toFixed(1) || 0}h total studied</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📅 Joined {new Date(user?.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>✏️ Edit Profile</button>
        <button className={`tab ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>⚙️ Preferences</button>
        <button className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>🔒 Security</button>
      </div>

      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email cannot be changed</span>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '💾 Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Study Preferences</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Daily Study Goal (hours)</label>
                <input type="range" min={1} max={12} step={0.5} value={form.studyGoalHours} onChange={e => setForm({ ...form, studyGoalHours: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <span>1h</span>
                  <strong style={{ color: 'var(--accent)' }}>{form.studyGoalHours}h / day</strong>
                  <span>12h</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Energy Level</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ENERGY_OPTS.map(({ val, label, desc }) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: `2px solid ${form.energyLevel === val ? 'var(--accent)' : 'var(--border)'}`, background: form.energyLevel === val ? 'rgba(108,99,255,0.08)' : 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                      <input type="radio" name="energy" value={val} checked={form.energyLevel === val} onChange={() => setForm({ ...form, energyLevel: val })} style={{ accentColor: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>🔔 Notifications</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Receive break reminders and alerts</div>
                  </div>
                  <div onClick={() => setForm({ ...form, notifications: !form.notifications })}
                    style={{ width: 44, height: 24, borderRadius: 12, background: form.notifications ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.3s', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: form.notifications ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Preferences'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🔒 Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} placeholder="Repeat new password" />
              {passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword && (
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>Passwords don't match</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPass}>
              {savingPass ? 'Changing...' : '🔒 Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
