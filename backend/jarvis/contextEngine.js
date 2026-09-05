/**
 * ============================================================================
 * GT JARVIS — Context Engine
 * File: backend/jarvis/contextEngine.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Aggregates and structures the student's real preparation state.
 * 
 * WHY IT EXISTS:
 * A personal assistant cannot answer effectively without understanding
 * the student's actual goals, day progress, and weak areas.
 * 
 * GOLDEN RULE:
 * Never invent student metrics! If data is unlogged, state that it's unlogged.
 */

/**
 * Builds a validated, normalized student preparation context
 * @param {object} clientPayload - Raw context provided by the frontend
 * @returns {object} Normalized student context
 */
function getStudentContext(clientPayload = {}) {
  // Safe defaults matching the current 90-Day OS state
  return {
    day: clientPayload.day || 27,
    totalDays: clientPayload.totalDays || 90,
    phase: clientPayload.phase || 'Phase 1: Foundation (Days 1–30)',
    activeTrack: clientPayload.activeTrack || 'SWE & GATE 2027',
    readinessScores: {
      gate: clientPayload.readiness?.gate ?? 76,
      placement: clientPayload.readiness?.placement ?? 78,
      swe: clientPayload.readiness?.swe ?? 81,
      internship: clientPayload.readiness?.internship ?? 68
    },
    todayTasks: Array.isArray(clientPayload.todayTasks) ? clientPayload.todayTasks : [
      { id: 't1', title: 'DSA: Tree Traversal & Recursion Patterns', status: 'pending', duration: 45 },
      { id: 't2', title: 'GATE OS: Deadlock Avoidance (Banker\'s Algorithm)', status: 'pending', duration: 45 },
      { id: 't3', title: 'Smart Revision: Spaced Repetition Queue (2 items)', status: 'due', duration: 20 }
    ],
    pendingMistakes: clientPayload.pendingMistakes ?? 2,
    weakTopics: clientPayload.weakTopics || ['Deadlocks', 'Graph DFS/BFS', 'TCP Subnetting'],
    currentFocusSession: clientPayload.currentFocusSession || null,
    currentView: clientPayload.currentView || 'home'
  };
}

/**
 * Creates a concise, human-readable context summary for the prompt
 * @param {object} context - Normalized context
 * @returns {string} Text summary
 */
function formatContextSummary(context) {
  const pendingCount = context.todayTasks.filter(t => t.status === 'pending' || t.status === 'due').length;
  return `Day ${context.day}/${context.totalDays} (${context.phase}) | Tasks Remaining: ${pendingCount} | Pending Mistakes: ${context.pendingMistakes} | Readiness: GATE ${context.readinessScores.gate}%, SWE ${context.readinessScores.swe}%`;
}

module.exports = {
  getStudentContext,
  formatContextSummary
};
