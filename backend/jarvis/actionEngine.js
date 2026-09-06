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
  RESET_JOURNEY: 'reset_journey',
  OPEN_GATE_OFFICIAL: 'open_gate_official',
  OPEN_GATE_PREPARE: 'open_gate_prepare',
  OPEN_APTITUDE_RESOURCE: 'open_aptitude_resource',
  OPEN_SWE_ROADMAP: 'open_swe_roadmap'
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

    case 'OPEN_GATE_OFFICIAL': {
      const target = params.target || 'portal';
      const urls = {
        portal: 'https://gate2027.iitm.ac.in/',
        dates: 'https://gate2027.iitm.ac.in/important_dates',
        syllabus: 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus',
        pattern: 'https://gate2027.iitm.ac.in/question_paper_pattern',
        downloads: 'https://gate2027.iitm.ac.in/download',
        papers_drive: 'https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud',
        knowledgegate_pyq: 'https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/pyq-questions?q=68ecac7295474565f43ef40d',
        knowledgegate_practice: 'https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/practice-questions?q=6a1d2962cc6fe47e57ce7427',
        gate_videos: 'https://youtube.com/playlist?list=PLmXKhU9FNesTaKDC-MKWt-rFuB8OwqrCY&si=z2TEtNMoBzPKHuls'
      };
      const url = urls[target] || urls.portal;
      const targetLabels = {
        portal: 'Official Portal',
        dates: 'Important Dates',
        syllabus: 'Official Papers & Syllabus',
        pattern: 'Question Paper Pattern',
        downloads: 'Official Downloads',
        papers_drive: 'Question Papers Drive Vault',
        knowledgegate_pyq: 'Knowledge Gate PYQ Questions',
        knowledgegate_practice: 'Knowledge Gate Practice Questions',
        gate_videos: 'GATE Preparation Video Lectures'
      };
      let source = 'GATE 2027 — IIT Madras';
      if (target === 'papers_drive') source = 'GATE Question Papers Vault';
      else if (target === 'knowledgegate_pyq' || target === 'knowledgegate_practice') source = 'Knowledge Gate by Sanchit Sir';
      else if (target === 'gate_videos') source = 'GATE Preparation Video Series';

      let spokenConfirmation = `Opening the official GATE 2027 ${targetLabels[target] || 'Portal'} from IIT Madras.`;
      if (target === 'papers_drive') spokenConfirmation = "Opening the GATE Previous Years Question Papers Drive Vault.";
      else if (target === 'knowledgegate_pyq') spokenConfirmation = "Opening Knowledge Gate GATE PYQ Question Paper by Sanchit Sir.";
      else if (target === 'knowledgegate_practice') spokenConfirmation = "Opening Knowledge Gate GATE Practice Question Paper by Sanchit Sir.";
      else if (target === 'gate_videos') spokenConfirmation = "Opening the GATE Preparation Video Lectures playlist on YouTube.";

      return {
        type: ALLOWED_ACTIONS.OPEN_GATE_OFFICIAL,
        params: {
          url,
          target,
          label: targetLabels[target] || 'Official Portal',
          source
        },
        spokenConfirmation
      };
    }

    case 'OPEN_GATE_PREPARE': {
      return {
        type: ALLOWED_ACTIONS.OPEN_GATE_PREPARE,
        params: { view: 'prepare', tab: 'gate' },
        spokenConfirmation: "Opening your GATE 2027 preparation dashboard with official IIT Madras resources."
      };
    }

    case 'OPEN_APTITUDE_RESOURCE': {
      const isGfg = params.resource === 'geeksforgeeks' || (params.url && params.url.includes('geeksforgeeks'));
      const url = isGfg
        ? 'https://www.geeksforgeeks.org/aptitude/aptitude-questions-and-answers/'
        : (params.url || 'https://www.indiabix.com/aptitude/questions-and-answers/');
      const label = isGfg ? 'GeeksforGeeks Aptitude Questions & Answers' : 'IndiaBIX Aptitude Questions & Answers';
      const source = isGfg ? 'GeeksforGeeks' : 'IndiaBIX';
      return {
        type: ALLOWED_ACTIONS.OPEN_APTITUDE_RESOURCE,
        params: {
          url,
          label,
          source
        },
        spokenConfirmation: `Opening ${source} Quantitative Aptitude Questions & Answers.`
      };
    }

    case 'OPEN_SWE_ROADMAP': {
      return {
        type: ALLOWED_ACTIONS.OPEN_SWE_ROADMAP,
        params: { view: 'prepare', tab: 'swe' },
        spokenConfirmation: "Opening the 12-Step Software Engineer Roadmap."
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
