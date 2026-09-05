/**
 * ============================================================================
 * GT JARVIS — Proactive Recommendation Engine
 * File: backend/jarvis/recommendationEngine.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Proactively identifies the "Next Best Action" without waiting to be prompted.
 * 
 * WHY IT EXISTS:
 * A true personal assistant doesn't just passively answer questions — it keeps
 * the student on track toward their 90-day GATE & Placement milestones.
 */

/**
 * Generates data-driven study recommendations based on student context
 * @param {object} context - Normalized student preparation context
 * @returns {Array<{ title: string, reason: string, suggestedAction: string, priority: string }>}
 */
function getProactiveRecommendations(context = {}) {
  const recommendations = [];

  // 1. Check for pending mistakes in Mistake Book
  if (context.pendingMistakes > 0) {
    recommendations.push({
      id: 'rec-mistakes',
      title: `${context.pendingMistakes} Unresolved Errors in Mistake Book`,
      reason: "Converting past errors into mastered concepts increases long-term retention by 2.4x.",
      suggestedAction: "open_revision",
      priority: 'high',
      voicePrompt: `You have ${context.pendingMistakes} unresolved items in your Mistake Book. Reviewing them now will ensure you don't repeat them.`
    });
  }

  // 2. Check weakest readiness score among tracks
  const readiness = context.readinessScores || {};
  const scores = [
    { track: 'Internship', score: readiness.internship ?? 68, action: 'open_resume' },
    { track: 'GATE 2027', score: readiness.gate ?? 76, action: 'open_pyq' },
    { track: 'Placements', score: readiness.placement ?? 78, action: 'open_dsa' },
    { track: 'Software Engineering', score: readiness.swe ?? 81, action: 'open_cse_lab' }
  ].sort((a, b) => a.score - b.score);

  const weakest = scores[0];
  if (weakest && weakest.score < 75) {
    recommendations.push({
      id: 'rec-weakest-track',
      title: `Boost ${weakest.track} Readiness (${weakest.score}%)`,
      reason: `Your ${weakest.track} track currently has the lowest preparation score. Targeted practice here yields the highest overall gain.`,
      suggestedAction: weakest.action,
      priority: 'medium',
      voicePrompt: `Your ${weakest.track} readiness is currently at ${weakest.score}%. Shall we focus on this track today?`
    });
  }

  // 3. Daily task alignment
  const pendingTasks = (context.todayTasks || []).filter(t => t.status === 'pending');
  if (pendingTasks.length > 0) {
    const nextTask = pendingTasks[0];
    recommendations.push({
      id: 'rec-next-task',
      title: `Next Best Action: ${nextTask.title}`,
      reason: `Scheduled for today (${nextTask.duration} mins) to maintain your Day ${context.day || 27} streak.`,
      suggestedAction: 'start_focus',
      priority: 'high',
      voicePrompt: `Your highest priority scheduled task is ${nextTask.title}. Shall I start a ${nextTask.duration}-minute focus session?`
    });
  }

  return recommendations;
}

module.exports = {
  getProactiveRecommendations
};
