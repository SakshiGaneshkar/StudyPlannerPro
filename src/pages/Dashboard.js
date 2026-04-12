import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { getRandomQuote, formatTime, formatDate, daysUntil, getDeadlineColor, getPriorityBadgeClass } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [burnout, setBurnout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(getRandomQuote());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, tasksRes, burnoutRes] = await Promise.allSettled([
        API.get('/analytics/overview'),
        API.get('/tasks?status=pending'),
        API.get('/sessions/burnout-check'),
      ]);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.tasks || []);
      if (burnoutRes.status === 'fulfilled') setBurnout(burnoutRes.value.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTask = async (taskId) => {
    try {
      await API.patch(`/tasks/${taskId}/complete`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task completed! 🎉');
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const getBurnoutColor = (level) => {
    const map = { normal: 'var(--success)', low: 'var(--info)', moderate: 'var(--warning)', high: 'var(--danger)' };
    return map[level] || 'var(--success)';
  };

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 5);
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.scheduledDate || t.deadline);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).slice(0, 3);

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto 16px' }} /><p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p></div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your study overview for today</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/planner" className="btn btn-secondary btn-sm">📋 Add Task</Link>
          <Link to="/focus" className="btn btn-primary btn-sm">🎯 Start Focus</Link>
        </div>
      </div>

      {/* Burnout Alert */}
      {burnout && burnout.burnoutLevel !== 'normal' && (
        <div className={`alert alert-${burnout.burnoutLevel === 'high' ? 'danger' : burnout.burnoutLevel === 'moderate' ? 'warning' : 'info'}`} style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>{burnout.burnoutLevel === 'high' ? '⚠️' : burnout.burnoutLevel === 'moderate' ? '⚡' : '📉'}</span>
          <div>
            <strong>{burnout.message}</strong>
            <br /><span style={{ fontSize: 13, opacity: 0.85 }}>{burnout.suggestion}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': 'var(--accent)' }}>
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{analytics?.totalHours || '0'}<span style={{ fontSize: 16, fontWeight: 400 }}>h</span></span>
          <span className="stat-label">Total Study Hours</span>
          <span className="stat-change">↑ This month</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--success)' }}>
          <span className="stat-icon">✅</span>
          <span className="stat-value">{analytics?.completedTasks || 0}</span>
          <span className="stat-label">Tasks Completed</span>
          <span className="stat-change" style={{ color: 'var(--success)' }}>{analytics?.completionRate || 0}% rate</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--warning)' }}>
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{user?.streak || 0}</span>
          <span className="stat-label">Day Streak</span>
          <span className="stat-change" style={{ color: 'var(--warning)' }}>Keep it up!</span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--danger)' }}>
          <span className="stat-icon">⏳</span>
          <span className="stat-value">{analytics?.delayedTasks || 0}</span>
          <span className="stat-label">Overdue Tasks</span>
          <span className="stat-change" style={{ color: analytics?.delayedTasks > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {analytics?.delayedTasks > 0 ? 'Needs attention' : 'All clear!'}
          </span>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--info)' }}>
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{analytics?.procrastinationScore || 0}<span style={{ fontSize: 16 }}>%</span></span>
          <span className="stat-label">Procrastination Score</span>
          <span className="stat-change" style={{ color: (analytics?.procrastinationScore || 0) < 30 ? 'var(--success)' : 'var(--danger)' }}>
            {(analytics?.procrastinationScore || 0) < 30 ? 'Excellent!' : 'Needs improvement'}
          </span>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#f093fb' }}>
          <span className="stat-icon">💚</span>
          <span className="stat-value">{analytics?.habitCompletionRate || 0}<span style={{ fontSize: 16 }}>%</span></span>
          <span className="stat-label">Habit Completion</span>
          <span className="stat-change" style={{ color: 'var(--success)' }}>{analytics?.activeHabits || 0} active habits</span>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Today's Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>📅 Today's Tasks</h3>
            <Link to="/planner" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {todayTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div style={{ fontSize: 36 }}>🎉</div>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>No tasks scheduled for today!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayTasks.map(task => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <button onClick={() => completeTask(task._id)} style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--accent)', background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Complete">✓</button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.subject}</div>
                  </div>
                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>🚨 Priority Tasks</h3>
            <Link to="/planner" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {urgentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>No urgent tasks right now!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {urgentTasks.map(task => {
                const days = daysUntil(task.deadline);
                return (
                  <div key={task._id} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', borderLeft: `3px solid ${getDeadlineColor(days)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</span>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.subject}</span>
                      <span style={{ fontSize: 12, color: getDeadlineColor(days), fontWeight: 600 }}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today!' : `${days}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quote + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Quote */}
        <div className="quote-card">
          <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12, position: 'relative', zIndex: 1 }}>"{quote.text}"</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>— {quote.author}</p>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>⚡ Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { to: '/focus', icon: '🎯', label: 'Start Focus', color: 'var(--accent)' },
              { to: '/planner', icon: '📋', label: 'Add Task', color: 'var(--success)' },
              { to: '/habits', icon: '🔥', label: 'Check Habits', color: 'var(--warning)' },
              { to: '/analytics', icon: '📊', label: 'Analytics', color: 'var(--info)' },
            ].map(action => (
              <Link key={action.to} to={action.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <span style={{ fontSize: 20 }}>{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Burnout indicator */}
      {burnout && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>💚 Burnout Monitor</h3>
            <span style={{ fontSize: 12, color: getBurnoutColor(burnout.burnoutLevel), fontWeight: 600, textTransform: 'uppercase' }}>{burnout.burnoutLevel}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{burnout.totalHours}h</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>This Week</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{burnout.dailyAvg}h</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Daily Average</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{burnout.goalHours}h</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Your Goal</div>
            </div>
          </div>
          <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
            <div className="progress-bar" style={{ width: `${Math.min(100, (parseFloat(burnout.dailyAvg) / burnout.goalHours) * 100)}%`, background: `linear-gradient(90deg, var(--success), ${getBurnoutColor(burnout.burnoutLevel)})` }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>{burnout.suggestion}</p>
        </div>
      )}
    </div>
  );
}
