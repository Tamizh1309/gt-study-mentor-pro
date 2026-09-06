/**
 * test_official_gate_and_cleanup.js
 * Automated Verification Suite for Official IIT Madras GATE 2027 Integration & Cleanups
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { classifyIntent } = require('./backend/jarvis/intentEngine');
const { resolveAction } = require('./backend/jarvis/actionEngine');

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

async function runSuite() {
  console.log('\n======================================================');
  console.log('Official GATE 2027 Integration & Cleanup Verification');
  console.log('======================================================\n');

  // ── 1. Intent Engine Classification for GATE Commands ──
  console.log('1. Testing JARVIS Intent Engine for Official GATE Commands...');
  
  const iDates = classifyIntent('JARVIS, show GATE important dates');
  assert(iDates.intent === 'OPEN_GATE_OFFICIAL', 'Classifies "show GATE important dates" as OPEN_GATE_OFFICIAL');
  assert(iDates.parameters.target === 'dates', 'Extracts target as "dates"');

  const iPattern = classifyIntent("What is the official GATE question paper pattern?");
  assert(iPattern.intent === 'OPEN_GATE_OFFICIAL', 'Classifies question pattern query as OPEN_GATE_OFFICIAL');
  assert(iPattern.parameters.target === 'pattern', 'Extracts target as "pattern"');

  const iSyllabus = classifyIntent('Open the official GATE CS syllabus');
  assert(iSyllabus.intent === 'OPEN_GATE_OFFICIAL', 'Classifies syllabus query as OPEN_GATE_OFFICIAL');
  assert(iSyllabus.parameters.target === 'syllabus', 'Extracts target as "syllabus"');

  const iDownloads = classifyIntent('Where can I download GATE official documents?');
  assert(iDownloads.intent === 'OPEN_GATE_OFFICIAL', 'Classifies download query as OPEN_GATE_OFFICIAL');
  assert(iDownloads.parameters.target === 'downloads', 'Extracts target as "downloads"');

  const iPortal = classifyIntent('Open official GATE 2027 portal');
  assert(iPortal.intent === 'OPEN_GATE_OFFICIAL', 'Classifies portal query as OPEN_GATE_OFFICIAL');
  assert(iPortal.parameters.target === 'portal', 'Extracts target as "portal"');

  const iPrep = classifyIntent('Prepare for GATE 2027');
  assert(iPrep.intent === 'OPEN_GATE_PREPARE', 'Classifies "Prepare for GATE 2027" as OPEN_GATE_PREPARE');

  // ── 2. Action Engine URL Resolution ──
  console.log('\n2. Testing Action Engine URL Mapping to Official IIT Madras Sources...');

  const actDates = resolveAction('OPEN_GATE_OFFICIAL', { target: 'dates' });
  assert(actDates.type === 'open_gate_official', 'Action type is open_gate_official');
  assert(actDates.params.url === 'https://gate2027.iitm.ac.in/important_dates', 'Dates URL is https://gate2027.iitm.ac.in/important_dates');

  const actPattern = resolveAction('OPEN_GATE_OFFICIAL', { target: 'pattern' });
  assert(actPattern.params.url === 'https://gate2027.iitm.ac.in/question_paper_pattern', 'Pattern URL is https://gate2027.iitm.ac.in/question_paper_pattern');

  const actSyllabus = resolveAction('OPEN_GATE_OFFICIAL', { target: 'syllabus' });
  assert(actSyllabus.params.url === 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus', 'Syllabus URL is https://gate2027.iitm.ac.in/exam_papers_and_syllabus');

  const actDownloads = resolveAction('OPEN_GATE_OFFICIAL', { target: 'downloads' });
  assert(actDownloads.params.url === 'https://gate2027.iitm.ac.in/download', 'Downloads URL is https://gate2027.iitm.ac.in/download');

  const actPortal = resolveAction('OPEN_GATE_OFFICIAL', { target: 'portal' });
  assert(actPortal.params.url === 'https://gate2027.iitm.ac.in/', 'Portal URL is https://gate2027.iitm.ac.in/');

  // ── 3. Live HTTP API Verification ──
  console.log('\n3. Testing Live JARVIS API (/api/jarvis/chat)...');

  const chatRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS show GATE important dates',
    mode: 'study'
  });

  assert(chatRes.status === 200, 'POST /api/jarvis/chat returned HTTP 200');
  assert(chatRes.body.action, 'Response contains action payload');
  assert(chatRes.body.action.type === 'open_gate_official', 'Action type is open_gate_official');
  assert(chatRes.body.action.params.url === 'https://gate2027.iitm.ac.in/important_dates', 'Target URL is official IIT Madras dates page');

  // Test question papers drive query
  const iDrive = classifyIntent('JARVIS open GATE question papers');
  assert(iDrive.intent === 'OPEN_GATE_OFFICIAL', 'Classifies question papers query as OPEN_GATE_OFFICIAL');
  assert(iDrive.parameters.target === 'papers_drive', 'Extracts target as "papers_drive"');

  const actDrive = resolveAction('OPEN_GATE_OFFICIAL', { target: 'papers_drive' });
  assert(actDrive.params.url === 'https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud', 'Action returns Google Drive Question Papers link');

  const chatDriveRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open GATE question papers',
    mode: 'study'
  });

  assert(chatDriveRes.status === 200, 'POST /api/jarvis/chat for question papers returned 200');
  assert(chatDriveRes.body.action.params.url === 'https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud', 'Live action returns Google Drive folder URL');

  // ── 4. Codebase Cleanup & Drive Link Verification ──
  console.log('\n4. Testing Codebase Cleanliness & Question Paper Link...');
  const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  assert(!appJs.includes('http://localhost:3000'), 'app.js has zero occurrences of http://localhost:3000');
  assert(appJs.includes('API_BASE_URL'), 'app.js defines and uses API_BASE_URL');
  assert(appJs.includes('https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud'), 'app.js contains Google Drive question papers link');

  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(indexHtml.includes('https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud'), 'index.html contains Google Drive question papers link');

  console.log('\n======================================================');
  console.log('✅ ALL OFFICIAL GATE & CLEANUP TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runSuite().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
