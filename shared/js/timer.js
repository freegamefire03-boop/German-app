const LS_TIMER  = 'deutsch_timer';
const LS_STREAK = 'deutsch_streak';

let streakData = loadStreak();

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(LS_STREAK)) || { current: 0, lastDate: null }; }
  catch { return { current: 0, lastDate: null }; }
}

function saveStreak() {
  localStorage.setItem(LS_STREAK, JSON.stringify(streakData));
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (streakData.lastDate === today) return streakData.current;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streakData.lastDate === yesterday) {
    streakData.current++;
  } else {
    streakData.current = 1;
  }
  streakData.lastDate = today;
  saveStreak();
  return streakData.current;
}

let timerState = { running: false, elapsed: 0, startTime: null, completed: false };
let timerInterval = null;
let timerTickCb = null;
let sessionStats = { wordsPassed: 0, genderMastered: 0, pluralMastered: 0 };

function loadTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_TIMER));
    if (saved) {
      timerState = saved;
      if (timerState.running && timerState.startTime) {
        const extra = Math.floor((Date.now() - timerState.startTime) / 1000);
        timerState.elapsed = Math.min(timerState.elapsed + extra, CONFIG.TIMER_DURATION);
        if (timerState.elapsed >= CONFIG.TIMER_DURATION) {
          timerState.elapsed = CONFIG.TIMER_DURATION;
          timerState.running = false;
          timerState.completed = true;
          timerState.startTime = null;
          saveTimer();
        }
      }
    }
  } catch {}
}

function saveTimer() {
  localStorage.setItem(LS_TIMER, JSON.stringify(timerState));
}

function startTimer() {
  if (timerState.completed) return;
  timerState.running = true;
  timerState.startTime = Date.now();
  saveTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(timerTick, 1000);
}

function pauseTimer() {
  timerState.elapsed = getElapsedSeconds();
  timerState.running = false;
  timerState.startTime = null;
  saveTimer();
  clearInterval(timerInterval);
}

function resetTimer() {
  timerState = { running: false, elapsed: 0, startTime: null, completed: false };
  clearInterval(timerInterval);
  saveTimer();
}

function completeTimer() {
  timerState.running = false;
  timerState.completed = true;
  timerState.startTime = null;
  timerState.elapsed = CONFIG.TIMER_DURATION;
  saveTimer();
  clearInterval(timerInterval);
}

function getElapsedSeconds() {
  if (!timerState.startTime) return Math.min(timerState.elapsed, CONFIG.TIMER_DURATION);
  const total = timerState.elapsed + Math.floor((Date.now() - timerState.startTime) / 1000);
  return Math.min(total, CONFIG.TIMER_DURATION);
}

function getRemainingSeconds() {
  return Math.max(0, CONFIG.TIMER_DURATION - getElapsedSeconds());
}

function getTimerDisplay() {
  const s = getRemainingSeconds();
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function timerTick() {
  const remaining = getRemainingSeconds();
  if (timerTickCb) timerTickCb(remaining);
  if (remaining <= 0) {
    completeTimer();
    if (timerTickCb) timerTickCb(0);
    const streak = updateStreak();
    if (typeof showSessionCelebration === 'function') {
      showSessionCelebration(streak, { ...sessionStats });
    }
  }
}

function showSessionCelebration(streak, stats) {
  const existing = document.getElementById('session-celebration');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'session-celebration';
  overlay.className = 'celebration-overlay';

  const flame = streak > 0 ? '🔥' : '';

  overlay.innerHTML =
    '<div class="celebration-card">' +
      '<div class="celebration-checkmark">' +
        '<svg viewBox="0 0 52 52" class="celebration-svg">' +
          '<circle cx="26" cy="26" r="24" class="celebration-circle"/>' +
          '<path d="M14 27l7 7 16-16" class="celebration-check"/>' +
        '</svg>' +
      '</div>' +
      '<div class="celebration-title">Session Complete!</div>' +
      '<div class="celebration-stats">' +
        '<div class="celebration-stat"><span>⏱</span> 10 min</div>' +
        (stats.wordsPassed ? '<div class="celebration-stat"><span>✓</span> ' + stats.wordsPassed + ' words</div>' : '') +
        (stats.genderMastered ? '<div class="celebration-stat"><span>⚡</span> ' + stats.genderMastered + ' genders</div>' : '') +
        (stats.pluralMastered ? '<div class="celebration-stat"><span>📝</span> ' + stats.pluralMastered + ' plurals</div>' : '') +
      '</div>' +
      '<div class="celebration-streak"> ' + flame + ' ' + streak + '-day streak' + '</div>' +
      '<button class="celebration-btn" onclick="closeCelebration()">Keep going</button>' +
    '</div>';

  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('div');
    dot.className = 'celebration-particle';
    dot.style.setProperty('--x', Math.random() + '');
    dot.style.setProperty('--y', Math.random() + '');
    dot.style.setProperty('--s', (4 + Math.random() * 6) + 'px');
    dot.style.setProperty('--d', (Math.random() * 0.3) + 's');
    dot.style.setProperty('--c', ['#FF6B35', '#00E5C3', '#A78BFA', '#FB7185', '#FBBF24'][Math.floor(Math.random() * 5)]);
    overlay.appendChild(dot);
  }

  document.body.appendChild(overlay);
  overlay.classList.add('open');
  setTimeout(() => {
    const svgCircle = overlay.querySelector('.celebration-circle');
    const svgCheck = overlay.querySelector('.celebration-check');
    if (svgCircle) svgCircle.style.strokeDashoffset = '0';
    if (svgCheck) svgCheck.style.strokeDashoffset = '0';
  }, 100);
}

function closeCelebration() {
  const el = document.getElementById('session-celebration');
  if (el) {
    el.classList.remove('open');
    setTimeout(() => el.remove(), 300);
  }
}
