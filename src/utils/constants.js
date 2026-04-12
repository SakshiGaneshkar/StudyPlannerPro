export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent manner.", author: "Richard Feynman" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Learning is not attained by chance; it must be sought with ardor and diligence.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
];

export const SUBJECT_COLORS = [
  '#6C63FF', '#FF6584', '#43E97B', '#F7971E',
  '#4facfe', '#f093fb', '#43e97b', '#fa709a',
  '#a18cd1', '#fbc2eb', '#ffecd2', '#96fbc4',
];

export const SUBJECT_ICONS = ['📚', '🔬', '🧮', '🌍', '💻', '🎨', '🏛️', '⚗️', '📐', '🔭', '📝', '🎵'];

export const HABIT_ICONS = ['📚', '🏃', '🧘', '💧', '😴', '📖', '✍️', '🎯', '🍎', '🧠', '⏰', '🌱'];

export const ENERGY_COLORS = { low: '#43E97B', medium: '#F7971E', high: '#FF6584' };

export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export const getRandomQuote = () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

export const formatTime = (minutes) => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const daysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getDeadlineColor = (days) => {
  if (days < 0) return 'var(--danger)';
  if (days <= 2) return 'var(--danger)';
  if (days <= 5) return 'var(--warning)';
  return 'var(--success)';
};

export const getPriorityBadgeClass = (priority) => {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent' };
  return map[priority] || 'badge-medium';
};

export const getStatusBadgeClass = (status) => {
  const map = { completed: 'badge-completed', pending: 'badge-pending', 'in-progress': 'badge-medium', overdue: 'badge-overdue' };
  return map[status] || 'badge-pending';
};

export const PROCRASTINATION_TIPS = [
  "Break the task into tiny 5-minute chunks.",
  "Use the 2-minute rule: if it takes less than 2 minutes, do it now.",
  "Set a timer for 25 minutes and just start.",
  "Tell a friend your goal for accountability.",
  "Reward yourself after completing the task.",
  "Identify your peak energy hours and schedule difficult tasks then.",
  "Turn off notifications for 1 hour.",
  "Start with the easiest part of the task.",
];
