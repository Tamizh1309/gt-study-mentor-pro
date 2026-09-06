/**
 * ============================================================================
 * GT JARVIS — Model Router (Intelligent Task-Specific Routing)
 * File: backend/jarvis/modelRouter.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Implements the Blueprint Section 11 & 15 task-specific routing matrix:
 * 
 * | Task | Preferred Provider | Fallback |
 * |---|---|---|
 * | Daily planning | Local / Fast (FreeLLMAPI) | OmniRouter |
 * | Simple explanation | Fast model | Local |
 * | DSA reasoning | DeepSeek / GLM | Kimi / OmniRouter |
 * | Coding | DeepSeek / GLM | OmniRouter / Local |
 * | Large document analysis | Kimi | OmniRouter / GLM |
 * | Resume/JD matching | Kimi | GLM / OmniRouter |
 * | System Design | GLM / Kimi | DeepSeek / Local |
 * | Offline CSE question | Local knowledge | None |
 * 
 * Never broadcasts to all models simultaneously. Evaluates health and returns
 * a structured routing decision with active fallbacks.
 */

const { isAvailable, getProviderStatus } = require('./providerHealth');

// Task definitions & routing policy matrix
const ROUTING_MATRIX = {
  CODING: {
    primaryChain: ['deepseek', 'glm', 'omnirouter', 'freellmapi', 'local'],
    requiresVerification: true,
    description: 'Algorithmic code generation, debugging, and implementation'
  },
  DSA: {
    primaryChain: ['deepseek', 'glm', 'omnirouter', 'freellmapi', 'local'],
    requiresVerification: true,
    description: 'Data Structures & Algorithms conceptual reasoning'
  },
  LONG_CONTEXT: {
    primaryChain: ['kimi', 'omnirouter', 'glm', 'local'],
    requiresVerification: true,
    description: 'Long-form syllabus, transcripts, or project documentation analysis'
  },
  RESUME: {
    primaryChain: ['kimi', 'glm', 'omnirouter', 'local'],
    requiresVerification: true,
    description: 'Resume & Job Description ATS alignment analysis'
  },
  TECHNICAL_REASONING: {
    primaryChain: ['glm', 'deepseek', 'omnirouter', 'local'],
    requiresVerification: true,
    description: 'Core Computer Science theoretical reasoning (OS, DBMS, Networks)'
  },
  PLANNING: {
    primaryChain: ['freellmapi', 'local', 'omnirouter'],
    requiresVerification: false,
    description: 'Fast preparation scheduling, NBA determination, and time budgeting'
  },
  OFFLINE_CSE: {
    primaryChain: ['local'],
    requiresVerification: false,
    description: 'Instant deterministic offline CSE knowledge lookup'
  },
  GENERAL: {
    primaryChain: ['freellmapi', 'omnirouter', 'gemini', 'local'],
    requiresVerification: false,
    description: 'General student mentoring, encouragement, and navigational queries'
  }
};

/**
 * Classifies the incoming prompt and mode into a specific task type
 * @param {string} prompt - User query
 * @param {string} mode - Active JARVIS mode (study, gate, dsa, resume, etc.)
 * @returns {string} Task type key
 */
function classifyTaskType(prompt = '', mode = 'study') {
  const p = String(prompt).toLowerCase();
  const m = String(mode).toLowerCase();

  // Mode overrides
  if (m === 'dsa') return 'DSA';
  if (m === 'resume') return 'RESUME';

  // Coding patterns
  if (/\b(code|function|class|bug|syntax|implement|def |void |#include|import |sql query|regex)\b/i.test(p)) {
    return 'CODING';
  }

  // DSA patterns
  if (/\b(binary search|graph|tree|dp|dynamic programming|complexity|big-o|sorting|array|linked list|stack|queue|recursion)\b/i.test(p)) {
    return 'DSA';
  }

  // Resume & Career patterns
  if (/\b(resume|ats|job description|jd|cv|linkedin|portfolio|bullet point)\b/i.test(p) || p.length > 800) {
    return p.length > 800 ? 'LONG_CONTEXT' : 'RESUME';
  }

  // Technical CS Core
  if (/\b(deadlock|semaphore|paging|virtual memory|acid|normalization|bcnf|tcp|udp|raft|consensus|cache|socket)\b/i.test(p)) {
    return 'TECHNICAL_REASONING';
  }

  // Planning & schedule
  if (/\b(plan|schedule|today|tomorrow|hours|minutes|budget|priority|next action|routine)\b/i.test(p)) {
    return 'PLANNING';
  }

  return 'GENERAL';
}

/**
 * Routes a task to the most appropriate healthy provider
 * @param {string} prompt - Student's question or message
 * @param {Object} context - Student's preparation context
 * @param {string} mode - Active JARVIS mode
 * @returns {Object} Structured routing decision
 */
function routeTask(prompt = '', context = {}, mode = 'study') {
  const taskType = classifyTaskType(prompt, mode);
  const policy = ROUTING_MATRIX[taskType] || ROUTING_MATRIX.GENERAL;

  // Filter healthy providers in policy priority order
  const healthyChain = policy.primaryChain.filter(provider => isAvailable(provider));

  // If all preferred external models are degraded or offline, fallback to local
  const selectedProvider = healthyChain.length > 0 ? healthyChain[0] : 'local';
  const availableFallbacks = healthyChain.slice(1);

  // Model ID selection based on provider
  let selectedModel = 'default';
  if (selectedProvider === 'deepseek') {
    selectedModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  } else if (selectedProvider === 'kimi') {
    selectedModel = process.env.KIMI_MODEL || 'moonshot-v1-32k';
  } else if (selectedProvider === 'glm') {
    selectedModel = process.env.GLM_MODEL || 'glm-4';
  } else if (selectedProvider === 'omnirouter') {
    selectedModel = process.env.OMNIROUTER_MODEL || 'omni:balanced';
  } else if (selectedProvider === 'freellmapi') {
    selectedModel = process.env.JARVIS_MODEL || 'auto:balanced';
  } else if (selectedProvider === 'gemini') {
    selectedModel = process.env.JARVIS_MODEL || 'gemini-1.5-flash';
  } else {
    selectedModel = 'offline-cse-v2';
  }

  return {
    taskType,
    provider: selectedProvider,
    model: selectedModel,
    reason: `Routed to ${selectedProvider} for ${taskType} (${policy.description})`,
    fallbacks: availableFallbacks.length > 0 ? availableFallbacks : ['local'],
    requiresVerification: policy.requiresVerification,
    healthSnapshot: {
      provider: selectedProvider,
      status: getProviderStatus(selectedProvider)?.status || 'ONLINE'
    }
  };
}

module.exports = {
  routeTask,
  classifyTaskType,
  ROUTING_MATRIX
};
