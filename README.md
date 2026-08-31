# 🚀 GT Study Mentor Pro — Enterprise AI Career & GATE Preparation Ecosystem

An enterprise-grade, full-stack AI preparation and placement platform (inspired by **Skilldunia AI**) combining:
- **Master Placement Directory (1,024 Companies)** with interactive embedded Leaflet mini-maps, Google Maps directions, and salary breakdowns.
- **State-by-State Tech Corridor Map Radar** covering Tamil Nadu, Karnataka, Telangana, Maharashtra, NCR, Gujarat, Kerala, and West Bengal.
- **Unified Multi-Track Command Center**:
  1. Campus Placement Engine & Tech Puzzles Studio
  2. GATE CS 2027 Track with formula sheets and national AIR percentile simulator
  3. Seasonal Internship Pipeline with AI Tailored Cover Letter Generator
  4. Software Engineer 3-Month Intensive with 84-day activity heatmap
  5. Career Decision Support Matrix (M.Tech vs Industry Job)
  6. Competency Skill Tree with Cognitive Fatigue & Burnout Monitor
- **Free Preparation Resources Hub** with Aptitude tests, Core CS MCQs, and in-browser JavaScript Coding Runner.
- **Skilldunia-Inspired AI Voice Mock Interviewer** with 24-bar live audio waveform visualizer and rubric scoring.
- **Multi-Device Compatibility** (Mobile 320px, Tablet 768px, Desktop 1440px+) with Dark/Light theme switching and Multi-language support (English, Hindi, Tamil).

---

## 🏛️ System Architecture

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
\`\`\`bash
cd assistant_ai
npm install
\`\`\`

### 2. Environment Configuration
Copy the provided environment template:
\`\`\`bash
cp .env.example .env
\`\`\`
Edit `.env` to configure your port and security parameters:
\`\`\`ini
PORT=3000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=60000
MAX_REQUESTS_PER_WINDOW=120
CACHE_TTL_COMPANIES=180
\`\`\`

### 3. Launch Server
\`\`\`bash
node server.js
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing Suite

Run the full automated unit, integration, and E2E verification suite:
\`\`\`bash
node test_enterprise_suite.js
\`\`\`
**Coverage Overview:**
* **Unit Tests**: Input sanitization, token bucket rate limiter, cache TTL.
* **Integration Tests**: REST API endpoints (`/api/companies`, `/api/map/states`, `/api/prep/quizzes`).
* **E2E Puppeteer**: Desktop (1440x900) and Mobile (390x844) viewport rendering, multi-criteria sorting, role cycling, and 0 console errors.

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
Cycle roles dynamically by clicking the role badge in the top navigation bar.
