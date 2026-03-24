# FORGE - Productivity and Task Management

**FORGE** is a premium task management application that gamifies productivity. You can organize your tasks, maintain streaks, track long-term progress visually using an activity heatmap, follow other users, and get deep insights from the Forge Oracle. Developed with the MERN stack (MongoDB, Express, React, Node.js) and styled with top-tier Tailwind CSS, FORGE transforms daily grinding into an engaging journey.

## ✨ Complete Feature Breakdown

### 1. Task Management
- **Add Tasks**: Set title, description, and planned reminder times.
- **Task Lifecycle**: 
  - **Active**: Tasks ready to be started (indicated by a Play icon).
  - **In-Progress**: Running tasks with an active timer and start-timestamp logs.
  - **Forged**: Completed tasks, permanently etched into your history. Unchangeable.
- **Undo 5-sec Buffer**: Accidentally forged a task? A 5-second countdown popup allows you to undo the forged state before it is permanently committed to your timeline.
- **Task Timeline Sidebar**: Desktop layout features a dedicated column showing exact "Plan", "Started", and "Forged" timestamps.
- **Daily Stats & History**: View stats of tasks per day, or traverse back to see older forged tasks organized beautifully by calendar months.
- **Calendar Visualization**: Real-time Monthly Map tracking how productive you've been throughout the month.

### 2. User Profiles & Gamification
- **Sparks & Streaks**: Earn sparks for completing tasks. Maintain daily streaks and reach new maximum streaks. Your current and maximum streaks are tracked globally.
- **Activity Heatmap**: A GitHub-style contribution heatmap explicitly showing your task activity history over the last 365 days.
- **Customizable Accounts**: Upload personalized avatars, write your customized bio, and view your join date.
- **Dark Mode**: Fully implemented dynamic Light/Dark mode accessible across all views.

### 3. Community & Following System
- **Search Users**: Discover friends or other productive users globally via the top navbar search.
- **Follow System**: Follow others to keep up with their productivity stats, and allow them to follow you.
- **View User Profiles**: Seamless profile routing (`/u/:username`) allows you to view other users' avatars, bios, stats (sparks, current & max streaks), and their public activity heatmaps.
- **Connections Management**: See your secure followers, following lists, and social stats dynamically fetched.

### 4. Forge Oracle (AI Insights)
- **Deep Insights Engine**: The Forge Oracle analyzes your latest backend statistics (e.g., total forged count) and provides personalized productivity motivations, keeping you locked in. 
- **Sleek UI Dashboard Integration**: Distinct Oracle visual cards integrated right into the dashboard grid using beautifully rendered lucide-react typography.

### 5. Hero & Daily Inspiration
- **Daily Unsplash Graphics**: Pulls majestic desktop backgrounds related to nature/landscapes dynamically upon dashboard load.
- **Motivational Quotes**: Integrated with API-Ninjas, offering daily motivational quotes specifically tailored to success. 
- **Graceful Fallbacks**: If API rate limits are exceeded, internal majestic fallback quotes and images replace them locally to keep the app visually flawless.

### 6. Robust Backend Architecture (MERN)
- **Authentication**: JWT-based login, registration, and refresh tokens seamlessly keep users persistently logged in securely.
- **Image Processing**: Multer and Cloudinary integration for smooth, non-blocking profile picture uploads onto CDN.
- **Security Updates**: Users have the ability to instantly update passwords and securely overwrite account details.
- **Rate Limiting & Middlewares**: Preventative middlewares specifically avoiding api-spamming (e.g., following rate limits prevent self-following and over-following).

---

## 🚀 How to Traverse and Use the Features

1. **Getting Started (Auth & Profiles)**
   - Head to `/register` or `/login`. Create a new account or sign in.
   - Go to **Settings -> My Account** to set up your Avatar (Cloudinary handles the heavy lifting instantly) and write your Bio.
   - Review your account security under **Settings -> Security**.

2. **Managing Your First Task**
   - On the **Dashboard**, click to add a new task, fill in the "What to Forge" fields and pick a time constraint.
   - Click the orange **Play button** next to a task; it switches to **In-Progress**.
   - After you finish working, click the highlighted dot. A 5-second countdown drops in; let it expire to successfully **Forge** the task. You will instantly gain **Sparks**.

3. **Tracking Your Progress**
   - Notice the **Monthly Map** updating in real-time on your dashboard.
   - Click over to your **Profile** (via the top right navigation) to marvel at your personalized Activity Heatmap and watch your streak counter elevate.
   - Read the **Forge Oracle** card located on your dashboard layout for contextualized performance reflections.

4. **Community (Followers & Following)**
   - Use the **Search bar** gracefully hidden inside the Navbar on desktop (Search icon accessible on mobile) to find other productive users. 
   - Open their profile `/u/[username]`. Admire their historic stats, then hit **Follow**.
   - Keep up with your connections directly from the centralized backend API routes tracking followers/following states.

---

## 🛠 Tech Stack

**Frontend Ecosystem Setup:**
- **React 19.2 + Vite 7.3** - Blazing fast cold-start performance & HMR.
- **Tailwind CSS 4.1** - High aesthetics utility-first classes (dynamic grid templates & complex pseudo-selectors).
- **React Router 7.13** - Fully optimized protected routing logic.
- **Context API** - Native State Management maintaining local Auth, Tasks, and Themes across instances.
- **Lucide Icons & React-Activity-Calendar** - Visually stunning graphics!
  
**Backend & Database Protocol:**
- **Node.js + Express.js**: Seamless non-blocking API endpoints.
- **MongoDB + Mongoose**: Scalable document-based database persisting highly-structured User schemas, generic Task objects, and Follow connection maps.
- **Cloudinary + Multer**: Optimized static image streaming and buffering arrays.
- **Axios**: Synchronizing unified requests from the React shell to Express routes.

---

*This complete feature manual & baseline reflects the fully scaled MERN architecture, bringing an end to the previous locally-hosted iterations.*
