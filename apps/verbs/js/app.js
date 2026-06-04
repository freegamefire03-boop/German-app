const LS_THEMES = 'chronos_themes';
const LS_PHRASES_PREFIX = 'chronos_phrases_';
const LS_MASTERED_PREFIX = 'chronos_mastered_';

let themes = [];
let activeThemeId = null;
let phrases = [];
let mastered = new Set();
let checked = false;
let currentPhraseIndex = -1;
let editingThemeId = null;

function loadThemes() {
    try { const t = localStorage.getItem(LS_THEMES); if (t) themes = JSON.parse(t); } catch (e) { themes = []; }
}
function saveThemes() { localStorage.setItem(LS_THEMES, JSON.stringify(themes)); }
function createTheme(name) {
    const theme = { id: 'theme_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), name: name.trim(), createdAt: Date.now() };
    themes.push(theme); saveThemes(); return theme;
}
function renameTheme(id, newName) { const t = themes.find(t => t.id === id); if (t) { t.name = newName.trim(); saveThemes(); } }
function deleteTheme(id) {
    themes = themes.filter(t => t.id !== id); saveThemes();
    localStorage.removeItem(LS_PHRASES_PREFIX + id); localStorage.removeItem(LS_MASTERED_PREFIX + id);
}
function getTheme(id) { return themes.find(t => t.id === id); }

function loadPhrases(themeId) { try { const p = localStorage.getItem(LS_PHRASES_PREFIX + themeId); phrases = p ? JSON.parse(p) : []; } catch (e) { phrases = []; } }
function savePhrases(themeId) { localStorage.setItem(LS_PHRASES_PREFIX + themeId, JSON.stringify(phrases)); }
function loadMastered(themeId) { try { const m = localStorage.getItem(LS_MASTERED_PREFIX + themeId); mastered = m ? new Set(JSON.parse(m)) : new Set(); } catch (e) { mastered = new Set(); } }
function saveMastered(themeId) { localStorage.setItem(LS_MASTERED_PREFIX + themeId, JSON.stringify([...mastered])); }

function getUnmastered() { return phrases.map((p, i) => ({ ...p, originalIndex: i })).filter(p => !mastered.has(p.originalIndex)); }
function getRandomUnmastered() { const u = getUnmastered(); if (u.length === 0) return null; return u[Math.floor(Math.random() * u.length)]; }

function showView(viewId) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(viewId).classList.add('active'); }

function renderThemesList() {
    const list = document.getElementById('themesList');
    const empty = document.getElementById('themesEmpty');
    if (themes.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    const colors = ['#A78BFA', '#FF6B35', '#00E5C3', '#FB7185', '#FBBF24', '#38bdf8'];
    list.innerHTML = themes.map(theme => {
        const savedP = localStorage.getItem(LS_PHRASES_PREFIX + theme.id);
        const savedM = localStorage.getItem(LS_MASTERED_PREFIX + theme.id);
        const total = savedP ? JSON.parse(savedP).length : 0;
        const done = savedM ? JSON.parse(savedM).length : 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const color = colors[theme.id.charCodeAt(theme.id.length - 1) % colors.length];
        return `<div class="theme-card" data-id="${theme.id}"><div class="theme-card-left"><div class="theme-card-icon">${total > 0 && done === total ? '🏆' : '📁'}</div><div class="theme-card-info"><div class="theme-card-name">${theme.name}</div><div class="theme-card-meta">${done}/${total} mastered · ${pct}%</div></div></div><div class="theme-card-actions"><button class="theme-card-btn rename-btn" data-id="${theme.id}" title="Rename">✏️</button><button class="theme-card-btn delete-btn" data-id="${theme.id}" title="Delete">🗑️</button></div></div>`;
    }).join('');
    list.querySelectorAll('.theme-card-left').forEach(el => { el.addEventListener('click', () => openTheme(el.closest('.theme-card').dataset.id)); });
    list.querySelectorAll('.rename-btn').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); startRename(el.dataset.id); }); });
    list.querySelectorAll('.delete-btn').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); confirmDelete(el.dataset.id); }); });
}

function renderQuizStats() {
    const total = phrases.length, done = mastered.size, left = total - done;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statMastered').textContent = done;
    document.getElementById('statRemaining').textContent = left;
    document.getElementById('progressFill').style.width = (total > 0 ? (done / total) * 100 : 0) + '%';
}

function openTheme(themeId) {
    activeThemeId = themeId;
    const theme = getTheme(themeId); if (!theme) return;
    loadPhrases(themeId); loadMastered(themeId);
    document.getElementById('quizThemeName').textContent = theme.name;
    renderQuizStats();
    document.getElementById('quizEmpty').style.display = 'none';
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizAllDone').style.display = 'none';
    if (phrases.length === 0) { document.getElementById('quizEmpty').style.display = 'flex'; }
    else { const next = getRandomUnmastered(); if (!next) { document.getElementById('quizAllDone').style.display = 'flex'; } else { document.getElementById('quizContent').style.display = 'block'; loadPhrase(next); } }
    showView('viewQuiz');
}

function loadPhrase(phraseData) {
    checked = false; currentPhraseIndex = phraseData.originalIndex;
    const answerArea = document.querySelector('.answer-area');
    if (!document.getElementById('answerInput')) { answerArea.innerHTML = '<input type="text" id="answerInput" class="answer-input" placeholder="Type your answer..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />'; }
    document.getElementById('phraseVerb').textContent = phraseData.verb;
    document.getElementById('phraseNumber').textContent = `${mastered.size + 1} / ${phrases.length}`;
    document.getElementById('phraseText').textContent = phraseData.phrase;
    document.getElementById('phraseEnglish').textContent = phraseData.english || '';
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').disabled = false;
    document.getElementById('answerInput').focus();
    document.getElementById('btnCheck').disabled = false;
    document.getElementById('btnNext').disabled = true;
    document.getElementById('msgArea').textContent = '';
    document.getElementById('msgArea').className = 'msg-area';
}

function checkAnswer() {
    if (checked) return;
    const input = document.getElementById('answerInput');
    const val = input.value.trim(); if (!val) return;
    checked = true;
    const phrase = phrases[currentPhraseIndex], correct = phrase.answer;
    const msg = document.getElementById('msgArea');
    if (val.toLowerCase() === correct.toLowerCase()) {
        msg.textContent = `✓ Correct! "${phrase.phrase.replace('___', correct)}"`;
        msg.className = 'msg-area success';
        if (!mastered.has(currentPhraseIndex)) { mastered.add(currentPhraseIndex); saveMastered(activeThemeId); }
        input.disabled = true;
    } else {
        const answerArea = document.querySelector('.answer-area');
        answerArea.innerHTML = `<div class="answer-wrong">${correct}</div>`;
    }
    document.getElementById('btnCheck').disabled = true;
    document.getElementById('btnNext').disabled = false;
    renderQuizStats();
}

function nextPhrase() {
    const next = getRandomUnmastered();
    if (!next) { document.getElementById('quizContent').style.display = 'none'; document.getElementById('quizAllDone').style.display = 'flex'; return; }
    loadPhrase(next);
}

function showCreateModal() {
    editingThemeId = null;
    document.getElementById('themeModalTitle').textContent = 'New Theme';
    document.getElementById('themeNameInput').value = '';
    document.getElementById('themeModalSave').textContent = 'Create';
    document.getElementById('themeModalOverlay').classList.add('open');
    document.getElementById('themeNameInput').focus();
}
function startRename(themeId) {
    const theme = getTheme(themeId); if (!theme) return;
    editingThemeId = themeId;
    document.getElementById('themeModalTitle').textContent = 'Rename Theme';
    document.getElementById('themeNameInput').value = theme.name;
    document.getElementById('themeModalSave').textContent = 'Rename';
    document.getElementById('themeModalOverlay').classList.add('open');
    document.getElementById('themeNameInput').focus(); document.getElementById('themeNameInput').select();
}
function saveThemeName() {
    const name = document.getElementById('themeNameInput').value.trim(); if (!name) return;
    if (editingThemeId) { renameTheme(editingThemeId, name); } else { createTheme(name); }
    document.getElementById('themeModalOverlay').classList.remove('open'); renderThemesList();
}

let deleteTargetId = null;
function confirmDelete(themeId) {
    const theme = getTheme(themeId); if (!theme) return;
    deleteTargetId = themeId;
    document.getElementById('deleteModalBody').textContent = `Delete "${theme.name}" and all its phrases? This cannot be undone.`;
    document.getElementById('deleteModalOverlay').classList.add('open');
}
function doDelete() {
    if (!deleteTargetId) return; deleteTheme(deleteTargetId); deleteTargetId = null;
    document.getElementById('deleteModalOverlay').classList.remove('open'); renderThemesList();
}

function showAddModal() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonStatus').textContent = '';
    document.getElementById('jsonStatus').className = 'json-status';
    document.getElementById('addModalOverlay').classList.add('open');
    document.getElementById('jsonInput').focus();
}
function hideAddModal() { document.getElementById('addModalOverlay').classList.remove('open'); }
function savePhrasesFromJSON() {
    const raw = document.getElementById('jsonInput').value.trim();
    const status = document.getElementById('jsonStatus');
    if (!raw) { status.textContent = 'Please paste some JSON data.'; status.className = 'json-status error'; return; }
    let data; try { data = JSON.parse(raw); } catch (e) { status.textContent = 'Invalid JSON: ' + e.message; status.className = 'json-status error'; return; }
    if (!Array.isArray(data)) { status.textContent = 'JSON must be an array.'; status.className = 'json-status error'; return; }
    const valid = [], errors = [];
    data.forEach((item, i) => {
        if (!item.verb || typeof item.verb !== 'string' || !item.verb.trim()) { errors.push(`#${i + 1}: missing "verb"`); return; }
        if (!item.phrase || typeof item.phrase !== 'string') { errors.push(`#${i + 1}: missing "phrase"`); return; }
        if (!item.answer || typeof item.answer !== 'string') { errors.push(`#${i + 1}: missing "answer"`); return; }
        if (!item.english || typeof item.english !== 'string') { errors.push(`#${i + 1}: missing "english"`); return; }
        if (!item.phrase.includes('___')) { errors.push(`#${i + 1}: "phrase" needs ___`); return; }
        valid.push({ verb: item.verb.trim(), phrase: item.phrase.trim(), answer: item.answer.trim(), english: item.english.trim() });
    });
    if (errors.length > 0) { status.textContent = errors.join('; '); status.className = 'json-status error'; return; }
    if (valid.length === 0) { status.textContent = 'No valid phrases.'; status.className = 'json-status error'; return; }
    phrases = phrases.concat(valid); savePhrases(activeThemeId); renderQuizStats();
    status.textContent = `✓ Added ${valid.length} phrase(s). Total: ${phrases.length}`;
    status.className = 'json-status success';
    setTimeout(() => {
        hideAddModal();
        if (document.getElementById('quizContent').style.display === 'none' && document.getElementById('quizAllDone').style.display === 'none') {
            const next = getRandomUnmastered();
            if (next) { document.getElementById('quizEmpty').style.display = 'none'; document.getElementById('quizContent').style.display = 'block'; loadPhrase(next); }
        }
    }, 1000);
}

function showProgressModal() {
    const masteredList = [...mastered].map(i => phrases[i] ? `<strong>${phrases[i].verb}</strong> ${phrases[i].phrase.replace('___', '→ ' + phrases[i].answer)}` : '').filter(Boolean).join('<br>') || 'none yet';
    document.getElementById('modalBody').innerHTML = `<strong>${mastered.size}/${phrases.length} mastered</strong><br><span style="font-size:0.8rem;color:var(--text-dim);line-height:1.8;display:block;margin-top:6px">${masteredList}</span>`;
    document.getElementById('progressModalOverlay').classList.add('open');
}

let manageSelected = new Set();
function openManageView() { manageSelected.clear(); renderManageList(); showView('viewManage'); }
function renderManageList() {
    const list = document.getElementById('manageList'), empty = document.getElementById('manageEmpty');
    if (phrases.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    list.innerHTML = phrases.map((p, i) => {
        const isDone = mastered.has(i), isSelected = manageSelected.has(i);
        return `<div class="manage-item${isSelected ? ' selected' : ''}" data-index="${i}"><div class="manage-checkbox">${isSelected ? '✓' : ''}</div><div class="manage-item-info"><div class="manage-item-verb">${p.verb}</div><div class="manage-item-phrase">${p.phrase.replace('___', '…')}</div><div class="manage-item-english">${p.english || ''}</div></div><div class="manage-item-status ${isDone ? 'done' : 'todo'}">${isDone ? 'Done' : 'Todo'}</div></div>`;
    }).join('');
    list.querySelectorAll('.manage-item').forEach(el => { el.addEventListener('click', () => { const idx = parseInt(el.dataset.index); if (manageSelected.has(idx)) manageSelected.delete(idx); else manageSelected.add(idx); renderManageList(); }); });
}
function manageSelectAll() { if (manageSelected.size === phrases.length) { manageSelected.clear(); } else { phrases.forEach((_, i) => manageSelected.add(i)); } renderManageList(); }
function manageMarkDone() { manageSelected.forEach(i => mastered.add(i)); saveMastered(activeThemeId); renderManageList(); renderQuizStats(); }
function manageMarkUndone() { manageSelected.forEach(i => mastered.delete(i)); saveMastered(activeThemeId); renderManageList(); renderQuizStats(); }
let manageDeleteTarget = [];
function manageConfirmDelete() { manageDeleteTarget = [...manageSelected]; document.getElementById('deletePhrasesModalBody').textContent = `Delete ${manageDeleteTarget.length} phrase(s)? This cannot be undone.`; document.getElementById('deletePhrasesModalOverlay').classList.add('open'); }
function manageDoDelete() {
    const sortedTargets = [...manageDeleteTarget].sort((a, b) => b - a);
    sortedTargets.forEach(i => { phrases.splice(i, 1); });

    // Remap mastered indices: for each deleted index below a mastered index, decrement it
    const newMastered = new Set();
    mastered.forEach(i => {
        const deletedBelow = sortedTargets.filter(d => d < i).length;
        const newIdx = i - deletedBelow;
        if (newIdx >= 0 && newIdx < phrases.length) newMastered.add(newIdx);
    });
    mastered = newMastered;
    savePhrases(activeThemeId); saveMastered(activeThemeId); manageSelected.clear(); manageDeleteTarget = [];
    document.getElementById('deletePhrasesModalOverlay').classList.remove('open'); renderManageList(); renderQuizStats();
}

// Event listeners
document.getElementById('btnCreateTheme').addEventListener('click', showCreateModal);
document.getElementById('themeModalCancel').addEventListener('click', () => { document.getElementById('themeModalOverlay').classList.remove('open'); });
document.getElementById('themeModalSave').addEventListener('click', saveThemeName);
document.getElementById('themeNameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveThemeName(); });
document.getElementById('deleteModalCancel').addEventListener('click', () => { document.getElementById('deleteModalOverlay').classList.remove('open'); deleteTargetId = null; });
document.getElementById('deleteModalConfirm').addEventListener('click', doDelete);
document.getElementById('btnHome').addEventListener('click', () => { showView('viewThemes'); renderThemesList(); });
document.getElementById('btnCheck').addEventListener('click', checkAnswer);
document.getElementById('btnNext').addEventListener('click', nextPhrase);
document.getElementById('btnAddPhrases').addEventListener('click', showAddModal);
document.getElementById('btnManage').addEventListener('click', openManageView);
document.getElementById('addModalCancel').addEventListener('click', hideAddModal);
document.getElementById('addModalSave').addEventListener('click', savePhrasesFromJSON);
document.getElementById('addModalCopy').addEventListener('click', () => {
    const template = JSON.stringify([{ "verb": "gehen", "phrase": "Ich ___ nach Hause", "answer": "gehe", "english": "I go home" }, { "verb": "lesen", "phrase": "Er ___ ein Buch", "answer": "liest", "english": "He reads a book" }], null, 2);
    navigator.clipboard.writeText(template).then(() => { const btn = document.getElementById('addModalCopy'); btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Format'; }, 1500); });
});
document.getElementById('btnProgress').addEventListener('click', showProgressModal);
document.getElementById('modalClose').addEventListener('click', () => { document.getElementById('progressModalOverlay').classList.remove('open'); });
document.getElementById('modalReset').addEventListener('click', () => {
    if (confirm('Reset all progress in this theme?')) {
        mastered.clear(); saveMastered(activeThemeId); renderQuizStats();
        document.getElementById('progressModalOverlay').classList.remove('open');
        const next = getRandomUnmastered();
        if (next) { document.getElementById('quizAllDone').style.display = 'none'; document.getElementById('quizContent').style.display = 'block'; loadPhrase(next); }
        else if (phrases.length > 0) { document.getElementById('quizContent').style.display = 'none'; document.getElementById('quizAllDone').style.display = 'flex'; }
    }
});
document.getElementById('btnManageBack').addEventListener('click', () => {
    showView('viewQuiz'); loadPhrases(activeThemeId); loadMastered(activeThemeId); renderQuizStats();
    const next = getRandomUnmastered();
    if (next) { document.getElementById('quizEmpty').style.display = 'none'; document.getElementById('quizAllDone').style.display = 'none'; document.getElementById('quizContent').style.display = 'block'; loadPhrase(next); }
    else if (phrases.length > 0) { document.getElementById('quizContent').style.display = 'none'; document.getElementById('quizEmpty').style.display = 'none'; document.getElementById('quizAllDone').style.display = 'flex'; }
    else { document.getElementById('quizContent').style.display = 'none'; document.getElementById('quizAllDone').style.display = 'none'; document.getElementById('quizEmpty').style.display = 'flex'; }
});
document.getElementById('btnSelectAll').addEventListener('click', manageSelectAll);
document.getElementById('btnMarkDone').addEventListener('click', manageMarkDone);
document.getElementById('btnMarkUndone').addEventListener('click', manageMarkUndone);
document.getElementById('btnDeleteSelected').addEventListener('click', manageConfirmDelete);
document.getElementById('deletePhrasesCancel').addEventListener('click', () => { document.getElementById('deletePhrasesModalOverlay').classList.remove('open'); });
document.getElementById('deletePhrasesConfirm').addEventListener('click', manageDoDelete);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const quiz = document.getElementById('viewQuiz'); if (quiz.classList.contains('active')) { if (!checked && !document.getElementById('btnCheck').disabled) { checkAnswer(); } else if (!document.getElementById('btnNext').disabled) { nextPhrase(); } } }
});
['themeModalOverlay', 'addModalOverlay', 'progressModalOverlay', 'deleteModalOverlay', 'deletePhrasesModalOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });
});

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) { const p = document.createElement('div'); p.className = 'particle'; p.style.left = Math.random() * 100 + '%'; p.style.animationDuration = (8 + Math.random() * 12) + 's'; p.style.animationDelay = (Math.random() * 10) + 's'; p.style.width = p.style.height = (2 + Math.random() * 3) + 'px'; container.appendChild(p); }
}
loadThemes(); createParticles(); renderThemesList();
