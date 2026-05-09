# Deutsch Lernen — German Flashcards PWA

A German vocabulary flashcard app with a der/die/das gender quiz. Works fully offline and can be installed on your home screen.

## Files

```
index.html      ← the app
manifest.json   ← PWA manifest
sw.js           ← service worker (offline support)
icon-192.png    ← app icon
icon-512.png    ← app icon (large)
```

## Deploy to GitHub Pages (step by step)

1. Create a new GitHub repository (e.g. `deutsch-lernen`)
2. Push all 5 files to the `main` branch:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deutsch-lernen.git
git push -u origin main
```

3. Go to your repo → **Settings** → **Pages**
4. Under *Source*, select **Deploy from a branch** → `main` → `/ (root)`
5. Hit **Save** — GitHub will give you a URL like `https://your-username.github.io/deutsch-lernen`

## Add to Home Screen

**iPhone (Safari):**
1. Open the GitHub Pages URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen" or "Install App"

## Notes

- All progress is saved in your browser's `localStorage` — it persists across sessions
- The app works fully offline after the first load (service worker caches everything)
- Flashcard mastery and quiz mastery are tracked separately
