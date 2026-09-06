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

const { orchestrate } = require('./orchestrator');
const { resolveAction } = require('./actionEngine');
const { getStudentContext } = require('./contextEngine');
const { getProactiveRecommendations } = require('./recommendationEngine');
const { getHistory } = require('./memoryService');
const { getSpeechConfig } = require('./voiceService');
const { getAllHealth, getProviderHealth } = require('./providerHealth');
const { ROUTING_MATRIX } = require('./modelRouter');
const { dispatchAutomationEvent, getRecentEvents } = require('./automationBridge');

/**
 * POST /api/jarvis/orchestrate
 * Complete master orchestration pipeline (Blueprint Section 6)
 */
router.post('/orchestrate', async (req, res) => {
  try {
    const {
      message = '',
      context: clientContext = {},
      sessionId = 'default-session',
      mode = 'study'
    } = req.body;

    const result = await orchestrate({
      input: message,
      clientContext,
      sessionId,
      mode
    });

    res.json(result);
  } catch (err) {
    console.error('[JARVIS Orchestrator Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal orchestration error',
      source: 'error-fallback'
    });
  }
});

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

    // Execute via central orchestrator
    const result = await orchestrate({
      input: trimmed,
      clientContext,
      sessionId,
      mode
    });

    // Return unified contract
    res.json(result);

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
  const provider = (process.env.JARVIS_PROVIDER || 'freellmapi').toLowerCase();
  const deepseekConfigured = !!(process.env.DEEPSEEK_API_KEY || process.env.JARVIS_API_KEY);
  const kimiConfigured = !!process.env.KIMI_API_KEY;
  const glmConfigured = !!process.env.GLM_API_KEY;
  const omniConfigured = !!process.env.OMNIROUTER_API_KEY;
  const freeLlmConfigured = !!process.env.FREELLMAPI_URL;

  const anyCloudConfigured = deepseekConfigured || kimiConfigured || glmConfigured || omniConfigured || freeLlmConfigured;

  res.json({
    name: 'GT JARVIS Multi-Model Collaboration Brain',
    status: 'ONLINE',
    version: '2.0.0',
    mode: 'Controlled Autonomous Preparation System',
    activeProvider: provider,
    cloudConfigured: anyCloudConfigured,
    localFallbackReady: true,
    providersConfigured: {
      freellmapi: freeLlmConfigured,
      omnirouter: omniConfigured,
      deepseek: deepseekConfigured,
      kimi: kimiConfigured,
      glm: glmConfigured,
      offline_cse: true
    },
    speechSupport: 'Web Speech API (Chrome/Edge/Chromium)',
    uptime: process.uptime()
  });
});

/**
 * GET /api/jarvis/health
 * Returns instantaneous health states of all connected providers and gateways
 */
router.get('/health', (req, res) => {
  const healthData = getAllHealth();
  const isHealthy = Object.values(healthData).some(p => p.status === 'ONLINE' || p.status === 'DEGRADED');

  res.json({
    success: true,
    healthy: isHealthy,
    jarvis: 'ONLINE',
    providers: healthData,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/jarvis/diagnostics
 * Detailed developer diagnostic endpoint (hidden under Settings -> Developer Diagnostics)
 */
router.get('/diagnostics', (req, res) => {
  res.json({
    success: true,
    jarvis: {
      identity: 'GT JARVIS',
      architecture: 'Controlled Autonomous Multi-Model Gateway',
      version: '2.0.0'
    },
    providers: getAllHealth(),
    routingPolicy: ROUTING_MATRIX,
    recentAutomationEvents: getRecentEvents(20),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/jarvis/automation/event
 * Safe OpenClaw automation dispatch gateway (Blueprint Section 7 & 23)
 * Non-destructive events only: REVISION_DUE, TASK_REMINDER, FOCUS_COMPLETED, etc.
 */
router.post('/automation/event', async (req, res) => {
  try {
    const { event, topic, priority, metadata, channel } = req.body || {};
    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Automation event type is required.'
      });
    }

    const dispatchResult = await dispatchAutomationEvent({
      event,
      topic,
      priority,
      metadata,
      channel
    });

    res.json(dispatchResult);
  } catch (err) {
    console.error('[JARVIS Automation Dispatch Error]', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Automation dispatch failed.'
    });
  }
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
