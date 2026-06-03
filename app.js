// Register the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Request persistent storage (so OS won't clear the cache under pressure)
if ('storage' in navigator && navigator.storage.persist) {
  navigator.storage.persist().then(persistent => {
    if (persistent) {
      console.log('Storage will be persistent (not cleared by OS).');
    } else {
      console.warn('Storage persistence not granted.');
    }
  });
}