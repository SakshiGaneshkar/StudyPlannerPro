import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate, daysUntil, getDeadlineColor, getPriorityBadgeClass } from '../utils/constants';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month or week

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tasksRes, sessionsRes] = await Promise.allSettled([
        API.get('/tasks'),
        API.get('/sessions?limit=100'),
      ]);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.tasks || []);
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data.sessions || []);
    } catch (e) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const getTasksForDate = (dateStr) => tasks.filter(t => {
    const dl = t.deadline ? t.deadline.split('T')[0] : null;
    const sd = t.scheduledDate ? t.scheduledDate.split('T')[0] : null;
    return dl === dateStr || sd === dateStr;
  });

  const getSessionsForDate = (dateStr) => sessions.filter(s => s.date === dateStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    days.push(d.toISOString().split('T')[0]);
  }

  const today = new Date().toISOString().split('T')[0];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedTasks = getTasksForDate(selectedDate);
  const selectedSessions = getSessionsForDate(selectedDate);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📅 Study Calendar</h1>
          <p className="page-subtitle">Track deadlines and study sessions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card">
          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={prevMonth} className="btn btn-secondary btn-sm">← Prev</button>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{MONTH_NAMES[month]} {year}</h3>
            <button onClick={nextMonth} className="btn btn-secondary btn-sm">Next →</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 0', letterSpacing: 0.5 }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((dateStr, idx) => {
              if (!dateStr) return <div key={`pad-${idx}`} />;
              const dayTasks = getTasksForDate(dateStr);
              const daySessions = getSessionsForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const hasUrgent = dayTasks.some(t => t.priority === 'urgent' || t.priority === 'high');
              const dayNum = new Date(dateStr).getDate();

              return (
                <div key={dateStr} onClick={() => setSelectedDate(dateStr)}
                  style={{ minHeight: 70, padding: '6px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${isSelected ? 'var(--accent)' : isToday ? 'rgba(108,99,255,0.3)' : 'transparent'}`, background: isSelected ? 'rgba(108,99,255,0.12)' : isToday ? 'rgba(108,99,255,0.06)' : 'var(--bg-secondary)', transition: 'var(--transition)', position: 'relative' }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(108,99,255,0.06)' : 'var(--bg-secondary)'; }}>
                  <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 4 }}>{dayNum}</div>
                  {dayTasks.slice(0, 2).map((t, i) => (
                    <div key={i} style={{ fontSize: 9, fontWeight: 600, padding: '2px 4px', borderRadius: 4, marginBottom: 2, background: t.subjectColor || 'var(--accent)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{dayTasks.length - 2} more</div>}
                  {daySessions.length > 0 && (
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} title={`${daySessions.length} sessions`} />
                  )}
                  {hasUrgent && (
                    <div style={{ position: 'absolute', top: 4, left: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> Today</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> Has Sessions</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} /> Urgent Task</div>
          </div>
        </div>

        {/* Selected day panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {selectedDate === today ? '📌 Today' : daysUntil(selectedDate) > 0 ? `In ${daysUntil(selectedDate)} days` : `${Math.abs(daysUntil(selectedDate))} days ago`}
            </p>

            {selectedTasks.length === 0 && selectedSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-secondary)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
                Nothing scheduled
              </div>
            ) : (
              <>
                {selectedTasks.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Tasks</div>
                    {selectedTasks.map(task => (
                      <div key={task._id} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 8, borderLeft: `3px solid ${task.subjectColor || 'var(--accent)'}` }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{task.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.subject}</span>
                          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSessions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Study Sessions</div>
                    {selectedSessions.map(session => (
                      <div key={session._id} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 8, borderLeft: '3px solid var(--success)' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{session.subject}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱️ {session.duration || 0}min • 🎯 {session.focusScore || 0}% focus</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⏳ Upcoming Deadlines</h3>
            {tasks.filter(t => daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 7 && t.status !== 'completed')
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 5)
              .map(task => {
                const days = daysUntil(task.deadline);
                return (
                  <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.subject}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: getDeadlineColor(days), whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {days === 0 ? 'Today!' : `${days}d`}
                    </span>
                  </div>
                );
              })}
            {tasks.filter(t => daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 7 && t.status !== 'completed').length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No deadlines in the next 7 days! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
