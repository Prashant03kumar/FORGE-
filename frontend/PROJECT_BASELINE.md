# FORGE Frontend - Complete Project Baseline

**Date:** February 21, 2026  
**Framework:** React 19.2 + Vite 7.3 + Tailwind 4.1 + React Router 7.13  
**Purpose:** Task management and productivity tracking application with daily challenges, history tracking, and time-based task lifecycle.

---

## 📁 Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with baseURL config
├── assets/
│   └── forge-logo.jpg        # Brand logo
├── components/
│   ├── AddTaskModal.jsx      # Modal for creating new tasks (time picker + title + desc)
│   ├── DailyChallenge.jsx    # Random daily challenge card
│   ├── Footer.jsx            # Footer navigation
│   ├── HeroQuoteCard.jsx     # Daily hero section (Unsplash image + motivational quote)
│   ├── MonthlyMap.jsx        # Monthly task completion heatmap/tracker
│   ├── Navbar.jsx            # Top navigation bar (logo, search, notifications, profile)
│   ├── Sidebar.jsx           # Left sidebar navigation (My Tasks, History, Calendar, Settings)
│   └── TaskList.jsx          # Main task table with status controls and timeline
├── context/
│   ├── AuthContext.jsx       # Auth state (login, logout, token, user)
│   └── TaskContext.jsx       # Task state management (add, start, forge, delete + localStorage)
├── hooks/                    # (Currently empty, for future custom hooks)
├── Layout/
│   └── DashboardLayout.jsx   # Main app shell (Navbar + Sidebar + mobile toggle)
├── pages/
│   ├── Dashboard.jsx         # Main dashboard (Hero + Challenge + MonthlyMap + TaskList)
│   ├── History.jsx           # Forge history view (last 3 months, grouped by month/day)
│   ├── Login.jsx             # Login page
│   └── Register.jsx          # Register page
├── App.jsx                   # Main router setup
├── App.css                   # Global styles
├── index.css                 # Base styles + Tailwind imports
└── main.jsx                  # React root + AuthProvider + TaskProvider
```

---

## 🔑 Core Features

### 1. **Authentication** (`AuthContext.jsx`, `src/pages/Login.jsx`, `Register.jsx`)

- **State:** `user`, `token`, `loading`
- **Methods:** `login(userData, userToken)`, `logout()`
- **Storage:** Token stored in `localStorage` under key `"token"`
- **Protected Routes:** Dashboard requires valid token via `<ProtectedRoute>` wrapper
- **Default:** Redirects to `/login` if no token

### 2. **Task Management** (`TaskContext.jsx`, `src/components/TaskList.jsx`)

- **Task Object Schema:**

  ```js
  {
    id: number (Date.now()),
    title: string,
    desc: string,
    reminder: string (e.g., "09:00 AM"),
    status: "active" | "in-progress" | "forged",
    startTime: string (e.g., "03:58 PM") // Human-readable
    startedAt: ISO string (e.g., "2026-02-21T..."),
    endTime: string (e.g., "04:17 PM") // Human-readable, set on forge
    forgedAt: ISO string // Set when task is marked as forged
  }
  ```

- **Context Methods:**
  - `addTask(newTask)` → creates task with `status: "active"`, auto-generates `id`
  - `startTask(id)` → sets `status: "in-progress"`, stores `startTime` and `startedAt` (ISO)
  - `forgeTask(id)` → sets `status: "forged"`, stores `endTime` and `forgedAt` (ISO)
  - `deleteTask(id)` → removes task completely

- **Storage:** Tasks persisted to `localStorage` under key `"forge_tasks"`

### 3. **Task Lifecycle & UI**

1. **Status: Active** → User sees orange **Play icon**
   - Clicking Play calls `startTask(id)`
2. **Status: In-Progress** → User sees orange **Dot** in a square box
   - Clicking the box triggers a **5-second undo countdown** UI popup at bottom
   - If countdown reaches 0, `forgeTask(id)` is called automatically
   - User can click "Undo" to cancel forging
3. **Status: Forged** → User sees orange **Checkmark** in a square box
   - Task title gets `line-through` and gray color
   - Clicking the checkmark shows "Task is Forged!" alert with forged time
   - Task cannot be edited or deleted (immutable)
   - Edit/Delete buttons replaced with green "Forged" badge

### 4. **Task List Sorting**

- **Priority Order:**
  1. `in-progress` tasks (running, at top)
  2. `active` tasks (to-do, middle)
  3. `forged` tasks (completed, bottom)
- **Tie-breakers:**
  - Within same status, newer items first (`startedAt` / `forgedAt` descending, then `id` descending)

### 5. **Desktop Timeline Column** (Hidden on mobile)

- **For Active Tasks:** Shows "Plan: HH:MM AM/PM"
- **For In-Progress Tasks:** Shows Plan + Start time (orange)
- **For Forged Tasks:** Shows Plan + Start time (orange) + End/Forged time (green)

### 6. **Add Task Modal** (`AddTaskModal.jsx`)

- **Inputs:**
  - Task title (required)
  - Description (optional)
  - Time picker (hour: 01-12, minute: 00-59, period: AM/PM)
- **Validation:** Clamps hour to 1-12, minute to 0-59
- **Output:** Calls `onAdd({ title, desc, reminder: "HH:MM AM/PM" })`

### 7. **Hero Quote Card** (`HeroQuoteCard.jsx`)

- **Data:** Daily image + motivational quote
- **Image Source:** Unsplash API (random nature/landscape/minimal photos)
- **Quote Source:** API-Ninjas (with fallback local quotes)
- **Caching:** Cached in `localStorage` under `"forge_hero_daily"` with date check
- **Resilience:**
  - If Unsplash fails → uses fallback image
  - If API-Ninjas fails → uses random fallback quote
  - Per-API try/catch blocks (no cascade failure)
- **Fallback Array:** 5 hardcoded motivational quotes

### 8. **History View** (`src/pages/History.jsx`)

- **Scope:** Shows forged tasks from last 3 months only
- **Grouping:** Month → Day (February 2026, Day 21, etc.)
- **List Display:**
  - Task title only (minimal, clickable)
  - No description or times shown initially
- **Modal on Click:**
  - Opens timeline modal showing:
    - Task title + description
    - Planned time
    - Started time (or fallback to `startedAt` ISO)
    - Forged time (or fallback to `forgedAt` ISO)
  - Green checkmark badge at top

---

## 🎨 UI & Styling

### Colors

- **Primary Orange:** `#FF6B00` (buttons, active status, highlights)
- **Gray Palette:** `gray-50` to `gray-800` (backgrounds, text, borders)
- **Accent Green:** `green-500`, `green-50`, `green-600` (forged badge, success states)
- **Success Red:** `red-400` (delete button)
- **Blue:** `blue-400` (edit button)

### Responsive Classes

- **Navbar Search:** Shows on desktop (`hidden sm:flex`), mobile search icon visible (`sm:hidden`)
- **Mobile Sidebar Toggle:** `top-24` (below navbar, z-50)
- **Desktop Timeline Column:** `hidden md:table-cell` (TaskList)
- **Grid Layout (Dashboard):** Flex on mobile, CSS Grid on `lg:` (45% / 25% / 30% columns)

### Key Tailwind Utilities Used

- `rounded-2xl`, `rounded-3xl` (card borders)
- `border border-gray-100`, `border-orange-100/50` (subtle borders)
- `shadow-sm`, `shadow-lg`, `shadow-2xl` (card elevation)
- `z-50`, `z-100` (stacking context for navbar, modals, floating UI)
- `animate-in`, `slide-in-from-bottom`, `fade-in` (entrance animations)
- `line-through` (forged task text styling)

---

## 🔌 External APIs

### 1. **Unsplash**

- **Endpoint:** `https://api.unsplash.com/photos/random`
- **Params:**
  - `query=nature,landscape,minimal`
  - `orientation=landscape`
  - `client_id=${VITE_UNSPLASH_ACCESS_KEY}`
- **Env Variable:** `VITE_UNSPLASH_ACCESS_KEY`
- **Response:** JSON with `urls.regular` (image URL)
- **Fallback:** Hardcoded image URL if request fails

### 2. **API-Ninjas (Quotes)**

- **Endpoint:** `https://api.api-ninjas.com/v1/quotes`
- **Params:** `category=${randomCategory}&limit=1`
- **Category Pool:** `["success", "motivation", "inspirational", "hope", "knowledge"]`
- **Headers:** `X-Api-Key: ${VITE_API_NINJAS_KEY}`
- **Env Variable:** `VITE_API_NINJAS_KEY`
- **Response:** JSON with `content` (quote text) and `author`
- **Fallback:** Random selection from `FALLBACK_QUOTES` array if request fails

### 3. **Backend Axios**

- **Base URL:** Set in `src/api/axios.js` (typically `http://localhost:3000` or similar)
- **Usage:** For future API calls to custom backend (auth endpoints, etc.)

---

## 📦 Dependencies

### Production

- **react** (19.2.0) - Core framework
- **react-dom** (19.2.0) - React rendering
- **react-router-dom** (7.13.0) - Client-side routing
- **tailwindcss** (4.1.18) - Utility-first CSS
- **@tailwindcss/vite** (4.1.18) - Vite integration
- **axios** (1.13.5) - HTTP client
- **lucide-react** (0.575.0) - Icon library

### Dev

- **vite** (7.3.1) - Build tool & dev server
- **@vitejs/plugin-react** (5.1.1) - React Fast Refresh support
- **eslint** + plugins (9.39.1) - Code linting
- **@types/react**, **@types/react-dom** - TypeScript definitions (optional)

---

## 🚀 Scripts

```json
{
  "dev": "vite", // Start dev server (HMR enabled)
  "build": "vite build", // Production bundle
  "lint": "eslint .", // Check code quality
  "preview": "vite preview" // Preview production build locally
}
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root:

```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
VITE_API_NINJAS_KEY=your_api_ninjas_key
```

---

## 🔄 Data Flow

### Task Creation Flow

1. User clicks "Add New Task" button
2. Modal opens with title, desc, time inputs
3. User submits form
4. `onAdd()` triggers `addTask()` from context
5. Task added to state, persisted to `localStorage`

### Task Start Flow

1. User clicks Play icon (orange) on active task
2. `startTask(id)` called
3. Task status → `"in-progress"`, stores human-readable `startTime` + ISO `startedAt`
4. UI re-renders: Play icon → Orange dot in square

### Task Forge Flow

1. User clicks status box (orange dot or checkmark)
2. If forged → show alert with forged time, return
3. If in-progress → show 5s countdown popup at bottom
4. User can click "Undo" to cancel
5. If countdown reaches 0:
   - `forgeTask(id)` called
   - Status → `"forged"`, stores human-readable `endTime` + ISO `forgedAt`
   - UI re-renders: title gets `line-through`, orange checkmark, "Forged" badge

### History View Flow

1. History page loads
2. Filters tasks where `status === "forged"` AND `forgedAt` exists
3. Groups into month/day buckets (last 3 months)
4. Renders month headers + day sections
5. Each day shows list of task titles only (minimal)
6. Click task → modal opens with full timeline (Planned / Started / Forged)

---

## 🛠️ Key Patterns

### HMR Safety (Vite)

- `TaskProvider` and `useTasks` exported as **named function exports** (not default)
- Required for Vite's React Fast Refresh compatibility

### localStorage Keys

- `"token"` → Auth token
- `"forge_tasks"` → Full task array (JSON stringified)
- `"forge_hero_daily"` → Daily hero data with date check

### Responsive Design

- Mobile-first: Base styles for mobile
- Tablet/Desktop: `sm:`, `md:`, `lg:` breakpoints
- Avoid arbitrary values; use Tailwind's preset scale (e.g., `z-100` not `z-[100]`)

### Modal Patterns

- Controlled via boolean or object state (e.g., `showAlertTask`)
- Fixed positioning with `z-50` or `z-100`
- Close via button click or timeout
- Overlay: `bg-black/40` semi-transparent

---

## 📝 Future Considerations

1. **Backfill Timestamps:** Older tasks without `startedAt` / `forgedAt` won't display correctly in History grouping
2. **Collapsible History:** Could add month/day collapse toggles for cleaner UX
3. **Task Animations:** Smooth transitions when task moves from Today → History
4. **Weekly View:** Add a weekly summary or calendar view (MonthlyMap currently exists)
5. **Sharing/Export:** Export history or share task stats
6. **Notifications:** Real-time notifications via `useEffect` when task times are reached
7. **Multi-language Support:** i18n setup for locale-aware formatting
8. **Categories/Tags:** Organize tasks by category (currently flat list)
9. **Backend Integration:** Wire up authentication endpoints, remote persistence
10. **Dark Mode:** Add theme toggle (currently light-only)

---

## 📋 Quick Debugging Checklist

| Issue                             | Solution                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Tasks not persisting              | Check `localStorage` key `"forge_tasks"`, verify JSON serialization                   |
| Hero quote fails                  | Check env keys for Unsplash & API-Ninjas, verify network tab, fallback should trigger |
| Mobile sidebar overlaps navbar    | Ensure toggle has `top-24` class                                                      |
| Search icon duplicates on desktop | Verify Navbar has `sm:hidden` on mobile search button                                 |
| Forged tasks appear in "active"   | Check sorting function: `forged` should have priority 2                               |
| History is empty                  | Ensure test tasks have `status: "forged"` AND valid `forgedAt` ISO string             |
| HMR errors on save                | Check TaskContext exports are named functions, not default + arrow function combo     |
| Tailwind classes not applying     | Use preset utilities (e.g., `z-100` not `z-[100]`), rebuild CSS if needed             |

---

## ✅ Known Working Features (as of Feb 21, 2026)

- ✅ Login / Register / Logout (Auth state)
- ✅ Protected Dashboard route
- ✅ Add tasks with title, description, reminder time
- ✅ Start task → capture start time
- ✅ 5-second undo countdown before marking forged
- ✅ Mark task as forged → capture end time
- ✅ Keep forged tasks visible (line-through, immutable)
- ✅ Sort tasks: in-progress first, then active, then forged
- ✅ Show forged time in task popup and timeline
- ✅ History view: group last 3 months by month/day
- ✅ History list: show title only; modal on click for full details
- ✅ Responsive mobile sidebar with toggle
- ✅ Hero quote with Unsplash image + fallback quotes
- ✅ Task list desktop timeline (Plan / Start / End times)
- ✅ localStorage persistence for tasks and auth token

---

**End of Baseline Document**
