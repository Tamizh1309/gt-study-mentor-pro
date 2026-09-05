/**
 * ============================================================================
 * GT JARVIS — Central Orchestration Layer
 * File: backend/jarvis/orchestrator.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Implements the master orchestration pipeline specified in Blueprint Section 6:
 * 
 * 1. Intent Classification (Bilingual English + Tanglish + Fast Rules)
 * 2. Context Ingestion (Verified student state, zero-state honest metrics)
 * 3. Decision Engine (Mathematical NBA scoring)
 * 4. Action Validation (Strict whitelist verification)
 * 5. Response Generation (Provider-agnostic with offline local fallback)
 * 6. Memory Persistence (Structured session interaction logging)
 * 
 * PIPELINE:
 * JARVIS thinks → Next Best Action decides → App executes → Progress remembers → JARVIS adapts
 */

const { classifyIntent } = require('./intentEngine');
const { getStudentContext } = require('./contextEngine');
const { decideNextAction } = require('./decisionEngine');
const { resolveAction } = require('./actionEngine');
const { generateResponse } = require('./aiProvider');
const { appendMessage, getHistory } = require('./memoryService');
const { cleanTextForSpeech, getSpeechConfig } = require('./voiceService');
const { getProactiveRecommendations } = require('./recommendationEngine');

/**
 * Master orchestration pipeline
 * @param {string} input - User query or voice transcript
 * @param {Object} clientContext - Raw client state
 * @param {string} sessionId - Session ID for memory isolation
 * @param {string} mode - Interaction mode ('study', 'career', 'code')
 * @returns {Promise<Object>} Unified response contract
 */
async function orchestrate({
  input = '',
  clientContext = {},
  sessionId = 'default-session',
  mode = 'study'
} = {}) {
  const trimmed = String(input).trim();
  if (!trimmed) {
    throw new Error('Message text is required for orchestration.');
  }

  // 1. Ingest & normalize real student context
  const context = getStudentContext(clientContext);

  // 2. Classify student intent (Rules + Tanglish + Schema)
  const intent = classifyIntent(trimmed);

  // 3. Decide Next Best Action based on real student context
  const decision = decideNextAction(intent, context);

  // 4. Validate & resolve safe action from whitelist
  let action = resolveAction(intent.intent, intent.parameters);
  if (!action && decision?.primaryAction) {
    // If the student query asks "what should I do?", wire the NBA decision
    if (intent.intent === 'CREATE_STUDY_PLAN' || intent.intent === 'GET_RECOMMENDATION') {
      action = resolveAction(decision.primaryAction.type, {
        topic: decision.primaryAction.topic,
        duration: decision.primaryAction.duration
      });
    }
  }

  // 5. Append student input to memory
  appendMessage(sessionId, 'user', trimmed);

  // 6. Generate provider-agnostic response
  let replyText = '';
  let source = 'local-intelligence';

  if (action && action.spokenConfirmation) {
    replyText = action.spokenConfirmation;
    source = 'action-engine';
  } else {
    // Generate evidence-based response with local fallback
    const aiResult = await generateResponse(trimmed, context, mode);
    replyText = aiResult.text;
    source = aiResult.source;
  }

  // 7. Save assistant reply to memory
  appendMessage(sessionId, 'assistant', replyText);

  // 8. Clean text for natural speech synthesis
  const spokenText = cleanTextForSpeech(replyText);

  // 9. Fetch proactive recommendations based on context
  const recommendations = getProactiveRecommendations(context);

  // 10. Return unified contract
  return {
    success: true,
    input: trimmed,
    intent,
    contextSummary: {
      day: context.day || 0,
      completedMinutes: context.completedMinutes || 0,
      streak: context.streak || 0,
      accuracy: context.accuracy || 0,
      weakTopicsCount: (context.weakTopics || []).length
    },
    decision,
    action,
    reply: replyText,
    spokenText,
    source,
    recommendations,
    speechConfig: getSpeechConfig()
  };
}

module.exports = {
  orchestrate
};
