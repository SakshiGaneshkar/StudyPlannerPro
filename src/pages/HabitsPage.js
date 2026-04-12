import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { HABIT_ICONS } from '../utils/constants';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#6C63FF', '#FF6584', '#43E97B', '#F7971E', '#4facfe', '#f093fb', '#43e97b'];

const emptyForm = { name: '', description: '', targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], color: '#6C63FF', icon: '📚' };

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const today = new Date().toISOString().split('T')[0];

  // Last 7 days for calendar strip
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return { date: d.toISOString().split('T')[0], day: d.toLocaleDateString('en', { weekday: 'short' }), dayNum: d.getDate() };
  });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const { data } = await API.get('/habits');
      setHabits(data.habits || []);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Please enter a habit name.');
    try {
      const { data } = await API.post('/habits', form);
      setHabits([...habits, data.habit]);
      setShowModal(false);
      setForm(emptyForm);
      toast.success('Habit created! 🔥');
    } catch { toast.error('Failed to create habit.'); }
  };

  const toggleHabit = async (habitId, date) => {
    try {
      const { data } = await API.patch(`/habits/${habitId}/check`, { date });
      setHabits(habits.map(h => h._id === habitId ? data.habit : h));
    } catch { toast.error('Failed to update habit.'); }
  };

  const deleteHabit = async (habitId) => {
    if (!window.confirm('Remove this habit?')) return;
    try {
      await API.delete(`/habits/${habitId}`);
      setHabits(habits.filter(h => h._id !== habitId));
      toast.success('Habit removed.');
    } catch { toast.error('Failed to remove habit.'); }
  };

  const toggleDay = (day) => {
    const days = form.targetDays.includes(day) ? form.targetDays.filter(d => d !== day) : [...form.targetDays, day];
    setForm({ ...form, targetDays: days });
  };

  const totalCompletedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const overallStreak = habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">🔥 Habit Builder</h1>
          <p className="page-subtitle">Build consistency, one day at a time</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New Habit</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--card-accent': 'var(--warning)' }}>
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{overallStreak}</span>
          <span className="stat-label">Best Active Streak</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--success)' }}>
          <span className="stat-icon">✅</span>
          <span className="stat-value">{totalCompletedToday}/{habits.length}</span>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--accent)' }}>
          <span className="stat-icon">📊</span>
          <span className="stat-value">{habits.length > 0 ? Math.round((totalCompletedToday / habits.length) * 100) : 0}%</span>
          <span className="stat-label">Today's Rate</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--info)' }}>
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{habits.length}</span>
          <span className="stat-label">Active Habits</span>
        </div>
      </div>

      {/* Week strip */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 This Week at a Glance</h3>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {last7.map(({ date, day, dayNum }) => {
            const completedCount = habits.filter(h => h.completedDates?.includes(date)).length;
            const rate = habits.length > 0 ? completedCount / habits.length : 0;
            const isToday = date === today;
            return (
              <div key={date} style={{ flex: 1, minWidth: 60, textAlign: 'center', padding: '8px 4px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>{day}</div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: rate > 0.8 ? 'var(--success)' : rate > 0.5 ? 'var(--warning)' : rate > 0 ? 'rgba(108,99,255,0.3)' : 'var(--bg-secondary)', color: rate > 0 ? '#fff' : 'var(--text-muted)', border: isToday ? '2px solid var(--accent)' : 'none' }}>
                  {dayNum}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{habits.length > 0 ? `${completedCount}/${habits.length}` : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h3>No habits yet</h3>
          <p>Start building positive study habits today!</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}>+ Add First Habit</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {habits.map(habit => {
            const isToday = habit.completedDates?.includes(today);
            return (
              <div key={habit._id} className="card" style={{ padding: '18px 20px', borderLeft: `4px solid ${habit.color || '#6C63FF'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Check button */}
                  <button onClick={() => toggleHabit(habit._id, today)}
                    style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${habit.color || 'var(--accent)'}`, background: isToday ? (habit.color || 'var(--accent)') : 'transparent', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'var(--transition)' }}
                    title={isToday ? 'Uncheck' : 'Mark complete'}>
                    {isToday ? '✓' : habit.icon || '📚'}
                  </button>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{habit.name}</span>
                      {isToday && <span style={{ fontSize: 11, background: 'rgba(67,233,123,0.15)', color: 'var(--success)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Done today!</span>}
                    </div>
                    {habit.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{habit.description}</p>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🎯 {habit.targetDays?.join(', ')}</span>
                      <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>🔥 {habit.currentStreak || 0} day streak</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🏆 Best: {habit.longestStreak || 0}</span>
                    </div>
                  </div>

                  {/* 7-day mini calendar */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {last7.map(({ date, day }) => {
                      const done = habit.completedDates?.includes(date);
                      return (
                        <div key={date} title={`${day} — ${done ? 'Done' : 'Missed'}`}
                          style={{ width: 24, height: 24, borderRadius: 6, background: done ? (habit.color || 'var(--accent)') : 'var(--bg-secondary)', border: `1px solid ${done ? 'transparent' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: done ? '#fff' : 'var(--text-muted)' }}
                          onClick={() => toggleHabit(habit._id, date)}>
                          {done ? '✓' : ''}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => deleteHabit(habit._id)} className="btn btn-danger btn-sm btn-icon" title="Remove habit">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">🌱 New Habit</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createHabit}>
              <div className="form-group">
                <label className="form-label">Habit Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Study for 2 hours" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {HABIT_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                      style={{ width: 36, height: 36, borderRadius: 8, border: form.icon === icon ? '2px solid var(--accent)' : '2px solid var(--border)', background: form.icon === icon ? 'rgba(108,99,255,0.15)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: 18 }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Days</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${form.targetDays.includes(day) ? 'var(--accent)' : 'var(--border)'}`, background: form.targetDays.includes(day) ? 'rgba(108,99,255,0.2)' : 'transparent', color: form.targetDays.includes(day) ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: form.targetDays.includes(day) ? 600 : 400 }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">🌱 Create Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
