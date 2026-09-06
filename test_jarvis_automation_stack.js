/**
 * test_jarvis_automation_stack.js
 * Automated Verification Suite for GT JARVIS Autonomous AI Collaboration & Automation Blueprint
 */

const http = require('http');
const { getProviderStatus, recordSuccess, recordFailure, resetHealth, getAllHealth } = require('./backend/jarvis/providerHealth');
const { classifyTaskType, routeTask, ROUTING_MATRIX } = require('./backend/jarvis/modelRouter');
const { verifyResponse } = require('./backend/jarvis/verifier');
const { dispatchAutomationEvent, getRecentEvents, ALLOWED_EVENTS } = require('./backend/jarvis/automationBridge');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('GT JARVIS Autonomous AI Blueprint — Verification Suite');
  console.log('======================================================\n');

  // ── 1. Provider Health & Circuit Breaker ──
  console.log('1. Testing Provider Health & Circuit Breaker Engine...');
  resetHealth();
  let h = getProviderStatus('deepseek');
  assert(h.status === 'ONLINE', 'Initial state for deepseek is ONLINE');

  recordFailure('deepseek', 'HTTP 429: Too Many Requests', 429);
  recordFailure('deepseek', 'HTTP 429: Too Many Requests', 429);
  recordFailure('deepseek', 'HTTP 429: Too Many Requests', 429);

  h = getProviderStatus('deepseek');
  assert(h.status === 'RATE_LIMITED' || h.status === 'DEGRADED', '3 consecutive 429 errors trips circuit breaker');
  assert(h.consecutiveFailures === 3, 'Consecutive failures is correctly recorded as 3');

  // Fast recover for subsequent tests
  resetHealth();
  h = getProviderStatus('deepseek');
  assert(h.status === 'ONLINE', 'Reset returns provider to ONLINE');

  // ── 2. Model Router & Classification ──
  console.log('\n2. Testing Model Router & Task Classification...');
  const tCode = classifyTaskType('Write a Python function to implement binary search', 'study');
  assert(tCode === 'CODING' || tCode === 'DSA', 'Classifies code implementation query as CODING or DSA');

  const tDsa = classifyTaskType('How do I detect a cycle in a linked list using Floyd algorithm?', 'study');
  assert(tDsa === 'DSA', 'Classifies algorithm query as DSA');

  const tResume = classifyTaskType('Review my resume summary against this Google JD', 'career');
  assert(tResume === 'RESUME', 'Classifies career resume review as RESUME');

  const tGate = classifyTaskType('Explain Deadlock avoidance and Banker Algorithm for GATE CSE', 'study');
  assert(tGate === 'TECHNICAL_REASONING', 'Classifies complex concept as TECHNICAL_REASONING');

  const tPlan = classifyTaskType('Create my daily revision plan for 45 minutes', 'study');
  assert(tPlan === 'PLANNING', 'Classifies schedule creation as PLANNING');

  const routeDecision = routeTask('Write a Python function to implement quicksort', {}, 'study');
  assert(routeDecision.provider, 'Router provides a selected provider');
  assert(Array.isArray(routeDecision.fallbacks), 'Router provides fallback sequence');

  // ── 3. Response Verifier & Anti-Hallucination ──
  console.log('\n3. Testing Response Verifier & Safety Guard...');
  const rawHallucination = "I guarantee you AIR 1 in GATE CSE and a 100% placement job offer at Google! You have an 85% mastery score.";
  const verified = verifyResponse(rawHallucination, { day: 0 });
  assert(!verified.text.includes('guarantee you AIR 1'), 'Strips unsupported AIR guarantees');
  assert(!verified.text.includes('100% placement job offer'), 'Strips false placement promises');
  assert(verified.verified === true, 'Verification flags object as verified');

  // ── 4. OpenClaw Automation Bridge ──
  console.log('\n4. Testing OpenClaw Automation Gateway Bridge...');
  assert(ALLOWED_EVENTS.includes('REVISION_DUE'), 'REVISION_DUE is on the whitelist');
  assert(ALLOWED_EVENTS.includes('FOCUS_COMPLETED'), 'FOCUS_COMPLETED is on the whitelist');

  const safeEvent = await dispatchAutomationEvent({
    event: 'REVISION_DUE',
    topic: 'Operating Systems - Deadlock',
    priority: 'high',
    metadata: { test: true }
  });
  assert(safeEvent.success === true, 'Dispatches whitelisted safe event');
  assert(safeEvent.event === 'REVISION_DUE', 'Event type correctly preserved');

  let rejected = false;
  try {
    await dispatchAutomationEvent({
      event: 'DELETE_USER_DATA',
      topic: 'Destructive Wipe'
    });
  } catch(e) {
    rejected = true;
  }
  assert(rejected === true, 'Rejects unwhitelisted destructive action (DELETE_USER_DATA)');

  // ── 5. Backend HTTP Endpoints ──
  console.log('\n5. Testing Live HTTP Endpoints on Localhost:3000...');
  
  // Status
  const statusRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/status',
    method: 'GET'
  });
  assert(statusRes.status === 200, 'GET /api/jarvis/status returns HTTP 200');
  assert(statusRes.body.status === 'ONLINE', 'JARVIS is reported as ONLINE');

  // Health
  const healthRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/health',
    method: 'GET'
  });
  assert(healthRes.status === 200, 'GET /api/jarvis/health returns HTTP 200');
  assert(healthRes.body.jarvis === 'ONLINE', 'System health confirms JARVIS ONLINE');
  assert(healthRes.body.providers.freellmapi, 'Reports FreeLLMAPI health');
  assert(healthRes.body.providers.deepseek, 'Reports DeepSeek health');

  // Diagnostics
  const diagRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/diagnostics',
    method: 'GET'
  });
  assert(diagRes.status === 200, 'GET /api/jarvis/diagnostics returns HTTP 200');
  assert(diagRes.body.routingPolicy, 'Returns complete routing policy');
  assert(Array.isArray(diagRes.body.recentAutomationEvents), 'Returns recent automation event history');

  // Automation Dispatch via API
  const eventRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/automation/event',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    event: 'FOCUS_COMPLETED',
    topic: 'DSA Dynamic Programming',
    priority: 'normal'
  });
  assert(eventRes.status === 200, 'POST /api/jarvis/automation/event returns HTTP 200');
  assert(eventRes.body.event === 'FOCUS_COMPLETED', 'Dispatches FOCUS_COMPLETED successfully');

  // Orchestrator Chat
  const chatRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'Explain Process Synchronization in OS and what is a critical section?',
    mode: 'study',
    context: { day: 0, streak: 0, completedMinutes: 0 }
  });
  assert(chatRes.status === 200, 'POST /api/jarvis/chat returns HTTP 200');
  assert(chatRes.body.reply && chatRes.body.reply.length > 20, 'Returns rich CSE technical answer');
  assert(chatRes.body.routing, 'Returns multi-model routing telemetry');
  assert(chatRes.body.verified === true, 'Response is verified');

  console.log('\n======================================================');
  console.log('✅ ALL JARVIS AUTOMATION STACK TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
