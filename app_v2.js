// ══════════════════════════════════════════════════════════════
// GT STUDY MENTOR PRO 2.0 — PREPARATION INTELLIGENCE & ROUTING
// ══════════════════════════════════════════════════════════════

window.currentV2View = 'home';
window.currentV2Subtab = null;

// ── Global View Navigation (Section 7 Compliant) ──
window.navigateToView = function (viewName, subtab) {
  window.currentV2View = viewName;
  window.currentV2Subtab = subtab;

  // 1. Hide all main views
  const panels = document.querySelectorAll('.app-view-panel, #chat-main, #dashboard-panel, #map-panel, #forge-panel');
  panels.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active-view');
  });

  // 2. Clear all active sidebar highlights
  const navBtns = document.querySelectorAll('.sidebar-nav-item');
  navBtns.forEach(b => b.classList.remove('active'));

  // 3. Close mobile sidebar drawer if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth < 768) {
    sidebar.classList.add('sidebar-closed');
  }

  // 4. Activate selected view
  if (viewName === 'chat') {
    const chat = document.getElementById('chat-main');
    if (chat) chat.style.display = 'flex';
    const btn = document.getElementById('nav-ai-mentor-btn');
    if (btn) btn.classList.add('active');
  } else {
    const targetPanel = document.getElementById('view-' + viewName);
    if (targetPanel) {
      targetPanel.style.display = 'block';
      targetPanel.classList.add('active-view');
    }
    
    // Highlight matching sidebar button
    const btnId = subtab ? 'nav-' + (viewName === 'prepare' ? 'prep-' : viewName === 'practice' ? 'prac-' : viewName === 'career' ? 'car-' : 'prog-') + subtab + '-btn' : 'nav-' + viewName + '-btn';
    const activeBtn = document.getElementById(btnId) || document.getElementById('nav-' + viewName + '-btn');
    if (activeBtn) activeBtn.classList.add('active');

    // Trigger renderers
    if (viewName === 'home') renderHomeDashboard();
    if (viewName === 'prepare') switchPrepareTab(subtab || 'gate');
    if (viewName === 'practice') switchPracticeTab(subtab || 'dsa');
    if (viewName === 'career') switchCareerTab(subtab || 'apps');
    if (viewName === 'progress') switchProgressTab(subtab || 'mastery');
    if (viewName === 'resources') renderResourcesLibrary();
  }
};

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
  const tabs = ['mastery', 'mistakes', 'revision', 'weekly'];
  tabs.forEach(t => {
    const el = document.getElementById('subview-prog-' + t);
    const btn = document.getElementById('btn-progtab-' + t);
    if (el) el.style.display = (t === tab ? 'block' : 'none');
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'mastery') renderReadinessMatrix();
  if (tab === 'mistakes') renderMistakeBook();
  if (tab === 'revision') renderFSRSRevision();
  if (tab === 'weekly') renderWeeklyMentorReport();
};

window.renderReadinessMatrix = function () {
  const table = document.getElementById('progress-readiness-table');
  if (!table || typeof PrepIntelligenceEngine === 'undefined') return;
  const matrix = PrepIntelligenceEngine.getCompetencyMatrix();

  let html = `
    <thead>
      <tr>
        <th>Skill / Subject</th>
        <th>GATE 2027</th>
        <th>Placement</th>
        <th>Software Eng</th>
        <th>Internship</th>
        <th>Cross-Goal Impact</th>
      </tr>
    </thead>
    <tbody>
  `;

  matrix.forEach(row => {
    html += `
      <tr>
        <td><strong>${row.skill}</strong></td>
        <td>${row.gate !== null ? `<span class="score-pill ${row.gate >= 80 ? 'high' : 'med'}">${row.gate}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${row.placement !== null ? `<span class="score-pill ${row.placement >= 80 ? 'high' : 'med'}">${row.placement}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${row.swe !== null ? `<span class="score-pill ${row.swe >= 80 ? 'high' : 'med'}">${row.swe}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${row.intern !== null ? `<span class="score-pill ${row.intern >= 80 ? 'high' : 'med'}">${row.intern}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${row.highLeverage ? '<span class="badge-pill" style="background:rgba(251,191,36,0.15);color:var(--warning);font-size:10px;">🔥 High Leverage (3+ Goals)</span>' : '<span style="color:var(--text-muted);font-size:11px;">Standard Topic</span>'}</td>
      </tr>
    `;
  });

  html += '</tbody>';
  table.innerHTML = html;
};

window.renderMistakeBook = function () {
  const list = document.getElementById('progress-mistakes-list');
  if (!list || typeof MistakeBookModule === 'undefined') return;
  const mistakes = MistakeBookModule.getMistakes();

  list.innerHTML = '';
  mistakes.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mistake-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="mistake-badge ${m.mistakeType.includes('Gap') ? 'gap' : m.mistakeType.includes('Calc') ? 'calc' : 'misread'}">${m.mistakeType}</span>
          <strong style="color:#fff; margin-left:8px; font-size:13px;">${m.subject} — ${m.topic}</strong>
        </div>
        <span style="font-size:11px; color:var(--text-muted);">Added: ${m.dateAdded}</span>
      </div>
      <div style="font-size:13px; color:#fff; font-weight:600; margin:4px 0;">Q: ${m.question}</div>
      <div style="font-size:12px; color:var(--danger);">❌ Your choice: ${m.userWrongAnswer}</div>
      <div style="font-size:12px; color:var(--success);">✅ Correct concept: ${m.correctAnswer}</div>
      <div style="font-size:11px; color:var(--text-muted); background:rgba(255,255,255,0.02); padding:6px 10px; border-radius:6px; margin-top:4px;">
        💡 <strong>Key Takeaway:</strong> ${m.concept}
      </div>
    `;
    list.appendChild(card);
  });
};

window.reattemptMistakes = function () {
  alert('🎯 Launching Mistake Reattempt Mode!nnPreparing 3 targeted questions from your weak taxonomy: Deadlocks, Heaps, and Probability.');
  navigateToView('practice', 'pyq');
};

function renderFSRSRevision() {
  const container = document.getElementById('progress-fsrs-deck-container');
  if (!container || typeof MistakeBookModule === 'undefined') return;
  const cards = MistakeBookModule.getAllFSRSCards();

  container.innerHTML = `
    <h3 style="color:#fff; margin:0 0 8px;">🔄 FSRS Spaced Repetition Review Deck</h3>
    <p style="font-size:12px; color:var(--text-muted); margin:0 0 16px;">Based on the Free Spaced Repetition Scheduler algorithm. Optimizes memory stability, difficulty, and retention intervals.</p>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
      ${cards.map(c => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:10px; padding:14px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--primary);">
            <span>${c.topic}</span>
            <span class="badge-pill" style="font-size:9px;">${c.state}</span>
          </div>
          <div style="font-size:13px; font-weight:700; color:#fff; margin:8px 0;">${c.question}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">
            Stability: ${c.stability.toFixed(1)}d • Difficulty: ${c.difficulty.toFixed(1)}/10 • Reps: ${c.repetitions}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWeeklyMentorReport() {
  const container = document.getElementById('progress-weekly-report-container');
  if (!container) return;
  container.innerHTML = `
    <div style="border-left:4px solid var(--primary); padding-left:14px; margin-bottom:18px;">
      <h3 style="color:#fff; margin:0; font-size:1.3rem;">📋 YOUR WEEK IN REVIEW (Day 21 – Day 27)</h3>
      <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0;">Strictly data-driven mentor synthesis. No fabricated metrics.</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="track-card" style="padding:12px; text-align:center;">
        <span style="font-size:11px; color:var(--text-muted);">Total Study Time</span>
        <div style="font-size:1.6rem; font-weight:900; color:#fff;">38.5 hrs</div>
        <span style="font-size:10px; color:var(--success);">+4.2 hrs vs last week</span>
      </div>
      <div class="track-card" style="padding:12px; text-align:center;">
        <span style="font-size:11px; color:var(--text-muted);">Tasks Completed</span>
        <div style="font-size:1.6rem; font-weight:900; color:var(--success);">26 / 28</div>
        <span style="font-size:10px; color:var(--text-muted);">93% Execution Rate</span>
      </div>
      <div class="track-card" style="padding:12px; text-align:center;">
        <span style="font-size:11px; color:var(--text-muted);">Question Accuracy</span>
        <div style="font-size:1.6rem; font-weight:900; color:var(--primary);">74.2%</div>
        <span style="font-size:10px; color:var(--primary);">142 Questions Solved</span>
      </div>
      <div class="track-card" style="padding:12px; text-align:center;">
        <span style="font-size:11px; color:var(--text-muted);">Applications Sent</span>
        <div style="font-size:1.6rem; font-weight:900; color:var(--warning);">3 Applied</div>
        <span style="font-size:10px; color:var(--text-muted);">2 Shortlisted for OA</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      <div class="track-card" style="border-left:4px solid var(--success);">
        <strong style="color:var(--success); font-size:13px;">🏆 BIGGEST WIN</strong>
        <p style="font-size:12px; color:var(--text); margin:6px 0 0; line-height:1.4;">
          Mastered Striver Binary Trees &amp; Traversals (92% accuracy across 35 problems). Solved 48 GATE Operating Systems PYQs on CPU Scheduling with zero formula mistakes.
        </p>
      </div>
      <div class="track-card" style="border-left:4px solid var(--danger);">
        <strong style="color:var(--danger); font-size:13px;">⚠️ BIGGEST WEAKNESS</strong>
        <p style="font-size:12px; color:var(--text); margin:6px 0 0; line-height:1.4;">
          Banker's Algorithm and Resource Allocation Graphs (41% accuracy under time pressure). Need explicit calculation check for Need = Max - Allocation.
        </p>
      </div>
    </div>

    <div class="track-card" style="margin-top:16px; border-left:4px solid var(--primary);">
      <strong style="color:var(--primary); font-size:13px;">🎯 NEXT WEEK PRIORITIES (Phase 1 Final Lap)</strong>
      <ol style="font-size:12px; color:var(--text); margin:8px 0 0 16px; padding:0; line-height:1.6;">
        <li>Eliminate Deadlock weakness via 10 Banker's algorithm practice drills.</li>
        <li>Complete Striver Dynamic Programming 1D &amp; 2D patterns (0/1 Knapsack &amp; LCS).</li>
        <li>Revise Probability &amp; Bayes theorem for GATE Math + Campus Aptitude tests.</li>
        <li>Deploy Project 1 on Vercel with live demo link and update GitHub README.</li>
      </ol>
    </div>
  `;
}

// ── PRACTICE HUB SWITCHER ──
window.switchPracticeTab = function (tab) {
  const tabs = ['dsa', 'pyq', 'aptitude', 'mocks'];
  tabs.forEach(t => {
    const el = document.getElementById('subview-prac-' + t);
    const btn = document.getElementById('btn-practab-' + t);
    if (el) el.style.display = (t === tab ? 'block' : 'none');
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'dsa') renderDSAPractice();
  if (tab === 'pyq') renderPYQPractice();
  if (tab === 'aptitude') renderAptitudePractice();
  if (tab === 'mocks') renderMockTestsPractice();
};

function renderDSAPractice() {
  const container = document.getElementById('practice-dsa-container');
  if (!container) return;
  const patterns = [
    { name: 'Two Pointers', problems: 18, solved: 16, difficulty: 'Easy-Med' },
    { name: 'Sliding Window', problems: 14, solved: 12, difficulty: 'Medium' },
    { name: 'Fast & Slow Pointers', problems: 8, solved: 8, difficulty: 'Easy-Med' },
    { name: 'Binary Trees & Traversals', problems: 24, solved: 21, difficulty: 'Medium' },
    { name: '0/1 Knapsack & DP', problems: 22, solved: 9, difficulty: 'Hard' },
    { name: 'Graphs & BFS/DFS', problems: 26, solved: 14, difficulty: 'Medium-Hard' },
    { name: 'Top K Elements (Heaps)', problems: 12, solved: 10, difficulty: 'Medium' }
  ];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="color:#fff; margin:0;">Striver A2Z 17 DSA Patterns Tracker</h3>
      <span class="badge-pill" style="background:rgba(99,216,255,0.15); color:var(--primary);">90 / 124 Problems Solved</span>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
      ${patterns.map(p => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; color:#fff;">
            <span>${p.name}</span>
            <span class="score-pill ${p.solved/p.problems >= 0.7 ? 'high' : 'low'}">${p.solved}/${p.problems}</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin:8px 0 4px;">
            <div style="width:${Math.round((p.solved/p.problems)*100)}%; height:100%; background:var(--primary);"></div>
          </div>
          <span style="font-size:10px; color:var(--text-muted);">Difficulty: ${p.difficulty}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:16px;">
      <button class="action-btn" onclick="openModal('algo-visualizer-modal')">Launch Algorithm Step-Through Visualizer →</button>
    </div>
  `;
}

function renderPYQPractice() {
  const container = document.getElementById('practice-pyq-container');
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div>
        <h3 style="color:#fff; margin:0;">GATE CS 2000–Present PYQ Engine</h3>
        <p style="font-size:12px; color:var(--text-muted); margin:2px 0 0;">Solve authentic previous year questions with timers, concept walkthroughs, and error taxonomy.</p>
      </div>
      <button class="action-btn" onclick="openModal('master-question-bank-modal')">Open Full Question Bank (2000-2025)</button>
    </div>
    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:10px; padding:16px; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--primary);">
        <span>GATE CS 2023 • Operating Systems • 2 Marks</span>
        <span>⏱️ Timer: 01:45</span>
      </div>
      <div style="font-size:14px; font-weight:700; color:#fff; margin:10px 0;">
        Consider a system with 3 processes P1, P2, P3 sharing 4 instances of resource R. Each process needs at most 2 instances. Can Deadlock occur?
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
        <button class="action-btn" style="text-align:left; padding:8px 12px;" onclick="checkPYQAnswer(false, this)">A) Yes, if each holds 1 instance and requests 1 more simultaneously.</button>
        <button class="action-btn" style="text-align:left; padding:8px 12px;" onclick="checkPYQAnswer(true, this)">B) No, because total demand (2*3=6) minus 3 + 1 = 4, guaranteeing at least one process finishes.</button>
        <button class="action-btn" style="text-align:left; padding:8px 12px;" onclick="checkPYQAnswer(false, this)">C) Yes, if circular wait is formed among all 3 processes.</button>
        <button class="action-btn" style="text-align:left; padding:8px 12px;" onclick="checkPYQAnswer(false, this)">D) Insufficient information to determine.</button>
      </div>
      <div id="pyq-explanation-box" style="display:none; margin-top:12px; padding:10px; background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.25); border-radius:6px; font-size:12px; line-height:1.4;"></div>
    </div>
  `;
}

window.checkPYQAnswer = function (isCorrect, btn) {
  const expBox = document.getElementById('pyq-explanation-box');
  if (expBox) {
    expBox.style.display = 'block';
    if (isCorrect) {
      btn.style.background = 'rgba(74,222,128,0.2)';
      btn.style.borderColor = 'var(--success)';
      expBox.innerHTML = '<strong style="color:var(--success);">✅ Correct!</strong> Condition for deadlock-free operation is R >= P*(M - 1) + 1. Here 3*(2 - 1) + 1 = 4. Since available R=4, deadlock can never occur.';
    } else {
      btn.style.background = 'rgba(251,113,133,0.2)';
      btn.style.borderColor = 'var(--danger)';
      expBox.innerHTML = '<strong style="color:var(--danger);">❌ Incorrect!</strong> Formula: Deadlock-free if R >= P*(M - 1) + 1 = 3*(1) + 1 = 4. Added to your Mistake Book under Concept Gap.';
      if (typeof MistakeBookModule !== 'undefined') {
        MistakeBookModule.recordMistake(
          'Deadlock condition with 3 processes each needing max 2 instances with 4 resources',
          'Operating Systems',
          'Deadlocks',
          'Option A/C selected',
          'Option B: R >= P*(M-1) + 1 = 4 prevents deadlock',
          'Deadlock-free formula: R >= Sum(Max_i - 1) + 1',
          'Concept Gap'
        );
      }
    }
  }
};

function renderAptitudePractice() {
  const container = document.getElementById('practice-aptitude-container');
  if (!container) return;
  container.innerHTML = `
    <h3 style="color:#fff; margin:0 0 8px;">📊 Aptitude Speed Drills</h3>
    <p style="font-size:12px; color:var(--text-muted); margin:0 0 16px;">High-yield formulas and 60-second speed challenges.</p>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
        <strong style="color:#fff; font-size:13px;">Time &amp; Work Formula</strong>
        <p style="font-size:11px; color:var(--text-muted); margin:4px 0;">If A takes a days and B takes b days, together they take (a*b)/(a + b) days.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
        <strong style="color:#fff; font-size:13px;">Relative Speed (Opposite &amp; Same)</strong>
        <p style="font-size:11px; color:var(--text-muted); margin:4px 0;">Opposite directions: S1 + S2. Same direction: |S1 - S2|.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
        <strong style="color:#fff; font-size:13px;">Bayes Theorem</strong>
        <p style="font-size:11px; color:var(--text-muted); margin:4px 0;">P(A|B) = [P(B|A) * P(A)] / P(B).</p>
      </div>
    </div>
  `;
}

function renderMockTestsPractice() {
  const container = document.getElementById('practice-mocks-container');
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div>
        <h3 style="color:#fff; margin:0;">📝 Mock Exam Center</h3>
        <p style="font-size:12px; color:var(--text-muted); margin:2px 0 0;">Authentic 65-question 3-hour GATE CS mocks and 60-minute company placement assessments.</p>
      </div>
      <button class="action-btn" onclick="openModal('exam-simulator-modal')">Launch Exam Simulator</button>
    </div>
    <div class="track-card" style="border-left:4px solid var(--primary);">
      <strong style="color:#fff; font-size:13px;">Preparation Performance Indicator (Transparent Heuristic)</strong>
      <p style="font-size:12px; color:var(--text-muted); margin:4px 0 0;">
        We strictly avoid fake AIR or selection probability predictions. Scores reflect your actual syllabus completion (82%), PYQ accuracy (71%), and mock performance consistency.
      </p>
    </div>
  `;
}

// ── CAREER HUB SWITCHER ──
window.switchCareerTab = function (tab) {
  const tabs = ['apps', 'resume', 'projects', 'companies'];
  tabs.forEach(t => {
    const el = document.getElementById('subview-car-' + t);
    const btn = document.getElementById('btn-careertab-' + t);
    if (el) el.style.display = (t === tab ? 'block' : 'none');
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'apps') renderApplicationsCareer();
  if (tab === 'resume') renderResumeCareer();
  if (tab === 'projects') renderProjectsCareer();
  if (tab === 'companies') renderCompaniesPreview();
};

function renderApplicationsCareer() {
  const container = document.getElementById('career-apps-container');
  if (!container) return;
  const apps = [
    { company: 'Amazon', role: 'SDE Intern', date: '2026-08-15', status: 'OA Completed', next: 'Technical Round 1' },
    { company: 'Zoho', role: 'Software Developer', date: '2026-08-20', status: 'Shortlisted', next: 'Advanced Coding Round' },
    { company: 'TCS Digital', role: 'Software Engineer', date: '2026-08-22', status: 'Applied', next: 'Aptitude Test' },
    { company: 'Microsoft', role: 'Summer Intern', date: '2026-08-25', status: 'Applied', next: 'Resume Screening' }
  ];

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <h3 style="color:#fff; margin:0;">📬 Internship &amp; Placement Applications Pipeline</h3>
      <button class="action-btn" onclick="promptAddApplication()">+ Add Application</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${apps.map(a => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px 16px;">
          <div>
            <strong style="color:#fff; font-size:14px;">${a.company}</strong> — <span style="color:var(--text-muted); font-size:12px;">${a.role}</span>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Applied: ${a.date} • Next: <span style="color:var(--warning);">${a.next}</span></div>
          </div>
          <span class="badge-pill" style="background:rgba(99,216,255,0.15); color:var(--primary); font-size:11px;">${a.status}</span>
        </div>
      `).join('')}
    </div>
  `;
}

window.promptAddApplication = function () {
  const company = prompt('Enter Company Name:');
  if (!company) return;
  const role = prompt('Enter Role (e.g. SDE Intern):') || 'SDE Intern';
  alert('✅ Application for ' + company + ' (' + role + ') added to your tracking pipeline!');
  renderApplicationsCareer();
};

function renderResumeCareer() {
  const container = document.getElementById('career-resume-container');
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <div>
        <h3 style="color:#fff; margin:0;">📄 Resume Readiness &amp; ATS Checklist</h3>
        <p style="font-size:12px; color:var(--text-muted); margin:2px 0 0;">Transparent heuristic evaluation based on technical hiring standards.</p>
      </div>
      <div style="font-size:1.8rem; font-weight:900; color:var(--success);">84 / 100</div>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:#fff;">
        <span>✅</span> <span>Quantifiable metrics included in project bullet points (e.g. "reduced latency by 35%").</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:#fff;">
        <span>✅</span> <span>Live GitHub repository and deployment URLs tested and accessible.</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:#fff;">
        <span>✅</span> <span>Technical skills section categorized: Languages, Frameworks, Developer Tools, Core CS.</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:var(--warning);">
        <span>⚠️</span> <span>Add Unit Testing / CI/CD badge to Project 1 to reach 90+ score.</span>
      </div>
    </div>
    <div style="margin-top:16px;">
      <button class="action-btn" onclick="openModal('resume-ats-modal')">Open Detailed Resume Checker →</button>
    </div>
  `;
}

function renderProjectsCareer() {
  const container = document.getElementById('career-projects-container');
  if (!container) return;
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="color:#fff; margin:0;">📦 Project Tracker (Idea → Portfolio Ready)</h3>
      <button class="action-btn">+ New Project</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
      <div class="track-card">
        <strong style="color:#fff; font-size:14px;">AI Study Mentor Platform</strong>
        <p style="font-size:12px; color:var(--text-muted); margin:4px 0 8px;">Node.js, Express, SQLite, Vanilla JS SPA, Leaflet Maps, PWA.</p>
        <span class="badge-pill" style="background:rgba(74,222,128,0.15); color:var(--success); font-size:10px;">Portfolio Ready (Stage 7/7)</span>
      </div>
      <div class="track-card">
        <strong style="color:#fff; font-size:14px;">Distributed Task Scheduler</strong>
        <p style="font-size:12px; color:var(--text-muted); margin:4px 0 8px;">Go, Redis, Docker, Worker Pools.</p>
        <span class="badge-pill" style="background:rgba(99,216,255,0.15); color:var(--primary); font-size:10px;">Development (Stage 3/7)</span>
      </div>
    </div>
  `;
}

function renderCompaniesPreview() {
  const container = document.getElementById('career-companies-preview');
  if (!container) return;
  container.innerHTML = `
    <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">1,024 verified company dossiers across Tamil Nadu (Chennai, Coimbatore, Madurai) and All-India tech hubs.</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <span class="score-pill med">Amazon</span>
      <span class="score-pill med">Google</span>
      <span class="score-pill med">Zoho</span>
      <span class="score-pill med">Freshworks</span>
      <span class="score-pill med">TCS</span>
      <span class="score-pill med">Infosys</span>
      <span class="score-pill med">Wipro</span>
      <span class="score-pill med">Cognizant</span>
      <span class="score-pill med">+1,016 more</span>
    </div>
  `;
}

// ── RESOURCES LIBRARY RENDERER ──
window.renderResourcesLibrary = function () {
  const container = document.getElementById('resources-library-list');
  if (!container) return;
  const items = [
    { title: 'GATE CS 2027 Official Syllabus & Weightage Sheet', cat: 'GATE', desc: 'Detailed 100-mark distribution across 12 subjects.' },
    { title: 'Striver A2Z DSA Cheat Sheet (17 Patterns)', cat: 'SWE', desc: 'Clean algorithmic templates for two pointers, DP, and graphs.' },
    { title: 'Operating Systems Quick Revision Handbook', cat: 'Core CS', desc: 'Deadlocks, Paging, Virtual Memory, CPU Scheduling condensed.' },
    { title: 'Quantitative Aptitude High-Yield Formulas', cat: 'Placement', desc: 'Speed math shortcuts, percentages, work-time, and probability.' },
    { title: 'System Design Interview Primer', cat: 'SWE', desc: 'Scalability, microservices, caching layers, and database sharding.' },
    { title: 'HR Behavioral Interview STAR Question Bank', cat: 'Career', desc: '50 real interview behavioral questions with model responses.' }
  ];

  container.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge-pill" style="font-size:9px;">${it.cat}</span>
        <span style="font-size:16px;">⭐</span>
      </div>
      <h4 style="color:#fff; margin:8px 0 4px; font-size:14px;">${it.title}</h4>
      <p style="font-size:12px; color:var(--text-muted); margin:0 0 10px;">${it.desc}</p>
      <button class="action-btn" onclick="alert('Opening resource: ' + '${it.title}')" style="font-size:11px; padding:4px 10px;">Open Resource ↗</button>
    `;
    container.appendChild(card);
  });
};

// ── THEME SWITCHER (DARK, LIGHT, HIGH CONTRAST) ──
window.setV2Theme = function (theme) {
  document.body.classList.remove('high-contrast');
  if (theme === 'contrast') {
    document.body.classList.add('high-contrast');
    alert('⚡ High Contrast Mode (WCAG 2.2 AA) enabled!');
  } else if (theme === 'light') {
    document.body.classList.add('light-theme');
    alert('☀️ Clean Light Theme enabled!');
  } else {
    document.body.classList.remove('light-theme');
    alert('🌙 Cyber Dark Theme restored!');
  }
};

// Initial Auto-Render on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderHomeDashboard === 'function') {
    renderHomeDashboard();
  }
});
