# Changelog

All notable changes to this project are logged here, newest first.

## 2026-07-21 (later)
- Added: Native Kotlin Android APK in `GermanApp/` — full-featured clone of the PWA
  - Hub screen with app launcher grid
  - Flashcards with Room-powered themes and spaced repetition
  - Verbs (Chronos) conjugation viewer for 30 verbs
  - QCM multiple-choice quiz with topic pools
  - Cases grammatical case quiz with 4 case types
  - Pre-seeded database with 220+ words, 30 verbs, 60+ quiz questions, 65+ case examples
  - Material Design 3 dark theme, ViewBinding, Navigation Component, LiveData + Coroutines

## 2026-07-21
- Fixed: `sessionStats` implicit global in flashcards app.js — now properly declared with `let` inside the IIFE
- Fixed: `DEFAULT_ARTICLES` placeholder `['A', 'B', 'C', 'D']` changed to real German articles `['der', 'die', 'das', 'den', 'dem']` in cases/script.js
- Fixed: Removed unused `config.js` import from verbs/index.html (app never referenced `CONFIG`)
- Removed: Dead files — `generate.py`, `codebase.txt`, `tree.txt`, `patchdocumentation.txt`, entire `TASKS/` directory with all AI-generated artifacts
- Removed: Dead shared files — `shared/css/base.css`, `shared/js/utils.js`, `shared/js/timer.js` (all unused; timer.js conflicted with flashcards globals)
- Refactored: Created `shared/js/utils.js` with extracted `shuffle()` and `showMsg()` — loaded in flashcards, QCM, and cases apps; removed duplicate definitions from each app's JS
- Updated: `.gitignore` — removed stale un-ignore rules for deleted files
- Updated: `README.md` — rewritten to reflect multi-app architecture
