const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body><textarea id="code-studio-input"></textarea><pre id="code-studio-output"></pre><div id="code-complexity-badge"></div><div id="code-studio-tanglish"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
};

const Prep = require('./prepIntelligence.js');

console.log('1. Testing PrepIntelligenceEngine.generateCalibratedDayPlan...');
const plan = Prep.generateCalibratedDayPlan('GATE 2027 (Top 100 AIR)', 3, 1);
console.log('   Tasks generated:', plan.length);
if (plan.length !== 3) throw new Error('Expected 3 tasks for 3 hours');

console.log('2. Testing toggleTask...');
const t1 = plan[0];
Prep.toggleTask(t1.id);
const stateAfterToggle = Prep.getState();
if (!stateAfterToggle.todayTasks[0].completed) throw new Error('Task should be completed');
if (stateAfterToggle.completedMinutes !== t1.estMinutes) throw new Error('completedMinutes mismatch');
console.log('   Task toggled and completedMinutes recorded:', stateAfterToggle.completedMinutes);

console.log('3. Testing Next Best Action...');
const nba = Prep.getNextBestAction();
console.log('   NBA primary action:', nba.title);
if (!nba.title) throw new Error('NBA title should exist');

console.log('4. Testing resetCodeStudio...');
Prep.resetCodeStudio();
const inputVal = document.getElementById('code-studio-input').value;
if (!inputVal.includes('maxSubarraySum')) throw new Error('Code Studio reset should load sliding window template');
console.log('   Code Studio reset successfully loaded sliding window template.');

console.log('5. Testing runCodeStudioSimulation...');
Prep.runCodeStudioSimulation();
const outputVal = document.getElementById('code-studio-output').textContent;
if (!outputVal.includes('Max Sum Subarray')) throw new Error('Simulation output missing expected result');
console.log('   Code Studio simulation verified successfully.');

console.log('6. Testing advanceToNextDay rollover...');
const dayBefore = stateAfterToggle.currentDay;
const rolled = Prep.advanceToNextDay();
const rolledTasks = Prep.getState().todayTasks;
if (Prep.getState().currentDay !== dayBefore + 1) throw new Error('Day should increment');
const rolledOver = rolledTasks.find(t => t.id === plan[1].id);
if (!rolledOver) throw new Error('Incomplete task should be rolled over');
console.log('   Tasks rolled over into Day ' + Prep.getState().currentDay + ' successfully.');

console.log('\n🎉 ALL TARGETED PREP & CODE STUDIO TESTS PASSED WITH 0 ERRORS!');
