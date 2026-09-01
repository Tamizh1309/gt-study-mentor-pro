// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro 2.0 — Preparation Intelligence Engine
// Answers the core question: "WHAT SHOULD I DO NEXT?"
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
        action: 'Revise Deadlocks Banker\'s Algorithm & Complete 5 PYQs',
        track: 'GATE + SWE'
      },
      {
        id: 'wt-2',
        topic: 'Dynamic Programming (0/1 Knapsack & Subset Sum)',
        subject: 'Algorithms',
        accuracy: 47,
        prerequisiteScore: 85,
        reason: 'State transition mistakes detected in 4 consecutive practice questions.',
        action: 'Solve Striver 0/1 Knapsack patterns with Memoization templates',
        track: 'SWE + Placement'
      },
      {
        id: 'wt-3',
        topic: 'Probability & Bayes Theorem',
        subject: 'Mathematics / Aptitude',
        accuracy: 52,
        prerequisiteScore: 88,
        reason: 'High failure rate under time constraints in recent mock rounds.',
        action: 'Attempt 10 timed probability drills',
        track: 'Placement + GATE'
      }
    ]
  };

  // Load from LocalStorage if present
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = Object.assign(state, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load prep intelligence state from localStorage', e);
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
      // Find top weak area with prerequisite satisfaction
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

    getPhaseDetails: function (dayNumber) {
      const day = dayNumber || state.currentDay;
      if (day <= 30) {
        return {
          phaseNumber: 1,
          phaseName: 'Foundation',
          focus: 'Building core fundamentals: C/Data Structures, Striver Basics, Engg Maths, and Quantitative Aptitude.',
          daysRange: 'Days 1–30'
        };
      } else if (day <= 60) {
        return {
          phaseNumber: 2,
          phaseName: 'Build',
          focus: 'Intermediate mastery: OS, DBMS, CN, System Design, REST APIs, and Striver Trees/Graphs.',
          daysRange: 'Days 31–60'
        };
      } else {
        return {
          phaseNumber: 3,
          phaseName: 'Execute',
          focus: 'Full mocks, 2000–Present GATE PYQs, company placement drives, ATS resume polish, and STAR interviews.',
          daysRange: 'Days 61–90'
        };
      }
    },

    getCompetencyMatrix: function () {
      return state.competencyMatrix;
    },

    getWeakTopics: function () {
      return state.weakTopics;
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
