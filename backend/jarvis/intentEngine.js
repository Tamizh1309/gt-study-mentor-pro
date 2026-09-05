/**
 * ============================================================================
 * GT JARVIS — Intent Classification Engine
 * File: backend/jarvis/intentEngine.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Analyzes what the student said/typed and classifies the request into:
 * 1. Category: application_command | knowledge_question | planning_request | career_request
 * 2. Intent Code: e.g. START_FOCUS, OPEN_DSA, OPEN_COMPANY, etc.
 * 3. Parameters: e.g. duration: 45, company: 'Zoho', topic: 'Deadlocks'
 * 
 * WHY IT EXISTS:
 * Natural language is flexible ("Let's study", "Start 45 mins", "Begin focus session").
 * This engine maps all these natural variations into clean, actionable data.
 */

// Intent definitions with matching keywords and regex patterns
const INTENT_RULES = [
  {
    intent: 'START_FOCUS',
    category: 'application_command',
    patterns: [
      /(start|begin|launch|open|run)\s+(a\s+)?(focus|study|timer|session)/i,
      /focus\s+session/i,
      /let('s|s)?\s+study/i,
      /study\s+for\s+\d+\s*(mins?|minutes?|hours?)/i,
      /start\s+\d+\s*(mins?|minutes?)/i
    ],
    extractParams: (text) => {
      const durationMatch = text.match(/(\d+)\s*(mins?|minutes?)/i);
      let duration = durationMatch ? parseInt(durationMatch[1], 10) : 45;
      if (duration < 15) duration = 15;
      if (duration > 120) duration = 120;

      let topic = 'General Preparation';
      if (/os|operating system|deadlock/i.test(text)) topic = 'Operating Systems & Deadlocks';
      else if (/dsa|array|tree|graph|dp|algorithm/i.test(text)) topic = 'Data Structures & Algorithms';
      else if (/dbms|sql|database/i.test(text)) topic = 'Database Management Systems';
      else if (/network|tcp|udp|ip/i.test(text)) topic = 'Computer Networks';
      else if (/gate/i.test(text)) topic = 'GATE 2027 Core PYQ';

      return { duration, topic };
    }
  },
  {
    intent: 'OPEN_DSA',
    category: 'application_command',
    patterns: [
      /(open|go\s+to|show|view|launch)\s+dsa/i,
      /practice\s+(dsa|coding|problems?|algorithms?)/i,
      /solve\s+(a\s+)?problem/i
    ],
    extractParams: () => ({ view: 'practice', tab: 'dsa' })
  },
  {
    intent: 'OPEN_REVISION',
    category: 'application_command',
    patterns: [
      /(open|view|show|start)\s+(revision|smart\s+revision|mistakes?|mistake\s+book)/i,
      /what\s+mistakes?\s+did\s+i\s+make/i,
      /flashcards?/i
    ],
    extractParams: () => ({ view: 'progress', tab: 'smart-revision' })
  },
  {
    intent: 'SHOW_PROGRESS',
    category: 'application_command',
    patterns: [
      /(show|view|open|check)\s+(my\s+)?(progress|analytics|stats|scores?|readiness)/i,
      /how\s+am\s+i\s+doing/i,
      /what\s+is\s+my\s+readiness/i
    ],
    extractParams: () => ({ view: 'progress', tab: 'readiness' })
  },
  {
    intent: 'OPEN_RESUME',
    category: 'career_request',
    patterns: [
      /(open|show|check|scan|review)\s+(my\s+)?(resume|ats)/i,
      /ats\s+score/i,
      /resume\s+checklist/i
    ],
    extractParams: () => ({ view: 'career', tab: 'resume' })
  },
  {
    intent: 'START_INTERVIEW',
    category: 'career_request',
    patterns: [
      /(start|take|launch|conduct|practice)\s+(a\s+)?(mock\s+interview|interview)/i,
      /interview\s+me/i
    ],
    extractParams: () => ({ action: 'mock_interview' })
  },
  {
    intent: 'OPEN_COMPANY',
    category: 'career_request',
    patterns: [
      /(prepare\s+for|company|sprint|target)\s+(zoho|tcs|amazon|google|infosys|wipro)/i,
      /(zoho|tcs|amazon|google|infosys)\s+prep(aration)?/i
    ],
    extractParams: (text) => {
      let company = 'Zoho';
      if (/tcs/i.test(text)) company = 'TCS Digital';
      else if (/amazon/i.test(text)) company = 'Amazon';
      else if (/google/i.test(text)) company = 'Google';
      return { company, view: 'career', tab: 'companies' };
    }
  },
  {
    intent: 'OPEN_CSE_LAB',
    category: 'application_command',
    patterns: [
      /(open|show|launch)\s+(cse\s+labs?|lab|simulator|vortex|visualizer|tools?)/i,
      /consensus\s+cluster/i,
      /algorithm\s+visualizer/i
    ],
    extractParams: () => ({ view: 'cselabs' })
  },
  {
    intent: 'CREATE_STUDY_PLAN',
    category: 'planning_request',
    patterns: [
      /(what\s+should\s+i\s+study|plan\s+my\s+day|create\s+a\s+study\s+plan|what\s+should\s+i\s+do\s+next)/i,
      /plan\s+today/i,
      /next\s+best\s+action/i
    ],
    extractParams: () => ({ action: 'generate_plan' })
  },
  {
    intent: 'START_QUIZ',
    category: 'application_command',
    patterns: [
      /(quiz\s+me|start\s+(a\s+)?quiz|test\s+me|practice\s+quiz|diagnostic\s+test)/i
    ],
    extractParams: () => ({ view: 'practice', tab: 'quiz' })
  },
  {
    intent: 'REVIEW_MISTAKES',
    category: 'application_command',
    patterns: [
      /(mistake\s+book|review\s+mistakes?|my\s+errors?|unresolved\s+mistakes?)/i
    ],
    extractParams: () => ({ view: 'progress', tab: 'mistakes' })
  },
  {
    intent: 'RESET_JOURNEY',
    category: 'application_command',
    patterns: [
      /(reset\s+(my\s+)?(preparation|journey|progress|state|data)|start\s+over|fresh\s+start)/i
    ],
    extractParams: () => ({ action: 'confirm_reset' })
  }
];

/**
 * Classifies a user query string into an intent object
 * @param {string} text - User voice or text input
 * @returns {{ intent: string, category: string, confidence: number, parameters: object }}
 */
function classifyIntent(text) {
  if (!text || typeof text !== 'string') {
    return {
      intent: 'UNKNOWN',
      category: 'knowledge_question',
      confidence: 0,
      parameters: {}
    };
  }

  const clean = text.trim();

  // 1. Check intent rules
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        return {
          intent: rule.intent,
          category: rule.category,
          confidence: 0.95,
          parameters: rule.extractParams ? rule.extractParams(clean) : {}
        };
      }
    }
  }

  // 2. Planning questions
  if (/(schedule|plan|tomorrow|routine|hours?|roadmap)/i.test(clean)) {
    return {
      intent: 'CREATE_STUDY_PLAN',
      category: 'planning_request',
      confidence: 0.85,
      parameters: {}
    };
  }

  // 3. Career questions
  if (/(job|internship|placement|interview|offer|salary|ctc|ats)/i.test(clean)) {
    return {
      intent: 'CAREER_GUIDANCE',
      category: 'career_request',
      confidence: 0.85,
      parameters: {}
    };
  }

  // 4. Default to general knowledge answering
  return {
    intent: 'ANSWER_GENERAL_QUESTION',
    category: 'knowledge_question',
    confidence: 0.80,
    parameters: { query: clean }
  };
}

module.exports = {
  classifyIntent,
  INTENT_RULES
};
