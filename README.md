<div align="center">

<br/>

```
██╗  ██╗██████╗     ████████╗██████╗  █████╗  ██████╗██╗  ██╗███████╗██████╗
██║  ██║╚════██╗    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████║ █████╔╝       ██║   ██████╔╝███████║██║     █████╔╝ █████╗  ██████╔╝
██╔══██║██╔═══╝        ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║  ██║███████╗       ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═╝  ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

<br/>

**Your body. Your data. Your device. No cloud. No compromise.**

<br/>

![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Offline](https://img.shields.io/badge/100%25-Offline-09090b?style=for-the-badge&logo=shield&logoColor=white)

<br/>

![Build APK](https://img.shields.io/github/actions/workflow/status/ovrrup/H2-Tracker/build-apk.yml?style=flat-square&label=Build%20APK&logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)
![Built by](https://img.shields.io/badge/built%20by-ovrrpo-9333ea?style=flat-square)

</div>

---

<br/>

## What is H2 Tracker?

H2 Tracker is a **fully offline, zero-network Android app** for tracking the things that actually matter — your habits, goals, sleep, water intake, workouts, and biometric stats. Everything is stored locally on your device using `localStorage` through Capacitor. No account needed. No server. No telemetry. Nothing leaves your phone.

Built with React 19 + Vite + Tailwind + Capacitor. Compiled to a native Android APK via GitHub Actions.

<br/>

---

## Feature Overview

<br/>

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🏠  DASHBOARD      ·  At-a-glance summary of all your metrics    │
│   ✅  HABITS         ·  Daily/weekly streaks with 7-day grid        │
│   🎯  GOALS          ·  Progress tracking with deadlines            │
│   ❤️  HEALTH         ·  Water · Sleep · Workouts · Biometrics       │
│   ⚙️  SETTINGS       ·  Notifications · Data wipe                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

<br/>

### 🏠 Dashboard
Central command. See your active habit streaks, today's water progress, last sleep session, recent workout, and health stats — all in one scrollable view.

### ✅ Habits Manager
Build streaks that stick. Create daily or weekly habits across **5 categories**: Fitness, Nutrition, Mind, Productivity, and Custom. A 7-day completion grid lets you see your momentum at a glance. Filter by category. Each habit tracks its own streak counter.

### 🎯 Goals Manager
Set measurable targets with deadlines. Track progress in any unit — kg, km, steps, hours, times. Switch between active and completed goals. Built-in progress bars and deadline countdowns.

### ❤️ Health Tracker
Four dedicated modules in one tab:

| Module | What you log |
|--------|-------------|
| 💧 Water Intake | Per-entry ml logging, daily goal, running total |
| 🌙 Sleep | Bed time, wake time, quality rating (1–5), notes |
| 🔥 Workouts | Type, duration, intensity, calories burned |
| 📊 Biometrics | Weight, blood pressure (systolic/diastolic), resting heart rate |

All four render recharts-powered charts for trend visualization.

### ⚙️ Settings
Toggle synth alarm chimes on/off. Wipe all local data with a double-confirm safety gate.

<br/>

---

## Privacy Model

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Your phone                                         │
│   ┌──────────────────────────────────────────────┐   │
│   │  H2 Tracker APK                              │   │
│   │  ┌────────────────────────────────────────┐  │   │
│   │  │  localStorage (Capacitor)              │  │   │
│   │  │  · android_habits                      │  │   │
│   │  │  · android_goals                       │  │   │
│   │  │  · android_water                       │  │   │
│   │  │  · android_sleep                       │  │   │
│   │  │  · android_workout                     │  │   │
│   │  │  · android_health_stats                │  │   │
│   │  └────────────────────────────────────────┘  │   │
│   └──────────────────────────────────────────────┘   │
│                                                      │
│              ✗  No internet calls                    │
│              ✗  No analytics                         │
│              ✗  No accounts                          │
│              ✗  No ads                               │
│              ✗  No AI services                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

<br/>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Animations | Motion (Framer) |
| Charts | Recharts |
| Icons | Lucide React |
| Native Bridge | Capacitor 8 |
| Bundler | Vite 6 |
| CI/CD | GitHub Actions |
| Target | Android APK |

<br/>

---

## Project Structure

```
H2-Tracker/
│
├── src/
│   ├── components/
│   │   ├── AndroidShell.tsx      ← Bottom nav, app chrome
│   │   ├── DashboardHome.tsx     ← Home overview tab
│   │   ├── HabitsManager.tsx     ← Habits tab
│   │   ├── GoalsManager.tsx      ← Goals tab
│   │   ├── HealthTracker.tsx     ← Health tab (water/sleep/workout/stats)
│   │   └── SettingsTab.tsx       ← Settings tab
│   ├── lib/
│   │   ├── storage.ts            ← All localStorage read/write helpers
│   │   └── haptic.ts             ← Capacitor haptic feedback wrapper
│   ├── App.tsx                   ← Root, state management, notification engine
│   ├── types.ts                  ← All TypeScript interfaces
│   ├── main.tsx                  ← Entry point
│   └── index.css                 ← Global styles
│
├── android-overrides/            ← Your custom native files (AndroidManifest etc.)
│   └── app/src/main/
│       └── AndroidManifest.xml
│
├── capacitor.config.ts           ← Capacitor config (appId, webDir)
├── vite.config.ts                ← Vite build config
├── package.json
├── .gitignore
└── .github/
    └── workflows/
        └── build-apk.yml         ← CI pipeline → produces APK artifact
```

<br/>

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Android Studio (for local builds only)

### Local development

```bash
# Clone
git clone https://github.com/ovrrup/H2-Tracker.git
cd H2-Tracker

# Install
npm install

# Run in browser
npm run dev
```

### Build APK locally

```bash
# Build web assets
npm run build

# Add Android platform (first time only)
npx cap add android --no-sync

# Sync web assets into Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

Then in Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

### Build APK via GitHub Actions

Every push to `main` or `master` triggers the CI pipeline automatically.

1. Go to **Actions** tab in your repo
2. Select **Build H2 Tracker APK**
3. Download the APK from the **Artifacts** section of the run

<br/>

---

## CI Pipeline

```
push to main
     │
     ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Setup      │────▶│  Build web   │────▶│  cap add     │
│  Node 22    │     │  npm run     │     │  android     │
│  Java 17    │     │  build       │     │  --no-sync   │
│  Android SDK│     │              │     │              │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                    ┌───────────────────────────▼───────────────────────────┐
                    │  Apply android-overrides/ (AndroidManifest, icons...) │
                    └───────────────────────────┬───────────────────────────┘
                                                │
                    ┌───────────────────────────▼───┐
                    │  cap sync android             │
                    └───────────────────────────┬───┘
                                                │
                    ┌───────────────────────────▼───┐
                    │  ./gradlew assembleDebug      │
                    └───────────────────────────┬───┘
                                                │
                    ┌───────────────────────────▼───┐
                    │  Upload APK artifact          │
                    │  H2-Tracker-debug-{run#}.apk  │
                    └───────────────────────────────┘
```

<br/>

---

## Android Permissions

Declared in `android-overrides/app/src/main/AndroidManifest.xml`:

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | Capacitor bridge (localhost WebView) |
| `WAKE_LOCK` | Keep device awake during scheduled alerts |
| `POST_NOTIFICATIONS` | Native push notifications |
| `RECEIVE_BOOT_COMPLETED` | Restore notification schedules after reboot |
| `SCHEDULE_EXACT_ALARM` | Precision habit reminder timing |
| `USE_EXACT_ALARM` | Android 13+ exact alarm access |

<br/>

---

## Releasing a Signed APK

To distribute outside GitHub or sideload without warnings, generate a keystore and enable the signed release block in the workflow.

```bash
# Generate keystore (run once, keep safe)
keytool -genkey -v -keystore h2tracker.jks \
  -alias h2tracker -keyalg RSA -keysize 2048 -validity 10000

# Base64-encode for GitHub Secrets
base64 -w 0 h2tracker.jks
```

Then add four secrets to your repo (**Settings → Secrets → Actions**):

| Secret | Value |
|--------|-------|
| `KEYSTORE_BASE64` | Output of the base64 command above |
| `KEY_ALIAS` | `h2tracker` |
| `KEY_PASSWORD` | Password you chose |
| `STORE_PASSWORD` | Password you chose |

Finally, uncomment the signed release block in `.github/workflows/build-apk.yml`.

<br/>

---

## Data Model

```
Habit          Goal           SleepLog         WorkoutLog
──────         ──────         ──────────        ──────────
id             id             id                id
name           title          date              date
frequency      targetValue    bedTime           type
category       currentValue   wakeTime          durationMinutes
createdAt      unit           qualityRating     intensity
completedDates category       actualHours       caloriesBurned
streak         deadline       notes             notes
reminderTime   isCompleted

DailyWaterLog           HealthStat
─────────────           ──────────
date                    id
entries[]               date
  └─ amountMl           weightKg
  └─ loggedAt           systolicBp
dailyGoalMl             diastolicBp
                        restingHeartRateBpm
                        notes
```

<br/>

---

<div align="center">

Built with intention by **ovrrpo**

*No cloud. No tracking. Just you.*

<br/>

![](https://img.shields.io/badge/made%20with-typescript-3178C6?style=flat-square)
![](https://img.shields.io/badge/runs%20on-android-3DDC84?style=flat-square)
![](https://img.shields.io/badge/data%20stays-on%20device-09090b?style=flat-square)

</div>
