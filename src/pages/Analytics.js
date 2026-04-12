import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import API from '../utils/api';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const COLORS = ['#6C63FF', '#FF6584', '#43E97B', '#F7971E', '#4facfe', '#f093fb', '#fa709a', '#a18cd1'];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ovRes, wkRes] = await Promise.allSettled([
        API.get('/analytics/overview'),
        API.get('/analytics/weekly'),
      ]);
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data);
      if (wkRes.status === 'fulfilled') setWeekly(wkRes.value.data.weeklyData || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(108, 99, 255);
      doc.text('StudyPro - Analytics Report', 20, 25);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);

      if (overview) {
        doc.setFontSize(16);
        doc.text('Overview Statistics', 20, 55);
        doc.setFontSize(12);
        const stats = [
          ['Total Study Hours', `${overview.totalHours}h`],
          ['Total Sessions', overview.totalSessions],
          ['Tasks Completed', overview.completedTasks],
          ['Completion Rate', `${overview.completionRate}%`],
          ['Procrastination Score', `${overview.procrastinationScore}%`],
          ['Habit Completion Rate', `${overview.habitCompletionRate}%`],
          ['Delayed Tasks', overview.delayedTasks],
          ['Active Habits', overview.activeHabits],
        ];
        stats.forEach(([label, value], idx) => {
          doc.text(`${label}: ${value}`, 20, 65 + idx * 10);
        });
      }

      if (weekly.length) {
        doc.setFontSize(16);
        doc.text('Weekly Breakdown', 20, 155);
        doc.setFontSize(11);
        weekly.forEach((d, i) => {
          doc.text(`${d.day} (${d.date}): ${d.hours}h, ${d.sessions} sessions, ${d.avgFocus}% focus`, 20, 165 + i * 9);
        });
      }

      if (overview?.subjectHours) {
        doc.setFontSize(16);
        doc.text('Hours by Subject', 20, 235);
        doc.setFontSize(11);
        let y = 245;
        Object.entries(overview.subjectHours).forEach(([subject, hours]) => {
          if (y < 280) { doc.text(`${subject}: ${hours.toFixed(1)}h`, 20, y); y += 9; }
        });
      }

      doc.save('StudyPro_Analytics_Report.pdf');
      toast.success('📄 Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export report.');
    }
  };

  const subjectData = overview?.subjectHours
    ? Object.entries(overview.subjectHours).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) }))
    : [];

  const taskData = overview ? [
    { name: 'Completed', value: overview.completedTasks || 0 },
    { name: 'Pending', value: (overview.totalTasks - overview.completedTasks - overview.delayedTasks) || 0 },
    { name: 'Delayed', value: overview.delayedTasks || 0 },
  ].filter(d => d.value > 0) : [];

  const burnoutScore = overview ? Math.min(100, (parseFloat(overview.totalHours || 0) / (7 * 4)) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 13 }}>{p.name}: {p.value}</p>)}
      </div>
    );
    return null;
  };

  if (loading) return <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📊 Analytics Dashboard</h1>
          <p className="page-subtitle">Track your performance and identify patterns</p>
        </div>
        <button onClick={exportPDF} className="btn btn-secondary btn-sm">📄 Export PDF Report</button>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: '⏱️', value: `${overview?.totalHours || 0}h`, label: 'Total Study Hours', color: 'var(--accent)' },
          { icon: '📚', value: overview?.totalSessions || 0, label: 'Study Sessions', color: 'var(--info)' },
          { icon: '✅', value: `${overview?.completionRate || 0}%`, label: 'Task Completion Rate', color: 'var(--success)' },
          { icon: '🎯', value: `${overview?.procrastinationScore || 0}%`, label: 'Procrastination Score', color: (overview?.procrastinationScore || 0) < 30 ? 'var(--success)' : 'var(--danger)' },
          { icon: '🔥', value: `${overview?.habitCompletionRate || 0}%`, label: 'Habit Rate Today', color: 'var(--warning)' },
          { icon: '📉', value: overview?.delayedTasks || 0, label: 'Delayed Tasks', color: 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--card-accent': s.color }}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Daily Hours Line Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📈 Daily Study Hours (This Week)</h3>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="hours" stroke="#6C63FF" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 5 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No session data yet. Start studying to see your progress!</p></div>}
        </div>

        {/* Task Completion Pie */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🥧 Task Status Breakdown</h3>
          {taskData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={taskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {taskData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {taskData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.value} tasks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No task data yet. Add tasks to see breakdown!</p></div>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Subject Hours Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📚 Hours by Subject</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" radius={[6, 6, 0, 0]}>
                  {subjectData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No study sessions logged yet!</p></div>}
        </div>

        {/* Focus Score Line */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎯 Focus Score Trend</h3>
          {weekly.some(d => d.avgFocus > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgFocus" stroke="#43E97B" strokeWidth={2.5} dot={{ fill: '#43E97B', r: 5 }} name="Focus %" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding: 40 }}><p>No focus data yet. Use Focus Mode to track!</p></div>}
        </div>
      </div>

      {/* Burnout Indicator */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>💚 Burnout Level Indicator</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Current Load</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: burnoutScore > 80 ? 'var(--danger)' : burnoutScore > 60 ? 'var(--warning)' : 'var(--success)' }}>{Math.round(burnoutScore)}%</span>
            </div>
            <div className="progress-bar-wrap" style={{ height: 14 }}>
              <div className="progress-bar" style={{ width: `${burnoutScore}%`, background: `linear-gradient(90deg, #43E97B, ${burnoutScore > 80 ? '#FF6584' : burnoutScore > 60 ? '#F7971E' : '#43E97B'})` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--success)' }}>Healthy</span>
              <span style={{ fontSize: 11, color: 'var(--warning)' }}>Moderate</span>
              <span style={{ fontSize: 11, color: 'var(--danger)' }}>Burnout Risk</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 40 }}>{burnoutScore > 80 ? '😰' : burnoutScore > 60 ? '😐' : '😊'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{burnoutScore > 80 ? 'High Risk' : burnoutScore > 60 ? 'Moderate' : 'Healthy'}</div>
          </div>
        </div>
      </div>

      {/* Weekly performance bar */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 Weekly Performance Overview</h3>
        {weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              <Bar dataKey="hours" name="Study Hours" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sessions" name="Sessions" fill="#43E97B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state" style={{ padding: 40 }}><p>Start logging study sessions to see weekly performance!</p></div>}
      </div>
    </div>
  );
}
