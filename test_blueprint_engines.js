/**
 * Test Suite: Blueprint Engines Verification
 * File: test_blueprint_engines.js
 */

const assert = require('assert');
const { decideNextAction } = require('./backend/jarvis/decisionEngine');
const { orchestrate } = require('./backend/jarvis/orchestrator');
const MistakeBookModule = require('./mistakeBook');
const PrepIntelligenceEngine = require('./prepIntelligence');

console.log('🧪 Starting Blueprint Engines Verification...\n');

// 1. Test Decision Engine (NBA Scoring)
console.log('1. Testing Next Best Action Decision Engine...');
const d0Action = decideNextAction({}, { day: 0, completedMinutes: 0 });
assert(d0Action && d0Action.primaryAction, 'Day 0 must return primaryAction');
assert.strictEqual(d0Action.primaryAction.type, 'start_onboarding', 'Day 0 action must be onboarding setup');
assert.strictEqual(d0Action.primaryAction.score, 100, 'Day 0 setup must score 100');
assert(d0Action.primaryAction.whyBreakdown.what, 'Must contain 6-dimension breakdown');
console.log('✅ Day 0 calibration action verified.');

const d10Action = decideNextAction(
  { parameters: { availableMinutes: 60 } },
  {
    day: 10,
    completedMinutes: 30,
    weakTopics: [{ topic: 'Normalization', subject: 'DBMS', accuracy: 38 }],
    revisionsDue: [{ topic: 'Process Synchronization', subject: 'OS' }]
  }
);
assert(d10Action.primaryAction, 'Day 10 must return scored candidate');
assert(typeof d10Action.primaryAction.score === 'number' && d10Action.primaryAction.score > 0, 'Score must be positive number');
assert(d10Action.alternatives.length > 0, 'Must provide ranked alternatives');
console.log(`✅ Day 10 NBA decision calculated: "${d10Action.primaryAction.title}" (Score: ${d10Action.primaryAction.score})`);

// 2. Test Central Orchestrator
console.log('\n2. Testing Central Orchestrator Pipeline...');
(async () => {
  const orchResult = await orchestrate({
    input: 'What should I study today in 45 minutes?',
    clientContext: { day: 5, targetRoles: ['gate'] }
  });
  assert(orchResult.success, 'Orchestration must succeed');
  assert(orchResult.reply, 'Orchestrator must return speech/reply');
  assert(orchResult.decision, 'Orchestrator must return NBA decision');
  assert(orchResult.decision.primaryAction, 'Decision must contain primary action');
  console.log(`✅ Orchestrator returned response from source: ${orchResult.source}`);

  // 3. Test Structured Mistake Intelligence
  console.log('\n3. Testing Structured Mistake Intelligence (Blueprint Section 11)...');
  // High confidence wrong answer -> CRITICAL
  const critMistake = MistakeBookModule.recordMistake(
    'What is the time complexity of building a heap?',
    'Algorithms',
    'Heaps',
    'O(N log N)',
    'O(N)',
    'Bottom-up heap construction runs in linear time',
    'Misconception',
    { confidence: 'high', questionId: 'q-heap-1' }
  );
  assert.strictEqual(critMistake.severity, 'CRITICAL', 'High confidence mistake must be CRITICAL');
  assert.strictEqual(critMistake.confidence, 'high');
  assert(critMistake.nextReviewDate, 'Must have nextReviewDate');
  
  // Careless calculation -> LOW
  const lowMistake = MistakeBookModule.recordMistake(
    '2^10 equals?',
    'Aptitude',
    'Math',
    '1000',
    '1024',
    'Powers of 2',
    'Calculation',
    { confidence: 'low' }
  );
  assert.strictEqual(lowMistake.severity, 'LOW', 'Calculation mistake must be LOW severity');
  assert(MistakeBookModule.getCriticalMistakesCount() >= 1, 'Critical count must be tracked');
  console.log(`✅ Mistake intelligence: CRITICAL (severity: ${critMistake.severity}), LOW (severity: ${lowMistake.severity}) verified.`);

  // 4. Test Dynamic Scheduling Engine (Blueprint Section 13)
  console.log('\n4. Testing Dynamic Scheduling Engine (30m, 60m, 120m)...');
  const plan30 = PrepIntelligenceEngine.generateDynamicSchedule(30);
  assert.strictEqual(PrepIntelligenceEngine.getDailyBudget(), 30);
  assert(plan30.length >= 1, '30m plan must generate tasks');
  
  const plan60 = PrepIntelligenceEngine.generateDynamicSchedule(60);
  assert.strictEqual(PrepIntelligenceEngine.getDailyBudget(), 60);
  assert(plan60.length >= 1, '60m plan must generate tasks');

  const plan120 = PrepIntelligenceEngine.generateDynamicSchedule(120);
  assert.strictEqual(PrepIntelligenceEngine.getDailyBudget(), 120);
  assert(plan120.length >= 1, '120m plan must generate tasks');
  console.log(`✅ Dynamic scheduling verified for 30m (${plan30.length} tasks), 60m (${plan60.length} tasks), 120m (${plan120.length} tasks).`);

  console.log('\n🎉 ALL BLUEPRINT BACKEND ENGINES AND LOGIC PASSED VERIFICATION WITH 0 ERRORS!');
})();
