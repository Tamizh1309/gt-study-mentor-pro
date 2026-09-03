// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro 2.0 — Preparation Intelligence Engine
// Answers the core question: "WHAT SHOULD I DO NEXT?"
// Includes: Mock Interview Studio, GATE Rank & IIT Predictor,
// CSE Code Sandbox, 90-Day Gantt & iCal Sync, ATS Resume Optimizer
// ══════════════════════════════════════════════════════════════

const PrepIntelligenceEngine = (function () {
  const STORAGE_KEY = 'gt_mentor_prep_intel_v2';

  // Default initial state backed by actual tracked data structure
  let state = {
    currentDay: 27,
    totalDays: 90,
    dailyTargetHours: 6.0,
    completedMinutes: 222, // 3h 42m
    streakDays: 14,
    readinessScores: {
      gate: { score: 76, syllabus: 82, pyqAccuracy: 71, mockAvg: 68, revision: 79, confidence: 'Moderate' },
      placement: { score: 78, aptitude: 84, reasoning: 81, verbal: 72, hrStar: 76, confidence: 'High' },
      swe: { score: 81, dsa: 82, projects: 88, systemDesign: 68, coreCS: 79, confidence: 'High' },
      internship: { score: 68, applications: 8, resumeATS: 84, interviewReadiness: 66, confidence: 'Moderate' }
    },
    todayTasks: [
      {
        id: 'task-1',
        track: 'GATE',
        subject: 'Operating Systems',
        topic: 'Deadlocks (Banker\'s Algorithm & RAG)',
        estMinutes: 45,
        completed: false,
        priority: 'CRITICAL',
        highLeverageNote: 'Contributes to GATE (4 marks) + Amazon/Microsoft OS round.'
      },
      {
        id: 'task-2',
        track: 'SOFTWARE',
        subject: 'DSA',
        topic: 'Binary Trees (Maximum Path Sum & Diameter)',
        estMinutes: 60,
        completed: true,
        priority: 'HIGH',
        highLeverageNote: 'Overlaps with Placement Coding + Technical Interviews.'
      },
      {
        id: 'task-3',
        track: 'PLACEMENT',
        subject: 'Quantitative Aptitude',
        topic: 'Probability & Bayes Theorem Drills',
        estMinutes: 30,
        completed: false,
        priority: 'HIGH',
        highLeverageNote: 'Overlaps with GATE General Aptitude + TCS/Zoho Aptitude.'
      },
      {
        id: 'task-4',
        track: 'INTERNSHIP',
        subject: 'Career & Resume',
        topic: 'Improve Project 1 Quantifiable Metrics & Deploy Link',
        estMinutes: 30,
        completed: false,
        priority: 'MEDIUM',
        highLeverageNote: 'Directly boosts Resume Readiness score by +6 points.'
      }
    ],
    competencyMatrix: [
      { skill: 'DSA', gate: 82, placement: 91, swe: 88, intern: 84, highLeverage: true },
      { skill: 'DBMS', gate: 91, placement: 76, swe: 79, intern: 74, highLeverage: true },
      { skill: 'Operating Systems', gate: 87, placement: 72, swe: 75, intern: 69, highLeverage: true },
      { skill: 'Computer Networks', gate: 84, placement: 68, swe: 74, intern: 65, highLeverage: false },
      { skill: 'Projects', gate: null, placement: 71, swe: 89, intern: 94, highLeverage: true },
      { skill: 'Quantitative Aptitude', gate: 79, placement: 91, swe: 60, intern: 68, highLeverage: true },
      { skill: 'Technical Interviews', gate: null, placement: 64, swe: 72, intern: 61, highLeverage: false }
    ],
    weakTopics: [
      {
        id: 'wt-1',
        topic: 'Deadlocks',
        subject: 'Operating Systems',
        accuracy: 48,
        prerequisiteScore: 82,
        reason: 'Your recent accuracy is 48%, while prerequisite CPU scheduling concepts are at 82%. Crucial for GATE and SWE technical interviews.',
        action: 'Revise Banker\'s Algorithm & Resource Allocation Graph',
        track: 'GATE + SWE'
      },
      {
        id: 'wt-2',
        topic: 'Graph Shortest Paths (Dijkstra vs Bellman-Ford)',
        subject: 'Algorithms',
        accuracy: 54,
        prerequisiteScore: 86,
        reason: 'Negative cycle edge cases misidentified in recent mocks.',
        action: 'Practice 6 PYQ Graph Edge Cases',
        track: 'GATE + Placement'
      },
      {
        id: 'wt-3',
        topic: 'Normalization & Canonical Cover',
        subject: 'DBMS',
        accuracy: 59,
        prerequisiteScore: 90,
        reason: 'BCNF vs 3NF lossless join / dependency preservation confusion.',
        action: 'Solve 10 Decomposition Drills',
        track: 'GATE + SWE'
      }
    ]
  };

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
      progress: 90, // current day 27 is 90% of phase 1
      color: '#63D8FF',
      milestones: [
        { label: 'C Programming & Pointers Mastery', done: true },
        { label: 'Discrete Mathematics & Linear Algebra', done: true },
        { label: 'Striver A2Z DSA (Arrays, Strings, Two Pointers)', done: true },
        { label: 'GATE 2015–2020 OS & DBMS PYQs (150 Qs)', done: true },
        { label: 'ATS Resume Clean LaTeX Draft Built', done: true }
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign({}, state, parsed);
      }
    } catch (e) {
      console.warn('Could not load prep intelligence state', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save prep intelligence state', e);
    }
  }

  load();

  return {
    getState: function () {
      return state;
    },

    getNextBestAction: function () {
      const topWeak = state.weakTopics[0];
      return {
        action: topWeak ? 'Revise ' + topWeak.topic : 'Complete Today\'s Plan',
        subject: topWeak ? topWeak.subject : 'Core CS',
        why: topWeak ? topWeak.reason : 'Maintains your consistent daily study velocity.',
        cta: topWeak ? topWeak.action : 'Start Today\'s Plan',
        track: topWeak ? topWeak.track : 'GATE + Placement'
      };
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

    resetToDefaults: function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  };
})();

// Attach to window
if (typeof window !== 'undefined') {
  window.PrepIntelligenceEngine = PrepIntelligenceEngine;
}
