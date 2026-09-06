/**
 * ============================================================================
 * GT JARVIS — OpenClaw Automation Bridge & Event Dispatcher
 * File: backend/jarvis/automationBridge.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Implements Blueprint Section 7, 23 & 24 OpenClaw Automation Bridge:
 * - Emits controlled, safe external automation notifications (Discord, Slack, Webhook)
 * - Supported events:
 *   • REVISION_DUE
 *   • TASK_REMINDER
 *   • FOCUS_COMPLETED
 *   • APPLICATION_DEADLINE
 *   • WEEKLY_REPORT_READY
 * 
 * CRITICAL SAFETY CONSTRAINTS:
 * - Read-only notifications: External channels can NEVER trigger arbitrary or destructive actions.
 * - Rate-limited: Max 1 event per eventType per 30 seconds to prevent notification floods.
 * - Zero secrets exposed to client: Webhook URL & tokens reside server-side.
 */

const ALLOWED_EVENTS = [
  'REVISION_DUE',
  'TASK_REMINDER',
  'FOCUS_COMPLETED',
  'APPLICATION_DEADLINE',
  'WEEKLY_REPORT_READY'
];

const eventHistory = [];
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30s per event type

/**
 * Dispatches an automation event to configured OpenClaw gateway
 * @param {string} eventType - Name of the event
 * @param {Object} payload - Notification data
 * @returns {Promise<Object>} Dispatch result
 */
async function dispatchAutomationEvent(eventType, payload = {}) {
  let type = '';
  if (typeof eventType === 'object' && eventType !== null) {
    payload = eventType;
    type = String(payload.event || payload.eventType || '').toUpperCase().trim();
  } else {
    type = String(eventType || '').toUpperCase().trim();
  }

  // 1. Strict event whitelist check
  if (!ALLOWED_EVENTS.includes(type)) {
    throw new Error(`Event type "${type}" is not allowed. Must be one of: ${ALLOWED_EVENTS.join(', ')}`);
  }

  // 2. Rate limiting check
  const now = Date.now();
  const lastDispatched = rateLimitMap.get(type) || 0;
  if (now - lastDispatched < RATE_LIMIT_WINDOW_MS) {
    return {
      success: false,
      rateLimited: true,
      message: `Event "${type}" rate-limited. Cooldown active.`
    };
  }
  rateLimitMap.set(type, now);

  // 3. Construct sanitized event object
  const eventRecord = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventType: type,
    timestamp: new Date().toISOString(),
    title: payload.title || `JARVIS: ${type}`,
    message: payload.message || 'Automated preparation notification',
    topic: payload.topic || null,
    priority: payload.priority || 'normal',
    dispatchedTo: process.env.OPENCLAW_WEBHOOK_URL ? 'openclaw-webhook' : 'local-event-bus'
  };

  // 4. Save to memory audit history (keep last 50)
  eventHistory.unshift(eventRecord);
  if (eventHistory.length > 50) eventHistory.pop();

  // 5. Send to external OpenClaw webhook if configured
  const webhookUrl = process.env.OPENCLAW_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.OPENCLAW_TOKEN ? `Bearer ${process.env.OPENCLAW_TOKEN}` : ''
        },
        body: JSON.stringify(eventRecord)
      });
      eventRecord.httpStatus = res.status;
    } catch (err) {
      console.warn('[OpenClaw Bridge] Webhook dispatch warning:', err.message);
      eventRecord.error = err.message;
    }
  }

  return {
    success: true,
    event: eventRecord.eventType,
    eventRecord
  };
}

/**
 * Returns recent automation events for admin/diagnostics audit
 * @returns {Array}
 */
function getRecentEvents(limit = 20) {
  return eventHistory.slice(0, limit);
}

module.exports = {
  dispatchAutomationEvent,
  getRecentEvents,
  ALLOWED_EVENTS
};
