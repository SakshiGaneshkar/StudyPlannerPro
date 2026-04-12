import React, { useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How do I start a focus session?', a: 'Go to the Focus Mode page, enter your study subject, and click "Start Session". The Pomodoro timer will begin a 25-minute focus session automatically.' },
  { q: 'How does the AI Study Plan Generator work?', a: 'Go to Planner → AI Plan, enter your subjects (comma-separated), deadline, daily available hours, and energy pattern. The AI will distribute tasks evenly across the remaining days.' },
  { q: 'What is the Procrastination Score?', a: 'It is the percentage of your tasks that have been delayed or are overdue. A lower score is better. Aim to keep it below 20%.' },
  { q: 'How is the Burnout Level calculated?', a: 'We compare your daily average study hours in the past week against your goal hours. If you study significantly more or less than your goal, we flag it as a risk.' },
  { q: 'Can I customize the Pomodoro timer?', a: 'Yes! On the Focus Mode page, click ⚙️ Settings to change focus duration, short break, and long break lengths.' },
  { q: 'How do streaks work?', a: 'Your streak increases by 1 for every consecutive day you complete at least one habit or study session. Missing a day resets the streak.' },
  { q: 'How do I export my analytics?', a: 'Go to the Analytics page and click "Export PDF Report". A formatted PDF with your stats will be downloaded automatically.' },
  { q: 'Can I use the app without MongoDB?', a: 'The backend requires MongoDB. For quick testing, you can use MongoDB Atlas (free tier) — just update the MONGODB_URI in your .env file.' },
];

export default function Help() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ name: user?.name || '', email: user?.email || '', category: 'general', message: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) return toast.error('Please fill in all fields.');
    setSubmitting(true);
    try {
      await API.post('/feedback', feedbackForm);
      toast.success('Thank you for your feedback! 🙏');
      setFeedbackForm({ ...feedbackForm, category: 'general', message: '', rating: 5 });
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <h1 className="page-title">❓ Help Center</h1>
      <p className="page-subtitle">Find answers to common questions and get support</p>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { icon: '🚀', title: 'Getting Started', desc: 'Setup & first steps' },
          { icon: '🎯', title: 'Focus Mode', desc: 'Pomodoro guide' },
          { icon: '📊', title: 'Analytics', desc: 'Understanding charts' },
          { icon: '🔥', title: 'Habits', desc: 'Building consistency' },
        ].map(card => (
          <div key={card.title} className="card" style={{ textAlign: 'center', padding: 20, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{card.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Setup Guide</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '1', title: 'Install dependencies', cmd: 'cd backend && npm install\ncd ../frontend && npm install' },
            { step: '2', title: 'Configure environment', cmd: 'cp backend/.env.example backend/.env\n# Edit MONGODB_URI and JWT_SECRET' },
            { step: '3', title: 'Start backend server', cmd: 'cd backend && npm start' },
            { step: '4', title: 'Start frontend', cmd: 'cd frontend && npm start' },
          ].map(({ step, title, cmd }) => (
            <div key={step} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{step}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{title}</div>
                <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: '#43E97B', whiteSpace: 'pre', overflow: 'auto' }}>{cmd}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💬 Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '14px 18px', background: openFaq === i ? 'rgba(108,99,255,0.1)' : 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', transition: 'var(--transition)' }}>
                {faq.q}
                <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 12 }}>▼</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '14px 18px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📨 Send Feedback</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Help us improve StudyPro by sharing your experience</p>
        <form onSubmit={submitFeedback}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={feedbackForm.name} onChange={e => setFeedbackForm({ ...feedbackForm, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={feedbackForm.email} onChange={e => setFeedbackForm({ ...feedbackForm, email: e.target.value })} placeholder="your@email.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={feedbackForm.category} onChange={e => setFeedbackForm({ ...feedbackForm, category: e.target.value })}>
                <option value="general">💬 General</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="feature">✨ Feature Request</option>
                <option value="praise">🙏 Praise</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', opacity: feedbackForm.rating >= star ? 1 : 0.3, transition: 'opacity 0.2s' }}>⭐</button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" value={feedbackForm.message} onChange={e => setFeedbackForm({ ...feedbackForm, message: e.target.value })} placeholder="Share your thoughts, suggestions, or report issues..." rows={4} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending...</> : '📨 Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
