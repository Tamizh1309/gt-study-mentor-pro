/**
 * ============================================================================
 * GT JARVIS — Conversation & Student Memory Service
 * File: backend/jarvis/memoryService.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Stores short-term conversation context and student preferences.
 * 
 * WHY IT EXISTS:
 * When a student asks "Teach me binary search" and follows up with "Give me a
 * practice question", JARVIS must know that "practice question" refers to binary search!
 */

// In-memory session store (keyed by sessionId)
const sessionHistory = new Map();

// Student preferences (lightweight in-memory defaults)
const studentPreferences = new Map();

const MAX_HISTORY_LENGTH = 8;

/**
 * Retrieves recent conversation history for a given session
 * @param {string} sessionId
 * @returns {Array<{ role: string, content: string, timestamp: number }>}
 */
function getHistory(sessionId = 'default-session') {
  return sessionHistory.get(sessionId) || [];
}

/**
 * Appends a message to conversation history
 * @param {string} sessionId
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
function appendMessage(sessionId = 'default-session', role, content) {
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }

  const history = sessionHistory.get(sessionId);
  history.push({
    role,
    content: String(content).slice(0, 1000),
    timestamp: Date.now()
  });

  // Keep only the most recent messages to maintain low token overhead
  if (history.length > MAX_HISTORY_LENGTH) {
    history.splice(0, history.length - MAX_HISTORY_LENGTH);
  }
}

/**
 * Clears history for a session
 * @param {string} sessionId
 */
function clearHistory(sessionId = 'default-session') {
  sessionHistory.delete(sessionId);
}

/**
 * Updates a student preference
 * @param {string} key
 * @param {any} value
 */
function setPreference(key, value) {
  studentPreferences.set(key, value);
}

/**
 * Gets a student preference
 * @param {string} key
 * @param {any} defaultValue
 */
function getPreference(key, defaultValue = null) {
  return studentPreferences.has(key) ? studentPreferences.get(key) : defaultValue;
}

module.exports = {
  getHistory,
  appendMessage,
  clearHistory,
  setPreference,
  getPreference
};
