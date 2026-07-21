# Deutsch Lernen — German Learning App

A German vocabulary, verb conjugation, and grammar learning application. Available as both a **PWA** (web) and a **native Kotlin Android APK**.

## Status
Active development

## Features
- **Flashcards** — vocabulary deck with gender (der/die/das) and plural quizzes, spaced repetition, word management
- **Verbs (Chronos)** — verb conjugation practice with 30 essential verbs
- **QCM** — multiple-choice vocabulary quiz with topic-based pools
- **Cases** — sentence-level article selection for Nominativ, Akkusativ, Dativ, Genitiv

## Platforms

### PWA (Web)
```
index.html         ← hub / launcher
manifest.json      ← PWA manifest
sw.js              ← service worker (offline cache)
apps.json          ← sub-app registry
apps/              ← sub-applications (flashcards, verbs, QCM, cases)
shared/            ← shared config, utilities, word data
```

No build step. Serve with any HTTP server:

```bash
python -m http.server 8080
```

### Kotlin Android APK
```
GermanApp/         ← Android project root
  app/
    src/main/      ← Kotlin source, resources, manifest
    build.gradle.kts
  build.gradle.kts
  gradlew.bat
```

Build with:
```bash
cd GermanApp
gradlew.bat assembleDebug
```

APK output: `GermanApp/app/build/outputs/apk/debug/app-debug.apk`

## Tech Stack
- **PWA:** Vanilla HTML / CSS / JavaScript, Service Worker, localStorage
- **Android:** Kotlin, Room database, Navigation Component, Material Design 3, ViewBinding, LiveData, Coroutines, kapt

## Data
- Pre-seeded with 220+ vocabulary words across 18 themes
- 30 German verbs with full present tense conjugations
- 60+ quiz questions across 8 topic pools
- 65+ case examples covering all 4 grammatical cases
- All data stored locally (no network required)

## Project Structure
```
/
├── index.html           ← PWA entry point
├── manifest.json
├── sw.js
├── apps/                ← PWA sub-applications
├── shared/              ← PWA shared code
├── GermanApp/           ← Kotlin Android project
│   ├── gradlew.bat
│   ├── app/
│   │   └── src/main/java/com/germanapp/
│   │       ├── data/    ← Room DB, DAOs, models, seed data
│   │       ├── ui/      ← Hub, Flashcards, Verbs, QCM, Cases
│   │       └── util/
│   └── build.gradle.kts
└── README.md
```
