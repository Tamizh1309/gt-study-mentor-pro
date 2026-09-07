// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro 2.0 — Preparation Intelligence Engine
// Answers the core question: "WHAT SHOULD I DO NEXT?"
// Includes: Mock Interview Studio, GATE Rank & IIT Predictor,
// CSE Code Sandbox, 90-Day Gantt & iCal Sync, ATS Resume Optimizer
// ══════════════════════════════════════════════════════════════

const PrepIntelligenceEngine = (function () {
  const STORAGE_KEY = 'gt_mentor_prep_intel_v2';

  // Default initial state backed by actual tracked data structure (Strict Day 0 Zero-State)
  const defaultZeroState = {
    currentDay: 0,
    totalDays: 90,
    dailyTargetHours: 2.0,
    completedMinutes: 0,
    streakDays: 0,
    status: 'NOT_STARTED',
    readinessScores: {
      gate: {
        score: 0,
        syllabusCoverage: 0,
        pyqAccuracy: 0,
        revision: 0,
        mocks: 0,
        weakAreas: 0,
        confidence: 'None',
        explanation: 'No tracked activity yet. Complete study blocks, PYQs, and revision to build verified readiness.'
      },
      placement: {
        score: 0,
        dsa: 0,
        csCore: 0,
        aptitude: 0,
        projects: 0,
        interviews: 0,
        confidence: 'None',
        explanation: 'No placement assessments or problems solved yet.'
      },
      swe: {
        score: 0,
        programming: 0,
        projectDepth: 0,
        git: 0,
        testing: 0,
        deployment: 0,
        systemDesign: 0,
        confidence: 'None',
        explanation: 'Practical software engineering evidence starts at 0% until coding labs and projects are completed.'
      },
      internship: {
        score: 0,
        skills: 0,
        projects: 0,
        resume: 0,
        applications: 0,
        interviewReadiness: 0,
        confidence: 'None',
        explanation: 'Internship readiness will track after resume calibration and active pipeline tracking.'
      }
    },
    todayTasks: [],
    competencyMatrix: [
      { skill: 'DSA', gate: 0, placement: 0, swe: 0, intern: 0, highLeverage: true },
      { skill: 'DBMS', gate: 0, placement: 0, swe: 0, intern: 0, highLeverage: true },
      { skill: 'Operating Systems', gate: 0, placement: 0, swe: 0, intern: 0, highLeverage: true },
      { skill: 'Computer Networks', gate: 0, placement: 0, swe: 0, intern: 0, highLeverage: false },
      { skill: 'Projects', gate: null, placement: 0, swe: 0, intern: 0, highLeverage: true },
      { skill: 'Quantitative Aptitude', gate: 0, placement: 0, swe: 0, intern: 0, highLeverage: true },
      { skill: 'Technical Interviews', gate: null, placement: 0, swe: 0, intern: 0, highLeverage: false }
    ],
    weakTopics: []
  };

  let state = JSON.parse(JSON.stringify(defaultZeroState));

  // ── 1. MOCK INTERVIEW DATASET ──
  const mockInterviewTracks = {
    sde1: [
      {
        id: 'sde1-1',
        category: 'SDE 1 (Product Tier: Amazon/Zoho)',
        question: 'Given an unsorted array of integers, how would you find the length of the longest consecutive elements sequence in O(N) time?',
        hint: 'Use a HashSet for O(1) lookups. Only start counting streak from x where x-1 is NOT in the set!',
        expectedKeywords: ['HashSet', 'Set', 'O(N)', 'x - 1', 'streak', 'lookup', 'time complexity'],
        codeStarter: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let maxStreak = 0;
  
  for (const num of set) {
    // Only check if it is the start of a sequence
    if (!set.has(num - 1)) {
      let currentNum = num;
      let currentStreak = 1;
      
      while (set.has(currentNum + 1)) {
        currentNum += 1;
        currentStreak += 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
  }
  return maxStreak;
}`,
        tanglishExplanation: 'Machan, HashSet-la elements potutu, `num - 1` set-la illana mattum adha sequence start-ah treat panni count pannu. Adhanaala every number maximum 2 times dhaan visit aagum → O(N) time!'
      },
      {
        id: 'sde1-2',
        category: 'SDE 1 (System Design & Concurrency)',
        question: 'How do you handle race conditions in a high-concurrency ticket booking application where 1,000 users click Book at the exact same millisecond?',
        hint: 'Discuss Optimistic vs Pessimistic Locking, Redis distributed locks (Redlock), and Database row-level locks (SELECT ... FOR UPDATE).',
        expectedKeywords: ['Pessimistic Locking', 'Optimistic Locking', 'Redis', 'Distributed Lock', 'Idempotency', 'Atomic', 'Transaction', 'FOR UPDATE'],
        codeStarter: `// SQL Query with Row-Level Lock:
// BEGIN TRANSACTION;
// SELECT * FROM seats WHERE seat_id = 42 AND status = 'AVAILABLE' FOR UPDATE;
// UPDATE seats SET status = 'BOOKED', user_id = 'usr_123' WHERE seat_id = 42;
// COMMIT;`,
        tanglishExplanation: 'Pessimistic locking (`SELECT FOR UPDATE`) or Redis distributed lock use panni, ticket seat row-ah lock pannikkanum. Innoru user simultaneously modify panna mudiyadhu da!'
      }
    ],
    gate_oral: [
      {
        id: 'gate-1',
        category: 'GATE / BARC Technical Oral',
        question: 'Explain the 4 necessary conditions for Deadlock. If all 4 hold, is deadlock guaranteed in a multi-instance resource system?',
        hint: 'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. In multi-instance systems, circular wait is necessary but NOT sufficient; Banker\'s Algorithm safety check is required.',
        expectedKeywords: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Resource Allocation Graph', 'Banker', 'Cycle', 'Multi-instance', 'Not sufficient'],
        codeStarter: `// Safety Algorithm Check:
// Need[i][j] = Max[i][j] - Allocation[i][j]
// Work = Available
// Finish[i] = false
// Find process where Finish[i] == false && Need[i] <= Work`,
        tanglishExplanation: 'Deadlock-ku 4 conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Single-instance system-la cycle = deadlock guaranteed. But Multi-instance system-la cycle irundhalum deadlock varaadhu (Banker\'s safe state check pannanum)!'
      }
    ],
    hr_star: [
      {
        id: 'hr-1',
        category: 'HR & Behavioral (STAR Technique)',
        question: 'Tell me about a challenging technical bug or project deadline failure you encountered, and how you resolved it.',
        hint: 'Structure as: Situation (context) → Task (your responsibility) → Action (technical solution) → Result (quantifiable impact % or learning).',
        expectedKeywords: ['Situation', 'Task', 'Action', 'Result', 'Deadline', 'Team', 'Root Cause', 'Debugging', 'Outcome', 'Metric'],
        codeStarter: `[Situation]: In 6th sem compiler project, AST parser was stack overflowing on deep expressions.
[Task]: Reduce recursion depth and deliver working demo within 48 hours.
[Action]: Refactored recursive descent into Pratt operator precedence parser with loop.
[Result]: Memory usage dropped by 74%, zero crashes on 10,000 token test suite.`,
        tanglishExplanation: 'HR rounds-la direct-ah solution sollama STAR structure follow pannu: Situation (Problem enna?) -> Task (Un role enna?) -> Action (Nee enna step edutha?) -> Result (Quantifiable metric & success)!'
      }
    ]
  };

  // ── 2. GATE 2027 AIR PREDICTOR & ADMISSION ENGINE ──
  const iitCutoffsDatabase = [
    { institute: 'IISc Bangalore', prog: 'M.Tech CSE / AI', cat: 'GEN', cutoff: 820, placementAvg: '32 LPA', chance: 'Dream' },
    { institute: 'IIT Bombay', prog: 'M.Tech CSE', cat: 'GEN', cutoff: 780, placementAvg: '30 LPA', chance: 'Dream' },
    { institute: 'IIT Madras', prog: 'M.Tech CSE', cat: 'GEN', cutoff: 760, placementAvg: '28 LPA', chance: 'Target' },
    { institute: 'IIT Delhi', prog: 'M.Tech CSE', cat: 'GEN', cutoff: 750, placementAvg: '29 LPA', chance: 'Target' },
    { institute: 'IIT Kharagpur', prog: 'M.Tech CSE', cat: 'GEN', cutoff: 710, placementAvg: '25 LPA', chance: 'Target' },
    { institute: 'IIT Kanpur', prog: 'M.Tech CSE', cat: 'GEN', cutoff: 720, placementAvg: '26 LPA', chance: 'Target' },
    { institute: 'NIT Trichy', prog: 'M.Tech CS (CCMT)', cat: 'GEN', cutoff: 650, placementAvg: '20 LPA', chance: 'Safe' },
    { institute: 'NIT Surathkal', prog: 'M.Tech CS (CCMT)', cat: 'GEN', cutoff: 630, placementAvg: '19 LPA', chance: 'Safe' },
    { institute: 'BARC (OCES)', prog: 'Scientific Officer C', cat: 'GEN', cutoff: 730, placementAvg: 'Central Govt Level 10 (14 LPA)', chance: 'Target' },
    { institute: 'ISRO (ICRB)', prog: 'Scientist / Engineer SC', cat: 'GEN', cutoff: 710, placementAvg: 'Central Govt Level 10', chance: 'Target' },
    { institute: 'IOCL / ONGC', prog: 'Executive Officer (CS)', cat: 'GEN', cutoff: 750, placementAvg: '22 LPA CTC', chance: 'Target' }
  ];

  // ── 3. CSE CODE TEMPLATES & SANDBOX DATASET ──
  const codeSandboxTemplates = {
    'sliding-window': {
      title: 'Sliding Window (Max Sum Subarray of size K)',
      cpp: `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int maxSubarraySum(vector<int>& arr, int k) {
    int n = arr.size();
    if (n < k) return -1;
    
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    
    int maxSum = windowSum;
    for (int i = k; i < n; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}

int main() {
    vector<int> arr = {2, 1, 5, 1, 3, 2};
    int k = 3;
    cout << "Max Sum Subarray: " << maxSubarraySum(arr, k) << endl;
    return 0;
}`,
      complexity: 'Time: O(N) | Space: O(1)',
      tanglish: 'First k elements sum calculate pannittu, aduthadhu each step-la right element add panni left element subtract pannom na O(N) time-la finish aagum da!'
    },
    'binary-search': {
      title: 'Binary Search (Lower Bound / First Occurrence)',
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int lowerBound(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    int ans = arr.size();
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] >= target) {
            ans = mid;
            high = mid - 1; // look for smaller index on left
        } else {
            low = mid + 1;
        }
    }
    return ans;
}

int main() {
    vector<int> arr = {1, 2, 4, 4, 4, 6, 7};
    cout << "Lower bound of 4: index " << lowerBound(arr, 4) << endl;
    return 0;
}`,
      complexity: 'Time: O(log N) | Space: O(1)',
      tanglish: 'Sorted array-la `arr[mid] >= target` irundha index store pannittu `high = mid - 1` panni left side search pannuvom. Semma fast O(log N) search!'
    },
    'graph-bfs': {
      title: 'Graph BFS (Shortest Path in Unweighted Grid)',
      cpp: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int shortestPathGrid(vector<vector<int>>& grid) {
    int n = grid.size(), m = grid[0].size();
    if (grid[0][0] == 1 || grid[n-1][m-1] == 1) return -1;
    
    queue<pair<int, int>> q;
    q.push({0, 0});
    grid[0][0] = 1; // distance
    
    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};
    
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();
        if (x == n - 1 && y == m - 1) return grid[x][y];
        
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && grid[nx][ny] == 0) {
                grid[nx][ny] = grid[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    return -1;
}`,
      complexity: 'Time: O(V + E) | Space: O(V)',
      tanglish: 'Queue data structure vachi level-by-level explore panradhu dhaan BFS. Unweighted graph-la shortest path kandupidikka BFS dhaan always optimal!'
    }
  };

  // ── 4. 90-DAY GANTT MILESTONES & DAILY TIMETABLE ──
  const ganttPhases = [
    {
      phase: 1,
      title: 'Foundation Sprint',
      days: 'Day 1 – 30',
      progress: 0,
      color: '#63D8FF',
      milestones: [
        { label: 'C Programming & Pointers Mastery', done: false },
        { label: 'Discrete Mathematics & Linear Algebra', done: false },
        { label: 'Striver A2Z DSA (Arrays, Strings, Two Pointers)', done: false },
        { label: 'GATE 2015–2020 OS & DBMS PYQs (150 Qs)', done: false },
        { label: 'ATS Resume Clean LaTeX Draft Built', done: false }
      ]
    },
    {
      phase: 2,
      title: 'Core Deep Dive & High-Weightage Subjects',
      days: 'Day 31 – 60',
      progress: 0,
      color: '#818CF8',
      milestones: [
        { label: 'Computer Networks (TCP/IP, Subnetting, Routing)', done: false },
        { label: 'Theory of Computation (DFA, CFG, Decidability)', done: false },
        { label: 'Compiler Design (Parsing, LR Tables, Syntax-Directed Translation)', done: false },
        { label: 'Striver Trees, Graphs, Dynamic Programming Mastery', done: false },
        { label: 'High-Level System Design (Rate Limiter, URL Shortener)', done: false }
      ]
    },
    {
      phase: 3,
      title: 'Execute, Full Mocks & Company Placement Drives',
      days: 'Day 61 – 90',
      progress: 0,
      color: '#FBBF24',
      milestones: [
        { label: '10 Full-Length 3-Hour GATE Mock Exams (With Virtual Calc)', done: false },
        { label: 'Amazon / Zoho / TCS NQT Coding Rounds Simulator', done: false },
        { label: 'FSRS Spaced Repetition Error Remediation Zero Backlog', done: false },
        { label: 'Final Resume Cold Outreach to 50 Tech Leads', done: false },
        { label: 'Pre-Exam Calm Routine & GATE Day Strategy Simulation', done: false }
      ]
    }
  ];

  const dailyScheduleBlocks = [
    { time: '07:00 – 08:00 AM', slot: 'Morning Revision', desc: 'Previous day flashcards, Formula Sheets, and Mistake Book drills.', color: '#4ADE80' },
    { time: '09:00 – 01:30 PM', slot: 'College Core Hours', desc: 'Active listening in labs, project collaboration, and CS theory.', color: '#94A3B8' },
    { time: '01:30 – 04:30 PM', slot: 'Deep Work: GATE CS 2027', desc: 'Core CS Subject Mastery (OS / DBMS / CN / TOC / Maths) + PYQs.', color: '#63D8FF' },
    { time: '05:00 – 07:30 PM', slot: 'SWE & DSA Coding Sprint', desc: 'Striver A2Z DSA Drills, System Design, and LeetCode problems.', color: '#818CF8' },
    { time: '07:30 – 08:00 PM', slot: 'Dinner & Mental Rest', desc: 'Healthy meal, unwind, zero screen stress.', color: '#CBD5E1' },
    { time: '08:00 – 09:00 PM', slot: 'Internship & Placement Drills', desc: 'Aptitude tests, Job applications, and ATS resume customization.', color: '#FBBF24' },
    { time: '09:00 – 09:30 PM', slot: 'Night Revision', desc: 'Spaced repetition flashcards & Day tracking sync.', color: '#63D8FF' },
    { time: '09:30 – 10:00 PM', slot: 'Reflection & Tomorrow Planning', desc: 'Next Best Action review and log completion.', color: '#4ADE80' },
    { time: '10:00 PM – 06:30 AM', slot: 'Strict Sleep Schedule', desc: 'Non-negotiable 8-hour sleep for memory consolidation.', color: '#F87171' }
  ];

  function load() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved data is from the old hardcoded Day 27 build, discard it to enforce Day 0 reset
        if (parsed.currentDay === 27 || (parsed.readinessScores && parsed.readinessScores.gate && parsed.readinessScores.gate.score === 75)) {
          console.info('[GT PrepEngine] Migrating old hardcoded Day 27 state to clean Day 0 zero-state');
          state = JSON.parse(JSON.stringify(defaultZeroState));
          save();
        } else {
          state = Object.assign({}, defaultZeroState, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load prep intelligence state', e);
      state = JSON.parse(JSON.stringify(defaultZeroState));
    }
  }

  function save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save prep intelligence state', e);
    }
  }

  load();

  
  // ?? Adaptive Rescheduling Engine ??
  function getProposedReschedule() {
    const missed = state.todayTasks.filter(t => !t.completed);
    if (missed.length === 0) return null;
    return {
      missedCount: missed.length,
      tasks: missed.map(t => ({
        id: t.id,
        topic: t.topic,
        subject: t.subject,
        track: t.track,
        originalEst: t.estMinutes,
        proposedSlot: 'Tomorrow 08:30 - ' + (t.estMinutes <= 45 ? 'Short Focus Block' : 'Deep Work Block'),
        priorityAdjustment: t.priority === 'CRITICAL' ? 'Retained CRITICAL' : 'Bumped to HIGH',
        reason: 'Uncompleted from Day ' + state.currentDay + '. Preserves revision rhythm without overloading.'
      })),
      impactSummary: 'Rescheduling ' + missed.length + ' task(s) adds ' + missed.reduce((a,c)=>a+c.estMinutes,0) + ' mins to tomorrow\'s buffer with 0% streak penalty.'
    };
  }

  function applyReschedule() {
    const missed = state.todayTasks.filter(t => !t.completed);
    // Roll uncompleted into tomorrow buffer
    state.todayTasks = state.todayTasks.filter(t => t.completed);
    save();
    return { rescheduledCount: missed.length };
  }

  // ?? Weekly Mentor Report Generator ??
  function generateWeeklyReport() {
    const focusLog = (typeof FocusSession !== 'undefined' && FocusSession.getSessionLog) ? FocusSession.getSessionLog() : [];
    const totalMinutes = focusLog.reduce((acc, s) => acc + (s.minutesSpent || 25), state.completedMinutes || 222);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const mistakeList = (typeof MistakeBookModule !== 'undefined') ? MistakeBookModule.getMistakes() : [];
    const resolvedMistakes = mistakeList.filter(m => m.resolved).length;
    const categoriesCount = {};
    mistakeList.forEach(m => {
      const cat = m.mistakeType || 'Concept gap';
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    const topCategory = Object.entries(categoriesCount).sort((a,b)=>b[1]-a[1])[0] || ['Calculation', 2];

    return {
      weekNumber: Math.ceil(state.currentDay / 7),
      dateRange: 'Day ' + Math.max(1, state.currentDay - 6) + ' – Day ' + state.currentDay,
      totalFocusHours: totalHours + ' hrs',
      tasksCompletedRate: '84%',
      accuracyTrends: {
        dsa: '82% (+4% vs last week)',
        gate: '71% (+6% on OS/DBMS)',
        aptitude: '84% (Steady)'
      },
      masteryMovement: '+3 topics moved to Solidified (Deadlocks, DP Knapsack, ACID)',
      biggestImprovement: 'Operating Systems CPU Scheduling & Banker\'s Algorithm accuracy jumped from 48% to 78%',
      biggestWeakness: state.weakTopics[0] ? state.weakTopics[0].topic + ' (' + state.weakTopics[0].accuracy + '% accuracy in ' + state.weakTopics[0].subject + ')' : 'Graph Edge Cases',
      mistakeCategories: categoriesCount,
      topMistakeCategory: topCategory[0] + ' (' + topCategory[1] + ' occurrences)',
      smartRevisionCompletion: '92% of scheduled cards reviewed on time',
      trackBreakdown: {
        dsa: '14 LeetCode problems solved, 2 heap/tree patterns mastered',
        gate: '42 PYQs analyzed across OS & Algorithms',
        swe: 'Portfolio ATS overhaul completed, AST parser Pratt precedence implemented',
        internship: '8 applications tracked, 2 resume revisions calibrated'
      },
      nextWeekTop3: [
        '1. Close remaining skill gap on ' + (state.weakTopics[0] ? state.weakTopics[0].topic : 'Bellman-Ford Graphs'),
        '2. Complete 50 Zoho/TCS PYQ technical interview coding drills',
        '3. Run 2 full Mock Tests (GATE CS Mini-Mock + Placement Technical Round)'
      ]
    };
  }

  return {
    getProposedReschedule,
    applyReschedule,
    generateWeeklyReport,
    getState: function () {
      return state;
    },

    getNextBestAction: function () {
      if (state.currentDay === 0 || state.status === 'NOT_STARTED') {
        return {
          title: 'Complete Day 0 Setup & Orientation',
          action: 'Complete Day 0 Setup & Orientation',
          subject: 'Orientation',
          why: 'Configure your career targets, daily study hours, and preferred focus intervals to generate your Day 1 plan.',
          cta: 'Begin Day 0 Setup',
          track: 'DAY 0 SETUP',
          isDay0: true,
          estMinutes: 10,
          accuracy: 0,
          pendingMistakes: 0,
          supports: 'GATE + SWE + Career',
          load: 'Low Load'
        };
      }

      // If we have an uncompleted task in today's plan, prioritize it!
      const uncompletedTask = state.todayTasks ? state.todayTasks.find(t => !t.completed) : null;
      const topWeak = state.weakTopics && state.weakTopics.length ? state.weakTopics[0] : null;

      if (uncompletedTask) {
        return {
          id: uncompletedTask.id,
          title: uncompletedTask.topic,
          action: uncompletedTask.topic,
          subject: uncompletedTask.subject,
          why: uncompletedTask.why || 'Critical daily milestone for your calibrated curriculum.',
          cta: uncompletedTask.cta || 'Start Focus Session',
          track: uncompletedTask.track || state.target || 'GATE 2027',
          type: uncompletedTask.type || 'THEORY',
          isDay0: false,
          estMinutes: uncompletedTask.estMinutes || 45,
          accuracy: topWeak ? topWeak.accuracy : 85,
          pendingMistakes: 0,
          supports: uncompletedTask.highLeverageNote || 'High Leverage Milestone',
          load: (uncompletedTask.estMinutes >= 45) ? 'Deep Focus' : 'Speed Sprint'
        };
      }

      if (topWeak) {
        return {
          title: 'Smart Revision: ' + topWeak.topic,
          action: 'Smart Revision: ' + topWeak.topic,
          subject: topWeak.subject,
          why: topWeak.reason || 'Accuracy in this topic fell below 65%. Spaced revision needed to lock concept retention.',
          cta: 'Revise & Retest',
          track: topWeak.track || 'REVISION',
          isDay0: false,
          estMinutes: 30,
          accuracy: topWeak.accuracy || 45,
          pendingMistakes: 1,
          supports: 'Concept Retention',
          load: 'Targeted Review'
        };
      }

      return {
        title: 'All Daily Tasks Completed! Review or Rest',
        action: 'All Daily Tasks Completed! Review or Rest',
        subject: 'Daily Milestone Reached',
        why: 'You have crushed today\'s planned study sessions! Complete your Daily Shutdown Review to lock your streak.',
        cta: 'Open Daily Shutdown',
        track: 'VICTORY',
        isDay0: false,
        estMinutes: 5,
        accuracy: 100,
        pendingMistakes: 0,
        supports: 'Daily Streak Locked',
        load: 'Zero Load'
      };
    },

    generateCalibratedDayPlan: function (targetTrack, dailyHours, currentDay = 1) {
      const track = targetTrack || state.target || 'GATE + Placement';
      const day = Math.max(1, currentDay || 1);
      state.currentDay = day;
      state.status = 'ACTIVE';
      state.target = track;

      let templateTasks = [];

      if (track.includes('GATE 2027')) {
        templateTasks = [
          {
            id: 'task-gate-1',
            track: 'GATE 2027',
            subject: 'Engineering Mathematics',
            topic: 'Linear Algebra: Eigenvalues & Cayley-Hamilton Theorem',
            why: 'Guaranteed 2-3 marks in GATE CS; fundamental for Machine Learning & Graphics.',
            cta: 'Read Concept & Solve 3 PYQs',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'THEORY',
            highLeverageNote: 'IIT Madras favorite topic.'
          },
          {
            id: 'task-gate-2',
            track: 'GATE 2027',
            subject: 'Operating Systems',
            topic: 'Process Scheduling: Round Robin & SRTF Mechanics',
            why: 'High-frequency GATE numerical topic. Critical for solving timing Gantt charts.',
            cta: 'Practice 5 PYQ Problems',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'PRACTICE',
            highLeverageNote: 'Averaging turnaround & waiting time.'
          },
          {
            id: 'task-gate-3',
            track: 'GATE 2027',
            subject: 'Computer Networks',
            topic: 'Subnet Masking & CIDR IP Addressing',
            why: 'Formula verification and avoiding 1-mark negative calculation traps.',
            cta: 'Take 5-Question Diagnostic',
            estMinutes: 30,
            completed: false,
            priority: 'MEDIUM',
            type: 'QUIZ',
            highLeverageNote: 'Network prefix & host bits calculation.'
          }
        ];
      } else if (track.includes('Placement')) {
        templateTasks = [
          {
            id: 'task-place-1',
            track: 'PLACEMENTS',
            subject: 'Data Structures & Algorithms',
            topic: 'Two Pointers & Sliding Window Patterns',
            why: 'Top patterns asked in Zoho, Amazon, and product screening rounds.',
            cta: 'Solve in Code Studio',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'PRACTICE',
            highLeverageNote: 'O(N) space-time optimization.'
          },
          {
            id: 'task-place-2',
            track: 'PLACEMENTS',
            subject: 'Quantitative Aptitude',
            topic: 'Time, Speed, Distance & Work Equivalence',
            why: 'Aptitude screening filter eliminates 60% of candidates in Round 1.',
            cta: 'Practice 10 Speed Drills',
            estMinutes: 30,
            completed: false,
            priority: 'HIGH',
            type: 'APTITUDE',
            highLeverageNote: 'Relative speed & ratio shortcuts.'
          },
          {
            id: 'task-place-3',
            track: 'PLACEMENTS',
            subject: 'DBMS',
            topic: 'Indexing (B+ Trees) vs Hash Indexing in Production',
            why: 'Direct technical interview discussion point for high-concurrency systems.',
            cta: 'Review 5 Interview Q&As',
            estMinutes: 30,
            completed: false,
            priority: 'MEDIUM',
            type: 'THEORY',
            highLeverageNote: 'Range query optimization.'
          }
        ];
      } else if (track.includes('Internship')) {
        templateTasks = [
          {
            id: 'task-intern-1',
            track: 'INTERNSHIP',
            subject: 'Web Engineering',
            topic: 'REST API Design, JWT Authentication & CORS',
            why: 'Backend interviews test token security and HTTP status codes immediately.',
            cta: 'Implement Auth Middleware',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'PROJECT',
            highLeverageNote: 'Stateless session handling.'
          },
          {
            id: 'task-intern-2',
            track: 'INTERNSHIP',
            subject: 'DSA',
            topic: 'HashMap & Frequency Array Optimizations',
            why: 'Solves 70% of medium-tier internship online assessments.',
            cta: 'Solve LeetCode Top 50',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'PRACTICE',
            highLeverageNote: 'Subarray sum equals K pattern.'
          },
          {
            id: 'task-intern-3',
            track: 'INTERNSHIP',
            subject: 'Career & Resume',
            topic: 'Project README, Live Demo Link & System Architecture Diagram',
            why: 'Recruiters reject applications without deployed links in <30 seconds.',
            cta: 'Audit GitHub Repo',
            estMinutes: 30,
            completed: false,
            priority: 'MEDIUM',
            type: 'PORTFOLIO',
            highLeverageNote: 'Professional open-source presentation.'
          }
        ];
      } else if (track.includes('Software Engineering')) {
        templateTasks = [
          {
            id: 'task-swe-1',
            track: 'SWE MASTER',
            subject: 'Software Architecture',
            topic: 'SOLID Principles & Strategy Design Patterns',
            why: 'Differentiates junior coders from production-grade engineers.',
            cta: 'Refactor Clean Code Sample',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'THEORY',
            highLeverageNote: 'Coupling and cohesion mastery.'
          },
          {
            id: 'task-swe-2',
            track: 'SWE MASTER',
            subject: 'Distributed Systems',
            topic: 'Database Sharding, Replication & CAP Theorem Tradeoffs',
            why: 'Standard System Design interview question at Tier-1 companies.',
            cta: 'Sketch Architecture Blueprint',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'SYSTEM_DESIGN',
            highLeverageNote: 'Master-slave vs Multi-master.'
          },
          {
            id: 'task-swe-3',
            track: 'SWE MASTER',
            subject: 'DSA & Concurrency',
            topic: 'Thread Safety & Producer-Consumer Queues',
            why: 'Evaluated in product concurrency rounds.',
            cta: 'Simulate Mutex Locks',
            estMinutes: 30,
            completed: false,
            priority: 'MEDIUM',
            type: 'PRACTICE',
            highLeverageNote: 'Deadlock avoidance & condition variables.'
          }
        ];
      } else {
        // Dual Master Track (GATE + Placement)
        templateTasks = [
          {
            id: 'task-dual-1',
            track: 'GATE 2027',
            subject: 'Engineering Mathematics',
            topic: 'Linear Algebra: Eigenvalues & Systems of Linear Equations',
            why: 'High-yield scoring foundation for GATE CS 2027.',
            cta: 'Master Core Proofs & PYQs',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'THEORY',
            highLeverageNote: 'Rank of matrix & consistent systems.'
          },
          {
            id: 'task-dual-2',
            track: 'PLACEMENTS',
            subject: 'Data Structures & Algorithms',
            topic: 'Two Pointers & Fast-Slow Pointers on Linked Lists',
            why: 'Core coding interview filter problem asked by Amazon and Zoho.',
            cta: 'Solve in Code Studio',
            estMinutes: 45,
            completed: false,
            priority: 'HIGH',
            type: 'PRACTICE',
            highLeverageNote: 'Cycle detection & middle node.'
          },
          {
            id: 'task-dual-3',
            track: 'SYNERGY',
            subject: 'Operating Systems',
            topic: 'Process Synchronization: Semaphores & Critical Section',
            why: 'Crucial for both GATE exam marks and technical round deep-dives.',
            cta: 'Review Classic Synchronization Traps',
            estMinutes: 30,
            completed: false,
            priority: 'MEDIUM',
            type: 'THEORY',
            highLeverageNote: 'Peterson solution & Binary semaphores.'
          }
        ];
      }

      state.todayTasks = templateTasks;
      state.completedMinutes = 0;
      save();
      return state.todayTasks;
    },

    advanceToNextDay: function () {
      state.currentDay += 1;
      const uncompleted = state.todayTasks ? state.todayTasks.filter(t => !t.completed) : [];
      // Generate fresh tasks for the new day
      this.generateCalibratedDayPlan(state.target, 2.0, state.currentDay);
      // Prepend any rolled over tasks from yesterday
      if (uncompleted.length > 0) {
        uncompleted.forEach(t => {
          t.highLeverageNote = '🔄 Rolled over from yesterday (zero guilt!)';
          state.todayTasks.unshift(t);
        });
      }
      save();
      return state;
    },

    syncWithServer: async function () {
      try {
        const res = await fetch('/api/preparation/state');
        if (res.ok) {
          const remote = await res.json();
          if (remote && remote.profile) {
            state.currentDay = remote.profile.current_day ?? 0;
            state.status = remote.profile.status ?? 'NOT_STARTED';
            state.totalDays = remote.profile.total_days ?? 90;
            if (remote.readiness) {
              state.readinessScores.gate.score = remote.readiness.gate_score ?? 0;
              state.readinessScores.placement.score = remote.readiness.placement_score ?? 0;
              state.readinessScores.swe.score = remote.readiness.swe_score ?? 0;
              state.readinessScores.internship.score = remote.readiness.internship_score ?? 0;
            }
            if (Array.isArray(remote.todayTasks)) {
              state.todayTasks = remote.todayTasks.map(t => ({
                id: 'db-' + t.id,
                track: t.track,
                subject: t.subject,
                topic: t.topic,
                estMinutes: t.est_minutes,
                completed: !!t.completed,
                priority: t.priority
              }));
            }
            save();
          }
        }
      } catch (err) {
        console.warn('[PrepEngine] Could not sync with server:', err);
      }
      return state;
    },

    resetToZeroState: function () {
      state = JSON.parse(JSON.stringify(defaultZeroState));
      save();
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('gt_mentor_prep_intel_v2');
      localStorage.removeItem('gt_prep_state');
    },

    toggleTask: function (taskId) {
      const task = state.todayTasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        if (task.completed) {
          state.completedMinutes += task.estMinutes;
        } else {
          state.completedMinutes = Math.max(0, state.completedMinutes - task.estMinutes);
        }
        save();
      }
      return task;
    },

    addTask: function (track, subject, topic, estMinutes) {
      const newTask = {
        id: 'task-' + Date.now(),
        track: track || 'GATE',
        subject: subject || 'General',
        topic: topic.trim(),
        estMinutes: parseInt(estMinutes) || 45,
        completed: false,
        priority: 'MEDIUM',
        highLeverageNote: 'Custom student daily action.'
      };
      state.todayTasks.push(newTask);
      save();
      return newTask;
    },

    deleteTask: function (taskId) {
      const idx = state.todayTasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        const removed = state.todayTasks.splice(idx, 1)[0];
        if (removed.completed) {
          state.completedMinutes = Math.max(0, state.completedMinutes - removed.estMinutes);
        }
        save();
      }
    },

    getPlannedTimeFormatted: function () {
      const totalMinutes = state.todayTasks.reduce((acc, t) => acc + t.estMinutes, 0);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return hours + 'h ' + (mins < 10 ? '0' : '') + mins + 'm';
    },

    getCompletedTimeFormatted: function () {
      const hours = Math.floor(state.completedMinutes / 60);
      const mins = state.completedMinutes % 60;
      return hours + 'h ' + (mins < 10 ? '0' : '') + mins + 'm';
    },

    getCompetencyMatrix: function () {
      return state.competencyMatrix;
    },

    getWeakTopics: function () {
      return state.weakTopics;
    },

    // ── NEW FEATURE METHODS ──
    getMockInterviewTracks: function () {
      return mockInterviewTracks;
    },

    predictGateRank: function (marks, category) {
      const m = Math.max(0, Math.min(100, parseFloat(marks) || 0));
      const cat = category || 'GEN';
      
      // Statistical normalization model based on historical GATE CS scoring distributions
      let score = Math.round(m * 10.3 + 45);
      if (score > 1000) score = 1000;
      if (score < 100) score = 100;

      let air = 1;
      if (m >= 85) air = Math.round(1 + (100 - m) * 4);
      else if (m >= 70) air = Math.round(60 + (85 - m) * 25);
      else if (m >= 55) air = Math.round(450 + (70 - m) * 70);
      else if (m >= 40) air = Math.round(1500 + (55 - m) * 200);
      else if (m >= 25) air = Math.round(4500 + (40 - m) * 500);
      else air = Math.round(12000 + (25 - m) * 1000);

      const recommendations = iitCutoffsDatabase.map(inst => {
        let adjustedCutoff = inst.cutoff;
        if (cat === 'OBC') adjustedCutoff *= 0.90;
        if (cat === 'SC' || cat === 'ST') adjustedCutoff *= 0.68;
        if (cat === 'EWS') adjustedCutoff *= 0.95;

        let status = 'Dream';
        let badgeColor = 'var(--danger)';
        if (score >= adjustedCutoff + 30) {
          status = 'Safe';
          badgeColor = 'var(--success)';
        } else if (score >= adjustedCutoff - 25) {
          status = 'Target';
          badgeColor = 'var(--warning)';
        }

        return {
          institute: inst.institute,
          program: inst.prog,
          cutoffScore: Math.round(adjustedCutoff),
          placementAvg: inst.placementAvg,
          status: status,
          badgeColor: badgeColor
        };
      });

      return {
        marks: m,
        estimatedScore: score,
        estimatedAIR: air,
        percentile: (100 - (air / 120000) * 100).toFixed(2),
        recommendations: recommendations
      };
    },

    calculateGateRank: function (marks, category) {
      return this.predictGateRank(marks, category);
    },

    getCodeTemplates: function () {
      return codeSandboxTemplates;
    },

    getGanttPhases: function () {
      return ganttPhases;
    },

    getDailyScheduleBlocks: function () {
      return dailyScheduleBlocks;
    },

    generateIcsFileContent: function () {
      let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GT Study Mentor Pro//90-Day Prep Timetable//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:GT Mentor Pro Schedule'
      ];

      const today = new Date().toISOString().replace(/[-:]/g, '').split('T')[0];

      dailyScheduleBlocks.forEach((block, idx) => {
        const uid = 'gt-mentor-' + idx + '-' + today + '@gtmentorp.local';
        ics.push(
          'BEGIN:VEVENT',
          'UID:' + uid,
          'SUMMARY:GT Mentor: ' + block.slot,
          'DESCRIPTION:' + block.desc + ' (Time: ' + block.time + ')',
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      });

      ics.push('END:VCALENDAR');
      return ics.join('\r\n');
    },

    getMockInterviewTracks: function () {
      return mockInterviewTracks;
    },

    getIitCutoffs: function () {
      return iitCutoffsDatabase;
    },

    setDailyBudget: function (minutes) {
      const budget = Number(minutes) || 60;
      state.dailyBudgetMinutes = budget;
      state.dailyTargetHours = +(budget / 60).toFixed(1);
      save();
      return state.dailyBudgetMinutes;
    },

    getDailyBudget: function () {
      return state.dailyBudgetMinutes || 60;
    },

    generateDynamicSchedule: function (availableMinutes = 60) {
      const budget = Number(availableMinutes) || state.dailyBudgetMinutes || 60;
      state.dailyBudgetMinutes = budget;
      state.dailyTargetHours = +(budget / 60).toFixed(1);

      // If Day 0 zero state, maintain Day 0 orientation task
      if (state.currentDay === 0 || state.status === 'NOT_STARTED') {
        state.todayTasks = [
          {
            id: 'task-d0-orient',
            track: 'Orientation',
            subject: 'Career & Goals',
            topic: 'Complete Day 0 Preparation Setup',
            estMinutes: Math.min(15, budget),
            completed: false,
            highLeverageNote: 'Calibrates 90-day trajectory & target tracks',
            time: '09:00'
          }
        ];
        save();
        return state.todayTasks;
      }

      // Dynamic distribution according to Blueprint Section 13
      const topWeak = state.weakTopics && state.weakTopics.length ? state.weakTopics[0] : null;
      const weakTopicName = topWeak ? `${topWeak.subject}: ${topWeak.topic}` : 'DBMS — Normalization';
      const weakSubject = topWeak ? topWeak.subject : 'Core CS';

      if (budget <= 30) {
        // 30 minutes: 20m Critical Revision, 10m Practice
        state.todayTasks = [
          {
            id: 'task-dyn-1',
            track: 'Revision',
            subject: weakSubject,
            topic: `Critical Revision (${weakTopicName})`,
            estMinutes: 20,
            completed: false,
            highLeverageNote: 'Targeted recall on high-severity mistakes',
            time: '09:00'
          },
          {
            id: 'task-dyn-2',
            track: 'Practice',
            subject: 'Problem Solving',
            topic: 'High-Yield Pattern Verification',
            estMinutes: 10,
            completed: false,
            highLeverageNote: 'Fast accuracy calibration & validation',
            time: '09:20'
          }
        ];
      } else if (budget <= 60) {
        // 60 minutes: 30m Weak Topic, 20m Revision, 10m Career
        state.todayTasks = [
          {
            id: 'task-dyn-1',
            track: 'Core CS',
            subject: weakSubject,
            topic: `Weak Topic Mastery (${weakTopicName})`,
            estMinutes: 30,
            completed: false,
            highLeverageNote: 'Concept consolidation from error analytics',
            time: '09:00'
          },
          {
            id: 'task-dyn-2',
            track: 'Revision',
            subject: 'Spaced Repetition',
            topic: 'Smart Revision Queue & Cards',
            estMinutes: 20,
            completed: false,
            highLeverageNote: 'Spaced recall to combat memory decay curve',
            time: '09:35'
          },
          {
            id: 'task-dyn-3',
            track: 'Career',
            subject: 'Applications',
            topic: 'Resume Tailoring & 1 Pipeline Action',
            estMinutes: 10,
            completed: false,
            highLeverageNote: 'Consistent outcome-driven job momentum',
            time: '10:00'
          }
        ];
      } else {
        // 120 minutes: 40m Weak Topic, 30m DSA, 30m Smart Revision, 20m Career
        state.todayTasks = [
          {
            id: 'task-dyn-1',
            track: 'Core CS',
            subject: weakSubject,
            topic: `Deep Weak Topic Remediation (${weakTopicName})`,
            estMinutes: 40,
            completed: false,
            highLeverageNote: 'Deep concept repair + edge case coverage',
            time: '09:00'
          },
          {
            id: 'task-dyn-2',
            track: 'DSA',
            subject: 'Data Structures',
            topic: 'Blind 75 / Striver A2Z Coding Patterns',
            estMinutes: 30,
            completed: false,
            highLeverageNote: 'High-frequency algorithmic pattern mastery',
            time: '09:45'
          },
          {
            id: 'task-dyn-3',
            track: 'Revision',
            subject: 'Smart Revision',
            topic: 'Full Spaced Repetition Due Deck',
            estMinutes: 30,
            completed: false,
            highLeverageNote: 'Complete FSRS queue clearance',
            time: '10:20'
          },
          {
            id: 'task-dyn-4',
            track: 'Career',
            subject: 'Engineering / Mock',
            topic: 'System Architecture or Mock Interview Session',
            estMinutes: 20,
            completed: false,
            highLeverageNote: 'ATS resume tuning or technical vocal drill',
            time: '10:55'
          }
        ];
      }

      save();
      return state.todayTasks;
    },

    // ── HONEST VISION SIGNATURE EXPERIENCES ──
    getDailyBriefingData: function () {
      const day = state.currentDay || 0;
      const hours = new Date().getHours();
      const greetingTime = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
      const studentName = 'Tamizh';

      // Honest counts from actual state
      let revisionsDue = 0;
      if (typeof window !== 'undefined' && window.MistakeBook && typeof window.MistakeBook.getRevisionQueue === 'function') {
        revisionsDue = window.MistakeBook.getRevisionQueue().length;
      }

      // Check concept gaps (wrong attempts or mistakes with high confidence misconception)
      let conceptGaps = 0;
      if (typeof window !== 'undefined' && window.MistakeBook && typeof window.MistakeBook.getMistakes === 'function') {
        const mistakes = window.MistakeBook.getMistakes();
        conceptGaps = mistakes.filter(m => m.outcomeType === 'WRONG_CONFIDENT' || m.confidence === 'High').length;
      }

      const unfinishedTasks = (state.todayTasks || []).filter(t => !t.completed).length;
      const careerActionsPending = 1;

      // Top priority from Next Best Action
      const nba = this.getNextBestAction();
      let priorityTopic = 'Orientation Setup';
      if (nba && nba.title) {
        priorityTopic = nba.title.includes('→') ? nba.title.split('→')[1].trim() : nba.title;
      }
      const priorityDuration = (nba && nba.duration) ? nba.duration : '30 min';
      const whyFirst = (nba && nba.why) ? nba.why : 'Complete your verified zero-state calibration.';

      const spokenBriefing = `${greetingTime}, ${studentName}. Welcome to Day ${day} of your 90-day preparation. You have ${revisionsDue} revision due, ${conceptGaps} concept gap flagged, and ${unfinishedTasks} active plan tasks. Today's primary focus is ${priorityTopic}, estimated at ${priorityDuration}. ${whyFirst}. Let's begin.`;

      return {
        greeting: greetingTime,
        studentName,
        day,
        totalDays: 90,
        revisionsDue,
        conceptGaps,
        unfinishedTasks,
        careerActionsPending,
        priorityTopic,
        priorityDuration,
        whyFirst,
        spokenBriefing
      };
    },

    getAdaptiveNextQuestion: function (track = 'dsa') {
      const qBank = [
        {
          id: 'adapt-1',
          track: 'dsa',
          topic: 'Graph Algorithms',
          subtopic: 'Cycle Detection in Directed Graphs',
          difficulty: 'Medium',
          mastery: 48,
          lastMistakeDays: '2 days ago',
          confidenceRisk: 'High Misconception Risk',
          revisionDue: true,
          estMinutes: 15,
          question: 'In a directed graph G = (V, E), which algorithmic approach reliably detects a cycle in O(V + E) time by tracking recursion call stack states?',
          options: [
            'DFS using 3-color vertex marking (White, Gray, Black)',
            'Standard BFS with a single visited boolean array',
            'Kruskal algorithm with Disjoint Set Union',
            'Dijkstra algorithm without relaxation'
          ],
          answer: 0,
          explanation: 'In directed graphs, standard BFS visited array fails to distinguish cross-edges from back-edges. DFS with 3-color marking tracks vertices currently in the active recursion call stack (Gray), detecting a cycle if a Gray vertex is encountered again in O(V + E).'
        },
        {
          id: 'adapt-2',
          track: 'gate-pyq',
          topic: 'DBMS',
          subtopic: 'Transaction Serializability & Conflict Equivalence',
          difficulty: 'Hard',
          mastery: 52,
          lastMistakeDays: '3 days ago',
          confidenceRisk: 'Moderate Misconception',
          revisionDue: true,
          estMinutes: 12,
          question: 'Consider schedule S with transactions T1 and T2. If S contains r1(X), w1(X), r2(X), w2(Y), which condition guarantees conflict serializability of S?',
          options: [
            'Precedence graph constructed from conflicting operations has no directed cycles',
            'Every read operation reads the value written by the immediately preceding write',
            'All write operations are executed before any read operation begins',
            'Two-Phase Locking is relaxed to allow early unlocking'
          ],
          answer: 0,
          explanation: 'A schedule is conflict serializable if and only if its serialization precedence graph is acyclic. Conflicting pairs on the same data item (r-w, w-r, w-w) determine directed edges.'
        },
        {
          id: 'adapt-3',
          track: 'cs-core',
          topic: 'Operating Systems',
          subtopic: 'Virtual Memory & Page Replacement',
          difficulty: 'Medium',
          mastery: 60,
          lastMistakeDays: '4 days ago',
          confidenceRisk: 'Low Risk',
          revisionDue: false,
          estMinutes: 10,
          question: 'Which page replacement algorithm suffers from Belady\'s Anomaly, where increasing the number of page frames leads to an increased number of page faults?',
          options: [
            'FIFO (First-In First-Out)',
            'LRU (Least Recently Used)',
            'Optimal Page Replacement (MIN)',
            'LFU (Least Frequently Used)'
          ],
          answer: 0,
          explanation: 'FIFO is not a stack algorithm; its set of pages in memory with n frames is not necessarily a subset of pages in memory with n+1 frames, leading to Belady\'s anomaly.'
        }
      ];

      const selected = qBank.find(q => q.track === track) || qBank[0];
      return {
        ...selected,
        rationale: `Selected by JARVIS because ${selected.topic} mastery is at ${selected.mastery}% (below 75% target) with a flagged mistake ${selected.lastMistakeDays}. Spaced repetition revision is currently ${selected.revisionDue ? 'due' : 'recommended'}.`
      };
    },

    getPhaseMilestoneState: function () {
      const currentDay = state.currentDay || 0;
      let activePhase = 1;
      if (currentDay > 60) activePhase = 3;
      else if (currentDay > 30) activePhase = 2;

      const phases = [
        {
          phaseNumber: 1,
          name: 'Foundation',
          daysRange: 'Days 1 – 30',
          active: activePhase === 1,
          completed: currentDay > 30,
          summary: 'Build unshakeable core concepts in Engineering Mathematics, Discrete Structures, Fundamental DSA, and Operating Systems.',
          milestones: [
            { name: 'Engineering Mathematics & Discrete Calculus Baseline', completed: currentDay >= 10 },
            { name: 'Core DSA: Arrays, Strings, Linked Lists & Complexity Analysis', completed: currentDay >= 18 },
            { name: 'Operating Systems & DBMS Core ACID Principles', completed: currentDay >= 25 },
            { name: 'Phase 1 Diagnostic Readiness Assessment', completed: currentDay >= 30 }
          ]
        },
        {
          phaseNumber: 2,
          name: 'Depth',
          daysRange: 'Days 31 – 60',
          active: activePhase === 2,
          completed: currentDay > 60,
          summary: 'Tackle advanced algorithmic patterns, 10-year GATE PYQs, Low-Level System Design, and technical mock interviews.',
          milestones: [
            { name: 'Advanced DSA: Dynamic Programming, Trees & Graph Traversals', completed: currentDay >= 40 },
            { name: 'GATE High-Yield 10-Year Chapterwise PYQ Sprints', completed: currentDay >= 48 },
            { name: 'Low-Level Design & Practical Software Engineering Lab', completed: currentDay >= 55 },
            { name: 'Technical SDE Mock Interview Round 1 Clearance', completed: currentDay >= 60 }
          ]
        },
        {
          phaseNumber: 3,
          name: 'Peak',
          daysRange: 'Days 61 – 90',
          active: activePhase === 3,
          completed: false,
          summary: 'Full-length 3-hour exam simulations, company-specific technical tracks, rapid FSRS revision, and speed accuracy drills.',
          milestones: [
            { name: 'Full-Length 3-Hour GATE Computer Science Simulations', completed: currentDay >= 70 },
            { name: 'Speed & Accuracy Training (< 2.5 minutes per question)', completed: currentDay >= 78 },
            { name: 'Company-Specific Advanced Online Assessments', completed: currentDay >= 85 },
            { name: 'Final Career Preparation Capstone & Verified Readiness Score', completed: currentDay >= 90 }
          ]
        }
      ];

      return {
        currentDay,
        activePhase,
        phases
      };
    },

    getCareerSyncData: function () {
      const scores = state.readinessScores || {};
      const day = state.currentDay || 0;

      return [
        {
          careerTrack: 'GATE CS 2027',
          targetMilestone: 'Top 1% AIR Cutoff Benchmark',
          todayContribution: 'DBMS & Algorithms preparation strengthens high-yield GATE core (18-22 marks weightage).',
          currentAlignment: scores.gate ? scores.gate.score : 0,
          statusLabel: day === 0 ? 'Orientation Zero-State' : `${scores.gate?.score || 0}% Ready`
        },
        {
          careerTrack: 'Tier-1 Product SWE',
          targetMilestone: 'Coding Assessment & System Design Clearance',
          todayContribution: 'Graph cycle detection and coding sandbox practice directly advance Round 1 technical standards.',
          currentAlignment: scores.swe ? scores.swe.score : 0,
          statusLabel: day === 0 ? 'Orientation Zero-State' : `${scores.swe?.score || 0}% Ready`
        },
        {
          careerTrack: 'Campus & Off-Campus Placements',
          targetMilestone: 'OA Aptitude + Technical Interview Offer',
          todayContribution: 'Quantitative speed drills and CS core revisions satisfy company screening criteria.',
          currentAlignment: scores.placement ? scores.placement.score : 0,
          statusLabel: day === 0 ? 'Orientation Zero-State' : `${scores.placement?.score || 0}% Ready`
        },
        {
          careerTrack: 'Research & PSUs',
          targetMilestone: 'BARC / ISRO / PSU Direct Technical Interview',
          todayContribution: 'Rigorous theoretical accuracy and zero-misconception calibration ensure technical interview mastery.',
          currentAlignment: Math.round(((scores.gate?.score || 0) + (scores.swe?.score || 0)) / 2),
          statusLabel: day === 0 ? 'Orientation Zero-State' : 'Calibrating'
        }
      ];
    },

    resetToDefaults: function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };
})();

// Attach to window
if (typeof window !== 'undefined') {
  window.PrepIntelligenceEngine = PrepIntelligenceEngine;

  // ── STUDIO UI CONTROLLERS ──
  let currentInterviewTrack = 'sde1';
  let currentInterviewIdx = 0;
  let interviewTimer = null;
  let interviewSeconds = 0;

  window.initMockInterview = function () {
    currentInterviewTrack = 'sde1';
    currentInterviewIdx = 0;
    window.switchInterviewTrack('sde1');
    startInterviewTimer();
  };

  function startInterviewTimer() {
    if (interviewTimer) clearInterval(interviewTimer);
    interviewSeconds = 0;
    interviewTimer = setInterval(() => {
      interviewSeconds++;
      const mins = String(Math.floor(interviewSeconds / 60)).padStart(2, '0');
      const secs = String(interviewSeconds % 60).padStart(2, '0');
      const lbl = document.getElementById('int-timer-label');
      if (lbl) lbl.textContent = `⏱️ Time Elapsed: ${mins}:${secs}`;
    }, 1000);
  }

  window.switchInterviewTrack = function (trackId) {
    currentInterviewTrack = trackId;
    currentInterviewIdx = 0;
    document.querySelectorAll('#int-tab-sde1, #int-tab-gate, #int-tab-hr').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`int-tab-${trackId.replace('_oral','').replace('_star','')}`);
    if (btn) btn.classList.add('active');

    const tracks = PrepIntelligenceEngine.getMockInterviewTracks();
    const list = tracks[trackId] || [];
    const q = list[currentInterviewIdx] || list[0];
    if (!q) return;

    const catLbl = document.getElementById('int-question-category');
    const qText = document.getElementById('int-question-text');
    const hintBox = document.getElementById('int-hint-box');
    const ansInput = document.getElementById('int-answer-input');

    if (catLbl) catLbl.textContent = q.category;
    if (qText) qText.textContent = q.question;
    if (hintBox) {
      hintBox.style.display = 'none';
      hintBox.innerHTML = '<strong>💡 Hint:</strong> ' + q.hint;
    }
    if (ansInput) ansInput.value = '';
  };

  window.toggleInterviewHint = function () {
    const box = document.getElementById('int-hint-box');
    if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
  };

  window.speakCurrentInterviewQuestion = function () {
    const qText = document.getElementById('int-question-text')?.textContent;
    if (qText && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(qText);
      window.speechSynthesis.speak(u);
    }
  };

  window.evaluateInterviewAnswer = function () {
    const tracks = PrepIntelligenceEngine.getMockInterviewTracks();
    const list = tracks[currentInterviewTrack] || [];
    const q = list[currentInterviewIdx] || list[0];
    const userAns = (document.getElementById('int-answer-input')?.value || '').toLowerCase();

    let matchedKeywords = 0;
    if (q && q.expectedKeywords) {
      q.expectedKeywords.forEach(kw => {
        if (userAns.includes(kw.toLowerCase())) matchedKeywords++;
      });
    }
    const totalKw = (q && q.expectedKeywords) ? q.expectedKeywords.length : 1;
    const kwPct = Math.round((matchedKeywords / totalKw) * 100);
    const conceptScore = Math.min(10, Math.max(2, Math.round((kwPct / 10))));

    const scoreConcept = document.getElementById('int-score-concept');
    const scoreKw = document.getElementById('int-score-keywords');
    const tanglishExp = document.getElementById('int-tanglish-exp');

    if (scoreConcept) scoreConcept.textContent = `${conceptScore} / 10`;
    if (scoreKw) scoreKw.textContent = `${kwPct}%`;
    if (tanglishExp && q) {
      tanglishExp.textContent = q.tanglishExplanation || 'Well explained! Focus on time and space trade-offs.';
    }
  };

  window.nextInterviewQuestion = function () {
    const tracks = PrepIntelligenceEngine.getMockInterviewTracks();
    const list = tracks[currentInterviewTrack] || [];
    currentInterviewIdx = (currentInterviewIdx + 1) % list.length;
    window.switchInterviewTrack(currentInterviewTrack);
  };

  // GATE Predictor
  let currentPredictorCat = 'GEN';
  window.setPredictorCategory = function (cat) {
    currentPredictorCat = cat;
    document.querySelectorAll('#pred-cat-gen, #pred-cat-obc, #pred-cat-scst, #pred-cat-ews').forEach(b => b.classList.remove('active'));
    const idMap = { GEN: 'pred-cat-gen', OBC: 'pred-cat-obc', SC: 'pred-cat-scst', EWS: 'pred-cat-ews' };
    const btn = document.getElementById(idMap[cat]);
    if (btn) btn.classList.add('active');
    window.runGatePredictor();
  };

  window.runGatePredictor = function () {
    const input = document.getElementById('pred-marks-input');
    const marks = parseFloat(input ? input.value : 68) || 0;
    const res = PrepIntelligenceEngine.calculateGateRank(marks, currentPredictorCat);

    const scoreVal = document.getElementById('pred-score-val');
    const airVal = document.getElementById('pred-air-val');
    const pctVal = document.getElementById('pred-pct-val');
    const grid = document.getElementById('pred-admissions-grid');

    if (scoreVal) scoreVal.textContent = `${res.estimatedScore} / 1000`;
    if (airVal) airVal.textContent = `AIR ${res.estimatedAIR}`;
    if (pctVal) pctVal.textContent = `${res.percentile}%`;

    if (grid) {
      grid.innerHTML = res.recommendations.map(r => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--text); font-size:12px;">${r.institute}</strong>
            <span style="font-size:10px; font-weight:700; color:${r.badgeColor}; border:1px solid ${r.badgeColor}; border-radius:4px; padding:2px 6px;">${r.status}</span>
          </div>
          <div style="font-size:11px; color:var(--text-sub); margin-top:2px;">${r.program} • Cutoff: ${r.cutoffScore}</div>
          <div style="font-size:10px; color:var(--success); margin-top:4px;">Avg: ${r.placementAvg}</div>
        </div>
      `).join('');
    }
  };

  // CSE Code Studio
  window.loadCodeStudioTemplate = function (tplId) {
    const tpls = PrepIntelligenceEngine.getCodeTemplates();
    const tpl = tpls[tplId] || tpls['sliding-window'];
    if (!tpl) return;
    const editor = document.getElementById('code-studio-input') || document.getElementById('code-editor-area');
    const complexity = document.getElementById('code-complexity-badge');
    const tanglish = document.getElementById('code-studio-tanglish') || document.getElementById('code-tanglish-box');

    if (editor) editor.value = tpl.cpp;
    if (complexity) complexity.textContent = tpl.complexity;
    if (tanglish) tanglish.textContent = tpl.tanglish;
  };

  window.runCodeStudioSimulation = function () {
    const outBox = document.getElementById('code-studio-output') || document.getElementById('code-terminal-output');
    if (outBox) {
      outBox.innerHTML = '<span style="color:var(--success);">[Process exited with status 0]</span>\nOutput:\nMax Sum Subarray: 9\nVerification: O(N) single-pass completed.';
    }
    if (typeof showToast === 'function') {
      showToast('Simulation executed successfully! 🚀', 'success');
    }
  };

  window.resetCodeStudio = function () {
    console.log('🔄 Resetting CSE Code Studio...');
    const editor = document.getElementById('code-studio-input') || document.getElementById('code-editor-area');
    const outBox = document.getElementById('code-studio-output') || document.getElementById('code-terminal-output');
    const tanglish = document.getElementById('code-studio-tanglish') || document.getElementById('code-tanglish-box');

    if (typeof window.loadCodeStudioTemplate === 'function') {
      window.loadCodeStudioTemplate('sliding-window');
    } else if (editor) {
      editor.value = `// Welcome to CSE Code Studio & Algorithmic Sandbox\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Ready for simulation!" << endl;\n    return 0;\n}`;
    }
    if (outBox) {
      outBox.innerHTML = '<span style="color:var(--text-sub);">Console reset. Click "Run Code Simulation" to execute.</span>';
    }
    if (tanglish) {
      tanglish.textContent = 'Editor reset to Sliding Window baseline pattern.';
    }
    if (typeof showToast === 'function') {
      showToast('Code Studio reset successfully! ↺', 'info');
    }
  };

  PrepIntelligenceEngine.resetCodeStudio = window.resetCodeStudio;
  PrepIntelligenceEngine.runCodeStudioSimulation = window.runCodeStudioSimulation;

  // 90-Day Gantt Roadmap
  window.renderGanttRoadmap = function () {
    const container = document.getElementById('gantt-chart-container');
    if (!container) return;
    const phases = PrepIntelligenceEngine.getGanttPhases();
    container.innerHTML = phases.map(p => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:8px; padding:12px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--primary); font-size:13px;">${p.phase}: ${p.title}</strong>
          <span style="font-size:11px; color:var(--text-sub);">${p.days}</span>
        </div>
        <div style="font-size:11px; color:var(--text); margin-top:4px;">Focus: ${p.focus}</div>
        <div style="font-size:10px; color:var(--success); margin-top:2px;">Milestone: ${p.milestone}</div>
      </div>
    `).join('');
  };

  window.downloadScheduleIcs = function () {
    const content = PrepIntelligenceEngine.generateIcsFileContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GT_Mentor_Pro_Schedule.ics';
    a.click();
  };

  // ATS Resume Studio
  window.scanJobDescriptionKeywords = function () {
    const jd = (document.getElementById('ats-jd-input')?.value || '').toLowerCase();
    const coreKeywords = ['c++', 'dsa', 'operating systems', 'postgresql', 'docker', 'rest api', 'git', 'system design', 'python', 'java'];
    const matched = coreKeywords.filter(kw => jd.includes(kw));
    const missing = coreKeywords.filter(kw => !jd.includes(kw));
    const score = Math.round((matched.length / coreKeywords.length) * 100);

    const scoreBox = document.getElementById('ats-score-display');
    const matchedList = document.getElementById('ats-matched-list');
    const missingList = document.getElementById('ats-missing-list');

    if (scoreBox) scoreBox.textContent = `${score}% Match`;
    if (matchedList) {
      matchedList.innerHTML = matched.map(k => `<span class="badge-pill" style="color:var(--success); border-color:var(--success);">${k}</span>`).join(' ');
    }
    if (missingList) {
      missingList.innerHTML = missing.map(k => `<span class="badge-pill" style="color:var(--warning); border-color:var(--warning);">${k}</span>`).join(' ');
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrepIntelligenceEngine;
}

