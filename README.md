# 🚀 GT Study Mentor Pro — Enterprise AI Career & GATE Preparation Ecosystem

An enterprise-grade, full-stack AI preparation and placement platform combining:
- **Master Placement Directory (1,024 Companies)** with interactive embedded Leaflet mini-maps, Google Maps directions, and salary breakdowns.
- **State-by-State Tech Corridor Map Radar** covering Tamil Nadu, Karnataka, Telangana, Maharashtra, NCR, Gujarat, Kerala, and West Bengal.
- **Unified Multi-Track Command Center**:
  1. Campus Placement Engine & Tech Puzzles Studio
  2. GATE CS 2027 Track with formula sheets and national AIR percentile simulator
  3. Seasonal Internship Pipeline with AI Tailored Cover Letter Generator
  4. Software Engineer 3-Month Intensive with 84-day activity heatmap
  5. Career Decision Support Matrix (M.Tech vs Industry Job)
  6. Competency Skill Tree with Cognitive Fatigue & Burnout Monitor
- **AI Power Studio Ecosystem (Wave 1 to Wave 4)**:
  - **AI Mock Interview Studio** with live voice recording & rubric scoring
  - **GATE 2027 AIR Predictor** with college cutoff matching
  - **CSE Code Studio Sandbox** with multi-language execution
  - **90-Day Trajectory Calendar** with iCal sync
  - **ATS Resume Studio** with JD matching & instant print
  - **Pomodoro Deep Focus Engine** (25/5, 50/10, 90/20) with ambient lofi audio
  - **Subject Notes Vault** across 9 core GATE CS subjects with auto-save
  - **Company Application Kanban Board** with drag/move pipeline
  - **Weekly Performance Report** with print-to-PDF export
  - **Daily Motivation Engine** with XP streaks and milestone badges
  - **10:00 PM Sleep Mode Lockdown** with starfield animations & memory consolidation reminders
  - **GATE Formula Vault** with 40+ high-yield formulas & one-click AI explanation
  - **AI Code Reviewer & Complexity Studio** with time/space $O(...)$ analysis
  - **90-Day Smart Daily Schedule** with persistent task tracking & XP gains
  - **Striver A2Z 17 DSA Patterns Tracker** with status toggles & progress radar
  - **AI Gateway & FreeLLMAPI Config Studio** with 1-click test ping
  - **CS Blitz Speed Arena** (60-second rapid fire MCQ sprint with combo multiplier)
  - **System Design & Architecture Studio** with interactive blueprints (TinyURL, Rate Limiter, Notification Engine, E-Commerce, Real-Time Chat)
  - **GATE 2027 Weightage Radar & Mark Maximizer** with dynamic score calculator
  - **Study Vault Backup, Restore & Printable Cheat Sheet Engine** (Full offline JSON export/import)
  - **Interactive Algorithm Visualizer Studio** with step-by-step pointer mechanics (Two Pointers, Binary Search, Sliding Window, Bubble Sort)
  - **Tanglish Audio Mentor Podcast** with 2-minute bite-sized audio briefings, voice synthesizer, and animated equalizer
  - **Studio Hub Category Filter Bar** (All 21, AI & Code, GATE 2027, Placement & DSA, Focus & Plan) for a decluttered UI/UX

---

## 🏛️ System Architecture

* **AI Gateway Architecture**: OpenAI-compatible endpoint (`http://127.0.0.1:3001/v1/chat/completions`) powered by **FreeLLMAPI** / **GPT-5.4**.
  - **Zero Key Leaks**: Pure gateway design eliminating hardcoded vendor keys.
  - **Smart Offline Resiliency**: Seamlessly falls back to rich, high-yield built-in CSE intelligence if the local gateway is offline.
  - **One-Liner FreeLLMAPI Setup**:
    ```powershell
    iwr -useb https://freellmapi.co/install.ps1 | iex
    ```
* **Backend**: Node.js & Express with SQLite persistence (`database.js`), WebSocket real-time broadcast, and REST APIs (`companiesService.js`, `prepService.js`).
* **Production Middleware Layer (`middleware.js`)**:
  * **Security**: HTTP Security Headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`).
  * **Rate Limiter**: Token-bucket sliding window rate limiter (120 requests/min per IP with HTTP 429 response).
  * **In-Memory Caching**: Server-side TTL caching (180s - 300s) on high-traffic read endpoints.
  * **Input Sanitization**: HTML entity encoding and XSS tag stripper.
  * **Structured Logging**: Request timing and telemetry metrics.
* **Frontend Architecture**: Single Page Application (HTML5, Vanilla CSS Design System with WCAG 2.1 AA focus rings, and modular JavaScript).
* **Resilience**: Client-side offline sync queue with `navigator.onLine` auto-reconnection and telemetry tracking (`window.GTTelemetry`).

---

## 📦 Setup & Installation

### Prerequisites
* Node.js (v18.0.0 or higher)
* npm (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Tamizh1309/gt-study-mentor-pro.git
cd gt-study-mentor-pro
npm install
```

### 2. Launch Local Server
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing Suite

Run the full automated unit, integration, and E2E verification suite:
```bash
node test_v2_comprehensive.js
```
**Coverage Overview:**
* **Unit Tests**: Input sanitization, token bucket rate limiter, cache TTL.
* **Integration Tests**: REST API endpoints (`/api/companies`, `/api/map/states`, `/api/prep/quizzes`).
* **E2E Puppeteer**: Desktop (1440x900) and Mobile (390x844) viewport rendering, 19 studio modal activations, and 0 console errors.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Cache TTL |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies` | Paginated (24/page) query engine with search, tier, state, and salary filters | 180s |
| `GET` | `/api/companies/:id` | Full company profile with GPS coordinates, address, and links | None |
| `GET` | `/api/map/states` | Geographic state corridors with active recruiter counts and avg LPA | 300s |
| `GET` | `/api/prep/quizzes` | Aptitude and Technical MCQ question bank with explanations | 180s |
| `GET` | `/api/prep/coding` | Algorithmic coding challenges with starter code and test cases | 300s |
| `GET` | `/api/prep/guides` | Company-specific recruitment patterns and insider tips | 300s |
| `GET` | `/api/stats/placement-insights` | Aggregate national placement and tier metrics | 180s |

---

## 🛡️ Role-Based Access Control (RBAC)
* **Student** (Default): Full access to mock tests, practice quizzes, coding challenges, calculators, and career tracks.
* **Mentor**: Unlocks review of candidate STAR interview responses, custom question creation, and study plan recommendations.
* **Admin**: Unlocks platform telemetry, cache invalidation, and system-wide WebSocket broadcast alerts.

---

## 🌐 Live Deployment
* **GitHub Pages**: [https://tamizh1309.github.io/gt-study-mentor-pro/](https://tamizh1309.github.io/gt-study-mentor-pro/)
* **Repository**: [https://github.com/Tamizh1309/gt-study-mentor-pro](https://github.com/Tamizh1309/gt-study-mentor-pro)
