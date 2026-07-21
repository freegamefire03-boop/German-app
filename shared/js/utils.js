function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg show ' + type;
  setTimeout(() => { el.classList.remove('show'); }, 3500);
}
