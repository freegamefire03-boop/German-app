// ─── DEFAULT VOCABULARY ───────────────────────────────────────────────
// Words are loaded from words.json on first run

// ─── STATE ────────────────────────────────────────────────────────────
let vocab = [];
let passed = new Set();
let queue = [];
let currentIndex = 0;
let isFlipped = false;
let sessionCount = 0;

const LS_VOCAB         = 'deutsch_vocab';
const LS_PASSED        = 'deutsch_passed';
const LS_THEMES        = 'deutsch_themes';
const LS_ACTIVE_THEME  = 'deutsch_active_theme';

// ─── THEMES ───────────────────────────────────────────────────────────
let themes        = [];
let activeThemeId = null;

function loadThemes() {
  try { themes = JSON.parse(localStorage.getItem(LS_THEMES) || '[]'); } catch(e) { themes = []; }
  activeThemeId = localStorage.getItem(LS_ACTIVE_THEME) || null;
}

function saveThemes() {
  localStorage.setItem(LS_THEMES, JSON.stringify(themes));
}

function saveActiveTheme() {
  if (activeThemeId) localStorage.setItem(LS_ACTIVE_THEME, activeThemeId);
  else localStorage.removeItem(LS_ACTIVE_THEME);
}

function getActiveIndices() {
  if (!activeThemeId) return vocab.map((_, i) => i);
  const theme = themes.find(t => t.id === activeThemeId);
  if (!theme) return vocab.map((_, i) => i);
  return vocab
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => theme.wordKeys.includes(w.german))
    .map(({ i }) => i);
}

function setActiveTheme(id) {
  activeThemeId = id;
  saveActiveTheme();
  sessionCount = 0;
  buildQueue();
  render();
}

function createTheme(name) {
  const id = 'theme_' + Date.now();
  themes.push({ id, name, wordKeys: [] });
  saveThemes();
  return id;
}

function deleteTheme(id) {
  themes = themes.filter(t => t.id !== id);
  if (activeThemeId === id) { activeThemeId = null; saveActiveTheme(); }
  saveThemes();
  buildQueue();
  render();
}

function addWordKeysToActiveTheme(germanWords) {
  if (!activeThemeId) return;
  const theme = themes.find(t => t.id === activeThemeId);
  if (!theme) return;
  germanWords.forEach(g => {
    if (!theme.wordKeys.includes(g)) theme.wordKeys.push(g);
  });
  saveThemes();
}

// ─── VIEW SWITCHING ───────────────────────────────────────────────────
function showFlashcardView() {
  document.getElementById('themeSelectView').classList.remove('active');
  document.getElementById('flashcardView').classList.add('active');
  if (typeof initTimerSession === 'function') {
    initTimerSession('flashcards');
  }
}

function showThemeSelect() {
  activeThemeId = null;
  saveActiveTheme();
  document.getElementById('flashcardView').classList.remove('active');
  document.getElementById('themeSelectView').classList.add('active');
  renderThemeSelectList();
  if (typeof pauseTimer === 'function') pauseTimer();
}

function selectTheme(id) {
  activeThemeId = id;
  saveActiveTheme();
  sessionCount = 0;
  sessionStats = { wordsPassed: 0, genderMastered: 0, pluralMastered: 0 };
  buildQueue();
  render();
  showFlashcardView();
}

function renderThemeSelectList() {
  const list = document.getElementById('tsList');
  const allCount = vocab.length;
  const allMastered = passed.size;

  let html = `<div class="ts-card" onclick="selectTheme('__all__')">
    <div class="ts-icon">📚</div>
    <div class="ts-info">
      <div class="ts-title">All Words</div>
      <div class="ts-desc">${allCount} words · ${allMastered} mastered</div>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <button class="ts-manage-btn" onclick="event.stopPropagation();openWordManage('__all__')" title="Manage words">✎</button>
      <div class="ts-arrow">›</div>
    </div>
  </div>`;

  themes.forEach(t => {
    const count = vocab.filter(w => t.wordKeys.includes(w.german)).length;
    const mastered = vocab
      .map((w, i) => ({ w, i }))
      .filter(({ w, i }) => t.wordKeys.includes(w.german) && passed.has(i)).length;
    html += `<div class="ts-card" onclick="selectTheme('${t.id}')">
      <div class="ts-icon">🏷️</div>
      <div class="ts-info">
        <div class="ts-title">${t.name}</div>
        <div class="ts-desc">${count} words · ${mastered} mastered</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="ts-manage-btn" onclick="event.stopPropagation();openWordManage('${t.id}')" title="Manage words">✎</button>
        <div class="ts-arrow">›</div>
      </div>
    </div>`;
  });

  if (themes.length === 0) {
    html += `<div class="ts-empty">No themes yet. Create one to get started.</div>`;
  }

  list.innerHTML = html;
}

// ─── MODAL ────────────────────────────────────────────────────────────
function openCreateModal(autoName = '') {
  document.getElementById('tsCreateModal').classList.add('open');
  const input = document.getElementById('tsModalInput');
  input.value = autoName;
  input.focus();
}

function closeCreateModal() {
  document.getElementById('tsCreateModal').classList.remove('open');
}

document.getElementById('tsCreateBtn').addEventListener('click', () => openCreateModal());
document.getElementById('tsModalCancel').addEventListener('click', closeCreateModal);
document.getElementById('tsModalConfirm').addEventListener('click', () => {
  const input = document.getElementById('tsModalInput');
  const name = input.value.trim();
  if (!name) return;
  const id = createTheme(name);
  input.value = '';
  closeCreateModal();
  selectTheme(id);
});

document.getElementById('tsModalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('tsModalConfirm').click();
  if (e.key === 'Escape') closeCreateModal();
});

// ─── DATA LOADING ─────────────────────────────────────────────────────
async function loadState() {
  const v = localStorage.getItem(LS_VOCAB);
  const p = localStorage.getItem(LS_PASSED);

  if (v) {
    try {
      const parsed = JSON.parse(v);
      vocab = (Array.isArray(parsed) && parsed.length > 0)
        ? parsed
        : await fetchDefaultWords();
    } catch(e) {
      vocab = await fetchDefaultWords();
    }
  } else {
    vocab = await fetchDefaultWords();
    localStorage.setItem(LS_VOCAB, JSON.stringify(vocab));
  }

  try {
    passed = p ? new Set(JSON.parse(p)) : new Set();
  } catch(e) {
    passed = new Set();
  }
}

async function fetchDefaultWords() {
  try {
    const res = await fetch('../../shared/data/words.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    return data;
  } catch(e) {
    console.error('Could not load words.json', e);
    return [];
  }
}

function saveState() {
  localStorage.setItem(LS_VOCAB,  JSON.stringify(vocab));
  localStorage.setItem(LS_PASSED, JSON.stringify([...passed]));
}

// ─── QUEUE ────────────────────────────────────────────────────────────
function buildQueue() {
  const indices = getActiveIndices();
  queue = indices.filter(i => !passed.has(i));
  shuffle(queue);
  currentIndex = 0;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ─── RENDER ───────────────────────────────────────────────────────────
function render() {
  updateStats();
  if (queue.length === 0 || currentIndex >= queue.length) {
    showEmptyState();
    return;
  }
  const idx = queue[currentIndex];
  const word = vocab[idx];

  isFlipped = false;
  const scene = document.getElementById('cardScene');
  scene.classList.remove('flipped');

  const artClass = 'card-article-inline art-' + word.article.toLowerCase();

  const artFront = document.getElementById('cardArticleInline');
  artFront.textContent = word.article;
  artFront.className = artClass;

  document.getElementById('cardWord').textContent        = word.german;
  document.getElementById('cardPronun').textContent      = word.pronunciation ? '[ ' + word.pronunciation + ' ]' : '';
  document.getElementById('cardTranslation').textContent = word.english;
  document.getElementById('cardNumber').textContent      = '#' + (idx + 1);
  document.getElementById('cardNumberBack').textContent  = '#' + (idx + 1);

  const wrapper = document.getElementById('cardWrapper');
  wrapper.style.animation = 'none';
  void wrapper.offsetWidth;
  wrapper.style.animation = 'popIn 0.38s cubic-bezier(.4,0,.2,1)';

  document.getElementById('cardButtons').style.display = 'flex';
  document.getElementById('cardArea').querySelector('.empty-state')?.remove();
}

function showEmptyState() {
  document.getElementById('cardButtons').style.display = 'none';
  document.getElementById('cardArea').innerHTML = `
    <div class="empty-state">
      <div class="emoji">🎉</div>
      <p style="color:var(--yellow);font-size:1.2rem;font-family:'Bebas Neue',sans-serif;letter-spacing:2px;margin-bottom:6px;">All Words Mastered!</p>
      <p>Amazing job — you've passed all ${vocab.length} words.</p>
      <button class="btn-primary" style="margin-top:16px" onclick="resetPassed()">Start Fresh 🔄</button>
    </div>`;
}

function updateStats() {
  const indices   = getActiveIndices();
  const total     = indices.length;
  const mastCount = indices.filter(i => passed.has(i)).length;
  const remaining = total - mastCount;
  const pct       = total > 0 ? (mastCount / total) * 100 : 0;

  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statRemaining').textContent = remaining;
  document.getElementById('statPassed').textContent    = mastCount;
  document.getElementById('statSession').textContent   = sessionCount;
  document.getElementById('progressFill').style.width  = pct + '%';
}

// ─── FLIP ─────────────────────────────────────────────────────────────
document.getElementById('cardScene').addEventListener('click', () => {
  isFlipped = !isFlipped;
  document.getElementById('cardScene').classList.toggle('flipped', isFlipped);
});

// ─── PASS / REPEAT ────────────────────────────────────────────────────
document.getElementById('btnPass').addEventListener('click', () => {
  const idx = queue[currentIndex];
  passed.add(idx);
  sessionCount++;
  sessionStats.wordsPassed++;
  saveState();
  next();
});

document.getElementById('btnRepeat').addEventListener('click', () => {
  next(true);
});

function next(repeat = false) {
  if (repeat) {
    const cur = queue.splice(currentIndex, 1)[0];
    queue.push(cur);
    if (currentIndex >= queue.length) currentIndex = 0;
  } else {
    currentIndex++;
    if (currentIndex >= queue.length) {
      buildQueue();
    }
  }
  render();
}

// ─── IMPORT JSON ──────────────────────────────────────────────────────
document.getElementById('btnImportJson').addEventListener('click', () => {
  const raw = document.getElementById('jsonInput').value.trim();
  const msg = document.getElementById('msgImport');
  if (!raw) { showMsg(msg, 'Paste JSON first.', 'error'); return; }

  let arr;
  try {
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error('Expected an array');
  } catch (e) {
    showMsg(msg, '✗ Invalid JSON: ' + e.message, 'error');
    return;
  }

  const validItems = arr.filter(item => item.german && item.english);
  if (validItems.length === 0) {
    showMsg(msg, 'No valid items — each needs "german" and "english".', 'error');
    return;
  }

  let added = 0;
  const newGermanWords = [];
  validItems.forEach(item => {
    const exists = vocab.some(v => v.german === item.german);
    if (!exists) {
      vocab.push({
        german: item.german,
        english: item.english,
        article: item.article || '',
        pronunciation: item.pronunciation || '',
        plural: item.plural || ''
      });
      added++;
    }
    newGermanWords.push(item.german);
  });

  if (added === 0) {
    showMsg(msg, 'All words already exist in vocabulary.', 'info');
    return;
  }

  addWordKeysToActiveTheme(newGermanWords);
  saveState();
  buildQueue();
  render();
  document.getElementById('jsonInput').value = '';
  const themeNote = activeThemeId ? ' & added to theme' : '';
  showMsg(msg, `✓ Added ${added} new word${added !== 1 ? 's' : ''}${themeNote}!`, 'success');
});

// ─── EXPORT / IMPORT PROGRESS ─────────────────────────────────────────
document.getElementById('btnExport').addEventListener('click', () => {
  const data = {
    vocab,
    passed: [...passed],
    themes,
    genderProgress,
    genderMastered: [...genderMastered],
    pluralProgress,
    pluralMastered: [...pluralMastered],
    activeThemeId,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'deutsch_progress_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  showMsg(document.getElementById('msgSave'), '✓ Progress file downloaded!', 'success');
});

document.getElementById('btnUploadTrigger').addEventListener('click', () => {
  document.getElementById('fileUpload').click();
});

document.getElementById('fileUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (!data.vocab || !data.passed) throw new Error('Invalid progress file format');
      vocab  = data.vocab;
      passed = new Set(data.passed);
      if (data.themes) { themes = data.themes; saveThemes(); }
      if (data.genderProgress) genderProgress = data.genderProgress;
      if (data.genderMastered) genderMastered = new Set(data.genderMastered);
      if (data.pluralProgress) pluralProgress = data.pluralProgress;
      if (data.pluralMastered) pluralMastered = new Set(data.pluralMastered);
      if (data.activeThemeId) {
        activeThemeId = data.activeThemeId;
        saveActiveTheme();
      } else {
        activeThemeId = null;
        saveActiveTheme();
      }
      saveState();
      saveGenderState();
      savePluralState();
      buildQueue();
      render();
      if (activeThemeId) {
        showFlashcardView();
      }
      showMsg(document.getElementById('msgSave'), `✓ Loaded ${vocab.length} words, ${passed.size} mastered.`, 'success');
    } catch(e) {
      showMsg(document.getElementById('msgSave'), '✗ Could not read file: ' + e.message, 'error');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ─── PANEL TOGGLES ────────────────────────────────────────────────────
function openPanel(id) {
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('open'));
  document.getElementById(id).classList.add('open');
}

function closePanel(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.panel').forEach(p => {
  p.addEventListener('click', (e) => {
    if (e.target === p) p.classList.remove('open');
  });
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.close;
    if (id) closePanel(id);
  });
});

document.getElementById('btnAddPanel').addEventListener('click', () => openPanel('panelAdd'));
document.getElementById('btnImportPanel').addEventListener('click', () => openPanel('panelSave'));

document.getElementById('btnCopyTemplate').addEventListener('click', () => {
  const template = `[
  {
    "article": "",
    "german": "",
    "english": "",
    "plural": ""
  }
]`;
  navigator.clipboard.writeText(template).then(() => {
    const btn = document.getElementById('btnCopyTemplate');
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '📋'; }, 1500);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = template;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const btn = document.getElementById('btnCopyTemplate');
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '📋'; }, 1500);
  });
});

document.getElementById('btnResetAll').addEventListener('click', () => {
  if (confirm('Reset all mastered words? Your vocabulary list will stay.')) {
    resetPassed();
  }
});

document.getElementById('btnBackToThemes').addEventListener('click', showThemeSelect);

function resetPassed() {
  passed.clear();
  sessionCount = 0;
  saveState();
  buildQueue();
  render();
}

// ─── UTIL ─────────────────────────────────────────────────────────────
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg show ' + type;
  setTimeout(() => { el.classList.remove('show'); }, 3500);
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA') return;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    document.getElementById('cardScene').click();
  }
  if (e.key === 'ArrowRight') document.getElementById('btnPass').click();
  if (e.key === 'ArrowLeft')  document.getElementById('btnRepeat').click();
  if (e.key === 'Escape') {
    const filterPopup = document.getElementById('wmFilterPopup');
    if (filterPopup.classList.contains('open')) {
      filterPopup.classList.remove('open');
      document.getElementById('wmFilterBtn').classList.remove('active');
    } else if (document.getElementById('wordManageView').classList.contains('active')) {
      saveGenderState();
      savePluralState();
      closeWordManage();
    } else {
      const openPanel = document.querySelector('.panel.open');
      if (openPanel) {
        openPanel.classList.remove('open');
      } else if (document.getElementById('flashcardView').classList.contains('active')) {
        showThemeSelect();
      }
    }
  }
});

// ─── QUIZ ENGINE ──────────────────────────────────────────────────────
let activeQuizTab    = 'gender';
let quizAnswered     = false;
let quizSessionCorrect = 0;
let quizSessionWrong   = 0;

const LS_GENDER_PROGRESS = 'deutsch_quiz_progress';
const LS_GENDER_MASTERED = 'deutsch_quiz_mastered';
let genderProgress = {};
let genderMastered = new Set();
let genderCurrent  = null;

const LS_PLURAL_PROGRESS = 'deutsch_plural_progress';
const LS_PLURAL_MASTERED = 'deutsch_plural_mastered';
let pluralProgress = {};
let pluralMastered = new Set();
let pluralCurrent  = null;

function loadQuizState() {
  const gp = localStorage.getItem(LS_GENDER_PROGRESS);
  const gm = localStorage.getItem(LS_GENDER_MASTERED);
  genderProgress = gp ? JSON.parse(gp) : {};
  genderMastered = gm ? new Set(JSON.parse(gm)) : new Set();

  const pp = localStorage.getItem(LS_PLURAL_PROGRESS);
  const pm = localStorage.getItem(LS_PLURAL_MASTERED);
  pluralProgress = pp ? JSON.parse(pp) : {};
  pluralMastered = pm ? new Set(JSON.parse(pm)) : new Set();
}

function saveGenderState() {
  localStorage.setItem(LS_GENDER_PROGRESS, JSON.stringify(genderProgress));
  localStorage.setItem(LS_GENDER_MASTERED, JSON.stringify([...genderMastered]));
}

function savePluralState() {
  localStorage.setItem(LS_PLURAL_PROGRESS, JSON.stringify(pluralProgress));
  localStorage.setItem(LS_PLURAL_MASTERED, JSON.stringify([...pluralMastered]));
}

function buildPool(masteredSet) {
  const indices = getActiveIndices();
  const pool = [];
  indices.forEach(idx => {
    if (!passed.has(idx)) return;
    if (masteredSet.has(idx)) return;
    pool.push(idx);
  });
  shuffle(pool);
  return pool;
}

function updateQuizStats(masteredSet) {
  const inPool = passed.size - masteredSet.size;
  document.getElementById('qStatPool').textContent     = Math.max(0, inPool);
  document.getElementById('qStatMastered').textContent = masteredSet.size;
  document.getElementById('qStatCorrect').textContent  = quizSessionCorrect;
  document.getElementById('qStatWrong').textContent    = quizSessionWrong;
}

function switchQuizTab(tab) {
  activeQuizTab = tab;
  quizAnswered  = false;

  document.getElementById('tabGender').classList.toggle('active',       tab === 'gender');
  document.getElementById('tabGender').classList.toggle('plural-active',false);
  document.getElementById('tabPlural').classList.toggle('active',       tab === 'plural');
  document.getElementById('tabPlural').classList.toggle('plural-active',tab === 'plural');

  renderActiveQuiz();
}

function renderActiveQuiz() {
  if (activeQuizTab === 'gender') renderGenderQuiz();
  else                             renderPluralQuiz();
}

function renderGenderQuiz() {
  updateQuizStats(genderMastered);
  const area = document.getElementById('quizCardArea');

  if (passed.size === 0) {
    area.innerHTML = emptyHtml('📚', 'No mastered words yet.', 'Hit <strong>Got it!</strong> on flashcards first — they appear here for gender practice.');
    return;
  }

  const pool = buildPool(genderMastered);

  if (pool.length === 0) {
    area.innerHTML = emptyHtml('🏆', `All ${genderMastered.size} gender${genderMastered.size !== 1 ? 's' : ''} mastered!`, 'Keep adding vocabulary to keep going.');
    return;
  }

  genderCurrent = pool[0];
  quizAnswered  = false;
  const word    = vocab[genderCurrent];
  const count   = genderProgress[genderCurrent] || 0;

  let pips = '';
  for (let i = 0; i < 3; i++) pips += `<div class="pip${i < count ? ' filled' : ''}"></div>`;

  area.innerHTML = `
    <div class="quiz-card" id="quizCard">
      <div class="quiz-noun">${word.german}</div>
      <div class="quiz-noun-english">${word.english}</div>
      <div class="quiz-progress-pips">${pips}</div>
      <div class="quiz-feedback" id="quizFeedback"></div>
    </div>
    <div class="quiz-answers">
      <button class="btn-article der-btn" onclick="genderAnswer('der')">der</button>
      <button class="btn-article die-btn" onclick="genderAnswer('die')">die</button>
      <button class="btn-article das-btn" onclick="genderAnswer('das')">das</button>
    </div>
    <button class="quiz-next-btn" id="quizNextBtn" onclick="renderGenderQuiz()">Next →</button>
  `;
}

function genderAnswer(chosen) {
  if (quizAnswered) return;
  quizAnswered = true;

  const word    = vocab[genderCurrent];
  const correct = word.article.toLowerCase();
  const isRight = chosen === correct;

  const card     = document.getElementById('quizCard');
  const feedback = document.getElementById('quizFeedback');
  const btns     = document.querySelectorAll('.btn-article');
  btns.forEach(b => b.disabled = true);

  if (isRight) {
    quizSessionCorrect++;
    const newCount = (genderProgress[genderCurrent] || 0) + 1;
    genderProgress[genderCurrent] = newCount;

    card.classList.add('correct');
    feedback.textContent = newCount >= 3 ? '✓ MASTERED!' : `✓ CORRECT  (${newCount}/3)`;
    feedback.className   = 'quiz-feedback show correct-text';

    if (newCount >= 3) {
      genderMastered.add(genderCurrent);
      delete genderProgress[genderCurrent];
      sessionStats.genderMastered++;
    }

    btns.forEach(b => {
      if (b.textContent.trim() === chosen) {
        b.style.background = 'rgba(0,229,195,0.18)';
        b.style.borderColor = 'rgba(0,229,195,0.6)';
        b.style.color = '#5DECC8';
        b.style.opacity = '1';
        b.style.boxShadow = '0 0 20px rgba(0,229,195,0.25)';
      }
    });

  } else {
    quizSessionWrong++;
    card.classList.add('wrong');
    feedback.textContent = `✗  IT'S  "${correct.toUpperCase()}"`;
    feedback.className   = 'quiz-feedback show wrong-text';

    btns.forEach(b => {
      const art = b.textContent.trim();
      if (art === chosen) {
        b.style.background  = 'rgba(251,113,133,0.18)';
        b.style.borderColor = 'rgba(251,113,133,0.6)';
        b.style.color       = '#FB7185';
        b.style.opacity     = '1';
      }
      if (art === correct) b.classList.add('reveal-correct');
    });
  }

  saveGenderState();
  updateQuizStats(genderMastered);
  document.getElementById('quizNextBtn').classList.add('show');
}

function renderPluralQuiz() {
  updateQuizStats(pluralMastered);
  const area = document.getElementById('quizCardArea');

  if (passed.size === 0) {
    area.innerHTML = emptyHtml('📚', 'No mastered words yet.', 'Hit <strong>Got it!</strong> on flashcards first — they appear here for plural practice.');
    return;
  }

  const pool = buildPool(pluralMastered).filter(idx => vocab[idx] && vocab[idx].plural);

  if (pool.length === 0) {
    if ([...passed].some(idx => vocab[idx] && vocab[idx].plural)) {
      area.innerHTML = emptyHtml('🏆', `All ${pluralMastered.size} plural${pluralMastered.size !== 1 ? 's' : ''} mastered!`, 'Keep adding vocabulary to keep going.');
    } else {
      area.innerHTML = emptyHtml('📖', 'No plural data yet.', 'Your words need a <strong>plural</strong> field. Upload an updated progress file to unlock this quiz.');
    }
    return;
  }

  pluralCurrent = pool[0];
  quizAnswered  = false;
  const word    = vocab[pluralCurrent];
  const count   = pluralProgress[pluralCurrent] || 0;

  let pips = '';
  for (let i = 0; i < 2; i++) pips += `<div class="pip${i < count ? ' filled' : ''}"></div>`;

  area.innerHTML = `
    <div class="quiz-card" id="quizCard">
      <div class="quiz-noun-hint">Plural of</div>
      <div class="quiz-noun">${word.article} ${word.german}</div>
      <div class="quiz-noun-english">${word.english}</div>
      <div class="quiz-progress-pips">${pips}</div>
      <div class="quiz-noun-plural-display" id="pluralReveal">die ${word.plural}</div>
      <div class="quiz-feedback" id="quizFeedback"></div>
    </div>
    <div class="plural-input-row">
      <input class="plural-input" id="pluralInput" type="text" placeholder="Type plural noun…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <button class="plural-submit-btn" id="pluralSubmitBtn" onclick="pluralAnswer()">Check</button>
    </div>
    <div class="vkb" id="vkb">
      <div class="vkb-row">
        ${['q','w','e','r','t','z','u','i','o','p'].map(k => `<button class="vkb-key" onmousedown="vkbPress(event,'${k}')">${k}</button>`).join('')}
      </div>
      <div class="vkb-row">
        ${['a','s','d','f','g','h','j','k','l'].map(k => `<button class="vkb-key" onmousedown="vkbPress(event,'${k}')">${k}</button>`).join('')}
      </div>
      <div class="vkb-row">
        ${['y','x','c','v','b','n','m'].map(k => `<button class="vkb-key" onmousedown="vkbPress(event,'${k}')">${k}</button>`).join('')}
        <button class="vkb-key backspace" onmousedown="vkbPress(event,'⌫')">⌫</button>
      </div>
      <div class="vkb-row">
        ${['ä','ö','ü','ß'].map(k => `<button class="vkb-key special" onmousedown="vkbPress(event,'${k}')">${k}</button>`).join('')}
      </div>
    </div>
    <button class="quiz-next-btn" id="quizNextBtn" onclick="renderPluralQuiz()">Next →</button>
  `;

  const input = document.getElementById('pluralInput');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') pluralAnswer();
  });
}

function vkbPress(e, key) {
  e.preventDefault();
  const input = document.getElementById('pluralInput');
  if (!input || input.disabled) return;
  if (key === '⌫') {
    input.value = input.value.slice(0, -1);
  } else {
    input.value += key;
  }
}

function pluralAnswer() {
  if (quizAnswered) return;

  const input   = document.getElementById('pluralInput');
  const typed   = (input.value || '').trim();
  if (!typed) return;

  quizAnswered  = true;
  const word    = vocab[pluralCurrent];
  const correct = word.plural.trim().toLowerCase();
  const isRight = typed.toLowerCase() === correct;

  const card    = document.getElementById('quizCard');
  const feedback= document.getElementById('quizFeedback');
  const reveal  = document.getElementById('pluralReveal');

  input.disabled = true;
  document.getElementById('pluralSubmitBtn').disabled = true;
  document.querySelectorAll('.vkb-key').forEach(k => k.disabled = true);

  if (isRight) {
    quizSessionCorrect++;
    const newCount = (pluralProgress[pluralCurrent] || 0) + 1;
    pluralProgress[pluralCurrent] = newCount;

    card.classList.add('correct');
    reveal.classList.add('show');
    feedback.textContent = newCount >= 2 ? '✓ MASTERED!' : `✓ CORRECT  (${newCount}/2)`;
    feedback.className   = 'quiz-feedback show correct-text';
    input.style.borderColor = 'rgba(0,229,195,0.6)';
    input.style.color       = '#5DECC8';

    if (newCount >= 2) {
      pluralMastered.add(pluralCurrent);
      delete pluralProgress[pluralCurrent];
      sessionStats.pluralMastered++;
    }

  } else {
    quizSessionWrong++;
    card.classList.add('wrong');
    reveal.classList.add('show', 'wrong-plural');
    reveal.classList.remove('wrong-plural');
    feedback.textContent = `✗  CORRECT: die ${word.plural}`;
    feedback.className   = 'quiz-feedback show wrong-text';
    input.style.borderColor = 'rgba(251,113,133,0.6)';
    input.style.color       = '#FB7185';
  }

  savePluralState();
  updateQuizStats(pluralMastered);
  document.getElementById('quizNextBtn').classList.add('show');
}

function emptyHtml(emoji, title, sub) {
  return `<div class="quiz-empty">
    <span class="emoji">${emoji}</span>
    <p>${title}<br><span style="font-weight:400;font-size:0.85em;opacity:0.7">${sub}</span></p>
  </div>`;
}

document.getElementById('btnQuizToggle').addEventListener('click', () => {
  const section = document.getElementById('quizSection');
  const btn     = document.getElementById('btnQuizToggle');
  const isOpen  = section.classList.contains('open');
  if (isOpen) {
    section.classList.remove('open');
    btn.classList.remove('active');
  } else {
    section.classList.add('open');
    btn.classList.add('active');
    renderActiveQuiz();
  }
});

// ─── WORD MANAGEMENT VIEW ────────────────────────────────────────────
let wmThemeId = null;
let wmFilter = 'all';

function openWordManage(themeId) {
  wmThemeId = themeId;
  const theme = themes.find(t => t.id === themeId);
  document.getElementById('wmThemeName').textContent = theme ? theme.name : (themeId === '__all__' ? 'All Words' : 'Theme');
  document.getElementById('wmFilterBtn').classList.remove('active');
  document.getElementById('wmFilterPopup').classList.remove('open');
  document.querySelectorAll('input[name="wmFilter"]').forEach(r => r.checked = r.value === 'all');
  wmFilter = 'all';

  document.getElementById('themeSelectView').classList.remove('active');
  document.getElementById('wordManageView').classList.add('active');
  renderWordList();
}

function closeWordManage() {
  document.getElementById('wordManageView').classList.remove('active');
  document.getElementById('themeSelectView').classList.add('active');
  renderThemeSelectList();
}

function getThemeWordIndices(themeId) {
  if (themeId === '__all__') {
    return vocab.map((_, i) => i);
  }
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return [];
  return vocab
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => theme.wordKeys.includes(w.german))
    .map(({ i }) => i);
}

function filterWordIndices(indices) {
  switch (wmFilter) {
    case 'not-passed': return indices.filter(i => !passed.has(i));
    case 'passed': return indices.filter(i => passed.has(i));
    case 'gender-0': return indices.filter(i => !genderProgress[i] && !genderMastered.has(i));
    case 'gender-1': return indices.filter(i => (genderProgress[i] || 0) > 0 && (genderProgress[i] || 0) < 3 && !genderMastered.has(i));
    case 'gender-3': return indices.filter(i => genderMastered.has(i));
    case 'plural-none': return indices.filter(i => !pluralMastered.has(i));
    case 'plural-mastered': return indices.filter(i => pluralMastered.has(i));
    default: return indices;
  }
}

function renderWordList() {
  const list = document.getElementById('wmWordList');
  if (wmThemeId !== '__all__') {
    const theme = themes.find(t => t.id === wmThemeId);
    if (!theme) { list.innerHTML = '<div class="wm-empty">Theme not found.</div>'; return; }
  }

  let indices = getThemeWordIndices(wmThemeId);
  indices = filterWordIndices(indices);

  document.getElementById('wmWordCount').textContent = indices.length + ' words';

  if (indices.length === 0) {
    list.innerHTML = '<div class="wm-empty">No words match the current filter.</div>';
    return;
  }

  list.innerHTML = indices.map(idx => {
    const w = vocab[idx];
    const artClass = w.article ? 'art-' + w.article.toLowerCase() : 'art-none';
    const artDisplay = w.article || '—';
    const isPassed = passed.has(idx);
    const gCount = genderProgress[idx] || 0;
    const gMastered = genderMastered.has(idx);
    const pMastered = pluralMastered.has(idx);

    const genderLabel = gMastered ? '3/3' : gCount + '/3';
    const genderClass = gMastered ? 'g3' : 'g' + gCount;

    return `<div class="wm-word-card" data-idx="${idx}">
      <div class="wm-row-top" onclick="toggleWmEditor(${idx})">
        <input type="checkbox" class="wm-check" data-idx="${idx}" onclick="event.stopPropagation();onWmCheckChange()">
        <div class="wm-word-info">
          <div class="wm-word-main">
            <span class="wm-article ${artClass}">${artDisplay}</span>
            <span class="wm-german">${w.german}</span>
          </div>
          <div class="wm-english">${w.pronunciation ? '[' + w.pronunciation + '] ' : ''}${w.english}</div>
        </div>
        <div class="wm-badges">
          <span class="wm-badge ${isPassed ? 'passed' : 'not-passed'}">${isPassed ? '✓' : '✗'}</span>
          <span class="wm-badge gender-dot ${genderClass}">${genderLabel}</span>
          <span class="wm-badge plural-dot ${pMastered ? 'p-mastered' : 'p-none'}">${pMastered ? 'P✓' : 'P—'}</span>
        </div>
      </div>
      <div class="wm-editor" id="wmEditor_${idx}">
        <div class="wm-editor-row">
          <span class="wm-editor-label">Flashcard</span>
          <button class="wm-editor-toggle ${isPassed ? 'on' : 'off'}" onclick="wmTogglePassed(${idx})">${isPassed ? '✓ Got it' : '✗ Not passed'}</button>
        </div>
        <div class="wm-editor-row">
          <span class="wm-editor-label">Gender Quiz</span>
          <div class="wm-editor-gender-btns">
            <button class="${gCount === 0 && !gMastered ? 'active' : ''}" onclick="wmSetGender(${idx}, 0)">0</button>
            <button class="${gCount === 1 && !gMastered ? 'active' : ''}" onclick="wmSetGender(${idx}, 1)">1</button>
            <button class="${gCount === 2 && !gMastered ? 'active' : ''}" onclick="wmSetGender(${idx}, 2)">2</button>
            <button class="${gMastered ? 'mastered' : ''}" onclick="wmSetGender(${idx}, 3)">3 ✓</button>
          </div>
        </div>
        <div class="wm-editor-row">
          <span class="wm-editor-label">Plural Quiz</span>
          <div class="wm-editor-plural-btns">
            <button class="${!pMastered ? 'active' : ''}" onclick="wmSetPlural(${idx}, false)">Not started</button>
            <button class="${pMastered ? 'active' : ''}" onclick="wmSetPlural(${idx}, true)">✓ Mastered</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('wmSelectAll').checked = false;
  updateWmSelectedCount();
}

function toggleWmEditor(idx) {
  const editor = document.getElementById('wmEditor_' + idx);
  if (editor) editor.classList.toggle('open');
}

function wmTogglePassed(idx) {
  if (passed.has(idx)) { passed.delete(idx); }
  else { passed.add(idx); sessionCount++; }
  saveState();
  renderWordList();
}

function wmSetGender(idx, val) {
  if (val >= 3) {
    genderMastered.add(idx);
    delete genderProgress[idx];
  } else {
    genderMastered.delete(idx);
    if (val > 0) genderProgress[idx] = val;
    else delete genderProgress[idx];
  }
  saveGenderState();
  renderWordList();
}

function wmSetPlural(idx, mastered) {
  if (mastered) pluralMastered.add(idx);
  else pluralMastered.delete(idx);
  savePluralState();
  renderWordList();
}

function onWmCheckChange() {
  const checks = document.querySelectorAll('#wmWordList .wm-check');
  const allChecked = document.getElementById('wmSelectAll');
  const checked = document.querySelectorAll('#wmWordList .wm-check:checked');
  allChecked.checked = checked.length === checks.length && checks.length > 0;
  updateWmSelectedCount();
}

function updateWmSelectedCount() {
  const checked = document.querySelectorAll('#wmWordList .wm-check:checked');
  const count = checked.length;
  const bar = document.getElementById('wmBatchBar');
  document.getElementById('wmSelectedCount').textContent = count > 0 ? count + ' selected' : '';
  bar.classList.toggle('visible', count > 0);
}

document.getElementById('wmSelectAll').addEventListener('change', (e) => {
  document.querySelectorAll('#wmWordList .wm-check').forEach(c => c.checked = e.target.checked);
  updateWmSelectedCount();
});

// Batch operations
document.querySelectorAll('[data-batch]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.batch;
    const indices = [...document.querySelectorAll('#wmWordList .wm-check:checked')].map(c => parseInt(c.dataset.idx));
    if (indices.length === 0) return;

    indices.forEach(idx => {
      switch (action) {
        case 'pass': passed.add(idx); break;
        case 'unpass': passed.delete(idx); break;
        case 'gender-0': wmSetGenderDirect(idx, 0); break;
        case 'gender-1': wmSetGenderDirect(idx, 1); break;
        case 'gender-2': wmSetGenderDirect(idx, 2); break;
        case 'gender-3': wmSetGenderDirect(idx, 3); break;
        case 'plural-mastered': wmSetPluralDirect(idx, true); break;
        case 'plural-unmaster': wmSetPluralDirect(idx, false); break;
      }
    });

    const needsGenderSave = action.startsWith('gender-');
    const needsPluralSave = action.startsWith('plural-');
    const needsFlashSave = action === 'pass' || action === 'unpass';
    if (needsFlashSave) saveState();
    if (needsGenderSave) saveGenderState();
    if (needsPluralSave) savePluralState();
    renderWordList();
  });
});

function wmSetGenderDirect(idx, val) {
  if (val >= 3) { genderMastered.add(idx); delete genderProgress[idx]; }
  else { genderMastered.delete(idx); if (val > 0) genderProgress[idx] = val; else delete genderProgress[idx]; }
}

function wmSetPluralDirect(idx, mastered) {
  if (mastered) pluralMastered.add(idx); else pluralMastered.delete(idx);
}


// Filter popup
document.getElementById('wmFilterBtn').addEventListener('click', () => {
  const popup = document.getElementById('wmFilterPopup');
  const btn = document.getElementById('wmFilterBtn');
  popup.classList.toggle('open');
  btn.classList.toggle('active');
});

document.querySelectorAll('input[name="wmFilter"]').forEach(r => {
  r.addEventListener('change', () => {
    if (r.checked) {
      wmFilter = r.value;
      document.getElementById('wmFilterPopup').classList.remove('open');
      document.getElementById('wmFilterBtn').classList.remove('active');
      renderWordList();
    }
  });
});

// Close filter popup on outside click
document.addEventListener('click', (e) => {
  const popup = document.getElementById('wmFilterPopup');
  const btn = document.getElementById('wmFilterBtn');
  if (!popup.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    popup.classList.remove('open');
    btn.classList.remove('active');
  }
});

document.getElementById('wmBackBtn').addEventListener('click', () => {
  // Save batch changes before closing
  saveGenderState();
  savePluralState();
  closeWordManage();
});

// ─── WORD MANAGEMENT REGISTER SERVICE WORKER ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ─── TIMER INTEGRATION ─────────────────────────────────────────────
const timerPill = document.getElementById('timerPill');
if (timerPill) {
  timerTickCb = (remaining) => {
    const display = getTimerDisplay();
    timerPill.textContent = '⏱ ' + display;
    timerPill.style.color = remaining <= 120 ? 'var(--orange)' : (remaining <= 60 ? 'var(--rose)' : '');
  };
}

// ─── INIT ─────────────────────────────────────────────────────────────
(async () => {
  loadThemes();
  await loadState();
  loadQuizState();
  renderThemeSelectList();
  sessionStats = { wordsPassed: 0, genderMastered: 0, pluralMastered: 0 };
  if (activeThemeId) {
    buildQueue();
    render();
    showFlashcardView();
  }
})();
