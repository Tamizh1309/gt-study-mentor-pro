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
  const currentDay = clientPayload.day ?? 0;
  const isStarted = currentDay > 0;

  return {
    day: currentDay,
    totalDays: clientPayload.totalDays || 90,
    status: isStarted ? 'ACTIVE' : 'NOT_STARTED',
    phase: clientPayload.phase || (isStarted ? `Phase 1: Foundation (Day ${currentDay})` : 'Day 0: Setup & Orientation'),
    activeTrack: clientPayload.activeTrack || 'Not configured yet',
    readinessScores: {
      gate: clientPayload.readiness?.gate ?? 0,
      placement: clientPayload.readiness?.placement ?? 0,
      swe: clientPayload.readiness?.swe ?? 0,
      internship: clientPayload.readiness?.internship ?? 0
    },
    todayTasks: Array.isArray(clientPayload.todayTasks) ? clientPayload.todayTasks : [],
    pendingMistakes: clientPayload.pendingMistakes ?? 0,
    weakTopics: Array.isArray(clientPayload.weakTopics) ? clientPayload.weakTopics : [],
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
