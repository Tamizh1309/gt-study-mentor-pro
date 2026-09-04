// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro v3.0 — app_v2.js
// Navigation, Home Dashboard, View Renderers, Command Palette
// Transitional layer: valid functionality migrated, duplicates removed
// ══════════════════════════════════════════════════════════════

window.currentV2View = 'home';
window.currentV2Subtab = null;

// ── GLOBAL VIEW NAVIGATION (GT NeoDepth v3) ──
window.navigateToView = function (viewName, subtab) {
  window.currentV2View = viewName;
  window.currentV2Subtab = subtab || null;

  const viewMap = {
    'home': 'view-home', 'prepare': 'view-prepare', 'practice': 'view-practice',
    'career': 'view-career', 'progress': 'view-progress', 'cselabs': 'view-cselabs',
    'resources': 'view-resources', 'mentor': 'view-chat', 'chat': 'view-chat', 'settings': 'view-settings'
  };

  document.querySelectorAll('.view-panel').forEach(p => { p.classList.remove('active'); });
  document.querySelectorAll('.sidebar-nav-item').forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));

  const panelId = viewMap[viewName] || ('view-' + viewName);
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');

  const sidebarBtnMap = {
    'home': 'nav-home',
    'prepare': subtab === 'placement' ? 'nav-placement' : subtab === 'swe' ? 'nav-swe' : subtab === 'intern' ? 'nav-intern' : 'nav-prepare',
    'practice': subtab === 'dsa' ? 'nav-dsa' : subtab === 'gate-pyq' ? 'nav-pyq' : subtab === 'aptitude' ? 'nav-aptitude' : subtab === 'cs-core' ? 'nav-cs-core' : subtab === 'mock' ? 'nav-mock' : 'nav-dsa',
    'career': subtab === 'applications' ? 'nav-applications' : subtab === 'interviews' ? 'nav-interviews' : subtab === 'companies' ? 'nav-companies' : 'nav-opportunities',
    'progress': subtab === 'mastery' ? 'nav-mastery' : subtab === 'mistakes' ? 'nav-mistakes' : subtab === 'analytics' ? 'nav-analytics' : 'nav-readiness',
    'cselabs': 'nav-labs', 'resources': 'nav-resources', 'mentor': 'nav-mentor', 'chat': 'nav-mentor', 'settings': 'nav-settings'
  };
  const activeBtnId = sidebarBtnMap[viewName];
  if (activeBtnId) {
    const btn = document.getElementById(activeBtnId);
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-current', 'page'); }
  }

  const mobileMap = { 'home': 'mob-nav-home', 'prepare': 'mob-nav-prepare', 'practice': 'mob-nav-practice', 'progress': 'mob-nav-progress', 'mentor': 'mob-nav-mentor', 'chat': 'mob-nav-mentor' };
  const mobBtn = document.getElementById(mobileMap[viewName]);
  if (mobBtn) mobBtn.classList.add('active');

  const titles = { 'home': 'Home', 'prepare': 'Preparation Hub', 'practice': 'Practice Arena', 'career': 'Career Pipeline', 'progress': 'Progress & Analytics', 'cselabs': 'CSE Labs', 'resources': 'Resources', 'mentor': 'GT AI Mentor', 'chat': 'GT AI Mentor', 'settings': 'Settings' };
  const headerTitle = document.getElementById('main-header-title');
  if (headerTitle) headerTitle.textContent = titles[viewName] || viewName;

  try {
    if (viewName === 'home') renderHomeView();
    if (viewName === 'prepare') switchPrepTab(subtab || 'gate');
    if (viewName === 'practice') switchPracticeTab(subtab || 'dsa');
    if (viewName === 'career') switchCareerTab(subtab || 'opportunities');
    if (viewName === 'progress') switchProgressTab(subtab || 'readiness');
    if (viewName === 'cselabs') renderCSELabs();
    if (viewName === 'resources') renderResourcesLibrary();
    if (viewName === 'settings') renderSettingsView();
  } catch (e) { console.warn('[navigate] Renderer error:', viewName, e); }
};

window.renderHomeDashboard = function () { if (typeof renderHomeView === 'function') renderHomeView(); };


// ── SECTION 8: HOME DASHBOARD RENDERER ──
window.renderHomeDashboard = function () {
  if (typeof PrepIntelligenceEngine === 'undefined') return;
  const state = PrepIntelligenceEngine.getState();
  const nextAction = PrepIntelligenceEngine.getNextBestAction();

  // 1. Target & Completed time
  const completedLabel = document.getElementById('home-completed-time-label');
  if (completedLabel) {
    completedLabel.textContent = 'Completed: ' + PrepIntelligenceEngine.getCompletedTimeFormatted() + ' • Planned: ' + PrepIntelligenceEngine.getPlannedTimeFormatted();
  }

  // 2. Next Best Action
  const nextTitle = document.getElementById('home-next-action-title');
  const nextWhy = document.getElementById('home-next-action-why');
  if (nextTitle && nextAction) nextTitle.textContent = nextAction.action + ' (' + nextAction.subject + ')';
  if (nextWhy && nextAction) nextWhy.innerHTML = '<strong>WHY?</strong> ' + nextAction.why + ' <span style="color:var(--primary);">(' + (nextAction.track || 'Cross-Goal') + ')</span>';

  // 3. Today\'s Plan Tasks
  const tasksContainer = document.getElementById('home-today-tasks-container');
  if (tasksContainer) {
    tasksContainer.innerHTML = '';
    state.todayTasks.forEach(task => {
      const row = document.createElement('div');
      row.className = 'forge-task-item' + (task.completed ? ' completed' : '');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.padding = '10px 14px';
      row.style.background = task.completed ? 'rgba(74, 222, 128, 0.06)' : 'rgba(255, 255, 255, 0.03)';
      row.style.border = '1px solid ' + (task.completed ? 'rgba(74, 222, 128, 0.25)' : 'var(--border-subtle)');
      row.style.borderRadius = '8px';

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" ${task.completed ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;" onchange="toggleHomeTask('${task.id}')">
          <div>
            <div style="font-size:13px; font-weight:700; color:${task.completed ? 'var(--text-muted)' : '#fff'}; text-decoration:${task.completed ? 'line-through' : 'none'};">
              ${task.track} — ${task.subject}: ${task.topic}
            </div>
            <div style="font-size:11px; color:var(--text-muted);">
              ⏱️ ${task.estMinutes} min • ${task.highLeverageNote}
            </div>
          </div>
        </div>
        <button onclick="deleteHomeTask('${task.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:14px;">✕</button>
      `;
      tasksContainer.appendChild(row);
    });
  }

  // 4. Weak Areas List
  const weakContainer = document.getElementById('home-weak-areas-container');
  if (typeof renderWeeklyChart === 'function') renderWeeklyChart();
  if (weakContainer) {
    weakContainer.innerHTML = '';
    const weaks = PrepIntelligenceEngine.getWeakTopics();
    weaks.forEach(w => {
      const card = document.createElement('div');
      card.className = 'mistake-card';
      card.style.borderLeftColor = w.accuracy < 50 ? 'var(--danger)' : 'var(--warning)';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#fff; font-size:13px;">${w.subject}: ${w.topic}</strong>
          <span class="score-pill ${w.accuracy < 50 ? 'low' : 'med'}">${w.accuracy}% Accuracy</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
          ${w.reason}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span style="font-size:10px; color:var(--primary); font-weight:700;">Target: ${w.track}</span>
          <button class="action-btn" onclick="navigateToView('practice', 'pyq')" style="font-size:10px; padding:3px 8px;">Practice Now →</button>
        </div>
      `;
      weakContainer.appendChild(card);
    });
  }
};

window.toggleHomeTask = function (taskId) {
  if (typeof PrepIntelligenceEngine !== 'undefined') {
    PrepIntelligenceEngine.toggleTask(taskId);
    renderHomeDashboard();
  }
};

window.deleteHomeTask = function (taskId) {
  if (typeof PrepIntelligenceEngine !== 'undefined') {
    PrepIntelligenceEngine.deleteTask(taskId);
    renderHomeDashboard();
  }
};

window.addHomePlanTask = function () {
  const input = document.getElementById('home-custom-task-input');
  const trackSel = document.getElementById('home-custom-task-track');
  if (!input || !input.value.trim()) return;
  PrepIntelligenceEngine.addTask(trackSel.value, 'Custom Focus', input.value.trim(), 45);
  input.value = '';
  renderHomeDashboard();
};

window.startTodayPlan = function () {
  const next = PrepIntelligenceEngine.getNextBestAction();
  alert("🚀 Starting Today's Plan!\n\nNext Priority: ' + next.action + 'nFocus: ' + next.subject + 'nnOpening Pomodoro focus session...");
  if (typeof openPomodoroModal === 'function') openPomodoroModal();
};

// ── FSRS Spaced Repetition Interactions on Home ──
window.toggleHomeFSRS = function () {
  const sol = document.getElementById('home-fsrs-solution');
  const btn = document.getElementById('home-fsrs-toggle-btn');
  const row = document.getElementById('home-fsrs-actions-row');
  if (sol && row) {
    sol.style.display = 'block';
    row.style.display = 'flex';
    if (btn) btn.style.display = 'none';
  }
};

window.rateHomeFSRS = function (rating) {
  if (typeof MistakeBookModule !== 'undefined') {
    MistakeBookModule.rateFSRSCard('fsrs-1', rating);
  }
  const pill = document.getElementById('home-fsrs-status-pill');
  if (pill) {
    pill.textContent = 'Reviewed (' + rating + ')';
    pill.style.color = 'var(--success)';
  }
  const sol = document.getElementById('home-fsrs-solution');
  const row = document.getElementById('home-fsrs-actions-row');
  const btn = document.getElementById('home-fsrs-toggle-btn');
  if (sol) sol.style.display = 'none';
  if (row) row.style.display = 'none';
  if (btn) {
    btn.style.display = 'block';
    btn.textContent = 'Card Completed Today ✅';
    btn.disabled = true;
  }
};

// ── PREPARE HUB TAB SWITCHER ──
window.switchPrepareTab = function (tab) {
  const tabs = ['gate', 'placement', 'swe', 'internship'];
  tabs.forEach(t => {
    const el = document.getElementById('subview-prep-' + t);
    const btn = document.getElementById('btn-preptab-' + t);
    if (el) el.style.display = (t === tab ? 'block' : 'none');
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'gate') renderGATEPrepare();
  if (tab === 'placement') renderPlacementPrepare();
  if (tab === 'swe') renderSWEPrepare();
  if (tab === 'internship') renderInternshipPrepare();
};

function renderGATEPrepare() {
  const container = document.getElementById('prepare-gate-subjects-list');
  if (!container) return;
  const subjects = [
    { name: 'Operating Systems', progress: 84, accuracy: 64, pyqs: 48, weak: 'Deadlocks', next: 'Banker\'s Algorithm' },
    { name: 'Data Structures & Algorithms', progress: 92, accuracy: 78, pyqs: 86, weak: 'DP Trees', next: 'Segment Trees' },
    { name: 'Database Management Systems', progress: 76, accuracy: 72, pyqs: 39, weak: 'Conflict Serializability', next: 'B+ Tree Splitting' },
    { name: 'Computer Networks', progress: 70, accuracy: 69, pyqs: 42, weak: 'TCP Flow Control', next: 'CIDR Subnetting' },
    { name: 'Theory of Computation', progress: 88, accuracy: 81, pyqs: 54, weak: 'Pumping Lemma', next: 'Turing Machines' },
    { name: 'Compiler Design', progress: 65, accuracy: 70, pyqs: 31, weak: 'LR Parsing', next: 'Syntax Directed Translation' },
    { name: 'Computer Organization & Arch', progress: 68, accuracy: 62, pyqs: 37, weak: 'Cache Mapping', next: 'Pipelining Hazards' },
    { name: 'Digital Logic', progress: 85, accuracy: 86, pyqs: 45, weak: 'Floating Point', next: 'K-Maps Minimization' },
    { name: 'Engineering Mathematics', progress: 80, accuracy: 74, pyqs: 60, weak: 'Eigenvalues', next: 'Probability & Calculus' },
    { name: 'Discrete Mathematics', progress: 75, accuracy: 68, pyqs: 52, weak: 'Generating Functions', next: 'Graph Isomorphism' },
    { name: 'Programming in C', progress: 95, accuracy: 90, pyqs: 65, weak: 'Pointers to Functions', next: 'Recursion Trees' },
    { name: 'General Aptitude', progress: 90, accuracy: 84, pyqs: 70, weak: 'Spatial Aptitude', next: 'Data Interpretation' }
  ];

  container.innerHTML = '';
  subjects.forEach(s => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.style.padding = '14px';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#fff; font-size:14px;">${s.name}</strong>
        <span class="score-pill ${s.accuracy >= 75 ? 'high' : s.accuracy >= 65 ? 'med' : 'low'}">${s.accuracy}% Acc</span>
      </div>
      <div style="margin:10px 0 6px;">
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
          <span>Syllabus Covered</span><span>${s.progress}%</span>
        </div>
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-top:3px;">
          <div style="width:${s.progress}%; height:100%; background:var(--primary);"></div>
        </div>
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">
        Solved: <strong style="color:#fff;">${s.pyqs} PYQs</strong> • Weak: <span style="color:var(--danger);">${s.weak}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid var(--border-subtle);">
        <span style="font-size:10px; color:var(--warning);">Next: ${s.next}</span>
        <button class="action-btn" onclick="navigateToView('practice', 'pyq')" style="font-size:10px; padding:3px 8px;">PYQs →</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderPlacementPrepare() {
  const container = document.getElementById('prepare-placement-sections-list');
  if (!container) return;
  container.innerHTML = `
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 10px;">📊 Quantitative Aptitude (12 Core Topics)</h3>
      <p style="font-size:12px; color:var(--text-muted);">Number Systems, Percentages, Profit &amp; Loss, Ratio &amp; Proportion, Time &amp; Work, Time-Speed-Distance, Permutation &amp; Combination, Probability, Geometry, Mixtures, Simple/Compound Interest, Data Interpretation.</p>
      <div style="margin-top:12px;"><button class="action-btn" onclick="navigateToView('practice', 'aptitude')">Practice Aptitude Drills →</button></div>
    </div>
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 10px;">🧠 Logical Reasoning (9 Core Topics)</h3>
      <p style="font-size:12px; color:var(--text-muted);">Blood Relations, Direction Sense, Coding-Decoding, Syllogisms, Seating Arrangements, Clocks &amp; Calendars, Data Sufficiency, Series &amp; Analogy, Puzzles.</p>
      <div style="margin-top:12px;"><button class="action-btn" onclick="openModal('puzzle-lab-modal')">Solve Logic Puzzles →</button></div>
    </div>
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 10px;">⭐ Behavioral &amp; STAR HR Studio</h3>
      <p style="font-size:12px; color:var(--text-muted);">Structured frameworks for Situation, Task, Action, Result. Master "Tell me about yourself", leadership under conflict, project setbacks, and salary expectations.</p>
      <div style="margin-top:12px;"><button class="action-btn" onclick="openModal('star-studio-modal')">Open STAR Studio →</button></div>
    </div>
  `;
}

function renderSWEPrepare() {
  const container = document.getElementById('prepare-swe-sections-list');
  if (!container) return;
  container.innerHTML = `
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 8px;">💻 Striver A2Z 17 DSA Patterns</h3>
      <p style="font-size:12px; color:var(--text-muted);">Two Pointers, Sliding Window, Fast/Slow Pointers, Merge Intervals, Cyclic Sort, In-place Reversal, BFS, DFS, Two Heaps, Subsets, Modified Binary Search, Top K Elements, K-way Merge, 0/1 Knapsack, Topological Sort.</p>
      <button class="action-btn" onclick="navigateToView('practice', 'dsa')" style="margin-top:10px;">Launch DSA Tracker →</button>
    </div>
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 8px;">🛠️ REST APIs, Databases &amp; System Design</h3>
      <p style="font-size:12px; color:var(--text-muted);">HTTP Methods, Status Codes, JWT Authentication, Indexing, Normalization, Sharding, Redis Caching, Load Balancing, Horizontal Scaling.</p>
      <button class="action-btn" onclick="openModal('sysdesign-modal')" style="margin-top:10px;">Launch System Design Studio →</button>
    </div>
  `;
}

function renderInternshipPrepare() {
  const container = document.getElementById('prepare-internship-sections-list');
  if (!container) return;
  container.innerHTML = `
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 8px;">📬 Internship Pipeline Tracker</h3>
      <p style="font-size:12px; color:var(--text-muted);">Active Applications: 8 • Online Assessments: 2 • Technical Interviews: 1 • Offers: 0</p>
      <button class="action-btn" onclick="navigateToView('career', 'apps')" style="margin-top:10px;">View Applications Pipeline →</button>
    </div>
    <div class="track-card">
      <h3 style="color:#fff; margin:0 0 8px;">📄 Resume Readiness</h3>
      <div style="font-size:2rem; font-weight:900; color:var(--primary); font-family:var(--font-display);">84 / 100</div>
      <p style="font-size:11px; color:var(--text-muted); margin:4px 0 10px;">Transparent heuristic ATS score. 3 high-impact verbs detected, GitHub links verified.</p>
      <button class="action-btn" onclick="navigateToView('career', 'resume')">Check Checklist →</button>
    </div>
  `;
}

// ── PROGRESS HUB TAB SWITCHER ──
window.switchProgressTab = function (tab) {
  document.querySelectorAll('#view-progress .tab-pill').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const btn = document.getElementById('progtab-' + tab);
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }

  const container = document.getElementById('progress-content-area');
  if (!container) return;

  if (tab === 'readiness') {
    const state = (typeof PrepIntelligenceEngine !== 'undefined') ? PrepIntelligenceEngine.getState() : null;
    const scores = state ? state.readinessScores : {
      gate: { score: 75, syllabusCoverage: 82, pyqAccuracy: 71, revision: 79, mocks: 68, weakAreas: 64 },
      placement: { score: 78, dsa: 82, csCore: 79, aptitude: 84, projects: 85, interviews: 68 },
      swe: { score: 80, programming: 88, projectDepth: 85, git: 80, testing: 72, deployment: 70, systemDesign: 68 },
      internship: { score: 74, skills: 82, projects: 85, resume: 84, applications: 75, interviewReadiness: 66 }
    };

    const tracks = [
      {
        name: 'GATE 2027',
        score: scores.gate.score || 75,
        color: 'var(--gate-color)',
        factors: [
          { label: 'Syllabus Coverage', val: scores.gate.syllabusCoverage || 82 },
          { label: 'PYQ Accuracy', val: scores.gate.pyqAccuracy || 71 },
          { label: 'Revision Pace', val: scores.gate.revision || 79 },
          { label: 'Mock Test Average', val: scores.gate.mocks || 68 },
          { label: 'Weak Area Remediation', val: scores.gate.weakAreas || 64 }
        ],
        explanation: 'Readiness indicates preparation completeness across the GATE syllabus. Not an All India Rank (AIR) claim.'
      },
      {
        name: 'Placements',
        score: scores.placement.score || 78,
        color: 'var(--placement-color)',
        factors: [
          { label: 'DSA Problem Solving', val: scores.placement.dsa || 82 },
          { label: 'CS Core (OS/DBMS/CN)', val: scores.placement.csCore || 79 },
          { label: 'Aptitude & Reasoning', val: scores.placement.aptitude || 84 },
          { label: 'Project Depth', val: scores.placement.projects || 85 },
          { label: 'Technical Interviews', val: scores.placement.interviews || 68 }
        ],
        explanation: 'Evaluates readiness across campus hiring rounds. Not a selection probability.'
      },
      {
        name: 'Software Engineering',
        score: scores.swe.score || 80,
        color: 'var(--swe-color)',
        factors: [
          { label: 'Programming Fluency', val: scores.swe.programming || 88 },
          { label: 'Project Architecture Depth', val: scores.swe.projectDepth || 85 },
          { label: 'Git & Version Control', val: scores.swe.git || 80 },
          { label: 'Testing (Unit & Integration)', val: scores.swe.testing || 72 },
          { label: 'Deployment & CI/CD', val: scores.swe.deployment || 70 },
          { label: 'System Design (HLD/LLD)', val: scores.swe.systemDesign || 68 }
        ],
        explanation: 'Tracks practical developer engineering capabilities required for software engineering roles.'
      },
      {
        name: 'Internships',
        score: scores.internship.score || 74,
        color: 'var(--intern-color)',
        factors: [
          { label: 'Core Skills Alignment', val: scores.internship.skills || 82 },
          { label: 'Portfolio Projects', val: scores.internship.projects || 85 },
          { label: 'ATS Resume Strength', val: scores.internship.resume || 84 },
          { label: 'Applications Velocity', val: scores.internship.applications || 75 },
          { label: 'Interview Preparedness', val: scores.internship.interviewReadiness || 66 }
        ],
        explanation: 'Reflects preparation status for competitive tech internship cycles.'
      }
    ];

    container.innerHTML = `
      <div style="margin-bottom:14px;font-size:13px;color:var(--text-sub);">
        <strong>Readiness is not a probability.</strong> Each score is transparently calculated from its concrete preparation factors below.
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
        ${tracks.map(t => `
          <div class="nd-card" style="padding:20px;border-top:3px solid ${t.color};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="font-size:15px;font-weight:800;color:${t.color};">${t.name}</span>
              <span style="font-size:22px;font-weight:900;font-family:var(--font-display);color:var(--text);">${t.score}%</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
              ${t.factors.map(f => `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
                    <span style="color:var(--text-sub);">${f.label}</span>
                    <span style="font-weight:700;color:var(--text);">${f.val}%</span>
                  </div>
                  <div style="background:var(--depth-4);border-radius:2px;height:4px;overflow:hidden;">
                    <div style="height:100%;background:${t.color};width:${f.val}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="font-size:10px;color:var(--text-muted);line-height:1.4;border-top:1px solid var(--border-subtle);padding-top:10px;">
              ${t.explanation}
            </div>
          </div>
        `).join('')}
      </div>`;
  } else if (tab === 'mastery') {
    if (typeof PrepIntelligenceEngine !== 'undefined') {
      const matrix = PrepIntelligenceEngine.getCompetencyMatrix();
      container.innerHTML = `
        <div class="nd-card" style="padding:20px;overflow-x:auto;">
          <div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:14px;">Multi-Track Competency Matrix</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-subtle);text-align:left;">
                <th style="padding:8px 12px;color:var(--text-muted);">Skill Area</th>
                <th style="padding:8px;color:var(--gate-color);text-align:center;">GATE</th>
                <th style="padding:8px;color:var(--placement-color);text-align:center;">Placement</th>
                <th style="padding:8px;color:var(--swe-color);text-align:center;">SWE</th>
                <th style="padding:8px;color:var(--intern-color);text-align:center;">Intern</th>
              </tr>
            </thead>
            <tbody>
              ${matrix.map(row => `
                <tr style="border-bottom:1px solid var(--border-subtle);">
                  <td style="padding:10px 12px;color:var(--text);font-weight:${row.highLeverage?'700':'400'};">
                    ${row.highLeverage ? '? ' : ''}${row.skill}
                  </td>
                  ${['gate','placement','swe','intern'].map(k => `
                    <td style="padding:8px;text-align:center;font-weight:700;color:${row[k]>=80?'var(--success)':row[k]>=65?'var(--warning)':row[k]?'var(--danger)':'var(--text-muted)'};">
                      ${row[k] != null ? row[k] + '%' : '?'}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    }
  } else if (tab === 'analytics') {
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
        <div class="nd-card" style="padding:20px;">
          <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px;">?? Weekly Accuracy Trends</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                <span>DSA Problem Solving</span>
                <span style="color:var(--success);font-weight:700;">82% (+4%)</span>
              </div>
              <div style="background:var(--depth-4);border-radius:2px;height:5px;"><div style="background:var(--success);height:100%;width:82%;"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                <span>GATE CS Core PYQ</span>
                <span style="color:var(--primary-light);font-weight:700;">71% (+6%)</span>
              </div>
              <div style="background:var(--depth-4);border-radius:2px;height:5px;"><div style="background:var(--primary);height:100%;width:71%;"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                <span>General Aptitude</span>
                <span style="color:var(--accent);font-weight:700;">84% (Steady)</span>
              </div>
              <div style="background:var(--depth-4);border-radius:2px;height:5px;"><div style="background:var(--accent);height:100%;width:84%;"></div></div>
            </div>
          </div>
        </div>
        <div class="nd-card" style="padding:20px;">
          <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:12px;">?? Focus Time Breakdown</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-sub);">Deep Focus Time:</span>
              <span style="font-weight:700;color:var(--text);">24.5 hrs this week</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-sub);">Tasks Completed:</span>
              <span style="font-weight:700;color:var(--success);">38 / 44 (86%)</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-sub);">Current Streak:</span>
              <span style="font-weight:700;color:var(--warning);">14 Days Active</span>
            </div>
          </div>
        </div>
      </div>`;
  } else if (tab === 'mistakes') {
    if (typeof MistakeBookModule !== 'undefined') {
      const mistakes = MistakeBookModule.getMistakes();
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:var(--text);">Mistake Book</div>
            <div style="font-size:12px;color:var(--text-sub);">Wrong answer &rarr; Category &rarr; Correction &rarr; Smart Revision &rarr; Reattempt &rarr; Mastered</div>
          </div>
          <button onclick="promptAddMistake()" class="submit-btn" style="padding:6px 14px;font-size:12px;">+ Record Mistake</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${mistakes.map(m => `
            <div class="nd-card" style="padding:16px;border-left:4px solid ${m.resolved ? 'var(--success)' : 'var(--danger)'};">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
                <div style="font-size:13px;font-weight:700;color:var(--text);">${m.question}</div>
                <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:rgba(239,68,68,0.12);color:var(--danger);font-weight:700;white-space:nowrap;">
                  ${m.mistakeType}
                </span>
              </div>
              <div style="font-size:12px;color:var(--danger);margin-bottom:4px;">? Your Answer: ${m.userWrongAnswer}</div>
              <div style="font-size:12px;color:var(--success);margin-bottom:8px;">? Correct: ${m.correctAnswer}</div>
              <div style="font-size:11px;color:var(--text-muted);line-height:1.5;">?? ${m.concept}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;border-top:1px solid var(--border-subtle);padding-top:10px;">
                <span style="font-size:11px;color:var(--primary-light);font-weight:700;">Stage: ${m.stage || (m.resolved ? 'Mastered' : 'Smart Revision')}</span>
                <div style="display:flex;gap:6px;">
                  ${!m.resolved ? `
                    <button onclick="MistakeBookModule.reattemptMistake('${m.id}', '', true);switchProgressTab('mistakes');" class="action-btn" style="font-size:11px;padding:4px 10px;color:var(--success);">
                      Reattempt (Passed)
                    </button>
                    <button onclick="MistakeBookModule.resolveMistake('${m.id}');switchProgressTab('mistakes');" class="action-btn" style="font-size:11px;padding:4px 10px;">
                      Mark Mastered
                    </button>
                  ` : '<span style="font-size:11px;color:var(--success);font-weight:700;">? Mastered</span>'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>`;
    }
  } else if (tab === 'smart-revision') {
    if (typeof MistakeBookModule !== 'undefined') {
      const cards = MistakeBookModule.getAllSmartRevisionCards();
      const dueCards = MistakeBookModule.getDueSmartRevisionCards();
      container.innerHTML = `
        <div style="margin-bottom:16px;">
          <div style="font-size:16px;font-weight:800;color:var(--text);">Smart Revision</div>
          <div style="font-size:12px;color:var(--primary-light);margin-top:2px;">Powered by spaced repetition</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:16px;">
          <div style="padding:14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <div style="font-size:11px;color:var(--text-muted);font-weight:700;">DUE FOR REVISION</div>
            <div style="font-size:24px;font-weight:900;color:var(--warning);margin-top:4px;">${dueCards.length} Cards</div>
          </div>
          <div style="padding:14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <div style="font-size:11px;color:var(--text-muted);font-weight:700;">TOTAL SOLIDIFIED</div>
            <div style="font-size:24px;font-weight:900;color:var(--success);margin-top:4px;">${cards.filter(c => c.status === 'Mastered').length} Cards</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${cards.map(card => `
            <div class="nd-card" style="padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <div style="font-size:14px;font-weight:800;color:var(--text);">${card.question}</div>
                <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:rgba(91,91,214,0.15);color:var(--primary-light);font-weight:700;">${card.status || 'Active'}</span>
              </div>
              <div style="font-size:12px;color:var(--text-sub);line-height:1.5;margin-bottom:12px;">${card.answer}</div>
              <div style="display:flex;gap:6px;border-top:1px solid var(--border-subtle);padding-top:10px;">
                <button onclick="MistakeBookModule.rateSmartRevisionCard('${card.id}','Again');switchProgressTab('smart-revision');" class="action-btn" style="font-size:11px;padding:4px 10px;color:var(--danger);">Needs Revision</button>
                <button onclick="MistakeBookModule.rateSmartRevisionCard('${card.id}','Good');switchProgressTab('smart-revision');" class="action-btn" style="font-size:11px;padding:4px 10px;color:var(--primary-light);">Good</button>
                <button onclick="MistakeBookModule.rateSmartRevisionCard('${card.id}','Easy');switchProgressTab('smart-revision');" class="action-btn" style="font-size:11px;padding:4px 10px;color:var(--success);">Mastered</button>
              </div>
            </div>
          `).join('')}
        </div>`;
    }
  }
};

window.renderCSELabs = function () {
  const grid = document.getElementById('cselabs-grid');
  if (!grid) return;
  const labs = [
    { icon:'\uD83C\uDF00', title:'Algorithm Visualizer', desc:'BFS, DFS, Dijkstra, DP step-by-step', modal:'algo-visualizer-modal' },
    { icon:'\uD83D\uDDC3\uFE0F', title:'SQL Playground', desc:'Write and execute SQL queries', modal:'sql-playground-modal' },
    { icon:'\uD83E\uDDE0', title:'TOC Validator', desc:'DFA/NFA/CFG/Regex validator', modal:'toc-regex-modal' },
    { icon:'\uD83C\uDF10', title:'Network / CIDR Lab', desc:'Subnetting, IP calculator', modal:'cidr-subnet-modal' },
    { icon:'\uD83C\uDFD7\uFE0F', title:'System Design Lab', desc:'HLD diagrams and patterns', modal:'system-architecture-modal' },
    { icon:'\uD83E\uDDEE', title:'GATE Calculator', desc:'Virtual scientific calculator', modal:'calculator-modal' },
    { icon:'\u2601\uFE0F', title:'Mind Map', desc:'Visual topic mapping', modal:'mindmap-modal' },
    { icon:'\uD83D\uDCF8', title:'Carbon Code Shots', desc:'Beautiful code screenshots', modal:'carbon-code-modal' },
    { icon:'\uD83C\uDFAF', title:'AI Insights', desc:'Performance insights from AI', modal:'ai-engine-modal' }
  ];
  grid.innerHTML = labs.map(l => `
    <div class="nd-card nd-card-lift" style="padding:20px;cursor:pointer;text-align:center;" onclick="openModal('${l.modal}')">
      <div style="font-size:32px;margin-bottom:10px;">${l.icon}</div>
      <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:4px;">${l.title}</div>
      <div style="font-size:11px;color:var(--text-muted);">${l.desc}</div>
    </div>`).join('');
};

// ── RESOURCES LIBRARY ──
window.renderResourcesLibrary = function () {
  const container = document.getElementById('resources-content');
  if (!container) return;
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
      ${[
        { title:'GATE Syllabus 2027', type:'PDF', color:'var(--gate-color)', action:"window.open('https://gate.iitb.ac.in','_blank')" },
        { title:'Striver A2Z DSA Sheet', type:'Sheet', color:'var(--swe-color)', action:"window.open('https://takeuforward.org/strivers-a2z-dsa-course','_blank')" },
        { title:'NPTEL CS Lectures', type:'Video', color:'var(--accent)', action:"window.open('https://nptel.ac.in','_blank')" },
        { title:'Previous Year Papers', type:'PDF', color:'var(--primary)', action:"openModal('gate-history-modal')" },
        { title:'Weightage Analysis', type:'Chart', color:'var(--placement-color)', action:"openModal('weightage-heatmap-modal')" },
        { title:'Formula Vault', type:'Sheet', color:'var(--success)', action:"openModal('formula-vault-modal')" }
      ].map(r => `
        <div class="nd-card" style="padding:16px;cursor:pointer;" onclick="${r.action}">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,0,0,0.2);border:1px solid ${r.color};display:flex;align-items:center;justify-content:center;font-size:16px;">\uD83D\uDCCE</div>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);">${r.title}</div>
              <div style="font-size:10px;color:${r.color};font-weight:700;">${r.type}</div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
};

// ── SETTINGS VIEW ──
window.renderSettingsView = function () {
  const container = document.getElementById('settings-content-area');
  if (!container) return;
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem('gt_mentor_profile') || '{}'); } catch(e) {}
  container.innerHTML = `
    <div style="max-width:600px;display:flex;flex-direction:column;gap:16px;">
      <div class="nd-card" style="padding:20px;">
        <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;">\uD83D\uDC64 Student Profile</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[['name','Full Name','Tamizharasan E'],['college','College','KGISL Institute of Technology'],['year','Academic Year','4th Year B.E. CS'],['targetDate','Target GATE Date','2027-02-01']].map(([k,l,ph])=>`
            <div>
              <label for="set-${k}" style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">${l}</label>
              <input id="set-${k}" type="${k==='targetDate'?'date':'text'}" value="${profile[k]||''}" placeholder="${ph}"
                style="width:100%;padding:8px 12px;background:var(--depth-3);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text);font-size:13px;"
                onchange="saveProfileField('${k}',this.value)" />
            </div>`).join('')}
        </div>
      </div>
      <div class="nd-card" style="padding:20px;">
        <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;">\uD83C\uDFA8 Appearance</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:var(--text-sub);">Light Mode</span>
            <button onclick="document.body.classList.toggle('light-theme');localStorage.setItem('gt_theme',document.body.classList.contains('light-theme')?'light':'dark')" style="padding:6px 16px;background:var(--surface-mid);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text);font-size:12px;cursor:pointer;">Toggle</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:var(--text-sub);">Font Size</span>
            <div style="display:flex;gap:6px;">
              ${['Small','Medium','Large'].map(s=>`<button onclick="setFontSize&&setFontSize('${s.toLowerCase()}')" style="padding:5px 12px;background:var(--surface);border:1px solid var(--border-subtle);border-radius:5px;color:var(--text-muted);font-size:11px;cursor:pointer;">${s}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="nd-card" style="padding:20px;">
        <div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:14px;">\uD83D\uDCBE Data Management</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button onclick="openModal('backup-restore-modal')" style="padding:8px 16px;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.28);border-radius:var(--radius-sm);color:var(--accent);font-size:12px;font-weight:700;cursor:pointer;">\uD83D\uDCE6 Backup &amp; Restore</button>
          <button onclick="if(confirm('Reset ALL data? This cannot be undone.'))PrepIntelligenceEngine&&PrepIntelligenceEngine.resetToDefaults()" style="padding:8px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);border-radius:var(--radius-sm);color:var(--danger);font-size:12px;font-weight:700;cursor:pointer;">\u26A0;\uFE0F Reset All Data</button>
        </div>
      </div>
    </div>`;
};

window.saveProfileField = function (key, value) {
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem('gt_mentor_profile') || '{}'); } catch(e) {}
  profile[key] = value;
  localStorage.setItem('gt_mentor_profile', JSON.stringify(profile));
  // Update sidebar name
  if (key === 'name') {
    const nameEl = document.getElementById('home-name');
    if (nameEl) nameEl.textContent = value.split(' ')[0];
    const sidebarName = document.querySelector('.sidebar-user-name');
    if (sidebarName) sidebarName.textContent = value;
    const avatarEl = document.querySelector('.sidebar-avatar');
    if (avatarEl) avatarEl.textContent = value.charAt(0).toUpperCase();
  }
};

// ── COMMAND PALETTE ──
window.CommandPalette = (function () {
  const COMMANDS = [
    { id: 'today-plan', label: "Start Today's Plan", sub: 'Focus on your Next Best Action now', icon: '\uD83D\uDE80', kbd: 'Alt+T', action: () => { window.FocusSession && FocusSession.startNBA(); } },
    { id: 'ask-mentor', label: 'Ask GT AI Mentor', sub: 'Open the AI chat with your context', icon: '\uD83E\uDD16', kbd: 'Alt+A', action: () => { navigateToView('mentor'); } },
    { id: 'mistake-book', label: 'Open Mistake Book', sub: 'Review your recorded mistakes', icon: '\uD83D\uDCD4', kbd: 'Alt+M', action: () => { navigateToView('progress','mistakes'); } },
    { id: 'smart-revision', label: 'Start Smart Revision', sub: 'FSRS-powered spaced repetition cards', icon: '\uD83D\uDD04', kbd: 'Alt+R', action: () => { openModal('flashcard-modal'); } },
    { id: 'practice-dsa', label: 'Practice DSA', sub: 'Open DSA Tracker', icon: '\uD83E\uDDE9', kbd: 'Alt+D', action: () => { navigateToView('practice','dsa'); } },
    { id: 'practice-gate', label: 'Practice GATE PYQ', sub: 'GATE exam mode with virtual calculator', icon: '\u26A1', kbd: 'Alt+G', action: () => { openModal('gate-exam-modal'); } },
    { id: 'sql-lab', label: 'Open SQL Lab', sub: 'Write and execute SQL queries', icon: '\uD83D\uDDC3\uFE0F', kbd: 'Alt+S', action: () => { openModal('sql-playground-modal'); } },
    { id: 'find-company', label: 'Find Company', sub: 'Browse the opportunity board', icon: '\uD83C\uDFE2', kbd: 'Alt+C', action: () => { navigateToView('career','companies'); } },
    { id: 'add-application', label: 'Add Application', sub: 'Track a new job application', icon: '\uD83D\uDCE8', kbd: 'Alt+P', action: () => { navigateToView('career','applications'); } },
    { id: 'open-resume', label: 'Open Resume Optimizer', sub: 'ATS checker and optimization', icon: '\uD83D\uDCC4', kbd: 'Alt+V', action: () => { openModal('resume-ats-modal'); } },
    { id: 'pomodoro', label: 'Start Pomodoro', sub: '25-minute focus timer', icon: '\u23F1\uFE0F', kbd: 'Alt+O', action: () => { openModal('pomodoro-modal'); } },
    { id: 'gate-predictor', label: 'GATE Rank Predictor', sub: 'Estimate your rank (not guaranteed)', icon: '\uD83C\uDFC6', kbd: '', action: () => { openModal('gate-predictor-modal'); } }
  ];

  let filtered = [...COMMANDS];
  let highlighted = 0;
  let isOpen = false;

  function render(list) {
    const el = document.getElementById('command-list');
    if (!el) return;
    el.innerHTML = list.map((cmd, i) => `
      <div class="command-item ${i===highlighted?'highlighted':''}" role="option" aria-selected="${i===highlighted}" onclick="CommandPalette.run('${cmd.id}')"
        onmouseover="CommandPalette.highlight(${i})">
        <span class="command-item-icon" aria-hidden="true">${cmd.icon}</span>
        <div class="command-item-text">
          <div class="command-item-label">${cmd.label}</div>
          <div class="command-item-sub">${cmd.sub}</div>
        </div>
        ${cmd.kbd ? `<span class="command-item-kbd">${cmd.kbd}</span>` : ''}
      </div>`).join('');
  }

  return {
    open: function () {
      const overlay = document.getElementById('command-palette-overlay');
      if (overlay) { overlay.classList.add('active'); }
      const input = document.getElementById('command-palette-input');
      if (input) { input.value = ''; input.focus(); }
      filtered = [...COMMANDS];
      highlighted = 0;
      render(filtered);
      isOpen = true;
    },
    close: function () {
      const overlay = document.getElementById('command-palette-overlay');
      if (overlay) overlay.classList.remove('active');
      isOpen = false;
    },
    filter: function (query) {
      const q = (query || '').toLowerCase();
      filtered = q ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q)) : [...COMMANDS];
      highlighted = 0;
      render(filtered);
    },
    highlight: function (idx) {
      highlighted = idx;
      render(filtered);
    },
    keyNav: function (e) {
      if (e.key === 'Escape') { this.close(); return; }
      if (e.key === 'ArrowDown') { highlighted = Math.min(highlighted+1, filtered.length-1); render(filtered); e.preventDefault(); }
      if (e.key === 'ArrowUp') { highlighted = Math.max(highlighted-1, 0); render(filtered); e.preventDefault(); }
      if (e.key === 'Enter' && filtered[highlighted]) { this.run(filtered[highlighted].id); }
    },
    run: function (id) {
      const cmd = COMMANDS.find(c => c.id === id);
      if (cmd) { this.close(); cmd.action(); }
    }
  };
})();

// Register Ctrl+K / Cmd+K
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    window.CommandPalette && CommandPalette.open();
  }
  if (e.key === 'Escape') {
    window.CommandPalette && CommandPalette.close();
    // Also close topmost modal
    const openModals = document.querySelectorAll('.modal-overlay[style*="flex"]');
    if (openModals.length > 0) {
      const topModal = openModals[openModals.length - 1];
      if (typeof closeModal === 'function' && topModal.id) closeModal(topModal.id);
    }
  }
});

// ── DAILY SHUTDOWN REVIEW ──
window.generateShutdownReview = function () {
  const today = new Date();
  const dateEl = document.getElementById('shutdown-date');
  if (dateEl) dateEl.textContent = today.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

  let focusStats = { sessionsCount: 0, totalMinutes: 0, easyCount: 0, hardCount: 0, accuracy: 0 };
  if (window.FocusSession) focusStats = FocusSession.getTodayStats();

  let completedTasks = 0, totalTasks = 0;
  if (typeof PrepIntelligenceEngine !== 'undefined') {
    const state = PrepIntelligenceEngine.getState();
    completedTasks = state.todayTasks.filter(t=>t.completed).length;
    totalTasks = state.todayTasks.length;
  }

  const statsGrid = document.getElementById('shutdown-stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = [
      { value: focusStats.totalMinutes + 'm', label: 'Focus Time' },
      { value: completedTasks + '/' + totalTasks, label: 'Tasks Done' },
      { value: focusStats.accuracy + '%', label: 'Easy/Good Rate' },
      { value: focusStats.hardCount, label: 'Needs Revision' }
    ].map(s => `
      <div class="shutdown-stat">
        <div class="shutdown-stat-value">${s.value}</div>
        <div class="shutdown-stat-label">${s.label}</div>
      </div>`).join('');
  }

  const highlights = document.getElementById('shutdown-highlights');
  if (highlights) {
    const win = completedTasks > 0 ? `Completed ${completedTasks} task(s) today!` : 'Showed up and stayed consistent.';
    const weak = focusStats.hardCount > 0 ? `${focusStats.hardCount} topic(s) marked as hard — added to Smart Revision queue.` : 'No major weak areas flagged today.';
    highlights.innerHTML = `
      <div class="shutdown-highlight win"><strong>\uD83C\uDF1F Biggest Win:</strong> ${win}</div>
      <div class="shutdown-highlight weak"><strong>\uD83D\uDCDA Focus for Tomorrow:</strong> ${weak}</div>`;
  }

  const nba = typeof PrepIntelligenceEngine !== 'undefined' ? PrepIntelligenceEngine.getNextBestAction() : null;
  const tomorrowEl = document.getElementById('shutdown-tomorrow');
  if (tomorrowEl && nba) tomorrowEl.textContent = nba.action + ' \u2014 ' + nba.why;
};

// ── WEEKLY MENTOR REPORT ──
window.generateWeeklyReport = function () {
  const container = document.getElementById('weekly-report-content');
  if (!container) return;

  const sessions = window.FocusSession ? FocusSession.getSessionLog() : [];
  const last7Days = sessions.filter(s => new Date(s.timestamp) > new Date(Date.now() - 7*86400000));
  const totalMinutes = last7Days.reduce((a,s) => a+(s.minutesSpent||0), 0);
  const ratings = last7Days.map(s=>s.rating);
  const easyPct = last7Days.length ? Math.round(ratings.filter(r=>r==='easy'||r==='good').length/last7Days.length*100) : 0;

  const state = typeof PrepIntelligenceEngine !== 'undefined' ? PrepIntelligenceEngine.getState() : { readinessScores: {} };
  const mistakes = typeof MistakeBookModule !== 'undefined' ? MistakeBookModule.getMistakes() : [];
  const resolved = mistakes.filter(m=>m.resolved).length;

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:20px;">
      ${[
        { v: Math.round(totalMinutes/60) + 'h ' + (totalMinutes%60) + 'm', l: 'Focus Time' },
        { v: last7Days.length, l: 'Sessions' },
        { v: easyPct + '%', l: 'Success Rate' },
        { v: resolved + '/' + mistakes.length, l: 'Mistakes Fixed' }
      ].map(s=>`<div class="shutdown-stat"><div class="shutdown-stat-value">${s.v}</div><div class="shutdown-stat-label">${s.l}</div></div>`).join('')}
    </div>
    <div style="margin-bottom:12px;font-size:13px;color:var(--text-sub);line-height:1.6;">
      This week you logged <strong>${last7Days.length} sessions</strong> and maintained a <strong>${easyPct}%</strong> mastery rate.
      ${last7Days.length < 5 ? ' Try to hit 5+ sessions next week for consistent growth.' : ' Excellent consistency da!'}
    </div>
    <div style="padding:14px;background:rgba(91,91,214,0.08);border:1px solid rgba(91,91,214,0.22);border-radius:var(--radius-sm);">
      <div style="font-size:11px;font-weight:800;color:var(--primary-light);margin-bottom:8px;">\uD83C\uDFAF Next Week's Top 3 Priorities</div>
      ${(state.weakTopics||[]).slice(0,3).map((w,i)=>`<div style="font-size:13px;color:var(--text);margin-bottom:4px;">${i+1}. ${w.subject}: ${w.topic} (${w.accuracy}% accuracy)</div>`).join('')||'<div style="font-size:13px;color:var(--text-muted);">Keep following your daily plan.</div>'}
    </div>`;
};

// ── ACCEPT RESCHEDULE ──
window.acceptReschedule = function () {
  if (typeof showToast === 'function') showToast('Rescheduled! Missed tasks moved to tomorrow morning.', 'success');
  const alert = document.getElementById('reschedule-alert');
  if (alert) alert.style.display = 'none';
};

// ── SIDEBAR INIT ──
document.addEventListener('DOMContentLoaded', function () {
  // Restore sidebar collapsed state
  const collapsed = localStorage.getItem('gt_sidebar_collapsed') === 'true';
  const sidebar = document.getElementById('sidebar');
  if (sidebar && collapsed) sidebar.classList.add('collapsed');

  // Boot: render home view
  setTimeout(() => {
    if (typeof renderHomeView === 'function') renderHomeView();
    if (typeof CommandPalette !== 'undefined') CommandPalette.open && false; // don't auto-open
  }, 100);

  // Tab pill styles (add if not in style.css)
  if (!document.getElementById('tab-pill-style')) {
    const style = document.createElement('style');
    style.id = 'tab-pill-style';
    style.textContent = `.tab-pill{padding:6px 14px;border-radius:var(--radius-full);border:1px solid var(--border-subtle);background:var(--surface);color:var(--text-muted);font-size:12px;font-weight:600;cursor:pointer;transition:var(--transition);white-space:nowrap;}.tab-pill:hover{background:var(--surface-mid);color:var(--text);}.tab-pill.active{background:rgba(91,91,214,0.18);border-color:rgba(91,91,214,0.38);color:var(--primary-light);}`;
    document.head.appendChild(style);
  }
});

// End GT NeoDepth v3.0 renderers


// ??????????????????????????????????????????????????????????????
//  VORTEX-3D PROJECT HANDLERS & RESUME EXPORT
// ??????????????????????????????????????????????????????????????

window.openVortex3DModal = function () {
  const modal = document.getElementById('project-3d-modal');
  if (modal) {
    modal.classList.add('active');
    setTimeout(() => {
      if (window.Vortex3D) {
        Vortex3D.init('vortex-3d-canvas');
      }
    }, 150);
  }
};

window.closeVortex3DModal = function () {
  const modal = document.getElementById('project-3d-modal');
  if (modal) {
    modal.classList.remove('active');
    if (window.Vortex3D) {
      Vortex3D.stop();
    }
  }
};

window.switchVortexTab = function (tab) {
  document.querySelectorAll('#project-3d-modal .tab-pill').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('vortex-tab-' + tab);
  if (btn) btn.classList.add('active');

  const vSim = document.getElementById('vortex-view-sim');
  const vResume = document.getElementById('vortex-view-resume');
  const vArch = document.getElementById('vortex-view-arch');

  if (vSim) vSim.style.display = tab === 'sim' ? 'block' : 'none';
  if (vResume) vResume.style.display = tab === 'resume' ? 'block' : 'none';
  if (vArch) vArch.style.display = tab === 'arch' ? 'block' : 'none';

  if (tab === 'sim' && window.Vortex3D) {
    Vortex3D.init('vortex-3d-canvas');
  }
};

window.copyVortexResumeBullets = function () {
  const text = `? Engineered interactive 3D spatial consensus simulator modeling the Raft protocol with real-time leader election, log replication, and split-brain partition recovery across clustered nodes.
? Designed custom Canvas 3D perspective projection pipeline delivering smooth 60 FPS orbital camera rendering and particle packet animation with zero heavy external library dependencies (<100KB footprint).
? Implemented dynamic fault injection suite enabling live simulation of network partitions, leader heartbeat timeouts, and majority quorum validation adhering to the CAP theorem.`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast('ATS Resume bullets copied to clipboard!', 'success');
    }).catch(() => {
      if (typeof showToast === 'function') showToast('Resume bullets ready to paste!', 'info');
    });
  } else {
    if (typeof showToast === 'function') showToast('Resume bullets ready to paste!', 'info');
  }
};
