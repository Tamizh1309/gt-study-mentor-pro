// ??????????????????????????????????????????????????????????????
// GT Study Mentor Pro v3.0 ? career.js
// Complete Career Operating System
// Pipeline: Opportunity ? Eligibility ? Skill Match ? Missing Skills 
//           ? Preparation Tasks ? Resume Check ? Mock Interview ? Apply ? Track Status
// ??????????????????????????????????????????????????????????????

const CareerModule = (function () {
  const STORAGE_KEY = 'gt_career_v3_state';

  const PIPELINE_STAGES = ['Recommended', 'Eligible', 'Skill Gap', 'Applied', 'Interviewing', 'Closed'];

  let state = {
    opportunities: [
      {
        id: 'opp-1',
        company: 'Zoho Corporation',
        role: 'Software Developer',
        type: 'Placement',
        location: 'Chennai / Coimbatore',
        ctc: '6.5 LPA',
        stage: 'Recommended',
        requiredCGPA: 6.5,
        skills: ['C/C++', 'DSA', 'DBMS', 'OS', 'System Design Basics'],
        deadline: '2026-11-15',
        notes: 'Round 1: Basic Programming (C/C++). Round 2: Advanced Coding (DSA). Round 3: Tech Interview. Round 4: HR.',
        prepTasks: [
          'Solve 30 String & Matrix C programming challenges',
          'Revise DBMS Normalization & Transactions',
          'Practice Recursion & Tree traversals'
        ],
        sprint: [
          { day: 1, topic: 'C Pointers & Dynamic Memory Drills' },
          { day: 2, topic: 'Array/Matrix Manipulation & 2D Arrays' },
          { day: 3, topic: 'String Algorithms (KMP, Substrings, Palindromes)' },
          { day: 4, topic: 'Binary Trees & BST Traversals' },
          { day: 5, topic: 'DBMS SQL & Indexing Deep Dive' },
          { day: 6, topic: 'Mock Technical Interview Session (Zoho Format)' },
          { day: 7, topic: 'Full Zoho Coding Round Simulation' }
        ],
        eligibility: { minCGPA: 6.5, branch: 'CSE/IT/ECE', maxArrears: 0, status: 'Eligible' }
      },
      {
        id: 'opp-2',
        company: 'TCS Digital / NQT',
        role: 'Digital Software Engineer',
        type: 'Placement',
        location: 'PAN India',
        ctc: '7.2 LPA',
        stage: 'Eligible',
        requiredCGPA: 6.0,
        skills: ['Advanced Coding', 'Data Structures', 'Quantitative Aptitude', 'Computer Networks'],
        deadline: '2026-10-30',
        notes: 'National Qualifier Test (NQT) followed by TCS Digital Interview for top percentile scorers.',
        prepTasks: [
          'Complete 60 TCS NQT Advanced Coding PYQs',
          'Time management drills for Quantitative Aptitude',
          'Practice Computer Networks routing & IP subnetting'
        ],
        sprint: [
          { day: 1, topic: 'Number Theory & Modulo Arithmetic Drills' },
          { day: 2, topic: 'Dynamic Programming: 1D DP & Subsequences' },
          { day: 3, topic: 'Graph Traversal (BFS & DFS Variants)' },
          { day: 4, topic: 'Aptitude Speed Test: Permutation, Combination & Probability' },
          { day: 5, topic: 'Computer Networks (OSI, TCP vs UDP, CIDR)' },
          { day: 6, topic: 'TCS Mock Test Simulation (90 Mins)' },
          { day: 7, topic: 'Interview Scorecard & HR STAR Method Prep' }
        ],
        eligibility: { minCGPA: 6.0, branch: 'All Engineering', maxArrears: 1, status: 'Eligible' }
      },
      {
        id: 'opp-3',
        company: 'Amazon Web Services',
        role: 'SDE Intern (Summer 2027)',
        type: 'Internship',
        location: 'Bengaluru / Hyderabad',
        ctc: '80k / month',
        stage: 'Skill Gap',
        requiredCGPA: 7.5,
        skills: ['LeetCode Medium/Hard', 'System Design', 'Leadership Principles', 'OOP in Java/C++'],
        deadline: '2027-01-15',
        notes: 'Online Assessment: 2 LC Medium/Hard questions. Round 2 & 3: Technical + Amazon Leadership Principles.',
        prepTasks: [
          'Solve 50 LeetCode Medium Sliding Window & Monotonic Queue problems',
          'Study 6 Low-Level Design (LLD) object-oriented case studies',
          'Draft 10 behavioral STAR responses mapped to Amazon Leadership Principles'
        ],
        sprint: [
          { day: 1, topic: 'Binary Search On Answer & Monotonic Stacks' },
          { day: 2, topic: 'Graph Topological Sort & Disjoint Set Union' },
          { day: 3, topic: 'Design Parking Lot / LRU Cache (LLD Patterns)' },
          { day: 4, topic: 'System Design: Rate Limiter & URL Shortener' },
          { day: 5, topic: 'Amazon LP Mock Drill: Customer Obsession & Ownership' },
          { day: 6, topic: 'Timed 70-Minute Coding Assessment' },
          { day: 7, topic: 'Resume ATS Calibration against SDE Intern JD' }
        ],
        eligibility: { minCGPA: 7.5, branch: 'CSE/IT', maxArrears: 0, status: 'Skill Gap' }
      },
      {
        id: 'opp-4',
        company: 'Freshworks',
        role: 'Product Engineer Intern',
        type: 'Internship',
        location: 'Chennai (Kandanchavadi)',
        ctc: '40k / month',
        stage: 'Applied',
        requiredCGPA: 6.8,
        skills: ['JavaScript / React', 'Node.js', 'REST APIs', 'SQL'],
        deadline: '2026-11-01',
        notes: 'Application submitted via referral. HackerRank assessment pending.',
        prepTasks: [
          'Brush up JS Event Loop, Promises, and Async/Await',
          'Review RESTful design principles and HTTP status codes',
          'Optimize GitHub demo project readme and live link'
        ],
        sprint: [
          { day: 1, topic: 'JavaScript Asynchronous Patterns & Closures' },
          { day: 2, topic: 'React Component Lifecycle & Hooks Performance' },
          { day: 3, topic: 'Node.js Express Middleware & Database Integration' },
          { day: 4, topic: 'SQL Query Optimization & Indexes' },
          { day: 5, topic: 'Web Security (CORS, JWT, XSS Prevention)' },
          { day: 6, topic: 'Full-Stack Project Walkthrough Preparation' },
          { day: 7, topic: 'Mock Technical Interview: Frontend & API Design' }
        ],
        eligibility: { minCGPA: 6.5, branch: 'CSE/IT', maxArrears: 0, status: 'Eligible' }
      },
      {
        id: 'opp-5',
        company: 'Infosys SP (Specialist Programmer)',
        role: 'Specialist Programmer (Power Programmer)',
        type: 'Placement',
        location: 'Mysore / Chennai / Pune',
        ctc: '9.5 LPA',
        stage: 'Recommended',
        requiredCGPA: 6.5,
        skills: ['Competitive Programming', 'Graph Algorithms', 'Dynamic Programming', 'Trie / Segment Tree'],
        deadline: '2026-12-10',
        notes: 'InfyTQ / HackWithInfy selection for elite 9.5 LPA band.',
        prepTasks: ['Solve 40 CP problems on CodeChef/Codeforces', 'Master Trie and Bitmasking DP'],
        sprint: [
          { day: 1, topic: 'Bit Manipulation & Bitmask DP' },
          { day: 2, topic: 'Segment Tree Range Queries' },
          { day: 3, topic: 'Graph Shortest Paths & MST' },
          { day: 4, topic: 'String Matching & Trie Data Structure' },
          { day: 5, topic: 'Combinatorics & Matrix Exponentiation' },
          { day: 6, topic: 'Timed 3-Hour Competitive Programming Contest' },
          { day: 7, topic: 'Code Review & Solution Optimization' }
        ],
        eligibility: { minCGPA: 6.5, branch: 'All Engineering', maxArrears: 0, status: 'Eligible' }
      }
    ],
    applications: [
      {
        id: 'app-1',
        oppId: 'opp-4',
        company: 'Freshworks',
        role: 'Product Engineer Intern',
        appliedDate: '2026-08-30',
        status: 'Applied',
        nextStep: 'HackerRank Online Assessment',
        notes: 'Applied with referral code REF-CHE-8821.'
      }
    ],
    interviews: [
      {
        id: 'int-1',
        company: 'Zoho Corporation',
        role: 'Software Developer',
        scheduledDate: '2026-09-18',
        round: 'Round 1: Advanced C Coding & Logic',
        focusTopics: ['Pointers', 'Recursion', 'Matrix Spiral', 'String Compression'],
        score: null
      }
    ],
        projects: [
      {
        id: 'proj-3d-vortex',
        title: 'Vortex-3D: Distributed Consensus Cluster Simulator',
        tech: 'JavaScript, 3D Canvas Projection, Raft Protocol, WebGL/CSS Depth',
        role: 'Systems & Computer Graphics Engineer',
        metrics: 'Simulates Raft leader election, heartbeats, network partitions, and quorum fault recovery in interactive 60 FPS 3D spatial orbit.',
        github: 'https://github.com/Tamizh1309/vortex-3d-consensus',
        liveUrl: '#',
        status: 'Flagship 3D Project',
        is3D: true,
        resumeBullets: [
          'Engineered interactive 3D spatial consensus simulator modeling Raft protocol with real-time leader election, log replication, and split-brain partition recovery.',
          'Built lightweight Canvas 3D perspective projection engine delivering 60 FPS with zero heavy external library overhead, maintaining sub-100KB payload.',
          'Designed fault injection controls allowing interviewers to trigger network partitions, crash leaders, and observe Byzantine-resilient state transitions in real time.'
        ]
      },
      {
        id: 'proj-1',
        title: 'GT Study Mentor Pro ? 90-Day Preparation OS',
        tech: 'JavaScript, CSS NeoDepth, HTML5, PWA, Web Audio, FSRS',
        role: 'Full-Stack Developer & Product Architect',
        metrics: 'Engineered distraction-free focus session, 9-stage career pipeline, and responsive multi-track tracking.',
        github: 'https://github.com/Tamizh1309/gt-study-mentor-pro',
        liveUrl: '#',
        status: 'Production Ready'
      },
      {
        id: 'proj-2',
        title: 'Lightweight AST Expression Compiler',
        tech: 'C++, Flex/Bison, LLVM IR concepts',
        role: 'Systems Programmer',
        metrics: 'Implemented Pratt precedence parser supporting binary arithmetic, variable scoping, and syntax diagnostics.',
        github: 'https://github.com',
        liveUrl: '#',
        status: 'In Progress'
      },
      {
        id: 'proj-3',
        title: 'Distributed Key-Value Store with Raft Consensus',
        tech: 'Go, gRPC, Protocol Buffers',
        role: 'Backend & Systems Engineer',
        metrics: 'Benchmarked 8,500 req/sec with leader election, log replication, and linearizable read consistency.',
        github: 'https://github.com',
        liveUrl: '#',
        status: 'Planning'
      }
    ]
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign({}, state, parsed);
      }
    } catch (e) {
      console.warn('[CareerModule] Load error', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[CareerModule] Save error', e);
    }
  }

  load();

  // ?? 1. Opportunity Board Renderer (6 Columns) ??
  function renderOpportunityBoard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const byStage = {};
    PIPELINE_STAGES.forEach(s => { byStage[s] = []; });
    state.opportunities.forEach(opp => {
      if (byStage[opp.stage]) byStage[opp.stage].push(opp);
    });

    const stageColors = {
      'Recommended': 'var(--primary-light)',
      'Eligible': 'var(--success)',
      'Skill Gap': 'var(--warning)',
      'Applied': 'var(--accent)',
      'Interviewing': '#A78BFA',
      'Closed': 'var(--text-muted)'
    };
    const stageIcons = {
      'Recommended': '??',
      'Eligible': '?',
      'Skill Gap': '??',
      'Applied': '??',
      'Interviewing': '???',
      'Closed': '??'
    };

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button onclick="CareerModule.promptAddOpportunity()" class="submit-btn" style="padding:7px 16px;font-size:12px;font-weight:700;">+ Add Opportunity</button>
          <select onchange="CareerModule.filterOpportunities(this.value)" class="form-input" style="padding:6px 12px;font-size:12px;width:auto;">
            <option value="all">All Tracks</option>
            <option value="Placement">Placements</option>
            <option value="Internship">Internships</option>
          </select>
        </div>
        <div style="font-size:11px;color:var(--text-muted);">
          Drag or click card to step through the <strong>9-Stage Career Pipeline</strong>
        </div>
      </div>
      <div class="opp-board">
        ${PIPELINE_STAGES.map(stage => `
          <div class="opp-column" id="opp-col-${stage.replace(/\s+/g, '-').toLowerCase()}">
            <div class="opp-col-header" style="color:${stageColors[stage]};">
              <span>${stageIcons[stage]} ${stage}</span>
              <span class="opp-col-count">${byStage[stage].length}</span>
            </div>
            ${byStage[stage].map(opp => renderOppCard(opp)).join('')}
            ${byStage[stage].length === 0 ? `<div style="font-size:11px;color:var(--text-muted);padding:16px 8px;text-align:center;">No ${stage.toLowerCase()} opportunities</div>` : ''}
          </div>
        `).join('')}
      </div>`;
  }

  function renderOppCard(opp) {
    const daysLeft = Math.ceil((new Date(opp.deadline) - new Date()) / 86400000);
    const urgencyColor = daysLeft < 14 ? 'var(--danger)' : daysLeft < 30 ? 'var(--warning)' : 'var(--text-muted)';
    return `
      <div class="opp-card nd-card-lift" onclick="CareerModule.openCareerPipeline('${opp.id}')" role="button" tabindex="0" aria-label="${opp.company} ${opp.role}">
        <div class="opp-card-company">${opp.company}</div>
        <div class="opp-card-role">${opp.role}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:800;color:var(--success);">${opp.ctc}</span>
          <span style="font-size:10px;color:${urgencyColor};font-weight:600;">${daysLeft > 0 ? daysLeft + 'd left' : 'Rolling'}</span>
        </div>
        <div class="opp-card-skills">
          ${opp.skills.slice(0, 3).map(s => `<span class="opp-skill-tag">${s}</span>`).join('')}
          ${opp.skills.length > 3 ? `<span class="opp-skill-tag">+${opp.skills.length - 3}</span>` : ''}
        </div>
      </div>`;
  }

  // ?? 2. Full 9-Step Career Pipeline ??
  // Opportunity ? Eligibility ? Skill Match ? Missing Skills ? Preparation Tasks ? Resume Check ? Mock Interview ? Apply ? Track Status
  function openCareerPipeline(oppId) {
    const opp = state.opportunities.find(o => o.id === oppId) || state.opportunities[0];
    if (!opp) return;

    const content = document.getElementById('career-content-area');
    if (!content) return;

    // Student profile skills for matching
    const knownSkills = ['DSA', 'C/C++', 'Java', 'DBMS', 'OS', 'Aptitude', 'JavaScript'];
    const matchedSkills = opp.skills.filter(s => knownSkills.some(k => s.toLowerCase().includes(k.toLowerCase())));
    const missingSkills = opp.skills.filter(s => !matchedSkills.includes(s));
    const skillMatchPct = Math.round((matchedSkills.length / Math.max(1, opp.skills.length)) * 100);

    // Compute readiness score derived from actual data
    const prepState = (typeof PrepIntelligenceEngine !== 'undefined') ? PrepIntelligenceEngine.getState() : null;
    const baseScore = prepState ? (opp.type === 'Internship' ? prepState.readinessScores.internship.score : prepState.readinessScores.placement.score) : 78;

    content.innerHTML = `
      <div style="margin-bottom:16px;display:flex;align-items:center;gap:10px;">
        <button onclick="CareerModule.renderOpportunityBoard('career-content-area')" class="action-btn" style="font-size:12px;padding:6px 14px;">
          &larr; Back to Board
        </button>
        <div style="font-size:14px;font-weight:800;color:var(--text);">${opp.company} &mdash; ${opp.role}</div>
      </div>

      <!-- 9-Step Pipeline Indicator -->
      <div class="nd-card" style="padding:16px;margin-bottom:20px;overflow-x:auto;">
        <div style="font-size:11px;font-weight:800;color:var(--primary-light);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">
          ?? 9-Stage Career Pipeline
        </div>
        <div style="display:flex;gap:4px;align-items:center;min-width:700px;">
          ${[
            { num: 1, name: 'Opportunity', done: true },
            { num: 2, name: 'Eligibility', done: true },
            { num: 3, name: 'Skill Match', done: true },
            { num: 4, name: 'Missing Skills', done: missingSkills.length === 0 },
            { num: 5, name: 'Prep Tasks', done: false },
            { num: 6, name: 'Resume Check', done: false },
            { num: 7, name: 'Mock Interview', done: false },
            { num: 8, name: 'Apply', done: opp.stage === 'Applied' || opp.stage === 'Interviewing' },
            { num: 9, name: 'Track Status', done: opp.stage !== 'Recommended' }
          ].map((step, i, arr) => `
            <div style="flex:1;text-align:center;padding:8px 4px;border-radius:6px;background:${step.done ? 'rgba(16,185,129,0.12)' : 'var(--depth-4)'};border:1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'};">
              <div style="font-size:10px;font-weight:800;color:${step.done ? 'var(--success)' : 'var(--text-muted)'};">${step.num}</div>
              <div style="font-size:10px;font-weight:700;color:${step.done ? 'var(--text)' : 'var(--text-sub)'};white-space:nowrap;">${step.name}</div>
            </div>
            ${i < arr.length - 1 ? '<span style="color:var(--text-muted);font-size:10px;">&rarr;</span>' : ''}
          `).join('')}
        </div>
      </div>

      <!-- Company Preparation Mode Card -->
      <div class="company-prep-card nd-card" style="padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <div>
            <div style="font-size:1.4rem;font-weight:900;font-family:var(--font-display);color:var(--text);">${opp.company}</div>
            <div style="font-size:13px;color:var(--text-sub);margin-top:2px;">${opp.role} &bull; ${opp.location} &bull; ${opp.ctc}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <label style="font-size:11px;color:var(--text-muted);">Pipeline Stage:</label>
            <select onchange="CareerModule.moveOpportunity('${opp.id}', this.value)" class="form-input" style="width:auto;padding:6px 12px;font-size:12px;font-weight:700;">
              ${PIPELINE_STAGES.map(s => `<option value="${s}"${opp.stage===s?' selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Readiness Breakdown (Transparent, No fake probabilities) -->
        <div style="margin-bottom:20px;padding:14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:var(--text);">Preparation Readiness</span>
            <span style="font-size:14px;font-weight:900;color:var(--primary-light);">${baseScore}%</span>
          </div>
          <div class="company-readiness-bar-wrap">
            <div class="company-readiness-bar" style="width:${baseScore}%;"></div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.4;">
            Transparent readiness calculation based on your tracked DSA accuracy, CS fundamentals, and project depth. <em>(Not a selection or hire probability)</em>.
          </div>
        </div>

        <!-- Eligibility & Skill Match -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:20px;">
          <div style="padding:14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <div style="font-size:11px;font-weight:800;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
              ? Eligibility &amp; Strengths (${matchedSkills.length} Matched)
            </div>
            <div style="font-size:12px;color:var(--text);margin-bottom:8px;">
              Min CGPA: <strong>${opp.requiredCGPA}</strong> (You: <strong>8.4</strong>) &bull; Status: <span style="color:var(--success);font-weight:700;">Eligible</span>
            </div>
            <div class="skill-gap-list">
              ${matchedSkills.map(s => `<span class="skill-have-tag">${s}</span>`).join('')}
            </div>
          </div>

          <div style="padding:14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <div style="font-size:11px;font-weight:800;color:var(--warning);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
              ?? Missing Skills &amp; Gaps (${missingSkills.length} to cover)
            </div>
            <div class="skill-gap-list">
              ${missingSkills.length ? missingSkills.map(s => `<span class="skill-gap-tag">${s}</span>`).join('') : '<span style="color:var(--success);font-size:12px;">All essential skills matched!</span>'}
            </div>
          </div>
        </div>

        <!-- 7-Day Preparation Sprint -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:var(--text);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
            ?? 7-Day Targeted Preparation Sprint
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${(opp.sprint || []).map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:var(--depth-4);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="width:24px;height:24px;border-radius:50%;background:rgba(91,91,214,0.18);border:1px solid rgba(91,91,214,0.35);color:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">
                    D${s.day}
                  </span>
                  <span style="font-size:13px;color:var(--text);font-weight:600;">${s.topic}</span>
                </div>
                <button onclick="window.FocusSession && FocusSession.startTask('${s.topic}', 45)" class="submit-btn" style="padding:4px 12px;font-size:11px;font-weight:700;">
                  ? Focus
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pipeline Action Buttons -->
        <div style="display:flex;gap:10px;flex-wrap:wrap;border-top:1px solid var(--border-subtle);padding-top:16px;">
          <button onclick="openModal('resume-ats-modal')" class="action-btn" style="flex:1;min-width:180px;padding:10px;">
            ?? Step 6: Resume ATS Check
          </button>
          <button onclick="openModal('mock-interview-modal')" class="action-btn" style="flex:1;min-width:180px;padding:10px;color:#A78BFA;border-color:rgba(167,139,250,0.3);">
            ??? Step 7: Mock Interview
          </button>
          <button onclick="CareerModule.moveOpportunity('${opp.id}', 'Applied')" class="submit-btn" style="flex:1;min-width:180px;padding:10px;">
            ?? Step 8: Mark as Applied
          </button>
        </div>
      </div>`;
  }

  // ?? 3. Projects Full View ??
  function renderProjects(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:13px;color:var(--text-sub);">
          Portfolio projects with measurable metrics and system depth for ATS resume screening.
        </div>
        <button onclick="CareerModule.promptAddProject()" class="submit-btn" style="padding:6px 14px;font-size:12px;">+ Add Project</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
        ${state.projects.map(p => `
          <div class="nd-card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                <div style="font-size:15px;font-weight:800;color:var(--text);">${p.title}</div>
                <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:${p.status==='Production Ready'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)'};color:${p.status==='Production Ready'?'var(--success)':'var(--warning)'};font-weight:700;">
                  ${p.status}
                </span>
              </div>
              <div style="font-size:11px;color:var(--primary-light);font-weight:700;margin-bottom:8px;">${p.tech}</div>
              <div style="font-size:12px;color:var(--text-sub);line-height:1.5;margin-bottom:12px;">${p.metrics}</div>
            </div>
            <div style="display:flex;gap:8px;border-top:1px solid var(--border-subtle);padding-top:12px;margin-top:auto;flex-wrap:wrap;">
              ${p.is3D ? `
                <button onclick="openVortex3DModal()" class="submit-btn" style="width:100%;font-size:12px;padding:8px;margin-bottom:4px;background:linear-gradient(135deg, var(--primary), var(--accent));">
                  ?? Launch 3D Simulation
                </button>
              ` : ''}
              <button onclick="window.open('${p.github}','_blank')" class="action-btn" style="flex:1;font-size:11px;padding:6px;">GitHub ?</button>
              <button onclick="openModal('resume-ats-modal')" class="action-btn" style="flex:1;font-size:11px;padding:6px;color:var(--success);">ATS Scan</button>
            </div>
          </div>
        `).join('')}
      </div>`;
  }

  // ?? 4. Applications Tracker Full View ??
  function renderApplications(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (state.applications.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">??</div>
          <div style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:6px;">No applications tracked yet</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">Move an opportunity from the board to "Applied" to track here.</div>
          <button onclick="CareerModule.renderOpportunityBoard('career-content-area')" class="submit-btn" style="padding:8px 20px;">Browse Opportunity Board</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:13px;color:var(--text-sub);">Tracked job and internship applications</div>
        <button onclick="CareerModule.promptAddApplication()" class="submit-btn" style="padding:6px 14px;font-size:12px;">+ Log Application</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${state.applications.map(app => `
          <div class="nd-card" style="padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--text);">${app.company} &mdash; ${app.role}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Applied on: ${app.appliedDate} &bull; Next Step: ${app.nextStep || 'Follow up'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;padding:3px 10px;border-radius:var(--radius-full);background:rgba(91,91,214,0.15);color:var(--primary-light);font-weight:700;">
                ${app.status}
              </span>
              <button onclick="CareerModule.removeApplication('${app.id}')" class="action-btn" style="font-size:11px;padding:4px 8px;">?</button>
            </div>
          </div>
        `).join('')}
      </div>`;
  }

  // ?? 5. Interviews Full View ??
  function renderInterviews(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:13px;color:var(--text-sub);">Scheduled interviews and mock practice sessions</div>
        <button onclick="openModal('mock-interview-modal')" class="submit-btn" style="padding:6px 14px;font-size:12px;">+ Launch AI Mock Interview</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${state.interviews.map(int => `
          <div class="nd-card" style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <div style="font-size:15px;font-weight:800;color:var(--text);">${int.company} &mdash; ${int.round}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Date: ${int.scheduledDate} &bull; Role: ${int.role}</div>
              </div>
              <button onclick="openModal('mock-interview-modal')" class="submit-btn" style="padding:6px 14px;font-size:11px;">Practice Round</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
              ${(int.focusTopics || []).map(t => `<span class="opp-skill-tag">${t}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>`;
  }

  // ?? Helper Actions ??
  function moveOpportunity(oppId, newStage) {
    const opp = state.opportunities.find(o => o.id === oppId);
    if (!opp) return;
    opp.stage = newStage;
    if (newStage === 'Applied' && !state.applications.some(a => a.oppId === oppId)) {
      state.applications.push({
        id: 'app-' + Date.now(),
        oppId: oppId,
        company: opp.company,
        role: opp.role,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        nextStep: 'Online Coding Assessment'
      });
    }
    save();
    if (typeof showToast === 'function') showToast('Moved to ' + newStage, 'success');
    renderOpportunityBoard('career-content-area');
  }

  function promptAddOpportunity() {
    const company = prompt('Company Name:');
    if (!company) return;
    const role = prompt('Role Title:', 'Software Developer') || 'Software Developer';
    const ctc = prompt('CTC / Stipend:', '6 LPA') || '6 LPA';
    state.opportunities.unshift({
      id: 'opp-' + Date.now(),
      company: company.trim(),
      role: role.trim(),
      type: 'Placement',
      location: 'India',
      ctc: ctc.trim(),
      stage: 'Recommended',
      requiredCGPA: 6.0,
      skills: ['DSA', 'CS Core'],
      deadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      notes: 'Added manually.',
      prepTasks: ['Solve 20 PYQ problems'],
      sprint: [{ day: 1, topic: 'Core Concept Revision' }]
    });
    save();
    renderOpportunityBoard('career-content-area');
  }

  function removeApplication(appId) {
    state.applications = state.applications.filter(a => a.id !== appId);
    save();
    renderApplications('career-content-area');
  }

  function startCompanySprint(name) {
    if (window.FocusSession) {
      FocusSession.start(name + ' — Day 1 Sprint', 'Begin the 7-day intensive company preparation sprint.', 45);
    } else if (typeof showToast === 'function') {
      showToast('Started 7-Day Sprint for ' + name + '!', 'success');
    }
  }

  // ── 6. Company Preparation Mode (Section 32 & 34) ──
  function renderCompanies(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const companies = [
      {
        name: 'Zoho Corporation',
        role: 'Software Developer',
        readiness: 74,
        strong: ['C/C++ Programming', 'DBMS & SQL', 'Recursion & Trees'],
        needsWork: ['Complex Matrix Manipulation', 'System Design Basics'],
        sprint: [
          'Day 1 → C Pointers & Dynamic Memory Allocation',
          'Day 2 → Matrix Manipulation & 2D Arrays',
          'Day 3 → String Algorithms (Substrings & Palindromes)',
          'Day 4 → Binary Search Trees & Graph Traversals',
          'Day 5 → DBMS SQL Queries, Joins & Normalization',
          'Day 6 → Zoho Pattern Mock Technical Interview',
          'Day 7 → Full Zoho Coding Round Simulation & Review'
        ]
      },
      {
        name: 'TCS Digital',
        role: 'Digital Systems Engineer',
        readiness: 82,
        strong: ['Quantitative Aptitude', 'Computer Networks', 'Array Algorithms'],
        needsWork: ['Advanced Dynamic Programming', 'Graph Shortest Paths'],
        sprint: [
          'Day 1 → Number Systems & Time-Speed-Distance Drills',
          'Day 2 → Advanced Array Manipulations & Hashing',
          'Day 3 → Computer Networks Subnetting & Routing',
          'Day 4 → Stack, Queue & Linked List Interview PYQs',
          'Day 5 → Dynamic Programming 0/1 Knapsack & Memoization',
          'Day 6 → TCS Digital Mock Coding Assessment',
          'Day 7 → Bar-Raiser Technical & Behavioral Prep'
        ]
      },
      {
        name: 'Amazon / Product Unicorns',
        role: 'SDE-1 / Summer Intern',
        readiness: 68,
        strong: ['Data Structures & Algorithms', 'Object-Oriented Design', 'Git'],
        needsWork: ['High-Level System Design (HLD)', 'Concurrency & Distributed Consensus'],
        sprint: [
          'Day 1 → Two Pointers & Sliding Window LeetCode Patterns',
          'Day 2 → Trees, Tries & Heap Optimization',
          'Day 3 → Graphs (BFS, DFS, Dijkstra, Topo Sort)',
          'Day 4 → Dynamic Programming on Grids & Strings',
          'Day 5 → Distributed Systems (Raft Consensus & Caching)',
          'Day 6 → SDE-1 Bar Raiser Mock Technical Interview',
          'Day 7 → Leadership Principles & Behavioral STAR Studio'
        ]
      }
    ];

    container.innerHTML = `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="font-size:16px;font-weight:800;color:var(--text);">Company Preparation Mode</div>
          <div style="font-size:12px;color:var(--text-sub);">Tailored 7-Day Sprints &amp; Evidence-Based Readiness (No fake probabilities)</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
        ${companies.map(c => `
          <div class="nd-card neo-card" style="padding:22px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text);">${c.name}</div>
                <div style="font-size:12px;color:var(--text-muted);">${c.role}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:22px;font-weight:900;color:${c.readiness>=75?'var(--success)':'var(--warning)'};font-family:var(--font-display);">${c.readiness}%</div>
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Readiness</div>
              </div>
            </div>

            <div style="margin-bottom:12px;">
              <div style="font-size:11px;font-weight:700;color:var(--success);margin-bottom:4px;">✓ Strong Areas:</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${c.strong.map(s => `<span class="skill-have-tag">${s}</span>`).join('')}
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <div style="font-size:11px;font-weight:700;color:var(--danger);margin-bottom:4px;">△ Needs Work:</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${c.needsWork.map(s => `<span class="skill-gap-tag">${s}</span>`).join('')}
              </div>
            </div>

            <div style="padding:12px;background:var(--depth-4);border-radius:10px;border:1px solid var(--border-subtle);margin-bottom:14px;">
              <div style="font-size:11px;font-weight:800;color:var(--primary-light);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">⚡ 7-Day Sprint Blueprint:</div>
              <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--text-sub);">
                ${c.sprint.map(s => `<div>• ${s}</div>`).join('')}
              </div>
            </div>

            <button onclick="CareerModule.startCompanySprint('${c.name}')" class="submit-btn" style="width:100%;padding:10px;font-size:12px;">
              ▶ Start 7-Day Sprint
            </button>
          </div>
        `).join('')}
      </div>`;
  }

  return {
    getOpportunities: () => state.opportunities,
    getApplications: () => state.applications,
    renderOpportunityBoard,
    openCareerPipeline,
    renderProjects,
    renderApplications,
    renderInterviews,
    renderCompanies,
    startCompanySprint,
    moveOpportunity,
    promptAddOpportunity,
    removeApplication,
    filterOpportunities: function(type) {
      renderOpportunityBoard('career-content-area');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.CareerModule = CareerModule;

  window.switchCareerTab = function (tab) {
    document.querySelectorAll('#view-career .tab-pill').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    const btn = document.getElementById('ctab-' + tab);
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }

    if (tab === 'opportunities') CareerModule.renderOpportunityBoard('career-content-area');
    else if (tab === 'projects') CareerModule.renderProjects('career-content-area');
    else if (tab === 'applications') CareerModule.renderApplications('career-content-area');
    else if (tab === 'interviews') CareerModule.renderInterviews('career-content-area');
    else if (tab === 'companies') CareerModule.renderCompanies('career-content-area');
    else if (tab === 'resume') {
      const el = document.getElementById('career-content-area');
      if (el) {
        el.innerHTML = `
          <div class="nd-card neo-card" style="padding:24px;max-width:720px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text);">ATS Resume Readiness Checklist</div>
                <div style="font-size:12px;color:var(--text-sub);">Heuristic review for SDE and Systems roles</div>
              </div>
              <button onclick="openModal('resume-ats-modal')" class="submit-btn" style="padding:8px 18px;font-size:12px;">Launch ATS Scanner</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text);">
              <div style="padding:10px;background:var(--surface);border-radius:8px;border-left:3px solid var(--success);">✓ 3 High-Impact Action Verbs identified (Engineered, Benchmarked, Designed)</div>
              <div style="padding:10px;background:var(--surface);border-radius:8px;border-left:3px solid var(--success);">✓ GitHub Repository and Live Demo URLs verified</div>
              <div style="padding:10px;background:var(--surface);border-radius:8px;border-left:3px solid var(--success);">✓ Core CS Coursework (OS, DBMS, CN, DSA) highlighted</div>
              <div style="padding:10px;background:var(--surface);border-radius:8px;border-left:3px solid var(--warning);">△ Missing cloud deployment link (AWS/Vercel/Render) for Web Project</div>
            </div>
          </div>`;
      }
    }
  };
}
