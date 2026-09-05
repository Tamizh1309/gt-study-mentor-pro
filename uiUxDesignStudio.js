/**
 * ============================================================================
 * GT Study Mentor Pro — 25 UI/UX Design System Specification & Studio
 * File: uiUxDesignStudio.js
 * ============================================================================
 * 
 * Provides interactive showcase, inspection, and live module execution for all
 * 25 screens defined in the master GT Study Mentor Pro UI/UX architecture:
 * 
 * Row 0:
 *   1. Landing / Hero
 *   2. Sign Up / Onboarding
 *   3. Goal Selection
 *   4. Dashboard (Overview)
 *   5. JARVIS Assistant
 * Row 1:
 *   6. Study Plan
 *   7. Practice Interface
 *   8. Practice Result
 *   9. Mistake Review
 *   10. Progress Analytics
 * Row 2:
 *   11. GATE Preparation
 *   12. Placement Preparation
 *   13. Resume Builder
 *   14. Mock Interview
 *   15. CSE Labs
 * Row 3:
 *   16. Focus Session
 *   17. Resources
 *   18. Career Tracker
 *   19. Community
 *   20. Achievements
 * Row 4:
 *   21. Mobile View
 *   22. Settings
 *   23. Notifications
 *   24. Quotes / Motivation
 *   25. 404 / Error Page
 */

(function () {
  'use strict';

  const SCREENS_DATA = [
    {
      id: 1,
      slug: '01_landing_hero',
      title: 'Landing / Hero',
      category: 'core',
      quote: 'Discipline Today, A Brighter Tomorrow',
      tagline: 'Your AI-powered companion for GATE, Placements, Internships & Beyond.',
      description: 'Cinematic brand entry with silhouette student overlooking mountain sunrise. Features value proposition, social proof (10K+ Students, 4.9 Rating, All-in-One), and direct call-to-action triggers.',
      components: ['Brand Navbar', 'Value Prop Hero Title', 'Dual Primary/Secondary CTAs', 'Social Proof Badges', 'Cinematic Sunset Background'],
      actionLabel: 'Launch Home Hero',
      action: () => window.navigateToView && window.navigateToView('home')
    },
    {
      id: 2,
      slug: '02_signup_onboarding',
      title: 'Sign Up / Onboarding',
      category: 'core',
      quote: 'Good Students Build Futures',
      tagline: 'Start your journey towards a better you.',
      description: 'Sleek obsidian authentication card with Full Name, Email, Password, and OAuth integrations (Google & GitHub). Sets tone for honest, verified Day 0 progress.',
      components: ['Floating Glass Card', 'Floating Label Input Fields', 'Primary Accent Button', 'OAuth Social Icons', 'Day 0 Setup Hook'],
      actionLabel: 'Open Onboarding',
      action: () => window.openDay0Onboarding ? window.openDay0Onboarding() : window.openModal('profile-modal')
    },
    {
      id: 3,
      slug: '03_goal_selection',
      title: 'Goal Selection',
      category: 'core',
      quote: 'Focus Determines Direction',
      tagline: 'What are your goals? Select all that apply. (Step 2 of 4)',
      description: 'Multi-track calibration interface supporting GATE, Placement, Internship, DSA, Core Subjects, and SWE Projects. Feeds directly into Next Best Action recommendations.',
      components: ['Step Progress Indicator', '6 Interactive Goal Cards', 'Dynamic Multi-Select', 'Back & Next Action Bar'],
      actionLabel: 'Configure Goals',
      action: () => window.openDay0Onboarding ? window.openDay0Onboarding() : window.openModal('profile-modal')
    },
    {
      id: 4,
      slug: '04_dashboard_overview',
      title: 'Dashboard (Overview)',
      category: 'core',
      quote: 'Small steps today, big results tomorrow.',
      tagline: 'Good Morning, Tamizh! Wed, 3 Sep 2026',
      description: 'Central command cockpit with 4 key metrics (Streak, Study Time, Questions Solved, Accuracy), Today’s Plan interactive checklist, and prominent Next Best Action card.',
      components: ['Greeting & Date Banner', '4 Stat Counter Badges', 'Today Plan Checklist', 'Next Best Action Card', 'Quick Search Bar'],
      actionLabel: 'Open Dashboard',
      action: () => window.navigateToView && window.navigateToView('home')
    },
    {
      id: 5,
      slug: '05_jarvis_assistant',
      title: 'JARVIS AI Assistant',
      category: 'core',
      quote: 'Ask, Learn, Plan, Achieve',
      tagline: 'Hi Tamizh! How can I help you today?',
      description: 'Conversational study companion with glowing robot mascot, Tanglish comprehension, speech input/output, and quick action pills (Plan my day, Practice, Explain, Progress).',
      components: ['Cute Glowing Robot Mascot', 'Speech Bubble Greeting', '4 Quick Action Pills', 'Voice Input / Mic Button', 'Safe Whitelist Action Engine'],
      actionLabel: 'Talk to JARVIS',
      action: () => window.openJarvisModal ? window.openJarvisModal() : window.navigateToView('mentor')
    },
    {
      id: 6,
      slug: '06_study_plan',
      title: 'Study Plan',
      category: 'study',
      quote: 'A well planned day is a step towards your dream.',
      tagline: 'Your Personalized Plan • Adaptive Timetable',
      description: 'Weekly and monthly schedule trajectory distributing subjects (TOC, Arrays, DBMS, OS, Aptitude) by cognitive load and personal deadlines.',
      components: ['Week/Month Switcher', 'Daily Schedule Cards', 'Task Duration Pills', 'Active Day Highlighting', 'Load Balancing Engine'],
      actionLabel: 'View Schedule',
      action: () => { window.navigateToView('home'); window.openModal && window.openModal('schedule-modal'); }
    },
    {
      id: 7,
      slug: '07_practice_interface',
      title: 'Practice Interface',
      category: 'study',
      quote: 'Precision Through Practice',
      tagline: 'DSA > Arrays > Easy • Q. 3/20 • Timer: 00:13:34',
      description: 'Distraction-free question arena featuring breadcrumb context, real-time stopwatch, option selector, progressive hint reveal, and clean submit flow.',
      components: ['Breadcrumb Header', 'Live Countdown Stopwatch', 'Question Progress Counter', '4 Radio Answer Pills', 'Hint Drawer & Submit Bar'],
      actionLabel: 'Start Practice',
      action: () => window.navigateToView && window.navigateToView('practice', 'dsa')
    },
    {
      id: 8,
      slug: '08_practice_result',
      title: 'Practice Result',
      category: 'study',
      quote: 'Every Solution Sharpens Your Mind',
      tagline: 'Correct! Well done, Tamizh!',
      description: 'Immediate feedback card with glowing success checkmark, elapsed time, difficulty calibration, concept taxonomy tag, and one-click solution review.',
      components: ['Glowing Emerald Checkmark', 'Time Taken Metric', 'Difficulty Rating Pill', 'Concept Taxonomy Tag', 'Next Question CTA'],
      actionLabel: 'Try Live Question',
      action: () => window.navigateToView && window.navigateToView('practice', 'gate-pyq')
    },
    {
      id: 9,
      slug: '09_mistake_review',
      title: 'Mistake Review Book',
      category: 'study',
      quote: 'Turn Mistakes Into Mastery',
      tagline: 'Mistake Book • All (12), Concept (6), Careless (4), Reattempt (2)',
      description: 'Adaptive spaced-repetition error log classifying student mistakes by root cause (concept gap vs careless arithmetic) with instant one-click review cards.',
      components: ['Classification Filter Tabs', 'Mistake Diagnosis Cards', 'Time Elapsed Timestamp', 'Concept Attribution Tag', 'Reattempt Button'],
      actionLabel: 'Open Mistake Book',
      action: () => window.navigateToView && window.navigateToView('progress', 'mistakes')
    },
    {
      id: 10,
      slug: '10_progress_analytics',
      title: 'Progress Analytics',
      category: 'study',
      quote: 'Progress Over Perfection',
      tagline: 'Overall Readiness: 68% • Weekly Study: 12h 30m',
      description: 'Comprehensive analytics hub with SVG radial readiness gauge, subject mastery horizontal meters (DSA, DBMS, OS, CN, Aptitude), and 7-day study time histogram.',
      components: ['Radial Progress Ring', 'Horizontal Subject Bars', 'Weekly Bar Chart Histogram', 'Streak & Hours Summary', 'Readiness Engine'],
      actionLabel: 'View Analytics',
      action: () => window.navigateToView && window.navigateToView('progress', 'analytics')
    },
    {
      id: 11,
      slug: '11_gate_preparation',
      title: 'GATE Preparation',
      category: 'academic',
      quote: 'Consistency Compounds Results',
      tagline: 'GATE 2027: Structured, Focused, Achievable.',
      description: 'GATE engineering hub containing 8 core CS subject modules (DBMS, OS, CN, TOC, COA, DAA, DS, Math), previous year papers, and 219 days countdown ring.',
      components: ['Subject Grid Matrix', 'PYQ & Mock Test Tabs', 'Countdown Days Ring (219 Days)', 'Cutoff Benchmark Predictor', 'Syllabus Weightage Map'],
      actionLabel: 'Open GATE Hub',
      action: () => window.navigateToView && window.navigateToView('prepare', 'gate')
    },
    {
      id: 12,
      slug: '12_placement_prep',
      title: 'Placement Preparation',
      category: 'academic',
      quote: 'Skills Today, Opportunities Tomorrow',
      tagline: 'Placement Hub: Prepare. Practice. Get Placed.',
      description: 'Campus placement operating cockpit with company-specific roadmaps, aptitude drills, DSA problem track, system design notes, and 65% interview readiness ring.',
      components: ['Placement Stage Tabs', 'Company Track Selector', '6-Point Prep Checklist', 'Readiness Gauge (65%)', 'Salary & Tier Insights'],
      actionLabel: 'Open Placement Hub',
      action: () => window.navigateToView && window.navigateToView('prepare', 'placement')
    },
    {
      id: 13,
      slug: '13_resume_builder',
      title: 'Resume Builder',
      category: 'academic',
      quote: 'Craft Your Professional Identity',
      tagline: 'ATS Resume Studio • Real-Time PDF Generator',
      description: 'Guided 6-step resume studio covering Personal Info, Education, Skills, Projects, Achievements, and Live PDF Preview with ATS score analyzer.',
      components: ['6-Step Wizard Navigation', 'Interactive Skill Tag Cloud', 'Real-Time A4 Preview Card', 'ATS Keyword Matcher', 'Download PDF CTA'],
      actionLabel: 'Open Resume Studio',
      action: () => window.navigateToView && window.navigateToView('career', 'resume')
    },
    {
      id: 14,
      slug: '14_mock_interview',
      title: 'Mock Interview Studio',
      category: 'academic',
      quote: 'Practice Builds Confidence',
      tagline: 'Technical Interview: Practice real interview questions with AI.',
      description: 'Interactive technical, aptitude, HR, and system design mock simulator with AI speech evaluation, question progression, and personalized scoring.',
      components: ['Interview Track Tabs', 'AI Interviewer Persona', 'Voice Recording Waveform', 'Instant Feedback Breakdown', 'Start Mock Interview Button'],
      actionLabel: 'Start Mock Interview',
      action: () => window.navigateToView && window.navigateToView('career', 'interviews')
    },
    {
      id: 15,
      slug: '15_cse_labs',
      title: 'CSE Practical Labs',
      category: 'academic',
      quote: 'Theory Builds Knowledge, Practice Builds Mastery',
      tagline: 'CSE Practical Labs: Learn by Doing. Build Real Skills.',
      description: 'Suite of 6 interactive browser sandboxes: Algorithm Visualizer, SQL Playground, Networking Lab, OS Simulator, TOC Visualizer, and System Design Studio.',
      components: ['6 Interactive Lab Cards', 'Algorithm Step Player', 'In-Browser SQL REPL', 'Network Packet Trace', 'System Architecture Canvas'],
      actionLabel: 'Launch CSE Labs',
      action: () => window.navigateToView && window.navigateToView('cselabs')
    },
    {
      id: 16,
      slug: '16_focus_session',
      title: 'Focus Session',
      category: 'career',
      quote: 'Distraction is expensive. Focus is powerful.',
      tagline: 'Focus Mode • Eliminate distractions. Get things done.',
      description: 'Immersive focus environment with Pomodoro, Deep Work, and Custom timers. Features glowing countdown ring, audio chimes, and "I’m Stuck" AI escape hatch.',
      components: ['Mode Selector (Pomodoro/Deep/Custom)', '25:00 Radial Countdown Ring', 'Start/Pause/Reset Controls', 'I’m Stuck Button', 'Ambient Study Quote'],
      actionLabel: 'Start Focus Session',
      action: () => window.FocusSession ? window.FocusSession.start(25) : window.openFocusModal && window.openFocusModal()
    },
    {
      id: 17,
      slug: '17_resources',
      title: 'Learning Resources',
      category: 'career',
      quote: 'Curated Knowledge for Maximum Retention',
      tagline: 'Learning Resources: Curated content for smarter learning.',
      description: 'Curated library of verified handwritten notes, PYQ solution compilations, video links, textbook summaries, and cheat sheets with direct file download links.',
      components: ['Format Filter Pills', 'Resource Item Cards', 'PDF File Size Badges', 'Download Button', 'Search & Bookmark System'],
      actionLabel: 'Browse Resources',
      action: () => window.navigateToView && window.navigateToView('resources')
    },
    {
      id: 18,
      slug: '18_career_tracker',
      title: 'Career Application Tracker',
      category: 'career',
      quote: 'Track. Prepare. Get Hired.',
      tagline: 'Application Tracker • All, Applied, In Progress, Interview, Offer',
      description: 'Kanban pipeline tracker managing internship and job applications across Google, Microsoft, Amazon, Zoho, and 50+ tech employers with interview reminders.',
      components: ['Status Filter Tabs', 'Company Logo & Role Rows', 'Application Date Badge', 'Status Pill (Interview/Applied)', 'Quick Add Application Form'],
      actionLabel: 'Open Application Tracker',
      action: () => window.navigateToView && window.navigateToView('career', 'applications')
    },
    {
      id: 19,
      slug: '19_community',
      title: 'Peer Community',
      category: 'career',
      quote: 'A Student with a Stronger Community Never Walks Alone',
      tagline: 'Peer Community: Learn. Share. Grow. Together.',
      description: 'Interactive peer network with discussion forums, study partner pairing, daily study hours sharing, and question answering for GATE & placement candidates.',
      components: ['Discussion / Partner / Resource Tabs', 'Post Thread Cards', 'User Avatars & Timestamps', 'Reply Count Badges', 'Ask Community Form'],
      actionLabel: 'Open Peer Community',
      action: () => window.openCommunityModal && window.openCommunityModal()
    },
    {
      id: 20,
      slug: '20_achievements',
      title: 'Achievements & Badges',
      category: 'career',
      quote: 'Small Wins Create Big Momentum',
      tagline: 'Your Achievements • Gamified Milestones & Streaks',
      description: 'Evidence-based achievement studio honoring authentic study habits: 7 Day Streak, 100 Questions, First Mock Test, Concept Master, Focus Pro, and Consistent Learner.',
      components: ['Badge Grid Matrix', 'Glowing Achievement Medals', 'Unlock Criteria Tooltip', 'Progress Towards Next Badge', 'Share Milestone Button'],
      actionLabel: 'View Achievements',
      action: () => window.openAchievementsModal && window.openAchievementsModal()
    },
    {
      id: 21,
      slug: '21_mobile_view',
      title: 'Mobile Responsive View',
      category: 'system',
      quote: 'Learn Adapt Grow Succeed',
      tagline: 'Pocket-Ready Career Preparation OS',
      description: 'Mobile viewport ergonomics featuring bottom thumb navigation (Home, Plan, Practice, JARVIS, More), compact dashboard metrics, and swipeable study cards.',
      components: ['Sticky Bottom Navigation Bar', 'Compact Stat Pills', 'Touch-Friendly Today Tasks', 'Slide-Out Drawer Menu', 'Thumb-Zone Floating Mic'],
      actionLabel: 'Preview Mobile Layout',
      action: () => {
        alert('GT Study Mentor Pro is 100% mobile responsive. Resize your browser or open on mobile to experience the native thumb-bar layout!');
      }
    },
    {
      id: 22,
      slug: '22_settings',
      title: 'Preferences & Settings',
      category: 'system',
      quote: 'Customize Your Experience',
      tagline: 'Settings • Profile, Appearance, AI Provider, Data & Privacy',
      description: 'Complete user configuration console: Theme mode (Dark/Light/System), AI provider fallback (Gemini/Claude/OpenAI/Local), notification alerts, and data backup.',
      components: ['Settings Vertical Nav', 'Theme Toggle Radio (Dark/Light)', 'AI Provider Dropdown', 'Notification Frequency Sliders', 'Export / Backup Data'],
      actionLabel: 'Open Settings',
      action: () => window.navigateToView && window.navigateToView('settings')
    },
    {
      id: 23,
      slug: '23_notifications',
      title: 'Notification Center',
      category: 'system',
      quote: 'Timely Prompts, Zero Noise',
      tagline: 'Notifications • Real-Time Daily Study & Revision Alerts',
      description: 'Notification drawer surfacing actionable preparation alerts: Daily plan readiness, due spaced-repetition revisions, new practice questions, and mock interview reminders.',
      components: ['Timestamped Alert Rows', 'Notification Type Icons', 'Mark All Read Action', 'Direct Jump-to-Action Link', 'Clear All Drawer'],
      actionLabel: 'Open Notifications',
      action: () => window.openNotificationsModal && window.openNotificationsModal()
    },
    {
      id: 24,
      slug: '24_quotes_motivation',
      title: 'Quotes / Motivation',
      category: 'system',
      quote: 'Discipline Today, A Brighter Tomorrow',
      tagline: 'Inspirational Scenic Reflection Studio',
      description: 'Full-screen serene aesthetic visualization pairing panoramic sunset mountain scenery with daily motivational guidance to inspire sustained focus.',
      components: ['High-Resolution Mountain Vista', 'Cinematic Serif Typography', 'Daily Rotating Quote Engine', 'Audio Calm Focus Chime', 'Download Wallpaper Button'],
      actionLabel: 'View Motivation Studio',
      action: () => window.openMotivationModal && window.openMotivationModal()
    },
    {
      id: 25,
      slug: '25_404_error_page',
      title: '404 / Error Page',
      category: 'system',
      quote: 'Every Explorer Finds Their Way',
      tagline: 'Oops! Looks like you’re lost. Let’s get you back on track.',
      description: 'Friendly 404 recovery state featuring a cute robot astronaut sitting on a starry cliff with laptop, comforting lost students and routing them safely back to Dashboard.',
      components: ['Illustrated Robot Astronaut Mascot', 'Compassionate Error Heading', 'Helpful Guidance Copy', 'Primary "Go Home" CTA', 'Quick Search Input'],
      actionLabel: 'Preview 404 Recovery',
      action: () => window.open404Modal && window.open404Modal()
    }
  ];

  let currentCategory = 'all';
  let searchQuery = '';

  function initStudio() {
    renderStudioGrid();
  }

  function renderStudioGrid() {
    const container = document.getElementById('designs-grid-container');
    if (!container) return;

    let filtered = SCREENS_DATA;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(s => s.category === currentCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    }

    const countLabel = document.getElementById('designs-count-label');
    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of 25 UI/UX Screens`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text);">No design screens match "${escapeHtml(searchQuery)}"</div>
          <div style="font-size: 13px; margin-top: 6px;">Try searching for "Hero", "GATE", "Mock", "Labs", "JARVIS", or reset the filter.</div>
          <button onclick="window.UIUXStudio.resetFilter()" style="margin-top: 16px; padding: 8px 18px; border-radius: var(--radius-full); background: var(--primary); color: white; border: none; font-weight: 700; cursor: pointer;">Show All 25 Screens</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(screen => `
      <div class="design-card nd-card-lift" id="design-card-${screen.id}">
        <div class="design-card-thumb-wrap" onclick="window.UIUXStudio.inspect(${screen.id})">
          <img src="assets/ui_ux_designs/${screen.slug}.jpg" alt="${screen.title}" class="design-card-thumb" loading="lazy" />
          <div class="design-card-badge">${screen.id < 10 ? '0' + screen.id : screen.id}</div>
          <div class="design-card-hover-overlay">
            <span>🔍 Zoom & Inspect</span>
          </div>
        </div>
        <div class="design-card-body">
          <div class="design-card-meta">
            <span class="design-cat-badge design-cat-${screen.category}">${getCategoryName(screen.category)}</span>
            <span class="design-screen-num">Screen ${screen.id} / 25</span>
          </div>
          <h3 class="design-card-title">${screen.title}</h3>
          <p class="design-card-tagline">“${screen.quote}”</p>
          <p class="design-card-desc">${screen.description}</p>
          <div class="design-card-chips">
            ${screen.components.slice(0, 3).map(c => `<span class="design-chip">${c}</span>`).join('')}
            ${screen.components.length > 3 ? `<span class="design-chip">+${screen.components.length - 3}</span>` : ''}
          </div>
          <div class="design-card-actions">
            <button class="design-btn-inspect" onclick="window.UIUXStudio.inspect(${screen.id})">
              <span>🔍</span> <span>Inspect</span>
            </button>
            <button class="design-btn-launch" onclick="window.UIUXStudio.launch(${screen.id})">
              <span>🚀</span> <span>${screen.actionLabel}</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function getCategoryName(cat) {
    const map = {
      'core': 'Core Flow',
      'study': 'Practice & Review',
      'academic': 'Prep & Labs',
      'career': 'Career & Habits',
      'system': 'System & Polish'
    };
    return map[cat] || cat;
  }

  function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.design-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    renderStudioGrid();
  }

  function setSearch(query) {
    searchQuery = query;
    renderStudioGrid();
  }

  function resetFilter() {
    currentCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('design-search-input');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.design-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === 'all');
    });
    renderStudioGrid();
  }

  function inspect(id) {
    const screen = SCREENS_DATA.find(s => s.id === id);
    if (!screen) return;

    let modal = document.getElementById('design-lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'design-lightbox-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card design-lightbox-card">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="design-lightbox-badge">${screen.id < 10 ? '0' + screen.id : screen.id}</span>
            <div>
              <h2 class="modal-title" style="margin:0;">${screen.title}</h2>
              <div style="font-size:11px;color:var(--accent);">${getCategoryName(screen.category)} • GT Study Mentor Pro UI/UX Specification</div>
            </div>
          </div>
          <button class="modal-close" onclick="document.getElementById('design-lightbox-modal').classList.remove('open')" aria-label="Close modal">×</button>
        </div>
        <div class="design-lightbox-content">
          <div class="design-lightbox-media-wrap">
            <img src="assets/ui_ux_designs/${screen.slug}.jpg" alt="${screen.title}" class="design-lightbox-img" />
            <div class="design-lightbox-caption">“${screen.quote}” — ${screen.tagline}</div>
          </div>
          <div class="design-lightbox-spec">
            <h4 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-sub);margin-bottom:8px;">UX Architecture & User Intent</h4>
            <p style="font-size:13px;line-height:1.6;color:var(--text);margin-bottom:16px;">${screen.description}</p>
            
            <h4 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-sub);margin-bottom:8px;">Core Design Tokens & Components</h4>
            <ul style="list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:6px;">
              ${screen.components.map(c => `
                <li style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-sub);">
                  <span style="color:var(--success);font-size:14px;">✓</span>
                  <span>${c}</span>
                </li>
              `).join('')}
            </ul>

            <div style="display:flex;gap:10px;margin-top:auto;">
              <button class="cta-pill-primary" style="flex:1;" onclick="document.getElementById('design-lightbox-modal').classList.remove('open'); window.UIUXStudio.launch(${screen.id});">
                <span>🚀</span> <span>${screen.actionLabel}</span>
              </button>
              <button class="cta-pill-secondary" onclick="window.UIUXStudio.openMasterBoard();">
                <span>🗺️</span> <span>View Master Board</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  function launch(id) {
    const screen = SCREENS_DATA.find(s => s.id === id);
    if (screen && typeof screen.action === 'function') {
      screen.action();
    }
  }

  function openMasterBoard() {
    let modal = document.getElementById('design-master-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'design-master-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 90vw; width: 1100px; padding: 24px;">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">GT Study Mentor Pro — Complete 25-Screen Master Board</h2>
            <div style="font-size: 12px; color: var(--accent);">5x5 Integrated UI/UX Design System Specification</div>
          </div>
          <button class="modal-close" onclick="document.getElementById('design-master-modal').classList.remove('open')">×</button>
        </div>
        <div style="margin: 16px 0; max-height: 72vh; overflow: auto; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center; background: #000;">
          <img src="assets/ui_ux_designs/ui_ux_master_board.jpg" alt="Master Design Board" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted);">
          <span>25 High-Fidelity Screens Covering End-to-End 90-Day OS</span>
          <button class="cta-pill-primary" onclick="document.getElementById('design-master-modal').classList.remove('open'); window.navigateToView('designs');">Explore All 25 Screens Individually →</button>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Dedicated Modals for Screens 19, 20, 23, 24, 25 ---
  function openCommunityModal() {
    let modal = document.getElementById('community-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'community-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 680px; width: 95%;">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">👥 Peer Community</h2>
            <div style="font-size: 12px; color: var(--text-muted);">Learn. Share. Grow. Together. • Screen 19</div>
          </div>
          <button class="modal-close" onclick="document.getElementById('community-modal').classList.remove('open')">×</button>
        </div>
        <div style="margin-top: 14px;">
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="subtab-pill active" style="font-size:12px;padding:6px 14px;">💬 Discussions</button>
            <button class="subtab-pill" style="font-size:12px;padding:6px 14px;" onclick="alert('Study Partner matching is active. 14 students matched this week!')">🤝 Study Partners</button>
            <button class="subtab-pill" style="font-size:12px;padding:6px 14px;" onclick="window.navigateToView('resources')">📚 Shared Resources</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;max-height:55vh;overflow-y:auto;padding-right:4px;">
            <div class="community-thread-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <div class="community-avatar">AK</div>
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:700;color:var(--text);">Anyone preparing for GATE 2027 together? Let’s form a focus group!</div>
                  <div style="font-size:11px;color:var(--text-muted);">Posted by Arun K. • 2 hours ago in #GATE2027</div>
                </div>
                <span class="community-tag">6 replies</span>
              </div>
              <p style="font-size:12px;color:var(--text-sub);line-height:1.4;margin:0;">Looking for serious peers aiming for top 100 AIR in CSE. We do 2 focus sessions daily and solve 10 PYQs every night.</p>
            </div>

            <div class="community-thread-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <div class="community-avatar" style="background:linear-gradient(135deg,#0D9488,#38BDF8);">SM</div>
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:700;color:var(--text);">Best resources for DBMS Normalization & Decomposition?</div>
                  <div style="font-size:11px;color:var(--text-muted);">Posted by Sneha M. • 5 hours ago in #CoreSubjects</div>
                </div>
                <span class="community-tag">12 replies</span>
              </div>
              <p style="font-size:12px;color:var(--text-sub);line-height:1.4;margin:0;">Check the Resources section! Hand-written notes with 3NF and BCNF lossy/lossless examples are pinned.</p>
            </div>

            <div class="community-thread-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <div class="community-avatar" style="background:linear-gradient(135deg,#F59E0B,#EF4444);">VR</div>
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:700;color:var(--text);">Share your daily study hours challenge — Day 15 progress!</div>
                  <div style="font-size:11px;color:var(--text-muted);">Posted by Vikram R. • 1 day ago in #Consistency</div>
                </div>
                <span class="community-tag">20 replies</span>
              </div>
              <p style="font-size:12px;color:var(--text-sub);line-height:1.4;margin:0;">Logged 4.5 hours today across DSA graphs and OS memory management. Keep the streak going!</p>
            </div>
          </div>

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border-subtle);display:flex;gap:10px;">
            <input type="text" placeholder="Start a new discussion or ask a peer question..." style="flex:1;background:var(--depth-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text);font-size:13px;" />
            <button class="cta-pill-primary" onclick="alert('Your post has been published to the Peer Community!')">Post</button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function openAchievementsModal() {
    let modal = document.getElementById('achievements-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'achievements-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 640px; width: 95%;">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">🏆 Your Achievements</h2>
            <div style="font-size: 12px; color: var(--text-muted);">Small Wins Create Big Momentum • Screen 20</div>
          </div>
          <button class="modal-close" onclick="document.getElementById('achievements-modal').classList.remove('open')">×</button>
        </div>
        <div style="margin-top: 14px;">
          <div class="achievements-grid">
            <div class="achievement-badge-card unlocked">
              <div class="achievement-icon">⚡</div>
              <div class="achievement-title">7 Day Streak</div>
              <div class="achievement-desc">Completed study focus sessions for 7 consecutive days.</div>
              <div class="achievement-status">Unlocked 🌟</div>
            </div>

            <div class="achievement-badge-card unlocked">
              <div class="achievement-icon">💯</div>
              <div class="achievement-title">100 Questions</div>
              <div class="achievement-desc">Solved 100+ GATE & DSA practice questions with verified logs.</div>
              <div class="achievement-status">Unlocked 🌟</div>
            </div>

            <div class="achievement-badge-card unlocked">
              <div class="achievement-icon">🎯</div>
              <div class="achievement-title">First Mock Test</div>
              <div class="achievement-desc">Attempted and analyzed a full-length timed mock test.</div>
              <div class="achievement-status">Unlocked 🌟</div>
            </div>

            <div class="achievement-badge-card in-progress">
              <div class="achievement-icon">🧠</div>
              <div class="achievement-title">Concept Master</div>
              <div class="achievement-desc">Achieved 80%+ accuracy across 5 fundamental core subjects.</div>
              <div class="achievement-status">3 / 5 Subjects</div>
            </div>

            <div class="achievement-badge-card in-progress">
              <div class="achievement-icon">⏱️</div>
              <div class="achievement-title">Focus Pro</div>
              <div class="achievement-desc">Accumulated 50+ total hours of deep focus study sessions.</div>
              <div class="achievement-status">12.5 / 50 hrs</div>
            </div>

            <div class="achievement-badge-card locked">
              <div class="achievement-icon">🚀</div>
              <div class="achievement-title">Consistent Learner</div>
              <div class="achievement-desc">Maintain active preparation through Day 30 without interruption.</div>
              <div class="achievement-status">Locked (Day 0)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function openNotificationsModal() {
    let modal = document.getElementById('notifications-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notifications-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 520px; width: 95%;">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">🔔 Notification Center</h2>
            <div style="font-size: 12px; color: var(--text-muted);">Real-Time Study & Career Alerts • Screen 23</div>
          </div>
          <button class="modal-close" onclick="document.getElementById('notifications-modal').classList.remove('open')">×</button>
        </div>
        <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
          <div class="notif-item-card unread">
            <div class="notif-icon" style="background:rgba(56,189,248,0.15);color:var(--accent);">📋</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--text);">Your daily plan is ready!</div>
              <div style="font-size:11px;color:var(--text-sub);">JARVIS calibrated your Day 0 Orientation milestones.</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);">2 min ago</span>
          </div>

          <div class="notif-item-card unread">
            <div class="notif-icon" style="background:rgba(245,158,11,0.15);color:var(--warning);">🔄</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--text);">DBMS Revision is due</div>
              <div style="font-size:11px;color:var(--text-sub);">Spaced repetition flagged Normalization for 20-min review.</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);">10 min ago</span>
          </div>

          <div class="notif-item-card">
            <div class="notif-icon" style="background:rgba(16,185,129,0.15);color:var(--success);">🧩</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--text);">New practice questions available</div>
              <div style="font-size:11px;color:var(--text-sub);">5 new GATE 2026 PYQs added for Operating Systems.</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);">1 hour ago</span>
          </div>

          <div class="notif-item-card">
            <div class="notif-icon" style="background:rgba(129,140,248,0.15);color:var(--primary-light);">🎙️</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--text);">Mock interview scheduled</div>
              <div style="font-size:11px;color:var(--text-sub);">Technical DSA interview simulation ready whenever you are.</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);">3 hours ago</span>
          </div>

          <div class="notif-item-card">
            <div class="notif-icon" style="background:rgba(239,68,68,0.15);color:var(--danger);">💼</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:var(--text);">Application status updated (Microsoft)</div>
              <div style="font-size:11px;color:var(--text-sub);">SWE Intern application moved to Interview stage!</div>
            </div>
            <span style="font-size:10px;color:var(--text-muted);">1 day ago</span>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function openMotivationModal() {
    let modal = document.getElementById('quote-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quote-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 800px; width: 95%; padding: 0; overflow: hidden; background: #000;">
        <div style="position:relative;min-height:440px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;text-align:center;background:linear-gradient(to bottom, rgba(5,8,20,0.3) 0%, rgba(5,8,20,0.85) 100%), url('assets/ui_ux_designs/24_quotes_motivation.jpg') center/cover no-repeat;">
          <button class="modal-close" style="position:absolute;top:16px;right:16px;background:rgba(0,0,0,0.5);border-radius:50%;width:36px;height:36px;" onclick="document.getElementById('quote-modal').classList.remove('open')">×</button>
          <div style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--accent);margin-bottom:16px;">Daily Inspiration • Screen 24</div>
          <h1 style="font-family:'Instrument Serif', serif;font-size:3rem;font-weight:400;color:#FFFFFF;margin-bottom:16px;line-height:1.2;text-shadow:0 4px 20px rgba(0,0,0,0.8);">
            “Discipline Today,<br><span style="color:var(--accent);">A Brighter Tomorrow”</span>
          </h1>
          <p style="font-size:15px;color:rgba(255,255,255,0.85);max-width:520px;line-height:1.6;margin-bottom:28px;">
            Preparation isn’t about 10 hours on one weekend. It’s about 45 dedicated minutes every day that compounds into extraordinary mastery.
          </p>
          <div style="display:flex;gap:12px;">
            <button class="cta-pill-primary" onclick="document.getElementById('quote-modal').classList.remove('open'); window.FocusSession ? window.FocusSession.start(45) : null;">
              <span>⚡</span> <span>Start 45-Min Focus</span>
            </button>
            <button class="cta-pill-secondary" onclick="document.getElementById('quote-modal').classList.remove('open'); window.navigateToView('designs');">
              <span>🎨</span> <span>Back to 25 UI/UX Screens</span>
            </button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function open404Modal() {
    let modal = document.getElementById('error-404-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'error-404-modal';
      modal.className = 'modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 620px; width: 95%; text-align:center; padding: 32px 24px;">
        <div style="margin: 0 auto 16px; max-width: 320px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle);">
          <img src="assets/ui_ux_designs/25_404_error_page.jpg" alt="404 Explorer Robot Astronaut" style="width: 100%; display: block;" />
        </div>
        <div style="font-size: 11px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent);">Error 404 • Explorer Recovery State</div>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text); margin: 8px 0 10px;">Oops! Looks like you’re lost.</h2>
        <p style="font-size: 13px; color: var(--text-sub); max-width: 440px; margin: 0 auto 24px; line-height: 1.5;">
          Every explorer finds their way. Even when algorithms recurse unexpectedly, JARVIS will guide you safely back on track.
        </p>
        <div style="display:flex;justify-content:center;gap:12px;">
          <button class="cta-pill-primary" onclick="document.getElementById('error-404-modal').classList.remove('open'); window.navigateToView('home');">
            <span>🏠</span> <span>Return to Dashboard</span>
          </button>
          <button class="cta-pill-secondary" onclick="document.getElementById('error-404-modal').classList.remove('open'); window.navigateToView('designs');">
            <span>🎨</span> <span>View Design Studio</span>
          </button>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  // Global Exports
  window.UIUXStudio = {
    init: initStudio,
    setCategory,
    setSearch,
    resetFilter,
    inspect,
    launch,
    openMasterBoard,
    openCommunityModal,
    openAchievementsModal,
    openNotificationsModal,
    openMotivationModal,
    open404Modal,
    getScreens: () => SCREENS_DATA
  };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }

})();
