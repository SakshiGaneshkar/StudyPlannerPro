import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🧠', title: 'AI Study Plan Generator', desc: 'Automatically distributes tasks based on deadline, daily hours, and energy patterns.' },
  { icon: '🎯', title: 'Smart Focus Mode', desc: 'Full-screen Pomodoro timer with distraction tracking and site blocklist.' },
  { icon: '💚', title: 'Burnout Detection', desc: 'Monitors weekly study load and alerts when you risk burnout or underperform.' },
  { icon: '⚡', title: 'Energy-Based Planner', desc: 'Matches tasks to your current energy level for maximum efficiency.' },
  { icon: '🔥', title: 'Habit Builder', desc: 'Daily habit tracking with streaks, calendar visualization, and consistency metrics.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Bar, line, and pie charts showing study hours, focus scores, and task completion.' },
  { icon: '🚨', title: 'Procrastination Tracker', desc: 'Detects delayed tasks, shows procrastination score, and suggests recovery tips.' },
  { icon: '📅', title: 'Interactive Calendar', desc: 'Visual calendar with task deadlines, session markers, and day-detail panel.' },
];

const TEAM = [
  { name: 'StudyPro Team', role: 'Core Development', emoji: '👨‍💻' },
  { name: 'AI Engine', role: 'Smart Planning', emoji: '🤖' },
  { name: 'UX Design', role: 'User Experience', emoji: '🎨' },
  { name: 'Backend Systems', role: 'Node.js + MongoDB', emoji: '⚙️' },
];

export default function About() {
  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48, padding: '48px 24px', background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,101,132,0.08))', borderRadius: 24, border: '1px solid rgba(108,99,255,0.2)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, marginBottom: 12 }}>StudyPro</h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.6 }}>
          An intelligent productivity assistant designed to solve modern student challenges — from procrastination and burnout to poor revision planning.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-pending" style={{ fontSize: 13 }}>v1.0.0</span>
          <span className="badge badge-completed" style={{ fontSize: 13 }}>Open Source</span>
          <span className="badge badge-medium" style={{ fontSize: 13 }}>MIT License</span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🛠️ Tech Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { name: 'React 18', role: 'Frontend', color: '#61dafb', emoji: '⚛️' },
            { name: 'Node.js + Express', role: 'Backend', color: '#68a063', emoji: '🟢' },
            { name: 'MongoDB', role: 'Database', color: '#47a248', emoji: '🍃' },
            { name: 'JWT Auth', role: 'Security', color: '#F7971E', emoji: '🔑' },
            { name: 'Recharts', role: 'Charts', color: '#6C63FF', emoji: '📊' },
            { name: 'React Router', role: 'Navigation', color: '#CA4245', emoji: '🛣️' },
          ].map(tech => (
            <div key={tech.name} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{tech.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{tech.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{tech.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>✨ Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problems solved */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(67,233,123,0.06), rgba(108,99,255,0.06))' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🎯 Problems We Solve</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            '📵 Digital Distraction',
            '😰 Burnout & Overwork',
            '📉 Study Inconsistency',
            '📋 Poor Revision Planning',
            '⏰ Deadline Overloading',
            '🧠 Lack of Focus',
            '📊 No Performance Tracking',
          ].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>{p}</div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🏆 Credits</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {TEAM.map(m => (
            <div key={m.name} style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Version info + CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>📦 StudyPro v1.0.0</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Built with ❤️ for students everywhere</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/help" className="btn btn-secondary btn-sm">❓ Help</Link>
          <Link to="/dashboard" className="btn btn-primary btn-sm">🚀 Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
