/**
 * ============================================================================
 * GT JARVIS — Provider Health & Circuit Breaker Engine
 * File: backend/jarvis/providerHealth.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Tracks the real-time operational status of all backend AI providers:
 * - FreeLLMAPI (Local gateway)
 * - OmniRouter (Multi-model router)
 * - GLM (Reasoning provider)
 * - Kimi (Long-context provider)
 * - DeepSeek (Coding provider)
 * - Gemini (Cloud assistant)
 * - Local CSE (Offline deterministic engine)
 * 
 * CIRCUIT BREAKER LOGIC:
 * - States: ONLINE | DEGRADED | RATE_LIMITED | OFFLINE | DISABLED
 * - Trips after 3 consecutive failures into DEGRADED state with a 60s cooldown.
 * - Probes on subsequent requests to auto-heal when service recovers.
 * - Zero fake metrics: reports real request latencies and error telemetry.
 */

const PROVIDERS = {
  freellmapi: { name: 'FreeLLMAPI Gateway', type: 'gateway' },
  omnirouter: { name: 'OmniRouter', type: 'router' },
  glm: { name: 'GLM Reasoning', type: 'model' },
  kimi: { name: 'Kimi Long-Context', type: 'model' },
  deepseek: { name: 'DeepSeek Coding', type: 'model' },
  gemini: { name: 'Google Gemini', type: 'cloud' },
  local: { name: 'Local CSE Knowledge Base', type: 'offline' }
};

const COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown for degraded state
const FAILURE_THRESHOLD = 3;

// Live health state store
const healthStore = {};

// Initialize state for each provider
Object.keys(PROVIDERS).forEach(key => {
  healthStore[key] = {
    provider: key,
    name: PROVIDERS[key].name,
    type: PROVIDERS[key].type,
    status: key === 'local' ? 'ONLINE' : 'ONLINE',
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    lastLatencyMs: 0,
    lastSuccess: key === 'local' ? Date.now() : null,
    lastFailure: null,
    lastError: null,
    cooldownUntil: null
  };
});

/**
 * Check if a provider is available for requests
 * @param {string} provider
 * @returns {boolean}
 */
function isAvailable(provider) {
  const p = String(provider).toLowerCase();
  const entry = healthStore[p];
  if (!entry) return false;
  if (entry.status === 'DISABLED') return false;
  if (p === 'local') return true; // Local knowledge is always 100% available

  // Check cooldown if degraded or rate-limited
  if (entry.cooldownUntil && Date.now() < entry.cooldownUntil) {
    return false;
  }

  return entry.status !== 'OFFLINE';
}

/**
 * Record a successful request
 * @param {string} provider
 * @param {number} latencyMs
 */
function recordSuccess(provider, latencyMs = 0) {
  const p = String(provider).toLowerCase();
  const entry = healthStore[p];
  if (!entry) return;

  entry.totalRequests++;
  entry.totalSuccesses++;
  entry.consecutiveFailures = 0;
  entry.status = 'ONLINE';
  entry.lastLatencyMs = Math.max(0, Math.round(latencyMs));
  entry.lastSuccess = Date.now();
  entry.lastError = null;
  entry.cooldownUntil = null;
}

/**
 * Record a failed request with circuit-breaker tracking
 * @param {string} provider
 * @param {Error|string} error
 */
function recordFailure(provider, error = 'Unknown error') {
  const p = String(provider).toLowerCase();
  const entry = healthStore[p];
  if (!entry || p === 'local') return;

  entry.totalRequests++;
  entry.totalFailures++;
  entry.consecutiveFailures++;
  entry.lastFailure = Date.now();
  entry.lastError = error?.message || String(error);

  // Check if rate limited
  const errStr = String(entry.lastError).toLowerCase();
  if (errStr.includes('429') || errStr.includes('rate limit') || errStr.includes('quota')) {
    entry.status = 'RATE_LIMITED';
    entry.cooldownUntil = Date.now() + (90 * 1000); // 90s cooldown for rate limits
    return;
  }

  // Circuit breaker: trip to degraded if failure threshold exceeded
  if (entry.consecutiveFailures >= FAILURE_THRESHOLD) {
    entry.status = 'DEGRADED';
    entry.cooldownUntil = Date.now() + COOLDOWN_MS;
  }
}

/**
 * Get status of a single provider
 * @param {string} provider
 */
function getProviderStatus(provider) {
  const p = String(provider).toLowerCase();
  return healthStore[p] ? { ...healthStore[p] } : null;
}

/**
 * Get snapshot of all provider health states
 */
function getAllHealth() {
  const snapshot = {};
  Object.keys(healthStore).forEach(key => {
    snapshot[key] = { ...healthStore[key] };
  });
  return snapshot;
}

/**
 * Reset health for testing
 */
function resetHealth() {
  Object.keys(healthStore).forEach(key => {
    healthStore[key].status = 'ONLINE';
    healthStore[key].consecutiveFailures = 0;
    healthStore[key].cooldownUntil = null;
    healthStore[key].lastError = null;
  });
}

module.exports = {
  isAvailable,
  recordSuccess,
  recordFailure,
  getProviderStatus,
  getAllHealth,
  resetHealth,
  PROVIDERS
};
