# 🛠️ Tools, Frameworks & Core Dependencies

This document provides a detailed technical audit of every single third-party framework, compilation utility, style processor, and SDK utilized in the **Aether Todo** suite.

---

## 🏗️ Core Framework & Runtime

### 1. **React 19** (`react` & `react-dom` v19.2.6)
*   **Role:** The foundational framework of the application.
*   **Operational Details:** Employs the new React 19 rendering optimization algorithms, concurrent features, and streamlined hydration models.
*   **Patterns Used:** Comprehensive React Hooks (`useState`, `useEffect`, `useContext`, `useRef`, `useMemo`).

### 2. **Vite 8** (`vite` v8.0.12)
*   **Role:** The frontend bundler and development build server.
*   **Operational Details:**
    *   **HMR (Hot Module Replacement):** Enables instant sub-millisecond updates in the browser without full reloads.
    *   **Rollup Compilation:** Packages and bundles optimized assets for the final production bundle.
    *   **TypeScript Loader:** Built-in blazing fast native transpiler.

### 3. **TypeScript 6** (`typescript` v6.0.2)
*   **Role:** Static typing engine.
*   **Operational Details:**
    *   Provides full compile-time type-safety across components, mappers, database adapters, and state context files.
    *   Enforces strict mode rules to eliminate runtime `null` or `undefined` property access bugs.

---

## 🎨 Styling, Icons & Animations

### 1. **Tailwind CSS & PostCSS** (`tailwindcss` v4.3.0, `postcss` v8.5.15, `autoprefixer` v10.5.0)
*   **Role:** Integrated styling pre-processing framework.
*   **Operational Details:** Used in coordination with core Vanilla CSS variables to style UI grids, shadows, colors, fonts, and responsive layouts.
*   **Vite Integration:** Leverages the high-performance `@tailwindcss/vite` compiler plugin for rapid asset build pipelines.

### 2. **Framer Motion** (`framer-motion` v12.40.0)
*   **Role:** Physics-based spring animation engine.
*   **Operational Details:**
    *   Coordinated animations for visual transitions, list enters/leaves, modal slide-ins, and theme customizer drawers.
    *   Provides layout shift animations (`layout` prop) that smoothly reposition surrounding task cards when an item is deleted.

### 3. **Lucide React** (`lucide-react` v1.16.0)
*   **Role:** Icon system.
*   **Operational Details:** Provides beautifully rendered SVG icons (Search, Calendar, Timer, User, Settings, Checkmark, Plus, Database, Alert) dynamically styled using CSS color variables.

### 4. **Canvas Confetti** (`canvas-confetti` v1.9.4)
*   **Role:** Micro-reward animations.
*   **Operational Details:** Triggers highly customizable particle confetti explosions in the DOM when users successfully complete a Pomodoro timer focus session or check off highly critical tasks.

---

## 🔌 Database Cloud SDKs

### 1. **Supabase Client SDK** (`@supabase/supabase-js` v2.106.1)
*   **Role:** Database driver for PostgreSQL cloud integrations.
*   **Operational Details:**
    *   Creates a single-instance client via `createClient(url, anonKey)`.
    *   Provides fluent JavaScript query interfaces (`.from('tasks').select('*')`) to mutate, fetch, or delete data on the remote server.
    *   Binds security requests to standard authentication headers (`Authorization: Bearer <JWT>`).

### 2. **Firebase Client SDK** (`firebase` v12.13.0)
*   **Role:** Database and authentication driver for Firestore cloud integrations.
*   **Operational Details:**
    *   Initializes the app using `initializeApp(config)`.
    *   Operates on Google Firestore databases via structured queries (`query`, `collection`, `where`).
    *   Implements transactional multi-row updates using `writeBatch()`.

---

## ⚙️ Compilation & Linting Utilities

### 1. **ESLint 10 & Plugins** (`eslint` v10.3.0, `typescript-eslint` v8.59.2)
*   **Role:** Code syntax analysis and formatting checking.
*   **Operational Details:**
    *   Enforces standard coding practices, hook compliance, type-aware lint rules, and unused variable elimination.
    *   Build configurations (`eslint.config.js`) are aligned with TypeScript-aware parser frameworks to ensure bulletproof compilation.

### 2. **React Compiler / HMR Plugin** (`@vitejs/plugin-react` v6.0.1)
*   **Role:** Core Vite React transpilation.
*   **Operational Details:** Translates React-specific syntax (JSX) into vanilla optimized ES modules.
