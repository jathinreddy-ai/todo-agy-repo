# 🏛️ Component Architecture & Visual Layouts

This document provides a highly granular, detailed breakdown of all React components, layout compositions, and visual systems in the **Aether Todo** suite.

---

## 🖼️ Primary Layout Hierarchy

The application layout is structured around a responsive CSS grid, dividing the workspace into operational zones:

```markdown
┌────────────────────────────────────────────────────────┐
│                        Layout                          │
│ ┌───────────┐ ┌──────────────────────────────────────┐ │
│ │  Sidebar  │ │                Header                │ │
│ │           │ ├──────────────────────────────────────┤ │
│ │  • Lists  │ │              Dashboard               │ │
│ │  • Tags   │ ├──────────────────────────────────────┤ │
│ │  • Themes │ │              TaskList                │ │
│ │  • Sync   │ │  ┌────────────────────────────────┐  │ │
│ │           │ │  │          TaskItem              │  │ │
│ │           │ │  ├────────────────────────────────┤  │ │
│ │           │ │  │          TaskItem (Timer Open) │  │ │
│ │           │ │  └────────────────────────────────┘  │ │
│ └───────────┘ └──────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Deep Dive

Below is the absolute technical analysis of all 12 custom components designed for the premium glassmorphic interface:

### 1. 🎛️ `Layout.tsx`
*   **Location:** [`src/components/Layout.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/Layout.tsx)
*   **Purpose:** Houses the primary responsive grid wrapper, coordinating the left sidebar and main content layout.
*   **State & Triggers:**
    *   Wires overlay panels (Theme Drawer, Cloud Configuration modal) and provides portal backdrops.
    *   Adapts grid layouts for mobile/desktop viewports with media queries.

### 2. 🗂️ `Sidebar.tsx`
*   **Location:** [`src/components/Sidebar.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/Sidebar.tsx)
*   **Purpose:** The central navigation panel.
*   **Key Features:**
    *   **Filter States:** Handles visual button feedback for primary tabs (`All`, `Today`, `Upcoming`, `Completed`).
    *   **Custom Category Lists:** Dynamically aggregates active task tags, displaying them as custom click-to-filter categories.
    *   **Theme & Settings Panel:** Access buttons for the custom theme editor drawer.
    *   **Live Cloud Connection Badge:** A highly stylized, pulsating badge reflecting the real-time sync state of `db.ts` (`local`, `supabase`, `firebase`). Shows network status dynamically.

### 3. 🔍 `Header.tsx`
*   **Location:** [`src/components/Header.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/Header.tsx)
*   **Purpose:** The top control bar.
*   **State & Triggers:**
    *   **Text Search:** Binds a reactive text input query to filter task lists by title or description string matching.
    *   **Sort Selectors:** Leverages a dropdown menu selecting fields (`Due Date`, `Priority`, `Title`, `Creation Date`) and sorting directions (`Ascending`, `Descending`).
    *   **User Action Drawer:** Triggers credential views, login workflows, or profile statuses depending on auth tokens.

### 4. 📊 `Dashboard.tsx`
*   **Location:** [`src/components/Dashboard.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/Dashboard.tsx)
*   **Purpose:** High-fidelity metrics widgets.
*   **States Computed:**
    *   **Completion Rate:** Calculates the visual percentage of checked tasks against total items.
    *   **Focus Rate:** Displays total Pomodoro focus hours accumulated.
    *   **Priority Metric Card:** Counts tasks categorized under `High` priority to help users focus on high-impact objectives.
    *   **Visual Graphs:** Radial progress ring indicator custom-colored to match the active accent theme flavor.

### 5. 📜 `TaskList.tsx`
*   **Location:** [`src/components/TaskList.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/TaskList.tsx)
*   **Purpose:** Grouping container for task instances.
*   **Key Features:**
    *   Iterates sorted and filtered task lists.
    *   Integrates graceful entry and exit animations using `framer-motion` layouts.
    *   Mounts the visual `EmptyState` component when tasks are depleted.

### 6. 📝 `TaskItem.tsx`
*   **Location:** [`src/components/TaskItem.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/TaskItem.tsx)
*   **Purpose:** The visual card representational unit of a single task.
*   **Key Features:**
    *   **Inline Controls:** Instantly toggle task completion, trigger the edit modal, or delete the card.
    *   **Dynamic Tag Chips:** Displays colored capsules matching the active accent color.
    *   **Subtask Visual Indicator:** Displays progress fractions (e.g. `2/4 subtasks completed`).
    *   **Integrated Timer Panel:** Mounts the slide-out visual countdown timer.
    *   **Haptic feedback:** Leverages custom slide gestures and floating hover shadows.

### 7. ⏱️ `PomodoroTimer.tsx`
*   **Location:** [`src/components/PomodoroTimer.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/PomodoroTimer.tsx)
*   **Purpose:** An immersive, stateful focus countdown timer.
*   **Internal State Variables:**
    *   `timeLeft`: Integer tracking seconds remaining (defaulting to `1500` for 25-minute Pomodoro sessions, or `300` for breaks).
    *   `isActive`: Boolean tracking play/pause interval states.
    *   `isBreak`: Boolean indicating whether a break session is active.
*   **Action Flow:**
    *   When the countdown reaches `0`: triggers a chime sound, fires a celebratory `canvas-confetti` explosion, and dispatches an update modifying `completedPomodoros` on the parent task, pushing the new data securely to the cloud.

### 8. 🖋️ `TaskModal.tsx`
*   **Location:** [`src/components/TaskModal.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/TaskModal.tsx)
*   **Purpose:** The central data creator/modifier overlay.
*   **State Binds:**
    *   Combines React ref inputs and hooks to manage title, priority, due date, description textareas, estimated Pomodoro sessions, and reminders.
    *   Includes a subtask sub-form to add, toggle, or delete granular sub-items in real-time.
    *   Keyboard listeners: Safely binds the `<kbd>Esc</kbd>` key to dismiss the panel.

### 9. 🎨 `ThemeCustomizer.tsx`
*   **Location:** [`src/components/ThemeCustomizer.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/ThemeCustomizer.tsx)
*   **Purpose:** The sliding right customizer panel.
*   **Interactive Controls:**
    *   **Accent Selectors:** Clicking colored circles dispatches the selected accent theme string (`indigo`, `emerald`, `rose`, `amber`, `cyan`) to change CSS global accent properties on the document root element.
    *   **Chroma Switches:** Toggle Dark Glass (translucent gray/dark navy backdrops) vs Light Glass (frosted ice white templates) under high-saturation glassmorphism rules.

### 10. 🔌 `CloudConfigModal.tsx`
*   **Location:** [`src/components/CloudConfigModal.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/CloudConfigModal.tsx)
*   **Purpose:** Highly sophisticated cloud backend manager.
*   **Features:**
    *   **Provider Switcher Tab:** Select between Supabase or Firebase configurations.
    *   **Smart Paste Parser Box:** Allows user to copy/paste the entire JavaScript configuration snippet from their Firebase or Supabase settings dashboard. Automatically parses the input using regular expressions and strict JSON parsing rules, extracting `apiKey`, `authDomain`, `projectId`, etc., to populate text input fields instantly.
    *   **Sync Authenticator Drawer:** Allows users to log in or register cloud sync credentials via email and password.
    *   **Local Migration Panel:** Prompts a glowing, premium alert showing detected local tasks with a single-click sync migrator button.

### 11. 🔔 `ToastContainer.tsx`
*   **Location:** [`src/components/ToastContainer.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/ToastContainer.tsx)
*   **Purpose:** Layout manager for micro-toasts.
*   **Visual Properties:**
    *   Frosted glass borders housing descriptive icons and custom text.
    *   Appears with floating top-right slide-in vectors, auto-destructing after specified durations (default `4000ms`).

### 12. 🏜️ `EmptyState.tsx`
*   **Location:** [`src/components/EmptyState.tsx`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/components/EmptyState.tsx)
*   **Purpose:** Placed in lists when search filters yield no results.
*   **Design elements:**
    *   Glassmorphic graphics, motivational icons, and CTA triggers.

---

## 🎬 Motion System & CSS Glassmorphism

Transitions and glassmorphic aesthetics are styled in [`index.css`](file:///c:/Users/jathi/Downloads/Antigravity_Projects/todo-app/src/index.css) using vanilla CSS tokens:

*   **Frosted Glass Recipe:**
    ```css
    background: rgba(15, 23, 42, 0.45); /* Dark */
    background: rgba(255, 255, 255, 0.35); /* Light */
    backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    ```
*   **Interactive Spring Animations:** Powered by `framer-motion` physics-based springs (`type: "spring", stiffness: 300, damping: 25`), making task removals, sidebar expanders, and notification slides feel alive.
