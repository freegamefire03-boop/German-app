// ═══════════════════════════════════════════════════════════════
//  LANDING PAGE — THEME LIST & CREATOR
// ═══════════════════════════════════════════════════════════════

async function loadThemeList() {
  try {
    const res = await fetch('data/themes.json');
    const data = await res.json();
    return data.themes || [];
  } catch {
    return [];
  }
}

function getSavedThemes() {
  try {
    return JSON.parse(localStorage.getItem('quizThemes') || '[]');
  } catch {
    return [];
  }
}

function saveThemes(themes) {
  localStorage.setItem('quizThemes', JSON.stringify(themes));
}

function getAllThemes() {
  const staticThemes = window.__staticThemes || [];
  const saved = getSavedThemes();
  const merged = [...staticThemes];
  saved.forEach(st => {
    const idx = merged.findIndex(m => m.id === st.id);
    if (idx >= 0) merged[idx] = st;
    else merged.push(st);
  });
  return merged;
}

function renderThemes() {
  const themes = getAllThemes();
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = '';

  if (themes.length === 0) {
    grid.innerHTML = '<div class="empty-state">No themes yet. Create one to get started!</div>';
    return;
  }

  themes.forEach(t => {
    const card = document.createElement('a');
    card.className = 'theme-card';
    card.href = 'quiz.html?theme=' + encodeURIComponent(t.id);
    const cardsCount = (t.cards || []).length || t.totalCards || 0;
    card.innerHTML =
      '<div class="theme-icon">' + (t.icon || '\uD83D\uDCD6') + '</div>' +
      '<div class="theme-info">' +
        '<div class="theme-name">' + escHtml(t.name || 'Untitled') + '</div>' +
        '<div class="theme-desc">' + escHtml(truncate(t.description || '', 80)) + '</div>' +
      '</div>' +
      '<div class="theme-meta">' + cardsCount + ' card' + (cardsCount !== 1 ? 's' : '') + '</div>';
    grid.appendChild(card);
  });
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function truncate(s, max) {
  return s.length > max ? s.slice(0, max) + '\u2026' : s;
}

function openCreateModal() {
  document.getElementById('createModal').classList.add('vis');
  document.getElementById('createModalOverlay').classList.add('vis');
}

function closeCreateModal() {
  document.getElementById('createModal').classList.remove('vis');
  document.getElementById('createModalOverlay').classList.remove('vis');
  document.getElementById('createForm').reset();
  document.getElementById('createError').textContent = '';
}

function createTheme(e) {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const desc = document.getElementById('newDesc').value.trim();
  const icon = document.getElementById('newIcon').value.trim() || '\uD83D\uDCD6';
  const articlesRaw = document.getElementById('newArticles').value.trim();

  if (!name) {
    document.getElementById('createError').textContent = 'Theme name is required.';
    return;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
  const articles = articlesRaw
    ? articlesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const saved = getSavedThemes();
  saved.push({
    id: id,
    name: name,
    description: desc || '',
    icon: icon,
    articles: articles,
    totalCards: 0,
    masteryPoints: 2,
    cards: []
  });
  saveThemes(saved);
  renderThemes();
  closeCreateModal();
}

document.addEventListener('DOMContentLoaded', async () => {
  window.__staticThemes = await loadThemeList();
  renderThemes();

  document.getElementById('createBtn').addEventListener('click', openCreateModal);
  document.getElementById('createModalOverlay').addEventListener('click', closeCreateModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeCreateModal);
  document.getElementById('createForm').addEventListener('submit', createTheme);
});
