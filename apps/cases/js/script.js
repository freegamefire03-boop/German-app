// ═══════════════════════════════════════════════════════════════
//  THEME LOADER
// ═══════════════════════════════════════════════════════════════

const DEFAULT_ARTICLES = ['A', 'B', 'C', 'D'];

let allThemes = [];

async function loadThemes() {
  try {
    const res = await fetch('data/themes.json');
    const data = await res.json();
    allThemes = data.themes || [];
  } catch {
    allThemes = [];
  }
  try {
    const saved = JSON.parse(localStorage.getItem('quizThemes') || '[]');
    saved.forEach(st => {
      const idx = allThemes.findIndex(m => m.id === st.id);
      if (idx >= 0) allThemes[idx] = st;
      else allThemes.push(st);
    });
  } catch {}
  return allThemes;
}

function getTheme(id) {
  return allThemes.find(t => t.id === id) || null;
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOM EXAMPLES (per-theme, localStorage)
// ═══════════════════════════════════════════════════════════════

function getCustomExamples(themeId) {
  try {
    return JSON.parse(localStorage.getItem('quiz-examples-' + themeId) || '[]');
  } catch { return []; }
}

function saveCustomExamples(themeId, examples) {
  localStorage.setItem('quiz-examples-' + themeId, JSON.stringify(examples));
}

function mergeCustomCards(theme, customExs) {
  if (!customExs || customExs.length === 0) return theme;
  const cards = theme.cards || [];
  let customIdx = 0;
  customExs.forEach(ex => {
    const match = cards.find(c =>
      c.answer === ex.answer && c.case === ex.case && c.gender === ex.gender
    );
    if (match) {
      match.examples.push({
        part1: ex.part1 || '',
        part2: ex.part2 || '',
        translation: ex.translation || ''
      });
    } else {
      const cid = 'custom-' + (customIdx++);
      cards.push({
        id: cid,
        answer: ex.answer || '',
        case: ex.case || '',
        gender: ex.gender || '',
        examples: [{
          part1: ex.part1 || '',
          part2: ex.part2 || '',
          translation: ex.translation || ''
        }]
      });
    }
  });
  theme.cards = cards;
  if (theme.totalCards) theme.totalCards = cards.length;
  return theme;
}

// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════

let pool      = [];
let mastered  = [];
let correct   = 0;
let answered_total = 0;
let streak    = 0;
let current   = null;
let currentEx = null;
let answeredFlag = false;
let currentTheme = null;
let initializing = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ═══════════════════════════════════════════════════════════════
//  INIT / RESTART
// ═══════════════════════════════════════════════════════════════

async function init(themeId) {
  if (initializing) return;
  initializing = true;

  await loadThemes();
  currentTheme = getTheme(themeId || 'german-articles');

  if (!currentTheme) {
    const quizArea = document.getElementById('quizArea');
    if (quizArea) quizArea.style.display = 'none';
    document.getElementById('compScreen').classList.add('vis');
    document.querySelector('.comp-title').textContent = 'Theme not found';
    document.getElementById('compStats').innerHTML = '<a href="index.html" style="color:var(--violet)">Back to themes</a>';
    initializing = false;
    return;
  }

  const customExs = getCustomExamples(currentTheme.id);
  currentTheme = mergeCustomCards(JSON.parse(JSON.stringify(currentTheme)), customExs);

  document.getElementById('quizArea').style.display = 'block';
  document.getElementById('compScreen').classList.remove('vis');

  const cards = currentTheme.cards || [];
  const total = currentTheme.totalCards || cards.length;

  document.querySelector('.title').textContent = currentTheme.name || 'Quiz';

  pool = shuffle(cards).map(c => ({
    ...c,
    points: 0,
    exIdx: 0
  }));
  mastered = [];
  correct  = 0;
  answered_total = 0;
  streak   = 0;
  current  = null;
  answeredFlag = false;

  updateStats();
  loadQuestion();
  renderPreview();
  initializing = false;
}

async function restart() {
  if (initializing) return;
  await init(currentTheme ? currentTheme.id : 'german-articles');
}

// ═══════════════════════════════════════════════════════════════
//  RENDER HELPERS
// ═══════════════════════════════════════════════════════════════

function safe(val, fallback) {
  return (val === null || val === undefined) ? fallback : val;
}

function updateStats() {
  const total = currentTheme ? (currentTheme.totalCards || currentTheme.cards.length) : 16;
  document.getElementById('statLeft').textContent = pool.length;
  document.getElementById('statCorrect').textContent = correct;
  document.getElementById('statStreak').textContent = streak;

  const done = total - pool.length;
  document.getElementById('progCount').textContent = done + ' / ' + total;
  document.getElementById('progFill').style.width = ((done / total) * 100) + '%';
}

// ═══════════════════════════════════════════════════════════════
//  QUESTION LOADING
// ═══════════════════════════════════════════════════════════════

function loadQuestion() {
  if (pool.length === 0) { showCompletion(); return; }

  answeredFlag = false;

  document.getElementById('nextBtn').classList.remove('vis');
  document.getElementById('removedBanner').classList.remove('vis');

  const fb = document.getElementById('feedback');
  fb.className = 'feedback';
  fb.textContent = '';

  const tt = document.getElementById('transText');
  tt.classList.remove('vis');
  const tb = document.getElementById('transBtn');
  tb.classList.remove('open');
  tb.innerHTML = '<span class="trans-arrow">\u25B6</span>&nbsp;Show translation';

  current   = pool[Math.floor(Math.random() * pool.length)];
  const exs = current.examples || [];
  currentEx = exs.length > 0 ? exs[current.exIdx % exs.length] : { part1: '', part2: '' };
  current.exIdx++;

  const badgeCase = document.getElementById('badgeCase');
  const badgeGender = document.getElementById('badgeGender');
  if (badgeCase && badgeGender) {
    badgeCase.textContent = safe(current.case, '\u2014');
    badgeGender.textContent = safe(current.gender, '\u2014');
  }
  const badges = document.querySelector('.badges');
  if (badges) badges.classList.add('hidden');

  document.getElementById('dot1').className = 'dot' + (current.points >= 1 ? ' on' : '');
  document.getElementById('dot2').className = 'dot' + (current.points >= 2 ? ' on' : '');

  const sentEl = document.getElementById('sentence');
  const p1 = safe(currentEx.part1, '');
  const p2 = safe(currentEx.part2, '');
  sentEl.innerHTML = p1 + '<span class="blank">___</span>' + p2;

  const transText = document.getElementById('transText');
  transText.textContent = currentEx.translation || '';

  const articles = (currentTheme && currentTheme.articles && currentTheme.articles.length > 0)
    ? currentTheme.articles
    : DEFAULT_ARTICLES;

  const grid = document.getElementById('answerGrid');
  grid.innerHTML = '';
  shuffle(articles).forEach(art => {
    const btn = document.createElement('button');
    btn.className = 'a-btn';
    btn.textContent = art;
    btn.onclick = () => handleAnswer(art, btn);
    grid.appendChild(btn);
  });

  const card = document.getElementById('qCard');
  card.style.animation = 'none';
  void card.offsetHeight;
  card.style.animation = 'cardIn .42s cubic-bezier(.4,0,.2,1) both';
}

// ═══════════════════════════════════════════════════════════════
//  ANSWER HANDLING
// ═══════════════════════════════════════════════════════════════

function handleAnswer(chosen, btn) {
  if (answeredFlag) return;
  answeredFlag = true;
  answered_total++;

  const allBtns = document.querySelectorAll('.a-btn');
  allBtns.forEach(b => b.disabled = true);

  const isCorrect = chosen === current.answer;
  const fb = document.getElementById('feedback');

  if (isCorrect) {
    btn.classList.add('correct');
    correct++;
    streak++;
    current.points++;

    fb.textContent = streak >= 4
      ? '\u2713 Richtig! \uD83D\uDD25 ' + streak + '-streak \u2014 you\'re on fire!'
      : streak >= 2
        ? '\u2713 Richtig! \uD83D\uDD25 ' + streak + ' in a row!'
        : '\u2713 Richtig! Well done!';
    fb.className = 'feedback vis ok';

    document.getElementById('dot1').className = 'dot' + (current.points >= 1 ? ' on' : '');
    document.getElementById('dot2').className = 'dot' + (current.points >= 2 ? ' on' : '');

    const mp = safe(currentTheme ? currentTheme.masteryPoints : 2, 2);
    if (current.points >= mp) {
      mastered.push(current);
      pool = pool.filter(c => c.id !== current.id);
      document.getElementById('removedBanner').classList.add('vis');
      spawnParticles(22);
    }

    vibrate(CONFIG.VIBRATE_SUCCESS);
  } else {
    btn.classList.add('wrong');
    streak = 0;

    allBtns.forEach(b => {
      if (b.textContent === current.answer) b.classList.add('reveal-correct');
    });

    fb.textContent = '\u2717 The answer is "' + safe(current.answer, '?') + '"';
    fb.className = 'feedback vis err';

    vibrate(CONFIG.VIBRATE_ERROR);
  }

  const sentEl = document.getElementById('sentence');
  const p1 = safe(currentEx ? currentEx.part1 : '', '');
  const p2 = safe(currentEx ? currentEx.part2 : '', '');
  const ans = safe(current.answer, '?');
  sentEl.innerHTML = p1 +
    '<span class="blank" style="color:' + (isCorrect ? 'var(--mint)' : 'var(--rose)') + ';border-color:' + (isCorrect ? 'var(--mint)' : 'var(--rose)') + '">' + ans + '</span>' +
    p2;

  const badges = document.querySelector('.badges');
  if (badges) badges.classList.remove('hidden');

  updateStats();

  document.getElementById('nextBtn').classList.add('vis');
  setTimeout(() => {
    const nb = document.getElementById('nextBtn');
    if (nb) nb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function next() { loadQuestion(); }

// ═══════════════════════════════════════════════════════════════
//  TRANSLATION TOGGLE
// ═══════════════════════════════════════════════════════════════

function toggleTrans() {
  const text = document.getElementById('transText');
  const btn  = document.getElementById('transBtn');
  if (!text || !btn) return;
  const open = text.classList.contains('vis');
  text.classList.toggle('vis');
  btn.classList.toggle('open');
  btn.innerHTML = open
    ? '<span class="trans-arrow">\u25B6</span>&nbsp;Show translation'
    : '<span class="trans-arrow" style="transform:rotate(90deg);display:inline-block">\u25B6</span>&nbsp;Hide translation';
}

// ═══════════════════════════════════════════════════════════════
//  REFERENCE TABLE
// ═══════════════════════════════════════════════════════════════

function toggleRef() {
  const el = document.getElementById('refWrap');
  if (el) el.classList.toggle('vis');
}

// ═══════════════════════════════════════════════════════════════
//  COMPLETION
// ═══════════════════════════════════════════════════════════════

function showCompletion() {
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('compScreen').classList.add('vis');

  const acc = answered_total > 0 ? Math.round((correct / answered_total) * 100) : 0;
  const themeName = currentTheme ? safe(currentTheme.name, 'Quiz') : 'Quiz';
  document.getElementById('compStats').innerHTML =
    'You answered <strong>' + correct + '</strong> questions correctly<br>' +
    'out of <strong>' + answered_total + '</strong> total attempts<br>' +
    'Accuracy: <strong>' + acc + '%</strong><br><br>' +
    'All cards mastered \u2014 ' + themeName;

  spawnParticles(70);
}

// ═══════════════════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════════════════

function spawnParticles(n) {
  n = n || 20;
  const colors = ['#FF6B35','#00E5C3','#A78BFA','#FB7185','#FBBF24'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'particle';
      const sz = Math.random() * 9 + 5;
      p.style.cssText = [
        'width:' + sz + 'px',
        'height:' + sz + 'px',
        'left:' + (Math.random() * 100) + 'vw',
        'top:-30px',
        'background:' + colors[Math.floor(Math.random() * colors.length)],
        'animation-duration:' + (1.6 + Math.random() * 2) + 's',
        'animation-delay:' + (Math.random() * .4) + 's',
        'opacity:.85',
      ].join(';');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4500);
    }, i * 35);
  }
}

// ═══════════════════════════════════════════════════════════════
//  ADD EXAMPLE MODAL
// ═══════════════════════════════════════════════════════════════

const EMPTY_TEMPLATE = JSON.stringify([
  {
    "part1": "Ich sehe ",
    "part2": " Mann im Park.",
    "answer": "den",
    "case": "Accusative",
    "gender": "Masculine",
    "translation": "I see the man in the park."
  }
], null, 2);

function openAddModal() {
  document.getElementById('addOverlay').classList.add('vis');
  document.getElementById('addModal').classList.add('vis');
  document.getElementById('addFeedback').textContent = '';
  document.getElementById('addFeedback').className = 'add-feedback';
}

function closeAddModal() {
  document.getElementById('addOverlay').classList.remove('vis');
  document.getElementById('addModal').classList.remove('vis');
}

function copyTemplate() {
  navigator.clipboard.writeText(EMPTY_TEMPLATE).then(() => {
    const fb = document.getElementById('addFeedback');
    fb.textContent = '\u2713 Template copied! Paste it in the field below and edit.';
    fb.className = 'add-feedback ok';
  }).catch(() => {
    const fb = document.getElementById('addFeedback');
    fb.textContent = 'Could not copy. Select and copy the template manually.';
    fb.className = 'add-feedback err';
  });
}

function renderPreview() {
  if (!currentTheme) return;
  const exs = getCustomExamples(currentTheme.id);
  const el = document.getElementById('previewSection');
  const list = document.getElementById('previewList');
  if (exs.length === 0) {
    el.classList.remove('vis');
    return;
  }
  el.classList.add('vis');
  list.innerHTML = exs.map(ex =>
    '<div class="preview-item"><strong>[' + safe(ex.answer, '?') + ']</strong> ' +
    safe(ex.part1, '') + '___' + safe(ex.part2, '') +
    (ex.translation ? ' <span style="color:var(--text-muted)">\u2014 ' + ex.translation + '</span>' : '') +
    '</div>'
  ).join('');
}

function appendExamples() {
  const fb = document.getElementById('addFeedback');
  fb.textContent = '';
  fb.className = 'add-feedback';

  let data;
  try {
    data = JSON.parse(document.getElementById('addTextarea').value.trim());
  } catch {
    fb.textContent = 'Invalid JSON. Check your syntax and try again.';
    fb.className = 'add-feedback err';
    return;
  }

  if (!Array.isArray(data)) {
    fb.textContent = 'Must be a JSON array, e.g. [{ ... }]';
    fb.className = 'add-feedback err';
    return;
  }

  if (data.length === 0) {
    fb.textContent = 'Array is empty. Add at least one example.';
    fb.className = 'add-feedback err';
    return;
  }

  const valid = [];
  const errors = [];
  data.forEach((item, i) => {
    if (!item.answer) {
      errors.push('Item ' + i + ' is missing "answer"');
      return;
    }
    valid.push({
      answer: item.answer,
      case: item.case || '',
      gender: item.gender || '',
      part1: item.part1 || '',
      part2: item.part2 || '',
      translation: item.translation || ''
    });
  });

  if (valid.length === 0) {
    fb.textContent = errors[0] || 'No valid examples found.';
    fb.className = 'add-feedback err';
    return;
  }

  const existing = getCustomExamples(currentTheme.id);
  saveCustomExamples(currentTheme.id, existing.concat(valid));

  const msg = '\u2713 Appended ' + valid.length + ' example' + (valid.length !== 1 ? 's' : '') + '!';
  fb.textContent = errors.length > 0 ? msg + ' (' + errors.length + ' skipped)' : msg;
  fb.className = 'add-feedback ok';

  document.getElementById('addTextarea').value = '';
  renderPreview();
  restart();
}

// ═══════════════════════════════════════════════════════════════
//  EVENT BINDING & START
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nextBtn').addEventListener('click', next);
  document.getElementById('transBtn').addEventListener('click', toggleTrans);
  const refBtn = document.querySelector('.ref-toggle-btn');
  if (refBtn) refBtn.addEventListener('click', toggleRef);
  const rstBtn = document.querySelector('.restart-btn');
  if (rstBtn) rstBtn.addEventListener('click', restart);

  document.getElementById('headerAddBtn').addEventListener('click', openAddModal);
  document.getElementById('addModalClose').addEventListener('click', closeAddModal);
  document.getElementById('addOverlay').addEventListener('click', closeAddModal);
  document.getElementById('copyTemplateBtn').addEventListener('click', copyTemplate);
  document.getElementById('addSubmitBtn').addEventListener('click', appendExamples);

  const params = new URLSearchParams(window.location.search);
  const themeId = params.get('theme') || 'german-articles';
  init(themeId);
});
