# milkedIn — Frontend
> **Brand:** `milkedIn` (lowercase **m**, capital **I**) — formerly "Milk Logs". Codebase folders remain `milk_logs_frontend/` / `milk_logs_backend/` for history; all product references are now **milkedIn**.

A cross-platform **React Native (Expo)** app for **milkedIn** — tracking daily milk consumption and spending. Built with **Expo Router** (file-based navigation), **TypeScript**, and a clean, layered architecture, `milkedIn` connects to the [`milkedIn backend`](../milk_logs_backend) (`milk_logs_backend/` folder) REST API to let users log milk by category, review daily/monthly summaries, visualize trends, and export their data as PDF or Excel.

> Works on **Android, iOS, and Web** from a single codebase.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Navigation & Screens](#navigation--screens)
- [State & Authentication](#state--authentication)
- [API Client](#api-client)
- [AI Assistant](#ai-assistant)
- [Theming & Design System](#theming--design-system)
- [Exporting Data](#exporting-data)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Build & Deploy](#build--deploy)
- [Scripts](#scripts)

---

## Features

- **Authentication** — register, login, logout, forgot/reset password (OTP emailed from the backend), and profile editing. Sessions persist securely across app launches.
- **Today view** — log a milk entry for the day, see a live breakdown by category, and view daily totals.
- **History** — browse past entries by date with a calendar, edit or delete any record.
- **Insights** — daily/monthly aggregated summaries with bar charts and stat tiles.
- **Milk & Price** — manage your milk **categories** (types) and their per-litre prices.
- **MilkEdin AI** — natural-language assistant (Gemini via backend) for questions like "How much did I spend last month?" in a chat tab with suggestions, tool-grounded answers, and retry.
- **Export** — download a PDF or Excel report for any month or year, shared via the OS share sheet (or browser download on web).
- **Resilient networking** — automatic JWT access-token refresh, short-lived GET cache, and friendly error messages.
- **Polished UI** — warm white-first design system, large touch targets, soft layered shadows, and animations.

---

## Tech Stack

| Concern            | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Framework          | Expo SDK 57 (`expo` ~57.0.12)                           |
| Runtime / Language | React 19 + TypeScript (`strict`)                        |
| Navigation         | `expo-router` (file-based, typed routes)                |
| Auth storage       | `expo-secure-store` (native) / `localStorage` (web)     |
| Charts / analytics | Custom `BarChart` component (no external chart dep)      |
| Export (client)    | `jspdf`, `xlsx`                                         |
| Animations         | `react-native-reanimated` + `react-native-worklets`      |
| Gestures / UI      | `react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context` |
| Icons              | `@expo/vector-icons` (Ionicons)                          |

---

## Architecture

The app follows a **layered, feature-aligned** structure that mirrors the backend:

```
Screen (src/app) → Hooks → Services (API) → HTTP Client → Backend
                      ↘ UI Components / Theme
```

- **`src/app`** — file-based routes (Expo Router). Parenthesis groups `(auth)` and `(tabs)` are **route groups** that don't affect the URL but let us apply shared layouts (auth stack vs. tab stack). Route-based **guards** (`Stack.Protected`) show the tabs only when authenticated, and the auth screens otherwise.
- **`src/services/api`** — typed wrappers per backend domain (`auth`, `categories`, `milk`, `export`) built on a single shared `client`.
- **`src/auth`** — `AuthContext` (current user + tokens, session restore) and `storage` (secure persistence).
- **`src/hooks`** — reusable data-fetching (`useApiData`) and lifecycle (`useRefreshOnFocus`) hooks.
- **`src/components`** — presentational building blocks grouped by domain (`ui`, `milk`, `calendar`, `analytics`, `export`, `navigation`).
- **`src/theme`** — centralized design tokens (colors, spacing, radii, typography, shadows) and the navigation theme.
- **`src/utils`** — pure helpers (`date`, `format`, `validation`, `records`, `analytics`, `exporters`).
- **`src/types`** — TypeScript contracts mirroring the backend API (`api.ts`, `index.ts`).
- **`src/constants`** — app-wide constants (e.g. `API_PORT`).

### Data flow

1. A screen calls a typed service function (e.g. `milk.getRecords()`).
2. The service delegates to the shared `client.request()`, which resolves the base URL, attaches the Bearer token, and (on `401`) transparently refreshes the access token once and retries.
3. The client unwraps the backend's `{ success, message, data }` envelope and returns `data` typed as `T`.
4. Screens consume results through `useApiData`, which exposes `{ data, loading, error, refetch }` with friendly error strings and refetch-on-focus.

---

## Project Structure

```
milkedIn-frontend/  (repo folder: milk_logs_frontend/ — kept for history)
├── app.json                     # Expo config (name: milkedIn, scheme: milkdin, plugins, web output)
├── package.json
├── tsconfig.json                # Path alias: @/* → src/*
├── .env.example                 # EXPO_PUBLIC_API_URL
├── src/
│   ├── app/                     # Expo Router screens
│   │   ├── _layout.tsx          # Root: AuthProvider + guarded stacks
│   │   ├── (auth)/              # login, register, forgot-password, reset-password
│   │   ├── (tabs)/              # Today, History, Insights, AI, Milk & Price
│   │   ├── add-milk.tsx         # Create a record
│   │   ├── edit-milk/[id].tsx   # Edit a record
│   │   └── update-profile.tsx   # Edit profile
│   ├── auth/
│   │   ├── AuthContext.tsx      # Session state + token refresh wiring
│   │   └── storage.ts           # SecureStore / localStorage persistence
│   ├── services/api/
│   │   ├── client.ts            # HTTP client, refresh, cache, ApiError
│   │   ├── auth.ts  categories.ts  milk.ts  export.ts  ai.ts
│   ├── hooks/
│   │   ├── useApiData.ts        # data/loading/error/refetch
│   │   └── useRefreshOnFocus.ts
│   ├── components/
│   │   ├── ui/                  # Button, Card, Field, Banner, Screen, …
│   │   ├── milk/                # MilkForm, HistoryItem, SummaryCard, …
│   │   ├── calendar/  analytics/  export/  navigation/
│   ├── theme/                   # index.ts (tokens) + navigation.ts
│   ├── types/                   # api.ts + index.ts
│   ├── utils/                   # date, format, validation, records, analytics, exporters
│   └── constants/api.ts
└── assets/                      # icons, splash, images
```

---

## Navigation & Screens

Routing is **file-based** via Expo Router. The root layout (`src/app/_layout.tsx`) wraps everything in `AuthProvider` and splits the tree with `Stack.Protected` guards:

- **Authenticated** (`guard={!!user}`):
  - `(tabs)` bottom tab bar (5 tabs):
    - **Today** (`index`) — add/log today's milk, live category breakdown, daily totals.
    - **History** (`history`) — calendar + list of past entries; tap to edit/delete.
    - **Insights** (`insights`) — daily/monthly summaries with charts.
    - **AI** (`ai`, `sparkles-outline`) — MilkEdin AI chat (see AI Assistant below).
    - **Milk & Price** (`settings`) — manage categories and prices.
  - Stack screens: `add-milk`, `edit-milk/[id]`, `update-profile`.
- **Unauthenticated** (`guard={!user}`):
  - `(auth)` stack: `login`, `register`, `forgot-password`, `reset-password`.

The splash screen stays visible until a persisted session is restored, so returning users never see a login flash.

---

## State & Authentication

`AuthContext` (`src/auth/AuthContext.tsx`) is the single source of truth for the session:

- On launch it restores `{ user, accessToken, refreshToken }` from secure storage (`storage.ts`).
- `signIn` / `registerAndSignIn` / `updateProfile` / `signOut` mutate state and persist it.
- It wires the HTTP client via `configureAuthClient({ getAccessToken, refreshAccessToken, onUnauthorized })`:
  - `getAccessToken` supplies the current Bearer token.
  - `refreshAccessToken` calls `/api/auth/refresh-token` with the stored refresh token, then saves the new access token. On failure it clears the session and signs the user out.
  - `onUnauthorized` force-signs-out on an unrecoverable `401`.

Tokens are stored with `expo-secure-store` on native and `localStorage` on web (with safe try/catch fallbacks). **No secrets live in source code.**

---

## API Client

`src/services/api/client.ts` is a thin, dependency-free `fetch` wrapper:

- **Base URL resolution** — `EXPO_PUBLIC_API_URL` → Expo dev-server LAN host on `API_PORT` (4000) → `localhost:4000`.
- **Auth** — attaches `Authorization: Bearer <token>` and retries once after a transparent refresh.
- **GET cache** — in-memory cache (60s TTL) keyed by URL + token; any mutation invalidates it. Aligns with `useRefreshOnFocus` so data is fresh after add/edit.
- **Error model** — a single `ApiError` class with `kind` (`network` | `http` | `unknown`) and a **user-friendly** message (e.g. network down, session ended, server error). It best-effort extracts messages from Express HTML error pages.
- **Binary** — `requestBlob()` fetches exports (PDF/XLSX) as bytes with the same auth/refresh handling.

Service modules map 1:1 to backend endpoints (see `auth.ts`, `milk.ts`, `categories.ts`, `export.ts`, `ai.ts`).

---

## AI Assistant

**MilkEdin AI** — a first-class chat tab grounded in your private milk data.

- **Tab:** `AI` (`src/app/(tabs)/ai.tsx`, `sparkles-outline`, 4th position: Today → History → Insights → **AI** → Milk & Price). Authenticated-only via existing `Stack.Protected guard={!!user}`.
- **Backend:** `POST /api/ai/chat` with `{ message: string (1–1000 chars) }` → `{ answer: string, tools_used?: string[] }`. Frontend only sends `message`; `userId` is injected server-side. Gemini is never called from the frontend — no `EXPO_PUBLIC_GEMINI_API_KEY` exists.
- **Service:** `src/services/api/ai.ts` `sendAIMessage(message)` → `request<AIChatResponse>('/api/ai/chat', {method:'POST', body:{message}})` reusing the shared `client.ts` (Bearer token + refresh preserved). Types `AIChatRequest`/`AIChatResponse` in `src/types/api.ts`.
- **UI:** `Screen` `scroll={false}` (KeyboardAvoidingView inside) + `FlatList` conversation, user (primary) / assistant (surface) bubbles with `FadeInView`, typing indicator (`AI is thinking…` + ActivityIndicator), empty state (`sparkles`, subtitle, 6 suggestion chips), compact chip strip above composer once chat starts, composer (`TextInput` multiline + circular `arrow-up` send, 56pt touch target, Enter-to-send on web, disabled while `sending` or empty/whitespace, single pending request guard), error bubble with `Try again` retry.
- **UX:** Suggestions (`How much did I spend last month?`, `Which milk do I consume the most?`, `Am I spending more than usual?`, `What was my most expensive month?`, `How much milk did I consume this month?`, `Show me my milk spending trend.`) send immediately on tap. No persistence (session memory only), no `useApiData` forced into chat, no tool internals exposed, no HTML/markdown parsing — answer rendered as `Text`.
- **a11y & responsive:** Labels (`Ask MilkEdin AI`, `Send message`, `Retry message`, `Ask: …`), roles, contrast via theme tokens, Android/iOS/Web tested, keyboard stays above composer via `Screen`'s `KeyboardAvoidingView`, scrollable list.

## Theming & Design System

All visual decisions live in `src/theme/index.ts` as design tokens:

- **Colors** — calm, warm, white-first palette (`background #F4F6F9`, `primary #2D6CDF`, dairy `accent #E08A1E`, plus semantic success/warning/danger and soft tints).
- **Shadows** — layered `sm` / `md` / `lg` for floating controls and cards.
- **Spacing / Radii** — consistent scale and rounded corner radii (`pill`, `xl`, …).
- **Typography** — large, high-contrast text styles (`screenTitle`, `sectionTitle`, `body`, `huge`, …).
- **Touch targets** — `minHeight: 56` baseline for accessibility.

Reusable primitives in `src/components/ui` (Button, Card, Field, Banner, Screen, Text, ConfirmDialog, QuantityStepper, DateStepper, etc.) consume these tokens so the whole app stays visually consistent.

### New in milkedIn — Responsive & Calendar (added without breaking existing system)

- **Responsive Web Shell** (`src/components/layout/WebSidebar.tsx` + `src/hooks/useResponsive.ts` + `src/components/ui/Screen.tsx`): `WebSidebar` (260px, sticky, channel-aware) on `web ≥1024px`; bottom tabs on mobile. `Screen` gains `maxWidth` (`default 1120 / narrow 720 / wide 1280`), centered `alignSelf: center`, and adaptive padding (`xl` → `32` on desktop). Kept 100% backward compatible — mobile layout untouched.
- **Modern Calendar** (`src/components/calendar/Calendar.tsx`): replaces the dot-only day with **heatmap intensity** (`primarySoft` → `#A9C2FD` by `quantity/max`), **quantity pill** (`water` + `"2L"`), **count badge** (`×N` for multiple entries), **TODAY** pill, and a 4-item **legend** (No entry / Logged / More milk / Today). Responsive (`0.92` aspect on web) and wrapped in `shadows.sm`.

---

## Exporting Data

Two paths cooperate:

1. **Backend-generated files** — `services/api/export.ts` calls `GET /api/logs/export?format=pdf|excel&startDate&endDate`, resolving a period (month/year) to an inclusive date range via `periodDateRange`, then `requestBlob` returns the raw bytes + filename.
2. **Device saving** — `utils/exporters.ts` `saveFile()` writes bytes to the cache and opens the OS **share sheet** on native, or triggers a real browser download on web (Uint8Array → base64 → `Share`/`Blob`).

The Export Sheet UI (`components/export/ExportSheet.tsx`) lets users pick a period and format.

---

## Setup & Installation

### Prerequisites

- **Node.js 18+**
- The **milkedIn backend** (`milk_logs_backend/` folder, formerly Milk Logs) running and reachable (default port `4000`).
- For device/emulator testing: the **Expo Go** app or a **development build**, plus (for native) Xcode (iOS) / Android Studio (Android).

### Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the API URL**

   Copy the example and set your backend URL:

   ```bash
   cp .env.example .env
   ```

   ```bash
   # .env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
   ```

   > In development you can leave `EXPO_PUBLIC_API_URL` unset — the app auto-detects the Expo dev-server LAN host on port `4000`. For physical devices and production builds you **must** set it to a URL the device can reach (use your machine's LAN IP, or the deployed backend URL).

3. **(Optional) Start the backend**

   From the backend folder:

   ```bash
   npm run dev
   ```

---

## Environment Variables

| Variable              | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | Base URL of the backend API. Required for physical devices / production builds. In dev it can be omitted (auto-resolved to the LAN host on port `4000`). |

All other configuration (JWT secrets, database, email) lives in the **backend** `.env`.

---

## Running the App

```bash
# Start the Expo dev server (Metro)
npm start

# Or target a platform directly:
npm run android
npm run ios
npm run web
```

Then open the app:

- **Expo Go** — scan the QR code from the terminal / Expo Dev Tools.
- **Development build** — scan the QR code to load the bundle into your build.
- **Web** — opens at `http://localhost:8081` (the origin allow-listed by the backend CORS config).
- **Emulator/Simulator** — press `a` (Android) or `i` (iOS) in the Expo CLI.

First launch shows the auth stack; register or sign in, then you land on the **Today** tab.

---

## Build & Deploy

This project is configured in `app.json` for Expo's EAS and web static output (`web.output: "static"`).

### Web (static)

```bash
npx expo export --platform web
```

The output in `dist/` can be hosted on any static host (Vercel, Netlify, etc.). Ensure `EXPO_PUBLIC_API_URL` points at your deployed backend, and that the backend CORS `allowedOrigins` includes your web origin.

### Android / iOS (EAS Build)

1. Install EAS CLI: `npm install -g eas-cli`
2. `eas login`
3. Configure: `eas build:configure`
4. Build:

   ```bash
   eas build --platform android
   eas build --platform ios
   ```

Set `EXPO_PUBLIC_API_URL` to your production backend before building (via EAS "Environment Variables" or `.env`).

### Android — Downloadable APK on push/merge to `main` (added, non-breaking)

`milkedIn` now builds a **downloadable `.apk`** automatically — no manual EAS dashboard hunting.

- **Workflow:** `.github/workflows/build-android-apk.yml` triggers on `push → main`, `pull_request (closed+merged) → main`, and `workflow_dispatch`. Guard: PRs must be merged.
- **What it does:**
  1. `setup-node 22` (npm cache) + `setup-java 17` + `setup-android`
  2. `npm ci` + `npm install -g eas-cli`
  3. **Cloud build (if `EXPO_TOKEN` set):** `eas build -p android --profile preview --wait --non-interactive` → APK link in `expo.dev` Builds dashboard. `eas.json:11` forces `preview.android.buildType: apk` (was implicit).
  4. **Local build (always):** `npx expo prebuild --platform android --clean` → `android/gradlew assembleRelease || assembleDebug` → `actions/upload-artifact@v4` (`milkedin-apk-<sha>`, 30-day retention) — download from **Actions → run → Artifacts**.
  5. **Release:** `softprops/action-gh-release@v2` creates tag `build-<sha>` on `push` to `main` and attaches `*.apk` — download from **Releases** page.
- **How to get the APK:** Push or merge to `main` → open GitHub → **Actions** → latest `Android APK Build` → **Artifacts** *or* **Releases → build-<sha>**. Cloud build alternative: `expo.dev` → Builds. No `EXPO_TOKEN`? Local artifact still builds via debug keystore.
- **OTA stays separate:** `.github/workflows/update-android.yml` still publishes `eas update --branch preview --platform android` on `push → main` for JS-only updates.

---

## Scripts

| Script            | Action                                              |
| ----------------- | --------------------------------------------------- |
| `npm start`       | Start the Expo dev server (Metro).                 |
| `npm run android` | Run on Android emulator/device.                    |
| `npm run ios`     | Run on iOS simulator/device.                       |
| `npm run web`     | Run in the browser.                                |
| `npm run lint`    | Lint with `expo lint` (ESLint).                    |
| `npm run typecheck` | Type-check with `tsc --noEmit`.                  |

---

> **Tip:** Keep the backend and frontend env URLs in sync. The backend serves `http://localhost:8081`/`127.0.0.1:8081` as allowed CORS origins for web dev — update `src/app.js` `allowedOrigins` in the backend when deploying.
