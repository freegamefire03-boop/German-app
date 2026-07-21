// ─── STATE ────────────────────────────────────────────────────────────
let themes = [];
let activeThemeId = null;
let quizzes = {};          // { themeId: [{ id, german, english, question, choices, correct, score }] }
let sessionCount = 0;
let sessionCorrect = 0;
let sessionWrong = 0;
let autoNextTimer = null;

const LS_THEMES       = 'qcm_themes';
const LS_ACTIVE_THEME = 'qcm_active_theme';
const LS_QUIZZES      = 'qcm_quizzes';

// ─── PERSISTENCE ──────────────────────────────────────────────────────
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

function loadQuizzes() {
  try { quizzes = JSON.parse(localStorage.getItem(LS_QUIZZES) || '{}'); } catch(e) { quizzes = {}; }
}

function saveQuizzes() {
  localStorage.setItem(LS_QUIZZES, JSON.stringify(quizzes));
}

function getThemeQuizzes(themeId) {
  return quizzes[themeId] || [];
}

function getMasteredCount(themeId) {
  const theme = themes.find(t => t.id === themeId);
  const threshold = theme ? theme.masteryScore : 3;
  return getThemeQuizzes(themeId).filter(q => q.score >= threshold).length;
}

// ─── UTIL ─────────────────────────────────────────────────────────────
function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ─── VIEW SWITCHING ───────────────────────────────────────────────────
function showThemeSelect() {
  if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
  activeThemeId = null;
  saveActiveTheme();
  document.getElementById('quizView').classList.remove('active');
  document.getElementById('editView').classList.remove('active');
  document.getElementById('themeSelectView').classList.add('active');
  renderThemeSelectList();
}

function showQuizView() {
  document.getElementById('themeSelectView').classList.remove('active');
  document.getElementById('editView').classList.remove('active');
  document.getElementById('quizView').classList.add('active');
  sessionCount = 0;
  sessionCorrect = 0;
  sessionWrong = 0;
  renderQuiz();
}

function showEditView() {
  if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
  document.getElementById('themeSelectView').classList.remove('active');
  document.getElementById('quizView').classList.remove('active');
  document.getElementById('editView').classList.add('active');
  editSearch = '';
  editFilter = 'all';
  editSelectedIds.clear();
  document.getElementById('editSearchInput').value = '';
  document.querySelectorAll('input[name="editFilter"]').forEach(r => r.checked = r.value === 'all');
  renderEditList();
}

function selectTheme(id) {
  activeThemeId = id;
  saveActiveTheme();
  showQuizView();
}

function openEditTheme(id) {
  activeThemeId = id;
  saveActiveTheme();
  showEditView();
}

// ─── THEME SELECT ─────────────────────────────────────────────────────
function renderThemeSelectList() {
  const list = document.getElementById('tsList');
  let html = '';

  themes.forEach(t => {
    const count = getThemeQuizzes(t.id).length;
    const mastered = getMasteredCount(t.id);
    html += `<div class="ts-card" onclick="selectTheme('${t.id}')">
      <div class="ts-icon">❓</div>
      <div class="ts-info">
        <div class="ts-title">${escHtml(t.name)}</div>
        <div class="ts-desc">${count} quizzes · ${mastered} mastered · ${t.masteryScore || 3} to pass</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="ts-manage-btn" onclick="event.stopPropagation();openSettingsModal('${t.id}')" title="Theme settings">⚙️</button>
        <div class="ts-arrow">›</div>
      </div>
    </div>`;
  });

  if (themes.length === 0) {
    html = `<div class="ts-empty">No themes yet. Create one to get started.</div>`;
  }

  list.innerHTML = html;
}

// ─── CREATE THEME MODAL ──────────────────────────────────────────────
function openCreateModal() {
  document.getElementById('tsCreateModal').classList.add('open');
  const input = document.getElementById('tsModalInput');
  input.value = '';
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
  const id = 'theme_' + Date.now();
  themes.push({ id, name, masteryScore: 3 });
  quizzes[id] = [];
  saveThemes();
  saveQuizzes();
  input.value = '';
  closeCreateModal();
  selectTheme(id);
});

document.getElementById('tsModalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('tsModalConfirm').click();
  if (e.key === 'Escape') closeCreateModal();
});

// ─── THEME SETTINGS MODAL ────────────────────────────────────────────
let settingsThemeId = null;

function openSettingsModal(themeId) {
  settingsThemeId = themeId;
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;
  document.getElementById('themeNameInput').value = theme.name;
  document.getElementById('masteryScoreInput').value = theme.masteryScore || 3;
  document.getElementById('themeSettingsModal').classList.add('open');
  document.getElementById('themeNameInput').focus();
}

function closeSettingsModal() {
  document.getElementById('themeSettingsModal').classList.remove('open');
  settingsThemeId = null;
}

document.getElementById('settingsCancel').addEventListener('click', closeSettingsModal);
document.getElementById('settingsSave').addEventListener('click', () => {
  if (!settingsThemeId) return;
  const theme = themes.find(t => t.id === settingsThemeId);
  if (!theme) return;
  const name = document.getElementById('themeNameInput').value.trim();
  if (name) theme.name = name;
  let val = parseInt(document.getElementById('masteryScoreInput').value) || 3;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  theme.masteryScore = val;
  saveThemes();
  closeSettingsModal();
  renderThemeSelectList();
});

document.getElementById('scoreMinus').addEventListener('click', () => {
  const input = document.getElementById('masteryScoreInput');
  let val = parseInt(input.value) || 3;
  if (val > 1) { val--; input.value = val; }
});

document.getElementById('scorePlus').addEventListener('click', () => {
  const input = document.getElementById('masteryScoreInput');
  let val = parseInt(input.value) || 3;
  if (val < 99) { val++; input.value = val; }
});

document.getElementById('masteryScoreInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('settingsSave').click();
  if (e.key === 'Escape') closeSettingsModal();
});

document.getElementById('themeNameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('settingsSave').click();
  if (e.key === 'Escape') closeSettingsModal();
});

// ══════════════════════════════════════════════════════════════════════
// QUIZ MODE
// ══════════════════════════════════════════════════════════════════════
let quizPool = [];
let quizCurrent = null;
let quizAnswered = false;
let quizChoices = [];

function buildQuizPool() {
  const theme = themes.find(t => t.id === activeThemeId);
  const threshold = theme ? theme.masteryScore : 3;
  const all = getThemeQuizzes(activeThemeId);
  quizPool = all.filter(q => q.score < threshold).map(q => q.id);
  shuffle(quizPool);
}

function renderQuiz() {
  updateQuizStats();
  const area = document.getElementById('quizCardArea');
  const theme = themes.find(t => t.id === activeThemeId);
  const all = getThemeQuizzes(activeThemeId);
  const threshold = theme ? theme.masteryScore : 3;

  if (all.length === 0) {
    area.innerHTML = `<div class="quiz-empty">
      <span class="emoji">📥</span>
      <p>No quizzes yet.<br><span style="font-weight:400;font-size:0.85em;opacity:0.7">Tap the <strong>＋</strong> button above to import quizzes via JSON.</span></p>
    </div>`;
    return;
  }

  if (quizPool.length === 0) {
    area.innerHTML = `<div class="quiz-empty">
      <span class="emoji">🏆</span>
      <p style="color:var(--mint);font-size:1.2rem;font-family:'Bebas Neue',sans-serif;letter-spacing:2px;margin-bottom:6px;">All Quizzes Mastered!</p>
      <p>Amazing job — you've mastered all ${all.length} quizzes.</p>
      <button class="btn-primary" style="margin-top:16px" onclick="resetQuizScores()">Start Fresh 🔄</button>
    </div>`;
    return;
  }

  quizCurrent = quizPool[0];
  quizAnswered = false;
  const q = all.find(x => x.id === quizCurrent);
  if (!q) { buildQuizPool(); renderQuiz(); return; }

  if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }

  const count = q.score;
  let pips = '';
  for (let i = 0; i < threshold; i++) pips += `<div class="pip${i < count ? ' filled' : ''}"></div>`;

  const shuffledChoices = [...q.choices].map((c, i) => ({ text: c, origIdx: i }));
  shuffle(shuffledChoices);
  quizChoices = shuffledChoices;

  const questionHtml = q.question ? `<div class="quiz-question">${escHtml(q.question)}</div>` : '';

  area.innerHTML = `
    <div class="quiz-card" id="quizCard">
      <div class="quiz-progress-pips">${pips}</div>
      <div class="quiz-german">${escHtml(q.german)}</div>
      <div class="quiz-english">${escHtml(q.english)}</div>
      <div class="quiz-feedback" id="quizFeedback"></div>
    </div>
    ${questionHtml}
    <div class="quiz-choices">
      ${shuffledChoices.map((c, i) => `<button class="btn-choice" onclick="quizAnswer(this, ${i})" data-correct="${c.text === q.correct ? 'true' : 'false'}">${escHtml(c.text)}</button>`).join('')}
    </div>
    <button class="quiz-next-btn" id="quizNextBtn" onclick="nextQuiz()">Next →</button>
  `;
}

function quizAnswer(btn, idx) {
  if (quizAnswered) return;
  quizAnswered = true;

  const chosen = quizChoices[idx].text;
  const all = getThemeQuizzes(activeThemeId);
  const q = all.find(x => x.id === quizCurrent);
  if (!q) return;
  const isRight = chosen === q.correct;

  const card = document.getElementById('quizCard');
  const feedback = document.getElementById('quizFeedback');
  const btns = document.querySelectorAll('.btn-choice');
  btns.forEach(b => b.disabled = true);

  if (isRight) {
    sessionCorrect++;
    q.score++;
    card.classList.add('correct');
    const theme = themes.find(t => t.id === activeThemeId);
    const threshold = theme ? theme.masteryScore : 3;
    feedback.textContent = q.score >= threshold ? '✓ MASTERED!' : `✓ CORRECT  (${q.score}/${threshold})`;
    feedback.className = 'quiz-feedback show correct-text';
    btn.classList.add('choice-correct');
    vibrate(CONFIG.VIBRATE_SUCCESS);
    saveQuizzes();
    updateQuizStats();
    autoNextTimer = setTimeout(() => { nextQuiz(); }, 1000);
  } else {
    sessionWrong++;
    card.classList.add('wrong');
    feedback.textContent = `✗  CORRECT: ${q.correct}`;
    feedback.className = 'quiz-feedback show wrong-text';
    btn.classList.add('choice-wrong');
    btns.forEach(b => {
      if (b.dataset.correct === 'true') b.classList.add('choice-reveal');
    });
    vibrate(CONFIG.VIBRATE_ERROR);
    saveQuizzes();
    updateQuizStats();
    document.getElementById('quizNextBtn').classList.add('show');
  }
}

function nextQuiz() {
  if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
  quizPool = quizPool.filter(id => id !== quizCurrent);
  if (quizPool.length === 0) buildQuizPool();
  renderQuiz();
}

function resetQuizScores() {
  const all = getThemeQuizzes(activeThemeId);
  all.forEach(q => q.score = 0);
  saveQuizzes();
  sessionCount = 0;
  sessionCorrect = 0;
  sessionWrong = 0;
  buildQuizPool();
  renderQuiz();
}

function updateQuizStats() {
  const theme = themes.find(t => t.id === activeThemeId);
  const threshold = theme ? theme.masteryScore : 3;
  const all = getThemeQuizzes(activeThemeId);
  const total = all.length;
  const mastered = all.filter(q => q.score >= threshold).length;
  const remaining = total - mastered;
  const pct = total > 0 ? (mastered / total) * 100 : 0;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statRemaining').textContent = remaining;
  document.getElementById('statMastered').textContent = mastered;
  document.getElementById('statSession').textContent = sessionCorrect;
  document.getElementById('progressFill').style.width = pct + '%';
}

document.getElementById('quizBackBtn').addEventListener('click', showThemeSelect);
document.getElementById('btnAddQuiz').addEventListener('click', () => {
  document.getElementById('panelImport').classList.add('open');
  setTimeout(() => document.getElementById('jsonInput').focus(), 100);
});
document.getElementById('btnEditQuizzes').addEventListener('click', () => {
  showEditView();
});
document.getElementById('btnResetQuiz').addEventListener('click', () => {
  if (confirm('Reset all quiz scores? This cannot be undone.')) resetQuizScores();
});

// ══════════════════════════════════════════════════════════════════════
// EDIT MODE
// ══════════════════════════════════════════════════════════════════════
let editFilter = 'all';
let editSearch = '';
let editSelectedIds = new Set();

function renderEditList() {
  const theme = themes.find(t => t.id === activeThemeId);
  if (!theme) return;

  document.getElementById('editThemeName').textContent = theme.name;

  let all = getThemeQuizzes(activeThemeId);
  const threshold = theme.masteryScore || 3;

  // Search filter
  if (editSearch) {
    const s = editSearch.toLowerCase();
    all = all.filter(q =>
      q.german.toLowerCase().includes(s) ||
      q.english.toLowerCase().includes(s)
    );
  }

  // Progress filter
  if (editFilter === 'not-mastered') all = all.filter(q => q.score < threshold);
  else if (editFilter === 'mastered') all = all.filter(q => q.score >= threshold);

  document.getElementById('editQuizCount').textContent = all.length + ' quizzes';

  const list = document.getElementById('editQuizList');

  if (all.length === 0) {
    list.innerHTML = '<div class="wm-empty">No quizzes match the current filter.</div>';
    document.getElementById('editSelectAll').checked = false;
    updateEditSelectedCount();
    return;
  }

  list.innerHTML = all.map(q => {
    const isMastered = q.score >= threshold;
    const scoreClass = isMastered ? 'mastered' : 'g' + q.score;

    let editorScoreBtns = '';
    for (let i = 0; i < threshold; i++) {
      editorScoreBtns += `<button class="${q.score === i ? 'active' : ''} ${i >= threshold ? 'mastered' : ''}" onclick="setQuizScore('${q.id}', ${i})">${i}</button>`;
    }
    editorScoreBtns += `<button class="${isMastered ? 'mastered' : ''}" onclick="setQuizScore('${q.id}', ${threshold})">${threshold} ✓</button>`;

    const choicesHtml = q.choices.map(c =>
      `<div class="wm-choice-item${c === q.correct ? ' is-correct' : ''}">${escHtml(c)}</div>`
    ).join('');

    const questionEditHtml = q.question
      ? `<div class="wm-editor-row"><span class="wm-editor-label">Question</span><span style="font-size:0.75rem;color:rgba(255,255,255,0.5);font-weight:600">${escHtml(q.question)}</span></div>`
      : '';

    return `<div class="wm-word-card" data-id="${q.id}">
      <div class="wm-row-top" onclick="toggleEditEditor('${q.id}')">
        <input type="checkbox" class="wm-check" data-id="${q.id}" onclick="event.stopPropagation();onEditCheckChange()">
        <div class="wm-word-info">
          <div class="wm-word-main">
            <span class="wm-german">${escHtml(q.german)}</span>
          </div>
          <div class="wm-english">${escHtml(q.english)}</div>
        </div>
        <div class="wm-badges">
          <span class="wm-badge ${isMastered ? 'mastered' : 'not-mastered'}">${isMastered ? '✓' : '✗'}</span>
          <span class="wm-badge score-dot ${scoreClass}">${q.score}/${threshold}</span>
        </div>
      </div>
      <div class="wm-editor" id="editEditor_${q.id}">
        <div class="wm-editor-row">
          <span class="wm-editor-label">Score</span>
          <div class="wm-editor-score-btns">${editorScoreBtns}</div>
        </div>
        ${questionEditHtml}
        <div class="wm-editor-row">
          <span class="wm-editor-label">Choices</span>
        </div>
        <div class="wm-choices-list">${choicesHtml}</div>
        <div class="wm-editor-row" style="margin-top:10px">
          <button class="wm-editor-toggle danger" onclick="deleteQuiz('${q.id}')">🗑 Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');

  // Restore selection state
  document.querySelectorAll('#editQuizList .wm-check').forEach(c => {
    c.checked = editSelectedIds.has(c.dataset.id);
  });
  document.getElementById('editSelectAll').checked = editSelectedIds.size === all.length && all.length > 0;
  updateEditSelectedCount();
}

function toggleEditEditor(id) {
  const editor = document.getElementById('editEditor_' + id);
  if (editor) editor.classList.toggle('open');
}

function setQuizScore(id, val) {
  const all = getThemeQuizzes(activeThemeId);
  const q = all.find(x => x.id === id);
  if (!q) return;
  q.score = val;
  saveQuizzes();
  renderEditList();
}

function deleteQuiz(id) {
  quizzes[activeThemeId] = getThemeQuizzes(activeThemeId).filter(q => q.id !== id);
  editSelectedIds.delete(id);
  saveQuizzes();
  renderEditList();
}

function onEditCheckChange() {
  const checks = document.querySelectorAll('#editQuizList .wm-check');
  const checked = document.querySelectorAll('#editQuizList .wm-check:checked');

  // Update selected IDs
  editSelectedIds.clear();
  checked.forEach(c => editSelectedIds.add(c.dataset.id));

  document.getElementById('editSelectAll').checked = checked.length === checks.length && checks.length > 0;
  updateEditSelectedCount();
}

function updateEditSelectedCount() {
  const count = editSelectedIds.size;
  const bar = document.getElementById('editBatchBar');
  document.getElementById('editSelectedCount').textContent = count > 0 ? count + ' selected' : '';
  bar.classList.toggle('visible', count > 0);

  // Dynamically update batch score buttons based on theme mastery
  const theme = themes.find(t => t.id === activeThemeId);
  const threshold = theme ? theme.masteryScore : 3;
  const scoreButtons = bar.querySelectorAll('[data-batch^="score-"]');
  scoreButtons.forEach(btn => {
    const val = parseInt(btn.dataset.batch.split('-')[1]);
    if (val >= threshold) {
      btn.dataset.batch = 'score-' + threshold;
      btn.textContent = 'Score ' + threshold;
    }
  });
}

document.getElementById('editSelectAll').addEventListener('change', (e) => {
  const checks = document.querySelectorAll('#editQuizList .wm-check');
  checks.forEach(c => {
    c.checked = e.target.checked;
    if (e.target.checked) editSelectedIds.add(c.dataset.id);
    else editSelectedIds.delete(c.dataset.id);
  });
  updateEditSelectedCount();
});

// Batch operations
document.querySelectorAll('[data-batch]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.batch;
    const theme = themes.find(t => t.id === activeThemeId);
    const threshold = theme ? theme.masteryScore : 3;
    const all = getThemeQuizzes(activeThemeId);
    const ids = [...editSelectedIds];

    if (ids.length === 0) return;

    ids.forEach(id => {
      const q = all.find(x => x.id === id);
      if (!q) return;
      switch (action) {
        case 'mark-done': q.score = threshold; break;
        case 'mark-undone': q.score = 0; break;
        case 'score-0': q.score = 0; break;
        case 'score-1': q.score = 1; break;
        case 'score-2': q.score = 2; break;
        case 'delete': break;
      }
    });

    if (action === 'delete') {
      if (!confirm(`Delete ${ids.length} quiz${ids.length !== 1 ? 'zes' : ''}?`)) return;
      quizzes[activeThemeId] = all.filter(q => !editSelectedIds.has(q.id));
      editSelectedIds.clear();
    }

    saveQuizzes();
    renderEditList();
  });
});

// Search
document.getElementById('editSearchInput').addEventListener('input', (e) => {
  editSearch = e.target.value;
  renderEditList();
});

// Filter
document.getElementById('editFilterBtn').addEventListener('click', () => {
  const popup = document.getElementById('editFilterPopup');
  const btn = document.getElementById('editFilterBtn');
  popup.classList.toggle('open');
  btn.classList.toggle('active');
});

document.querySelectorAll('input[name="editFilter"]').forEach(r => {
  r.addEventListener('change', () => {
    if (r.checked) {
      editFilter = r.value;
      document.getElementById('editFilterPopup').classList.remove('open');
      document.getElementById('editFilterBtn').classList.remove('active');
      renderEditList();
    }
  });
});

document.addEventListener('click', (e) => {
  const popup = document.getElementById('editFilterPopup');
  const btn = document.getElementById('editFilterBtn');
  if (!popup.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    popup.classList.remove('open');
    btn.classList.remove('active');
  }
});

// Navigation
document.getElementById('editBackBtn').addEventListener('click', () => {
  showQuizView();
});

// ══════════════════════════════════════════════════════════════════════
// IMPORT JSON
// ══════════════════════════════════════════════════════════════════════
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

  const existing = getThemeQuizzes(activeThemeId);
  let added = 0;
  let skipped = 0;

  arr.forEach(item => {
    if (!item.german || !item.english || !item.choices || !item.correct) return;

    // Duplicate check by german text
    const exists = existing.some(q => q.german === item.german);
    if (exists) { skipped++; return; }

    existing.push({
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + added,
      german: item.german,
      english: item.english,
      question: item.question || '',
      choices: item.choices,
      correct: item.correct,
      score: 0
    });
    added++;
  });

  quizzes[activeThemeId] = existing;
  saveQuizzes();

  let msgText = `✓ Added ${added} new quiz${added !== 1 ? 'zes' : ''}!`;
  if (skipped > 0) msgText += ` (${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped)`;
  showMsg(msg, msgText, 'success');
  document.getElementById('jsonInput').value = '';
  buildQuizPool();
  renderQuiz();
});

// Copy template
document.getElementById('btnCopyTemplate').addEventListener('click', () => {
  const template = `[
  {
    "german": "Ich gehe zur Schule",
    "english": "I go to school",
    "question": "What does this sentence mean?",
    "choices": [
      "I go to school",
      "I go to the hospital",
      "I go home",
      "I go to work"
    ],
    "correct": "I go to school"
  }
]`;
  navigator.clipboard.writeText(template).then(() => {
    const btn = document.getElementById('btnCopyTemplate');
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '📋'; }, 1500);
  }).catch(() => {
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

// Panel close
document.querySelectorAll('.panel').forEach(p => {
  p.addEventListener('click', (e) => {
    if (e.target === p) p.classList.remove('open');
  });
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.close;
    if (id) document.getElementById(id).classList.remove('open');
  });
});

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  if (e.key === 'Escape') {
    const filterPopup = document.getElementById('editFilterPopup');
    const importPanel = document.getElementById('panelImport');
    if (importPanel.classList.contains('open')) {
      importPanel.classList.remove('open');
    } else if (filterPopup.classList.contains('open')) {
      filterPopup.classList.remove('open');
      document.getElementById('editFilterBtn').classList.remove('active');
    } else if (document.getElementById('editView').classList.contains('active')) {
      showQuizView();
    } else if (document.getElementById('quizView').classList.contains('active')) {
      showThemeSelect();
    }
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────
loadThemes();
loadQuizzes();
renderThemeSelectList();

if (activeThemeId) {
  buildQuizPool();
  showQuizView();
}
