# 🏛️ Architecture Decision Records (ADR) — GT Study Mentor Pro

## ADR-001: Hybrid In-Memory & Client Caching Strategy
* **Status**: Accepted & Implemented
* **Context**: High traffic to company directories (1,024 companies) and geographic corridors could strain system resources and introduce latency.
* **Decision**: Implement a server-side in-memory cache middleware with a 180-second to 300-second TTL for read-only query endpoints (`/api/companies`, `/api/map/states`, `/api/stats/placement-insights`). Responses return `X-Cache: HIT` or `X-Cache: MISS`.
* **Consequences**: Sub-5ms response times on cached hits, drastic reduction in CPU utilization.

---

## ADR-002: Token Bucket Sliding Window API Rate Limiter
* **Status**: Accepted & Implemented
* **Context**: Prevention of denial-of-service, scraper attacks, and resource exhaustion on public endpoints.
* **Decision**: Implement an in-memory token bucket rate limiter tracking requests per IP within a 60-second sliding window.
* **Consequences**: Clients exceeding 120 req/min receive HTTP 429 Too Many Requests with standard `Retry-After` headers.

---

## ADR-003: Offline-First Queue with Real-time Auto-Sync
* **Status**: Accepted & Implemented
* **Context**: Students studying in intermittent network conditions (trains, libraries, offline devices) need seamless persistence.
* **Decision**: Store all state mutations in `localStorage` offline sync queue when `navigator.onLine === false`. When the browser detects an `online` event, the queue flushes automatically.
* **Consequences**: Zero data loss for candidate quiz answers, daily logs, and bookmarks.

---

## ADR-004: WCAG 2.1 AA Accessibility Standards & Atomic Design Tokens
* **Status**: Accepted & Implemented
* **Context**: Ensuring universal access for diverse learners, screen readers, and high-contrast viewports.
* **Decision**: Define CSS Custom Properties for spacing (`--space-1` through `--space-8`) and typography. Implement explicit `:focus-visible` outline rings and respect `prefers-reduced-motion: reduce`.
* **Consequences**: Flawless keyboard accessibility and screen-reader navigation.

---

## ADR-005: Role-Based Access Control (RBAC)
* **Status**: Accepted & Implemented
* **Context**: Platform caters to multiple user personas (Students, Faculty Mentors, Platform Admins).
* **Decision**: Implement a client-side permission matrix supporting `student`, `mentor`, and `admin` roles, dynamically adapting features and badges.
