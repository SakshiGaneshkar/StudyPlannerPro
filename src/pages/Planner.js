import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { getPriorityBadgeClass, getStatusBadgeClass, daysUntil, getDeadlineColor, formatDate, SUBJECT_COLORS, PROCRASTINATION_TIPS } from '../utils/constants';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const ENERGIES = ['low', 'medium', 'high'];

const emptyForm = { title: '', description: '', subject: '', subjectColor: '#6C63FF', priority: 'medium', deadline: '', estimatedHours: 1, energyRequired: 'medium', scheduledDate: '', tags: '', difficulty: 3 };

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '', subject: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [aiForm, setAiForm] = useState({ subjects: '', deadline: '', dailyHours: 4, energyPattern: 'morning' });
  const [procrastinationTip] = useState(PROCRASTINATION_TIPS[Math.floor(Math.random() * PROCRASTINATION_TIPS.length)]);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.tasks || []);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.deadline) return toast.error('Please fill required fields.');
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      if (editId) {
        const { data } = await API.put(`/tasks/${editId}`, payload);
        setTasks(tasks.map(t => t._id === editId ? data.task : t));
        toast.success('Task updated!');
      } else {
        const { data } = await API.post('/tasks', payload);
        setTasks([data.task, ...tasks]);
        toast.success('Task created!');
      }
      closeModal();
    } catch { toast.error('Failed to save task.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted.');
    } catch { toast.error('Failed to delete task.'); }
  };

  const handleComplete = async (id) => {
    try {
      const { data } = await API.patch(`/tasks/${id}/complete`);
      setTasks(tasks.map(t => t._id === id ? data.task : t));
      toast.success(data.message);
    } catch { toast.error('Failed to complete task.'); }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title, description: task.description || '', subject: task.subject,
      subjectColor: task.subjectColor || '#6C63FF', priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      estimatedHours: task.estimatedHours || 1, energyRequired: task.energyRequired || 'medium',
      scheduledDate: task.scheduledDate ? task.scheduledDate.split('T')[0] : '',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : '', difficulty: task.difficulty || 3,
    });
    setEditId(task._id);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditId(null); };

  const generateAIPlan = async (e) => {
    e.preventDefault();
    const subjects = aiForm.subjects.split(',').map(s => s.trim()).filter(Boolean);
    if (!subjects.length || !aiForm.deadline) return toast.error('Please fill required fields.');
    try {
      const { data } = await API.post('/tasks/generate-plan', { subjects, deadline: aiForm.deadline, dailyHours: aiForm.dailyHours, energyPattern: aiForm.energyPattern });
      setTasks([...data.tasks, ...tasks]);
      setShowAIModal(false);
      toast.success(`🧠 AI generated ${data.tasks.length} tasks across ${data.daysLeft} days!`);
    } catch { toast.error('Failed to generate plan.'); }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'today') {
      const d = new Date(t.scheduledDate || t.deadline);
      if (d.toDateString() !== new Date().toDateString()) return false;
    }
    if (activeTab === 'overdue') return t.status === 'overdue' || (new Date(t.deadline) < new Date() && t.status !== 'completed');
    if (activeTab === 'completed') return t.status === 'completed';
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.subject && !t.subject.toLowerCase().includes(filter.subject.toLowerCase())) return false;
    return true;
  });

  const delayedCount = tasks.filter(t => t.isDelayed || t.status === 'overdue').length;
  const procrastinationScore = tasks.length > 0 ? Math.round((delayedCount / tasks.length) * 100) : 0;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📋 Study Planner</h1>
          <p className="page-subtitle">{tasks.length} tasks • {tasks.filter(t => t.status === 'completed').length} completed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAIModal(true)} className="btn btn-secondary btn-sm">🧠 AI Plan</button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Add Task</button>
        </div>
      </div>

      {/* Procrastination Warning */}
      {procrastinationScore > 30 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <span>⚠️</span>
          <div>
            <strong>Procrastination Score: {procrastinationScore}%</strong> — {delayedCount} tasks delayed.
            <br /><span style={{ fontSize: 13, opacity: 0.85 }}>💡 Tip: {procrastinationTip}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: `All (${tasks.length})` },
          { key: 'today', label: '📅 Today' },
          { key: 'overdue', label: `⚠️ Overdue (${delayedCount})` },
          { key: 'completed', label: '✅ Done' },
        ].map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto', fontSize: 13 }} value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <input className="form-input" placeholder="Filter by subject..." style={{ width: 'auto', fontSize: 13 }} value={filter.subject} onChange={e => setFilter({ ...filter, subject: e.target.value })} />
        {(filter.priority || filter.subject) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilter({ status: '', priority: '', subject: '' })}>Clear filters</button>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Add your first task to get started!</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 16 }}>+ Add Task</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTasks.map(task => {
            const days = daysUntil(task.deadline);
            return (
              <div key={task._id} className="card" style={{ padding: '16px 20px', borderLeft: `4px solid ${task.subjectColor || 'var(--accent)'}`, opacity: task.status === 'completed' ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <button onClick={() => handleComplete(task._id)} disabled={task.status === 'completed'} style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${task.status === 'completed' ? 'var(--success)' : 'var(--border)'}`, background: task.status === 'completed' ? 'var(--success)' : 'none', cursor: task.status === 'completed' ? 'default' : 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                    {task.status === 'completed' ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                      <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                      {task.isDelayed && <span className="badge badge-overdue">⚠️ Delayed</span>}
                    </div>
                    {task.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0' }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📚 {task.subject}</span>
                      <span style={{ fontSize: 12, color: getDeadlineColor(days), fontWeight: 600 }}>
                        📅 {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today!' : `${days}d left`} ({formatDate(task.deadline)})
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱️ {task.estimatedHours}h est.</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⚡ {task.energyRequired} energy</span>
                    </div>
                    {task.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {task.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(task)} className="btn btn-secondary btn-sm btn-icon" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(task._id)} className="btn btn-danger btn-sm btn-icon" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editId ? '✏️ Edit Task' : '+ New Task'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What do you need to study?" autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {SUBJECT_COLORS.slice(0, 8).map(c => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, subjectColor: c })}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.subjectColor === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Energy Required</label>
                  <select className="form-select" value={form.energyRequired} onChange={e => setForm({ ...form, energyRequired: e.target.value })}>
                    {ENERGIES.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deadline *</label>
                  <input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input type="number" className="form-input" min={0.5} max={24} step={0.5} value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input type="date" className="form-input" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes..." />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="exam, chapter-3, important" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? '💾 Update' : '+ Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Plan Modal */}
      {showAIModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAIModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">🧠 AI Study Plan Generator</h2>
              <button className="modal-close" onClick={() => setShowAIModal(false)}>✕</button>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <span>💡</span>
              <span>Enter your subjects and deadline, and our AI will automatically distribute your study tasks across available days.</span>
            </div>
            <form onSubmit={generateAIPlan}>
              <div className="form-group">
                <label className="form-label">Subjects (comma-separated) *</label>
                <input className="form-input" value={aiForm.subjects} onChange={e => setAiForm({ ...aiForm, subjects: e.target.value })} placeholder="Mathematics, Physics, Chemistry, English" autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Exam/Deadline Date *</label>
                  <input type="date" className="form-input" value={aiForm.deadline} onChange={e => setAiForm({ ...aiForm, deadline: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Study Hours</label>
                  <input type="number" className="form-input" min={1} max={12} value={aiForm.dailyHours} onChange={e => setAiForm({ ...aiForm, dailyHours: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Study Pattern</label>
                <select className="form-select" value={aiForm.energyPattern} onChange={e => setAiForm({ ...aiForm, energyPattern: e.target.value })}>
                  <option value="morning">🌅 Morning Person (peak energy AM)</option>
                  <option value="evening">🌙 Night Owl (peak energy PM)</option>
                  <option value="afternoon">☀️ Afternoon (peak energy afternoon)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAIModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">🧠 Generate Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
