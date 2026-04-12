import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const MODES = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODE_LABELS = { work: '🎯 Focus', short: '☕ Short Break', long: '🌿 Long Break' };

export default function FocusMode() {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work);
  const [running, setRunning] = useState(false);
  const [pomCount, setPomCount] = useState(0);
  const [subject, setSubject] = useState('');
  const [distractions, setDistractions] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customTimes, setCustomTimes] = useState({ work: 25, short: 5, long: 15 });
  const [completedPomodoros, setCompletedPomodoros] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleTimerComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const handleTimerComplete = () => {
    playBeep();
    if (mode === 'work') {
      const newCount = pomCount + 1;
      setPomCount(newCount);
      setTotalFocusTime(t => t + customTimes.work);
      setCompletedPomodoros(p => [...p, { time: new Date().toLocaleTimeString(), duration: customTimes.work }]);
      toast.success(`🍅 Pomodoro #${newCount} complete! Take a break.`);
      if (newCount % 4 === 0) { setMode('long'); setTimeLeft(customTimes.long * 60); }
      else { setMode('short'); setTimeLeft(customTimes.short * 60); }
    } else {
      toast.success('Break over! Time to focus. 💪');
      setMode('work');
      setTimeLeft(customTimes.work * 60);
    }
  };

  const startSession = async () => {
    if (!subject.trim()) { toast.error('Please enter a subject!'); return; }
    try {
      const { data } = await API.post('/sessions/start', { subject, type: 'pomodoro', energyLevel: 'medium' });
      setSessionId(data.session._id);
    } catch {}
    setRunning(true);
    toast.success('🎯 Focus session started!');
  };

  const pauseResume = () => setRunning(!running);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(customTimes[mode === 'work' ? 'work' : mode === 'short' ? 'short' : 'long'] * 60);
  };

  const endSession = async () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    if (sessionId) {
      try {
        await API.put(`/sessions/${sessionId}/end`, { distractions, focusScore: Math.max(40, 100 - distractions * 10) });
        toast.success(`Session saved! ${pomCount} pomodoros completed.`);
      } catch {}
    }
    setSessionId(null);
    setPomCount(0);
    setDistractions(0);
    setCompletedPomodoros([]);
    setTotalFocusTime(0);
    resetTimer();
  };

  const switchMode = (m) => {
    if (running) { toast.error('Pause timer before switching modes'); return; }
    setMode(m);
    setTimeLeft(customTimes[m === 'work' ? 'work' : m === 'short' ? 'short' : 'long'] * 60);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = 1 - timeLeft / (MODES[mode]);
  const circumference = 2 * Math.PI * 120;
  const strokeDash = circumference * (1 - progress);

  const modeColor = mode === 'work' ? '#6C63FF' : mode === 'short' ? '#43E97B' : '#4facfe';

  return (
    <div className="page-container" style={{ background: focusMode ? '#000' : 'var(--bg-primary)', minHeight: '100vh', transition: 'background 0.5s' }}>
      {!focusMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🎯 Focus Mode</h1>
            <p className="page-subtitle">Pomodoro timer with distraction tracking</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary btn-sm">⚙️ Settings</button>
            <button onClick={() => setFocusMode(!focusMode)} className={`btn btn-sm ${focusMode ? 'btn-secondary' : 'btn-primary'}`}>
              {focusMode ? '🌙 Exit Focus' : '🚀 Full Focus'}
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && !focusMode && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⚙️ Timer Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { key: 'work', label: 'Focus Duration', emoji: '🎯' },
              { key: 'short', label: 'Short Break', emoji: '☕' },
              { key: 'long', label: 'Long Break', emoji: '🌿' },
            ].map(({ key, label, emoji }) => (
              <div key={key} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{emoji} {label} (min)</label>
                <input type="number" className="form-input" min={1} max={90} value={customTimes[key]}
                  onChange={e => setCustomTimes({ ...customTimes, [key]: parseInt(e.target.value) || 1 })} />
              </div>
            ))}
          </div>
          <button onClick={() => { setTimeLeft(customTimes.work * 60); setShowSettings(false); toast.success('Settings saved!'); }}
            className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Save Settings</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: focusMode ? '1fr' : '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Mode tabs */}
          {!focusMode && (
            <div className="tabs" style={{ width: '100%', maxWidth: 400, marginBottom: 32 }}>
              {[
                { key: 'work', label: '🎯 Focus' },
                { key: 'short', label: '☕ Short Break' },
                { key: 'long', label: '🌿 Long Break' },
              ].map(m => (
                <button key={m.key} className={`tab ${mode === m.key ? 'active' : ''}`} onClick={() => switchMode(m.key)}>{m.label}</button>
              ))}
            </div>
          )}

          {/* SVG Circle Timer */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <svg width={280} height={280} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={140} cy={140} r={120} fill="none" stroke="var(--border)" strokeWidth={10} />
              <circle cx={140} cy={140} r={120} fill="none" stroke={modeColor}
                strokeWidth={10} strokeLinecap="round" strokeDasharray={circumference}
                strokeDashoffset={strokeDash} style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: focusMode ? 72 : 60, fontFamily: 'var(--font-display)', fontWeight: 800, color: modeColor, lineHeight: 1 }}>{mins}:{secs}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{MODE_LABELS[mode]}</div>
              {running && <div style={{ fontSize: 12, color: modeColor, marginTop: 4, animation: 'pulse 2s infinite' }}>● Live</div>}
            </div>
          </div>

          {/* Subject input */}
          {!sessionId && !focusMode && (
            <div style={{ width: '100%', maxWidth: 360, marginBottom: 20 }}>
              <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="What are you studying? (e.g. Mathematics)" style={{ textAlign: 'center', fontSize: 15 }} />
            </div>
          )}
          {focusMode && !sessionId && (
            <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="What are you studying?" style={{ textAlign: 'center', fontSize: 18, marginBottom: 20, maxWidth: 360, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {!running && !sessionId && (
              <button onClick={startSession} className="btn btn-primary btn-lg" style={{ minWidth: 140 }}>▶ Start Session</button>
            )}
            {sessionId && (
              <>
                <button onClick={pauseResume} className={`btn btn-lg ${running ? 'btn-secondary' : 'btn-primary'}`} style={{ minWidth: 120 }}>
                  {running ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button onClick={resetTimer} className="btn btn-secondary btn-lg">↺ Reset</button>
                <button onClick={endSession} className="btn btn-danger btn-lg">⏹ End</button>
              </>
            )}
          </div>

          {/* Distraction tracker */}
          {sessionId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>📵 Distractions:</span>
              <button onClick={() => setDistractions(d => Math.max(0, d - 1))} className="btn btn-secondary btn-sm btn-icon">−</button>
              <span style={{ fontSize: 24, fontWeight: 800, minWidth: 32, textAlign: 'center', color: distractions > 3 ? 'var(--danger)' : 'var(--text-primary)' }}>{distractions}</span>
              <button onClick={() => setDistractions(d => d + 1)} className="btn btn-danger btn-sm btn-icon">+</button>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>(lower is better)</span>
            </div>
          )}

          {/* Focus mode exit */}
          {focusMode && (
            <button onClick={() => setFocusMode(false)} className="btn btn-secondary" style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              Exit Full Focus Mode
            </button>
          )}
        </div>

        {/* Side panel */}
        {!focusMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📊 Session Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🍅 Pomodoros</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{pomCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>⏱️ Focus Time</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{totalFocusTime}m</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📵 Distractions</span>
                  <span style={{ fontWeight: 700, color: distractions > 3 ? 'var(--danger)' : 'var(--text-primary)' }}>{distractions}</span>
                </div>
              </div>
            </div>

            {/* Pomodoro history */}
            {completedPomodoros.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🍅 Completed Pomodoros</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedPomodoros.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                      <span>#{i + 1} — {p.duration}min</span>
                      <span style={{ color: 'var(--text-muted)' }}>{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(67,233,123,0.05))' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>💡 Focus Tips</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Put your phone face-down 📱', 'Close social media tabs 💻', 'Use noise-cancelling headphones 🎧', 'Stay hydrated 💧', 'Clear your desk 🗂️'].map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 10 }}>●</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Site blocking simulation */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🚫 Distraction Blocklist</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Reminder: close these while studying</p>
              {['Instagram', 'YouTube', 'Twitter/X', 'TikTok', 'Reddit', 'Netflix'].map(site => (
                <div key={site} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--danger)', fontSize: 16 }}>🚫</span>
                  <span style={{ fontSize: 13, flex: 1, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{site}</span>
                  <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>BLOCKED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
