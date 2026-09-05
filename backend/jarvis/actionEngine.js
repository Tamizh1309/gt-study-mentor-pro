/**
 * ============================================================================
 * GT JARVIS — Action Execution Engine
 * File: backend/jarvis/actionEngine.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Validates and constructs safe application action payloads.
 * 
 * WHY IT EXISTS:
 * When a user says "Start a 30-minute focus session on OS", JARVIS doesn't just
 * talk — it sends a verified instruction to the UI to actually start the timer!
 * 
 * SAFETY RULES:
 * 1. Only predefined, safe application actions are permitted.
 * 2. All parameters (e.g. duration) are strictly sanitized and bounded.
 * 3. Never execute arbitrary code or shell commands.
 */

// Supported actions white-list
const ALLOWED_ACTIONS = {
  START_FOCUS: 'start_focus',
  OPEN_DSA: 'open_dsa',
  OPEN_PYQ: 'open_pyq',
  OPEN_REVISION: 'open_revision',
  SHOW_PROGRESS: 'show_progress',
  OPEN_RESUME: 'open_resume',
  OPEN_COMPANY: 'open_company',
  START_INTERVIEW: 'start_mock_interview',
  OPEN_DASHBOARD: 'open_dashboard',
  OPEN_CSE_LAB: 'open_cse_lab',
  OPEN_RESOURCES: 'open_resources',
  START_QUIZ: 'start_quiz',
  REVIEW_MISTAKES: 'review_mistakes',
  RESET_JOURNEY: 'reset_journey'
};

/**
 * Validates and builds a safe action payload
 * @param {string} intent - Detected intent code
 * @param {object} params - Parameters extracted by intent engine
 * @returns {object|null} Safe action payload or null if no action needed
 */
function resolveAction(intent, params = {}) {
  switch (intent) {
    case 'START_FOCUS': {
      let duration = parseInt(params.duration, 10) || 45;
      if (isNaN(duration) || duration < 15) duration = 15;
      if (duration > 120) duration = 120;

      const topic = params.topic && typeof params.topic === 'string'
        ? params.topic.slice(0, 80)
        : 'Deep Focus Session';

      return {
        type: ALLOWED_ACTIONS.START_FOCUS,
        params: { duration, topic },
        spokenConfirmation: `Starting a ${duration}-minute focus session on ${topic}. Let's make every minute count!`
      };
    }

    case 'OPEN_DSA': {
      return {
        type: ALLOWED_ACTIONS.OPEN_DSA,
        params: { view: 'practice', tab: 'dsa' },
        spokenConfirmation: "Opening your Data Structures & Algorithms practice board."
      };
    }

    case 'OPEN_REVISION': {
      return {
        type: ALLOWED_ACTIONS.OPEN_REVISION,
        params: { view: 'progress', tab: 'smart-revision' },
        spokenConfirmation: "Opening your Smart Revision spaced repetition queue."
      };
    }

    case 'SHOW_PROGRESS': {
      return {
        type: ALLOWED_ACTIONS.SHOW_PROGRESS,
        params: { view: 'progress', tab: params.tab || 'readiness' },
        spokenConfirmation: "Displaying your real-time preparation readiness and analytics."
      };
    }

    case 'OPEN_RESUME': {
      return {
        type: ALLOWED_ACTIONS.OPEN_RESUME,
        params: { view: 'career', tab: 'resume' },
        spokenConfirmation: "Opening your ATS Resume Readiness checklist."
      };
    }

    case 'START_INTERVIEW': {
      return {
        type: ALLOWED_ACTIONS.START_INTERVIEW,
        params: { modal: 'mock-interview-modal' },
        spokenConfirmation: "Launching your AI Technical Mock Interview session."
      };
    }

    case 'OPEN_COMPANY': {
      const company = params.company || 'Zoho';
      return {
        type: ALLOWED_ACTIONS.OPEN_COMPANY,
        params: { view: 'career', tab: 'companies', company },
        spokenConfirmation: `Loading the 7-day preparation sprint for ${company}.`
      };
    }

    case 'OPEN_CSE_LAB': {
      return {
        type: ALLOWED_ACTIONS.OPEN_CSE_LAB,
        params: { view: 'cselabs' },
        spokenConfirmation: "Opening CSE Labs and interactive visualization utilities."
      };
    }

    case 'OPEN_DASHBOARD': {
      return {
        type: ALLOWED_ACTIONS.OPEN_DASHBOARD,
        params: { view: 'home' },
        spokenConfirmation: "Returning to your 90-day Home Command Center."
      };
    }

    case 'START_QUIZ': {
      return {
        type: ALLOWED_ACTIONS.START_QUIZ,
        params: { view: 'practice', tab: 'quiz' },
        spokenConfirmation: "Launching your adaptive technical diagnostic quiz."
      };
    }

    case 'REVIEW_MISTAKES': {
      return {
        type: ALLOWED_ACTIONS.REVIEW_MISTAKES,
        params: { view: 'progress', tab: 'mistakes' },
        spokenConfirmation: "Opening your Mistake Book to review and resolve concept errors."
      };
    }

    case 'RESET_JOURNEY': {
      return {
        type: ALLOWED_ACTIONS.RESET_JOURNEY,
        params: { confirmationRequired: true },
        spokenConfirmation: "Resetting your preparation journey returns all progress to Day 0. Opening confirmation."
      };
    }

    default:
      return null;
  }
}

module.exports = {
  resolveAction,
  ALLOWED_ACTIONS
};
