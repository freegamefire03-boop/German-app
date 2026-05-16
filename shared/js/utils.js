function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg show ' + type;
  setTimeout(() => { el.classList.remove('show'); }, 3500);
}

function openPanel(id) {
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('open'));
  document.getElementById(id).classList.add('open');
}

function closePanel(id) {
  document.getElementById(id).classList.remove('open');
}

function emptyHtml(emoji, title, sub) {
  return `<div class="quiz-empty">
    <span class="emoji">${emoji}</span>
    <p>${title}<br><span style="font-weight:400;font-size:0.85em;opacity:0.7">${sub}</span></p>
  </div>`;
}
