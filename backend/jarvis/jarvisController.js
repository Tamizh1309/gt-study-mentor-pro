/**
 * ============================================================================
 * GT JARVIS — Express Controller & API Router
 * File: backend/jarvis/jarvisController.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Acts as the central traffic controller for JARVIS backend requests:
 * 1. POST /api/jarvis/chat      — Handles student text/voice messages
 * 2. POST /api/jarvis/action    — Validates and executes safe app actions
 * 3. GET  /api/jarvis/status    — Health and AI diagnostic status
 * 4. GET  /api/jarvis/proactive — Fetches data-driven study tips
 * 
 * WHY IT EXISTS:
 * Connects the frontend JARVIS HUD with all our modular backend engines
 * (Intent, Context, Action, AI Provider, Memory, and Voice).
 */

const express = require('express');
const router = express.Router();

const { classifyIntent } = require('./intentEngine');
const { getStudentContext } = require('./contextEngine');
const { resolveAction } = require('./actionEngine');
const { generateResponse } = require('./aiProvider');
const { getProactiveRecommendations } = require('./recommendationEngine');
const { appendMessage, getHistory } = require('./memoryService');
const { cleanTextForSpeech, getSpeechConfig } = require('./voiceService');

/**
 * POST /api/jarvis/chat
 * Primary conversation endpoint for voice & text interactions
 */
router.post('/chat', async (req, res) => {
  try {
    const {
      message = '',
      mode = 'study',
      context: clientContext = {},
      sessionId = 'default-session'
    } = req.body;

    const trimmed = String(message).trim();
    if (!trimmed) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required.'
      });
    }

    // 1. Ingest & normalize real student context (never invent fake metrics)
    const context = getStudentContext(clientContext);

    // 2. Classify user intent
    const intentResult = classifyIntent(trimmed);

    // 3. Check if this maps to a safe application action
    const action = resolveAction(intentResult.intent, intentResult.parameters);

    // 4. Save student message to conversation memory
    appendMessage(sessionId, 'user', trimmed);

    // 5. Generate AI response (or action confirmation)
    let replyText = '';
    let source = 'local-intelligence';

    if (action && action.spokenConfirmation) {
      replyText = action.spokenConfirmation;
      source = 'action-engine';
    } else {
      // Generate answer using AI provider (with automatic local CSE fallback)
      const aiResult = await generateResponse(trimmed, context, mode);
      replyText = aiResult.text;
      source = aiResult.source;
    }

    // 6. Save assistant response to conversation memory
    appendMessage(sessionId, 'assistant', replyText);

    // 7. Clean text for natural speech synthesis
    const spokenText = cleanTextForSpeech(replyText);

    // 8. Fetch proactive recommendations based on context
    const recommendations = getProactiveRecommendations(context);

    // 9. Return structured response
    res.json({
      success: true,
      reply: replyText,
      spokenText,
      intent: intentResult,
      action,
      recommendations,
      source,
      speechConfig: getSpeechConfig()
    });

  } catch (err) {
    console.error('[JARVIS Controller Error]', err);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the JARVIS request.',
      reply: "I encountered a minor glitch connecting to the service, but I'm ready for your next question!",
      spokenText: "I'm ready for your next question.",
      source: 'error-fallback'
    });
  }
});

/**
 * POST /api/jarvis/action
 * Validates and returns execution parameters for an action
 */
router.post('/action', (req, res) => {
  const { intent, params } = req.body;
  const action = resolveAction(intent, params);

  if (!action) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or disallowed action.'
    });
  }

  res.json({
    success: true,
    action
  });
});

/**
 * GET /api/jarvis/status
 * Health check & diagnostic endpoint
 */
router.get('/status', (req, res) => {
  const hasCloudKey = !!(process.env.JARVIS_API_KEY || process.env.GEMINI_API_KEY);
  res.json({
    name: 'GT JARVIS Voice Assistant',
    status: 'ONLINE',
    version: '1.0.0',
    mode: 'OS Preparation Engine',
    aiProvider: hasCloudKey ? 'Cloud AI Active (Gemini)' : 'Local High-Yield CSE Intelligence Active (Offline Ready)',
    cloudConfigured: hasCloudKey,
    speechSupport: 'Web Speech API (Chrome/Edge/Chromium)',
    uptime: process.uptime()
  });
});

/**
 * GET /api/jarvis/proactive
 * Returns proactive suggestions for the current student
 */
router.get('/proactive', (req, res) => {
  const context = getStudentContext();
  const recommendations = getProactiveRecommendations(context);
  res.json({
    success: true,
    recommendations
  });
});

module.exports = router;
