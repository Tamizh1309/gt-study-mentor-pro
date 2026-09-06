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

  // Test IndiaBIX Aptitude query
  const iBix = classifyIntent('JARVIS open IndiaBIX aptitude questions and answers');
  assert(iBix.intent === 'OPEN_APTITUDE_RESOURCE', 'Classifies IndiaBIX query as OPEN_APTITUDE_RESOURCE');
  
  const actBix = resolveAction('OPEN_APTITUDE_RESOURCE');
  assert(actBix.params.url === 'https://www.indiabix.com/aptitude/questions-and-answers/', 'Action returns IndiaBIX Aptitude URL');

  const chatBixRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open IndiaBIX aptitude questions',
    mode: 'study'
  });

  assert(chatBixRes.status === 200, 'POST /api/jarvis/chat for IndiaBIX returned 200');
  assert(chatBixRes.body.action.params.url === 'https://www.indiabix.com/aptitude/questions-and-answers/', 'Live action returns IndiaBIX URL');

  // Test GeeksforGeeks Aptitude query
  const iGfg = classifyIntent('JARVIS open GeeksforGeeks aptitude questions and answers');
  assert(iGfg.intent === 'OPEN_APTITUDE_RESOURCE', 'Classifies GeeksforGeeks query as OPEN_APTITUDE_RESOURCE');
  assert(iGfg.parameters.resource === 'geeksforgeeks', 'Extracts resource as "geeksforgeeks"');

  const actGfg = resolveAction('OPEN_APTITUDE_RESOURCE', { resource: 'geeksforgeeks' });
  assert(actGfg.params.url === 'https://www.geeksforgeeks.org/aptitude/aptitude-questions-and-answers/', 'Action returns GeeksforGeeks Aptitude URL');

  const chatGfgRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open GeeksforGeeks aptitude',
    mode: 'study'
  });

  assert(chatGfgRes.status === 200, 'POST /api/jarvis/chat for GeeksforGeeks returned 200');
  assert(chatGfgRes.body.action.params.url === 'https://www.geeksforgeeks.org/aptitude/aptitude-questions-and-answers/', 'Live action returns GeeksforGeeks URL');

  // Test Knowledge Gate & Video Playlist queries
  const iKgPyq = classifyIntent('JARVIS open Knowledge Gate PYQ questions');
  assert(iKgPyq.intent === 'OPEN_GATE_OFFICIAL', 'Classifies Knowledge Gate PYQ query');
  assert(iKgPyq.parameters.target === 'knowledgegate_pyq', 'Target is knowledgegate_pyq');

  const actKgPyq = resolveAction('OPEN_GATE_OFFICIAL', { target: 'knowledgegate_pyq' });
  assert(actKgPyq.params.url === 'https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/pyq-questions?q=68ecac7295474565f43ef40d', 'Returns Knowledge Gate PYQ URL');

  const iKgPractice = classifyIntent('JARVIS open Knowledge Gate practice questions');
  assert(iKgPractice.parameters.target === 'knowledgegate_practice', 'Target is knowledgegate_practice');

  const actKgPractice = resolveAction('OPEN_GATE_OFFICIAL', { target: 'knowledgegate_practice' });
  assert(actKgPractice.params.url === 'https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/practice-questions?q=6a1d2962cc6fe47e57ce7427', 'Returns Knowledge Gate Practice URL');

  const iGateVideos = classifyIntent('JARVIS open GATE preparation video playlist');
  assert(iGateVideos.parameters.target === 'gate_videos', 'Target is gate_videos');

  const actGateVideos = resolveAction('OPEN_GATE_OFFICIAL', { target: 'gate_videos' });
  assert(actGateVideos.params.url === 'https://youtube.com/playlist?list=PLmXKhU9FNesTaKDC-MKWt-rFuB8OwqrCY&si=z2TEtNMoBzPKHuls', 'Returns YouTube Video Playlist URL');

  const chatVideoRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open GATE preparation videos',
    mode: 'study'
  });

  assert(chatVideoRes.status === 200, 'POST /api/jarvis/chat for GATE videos returned 200');
  assert(chatVideoRes.body.action.params.url === 'https://youtube.com/playlist?list=PLmXKhU9FNesTaKDC-MKWt-rFuB8OwqrCY&si=z2TEtNMoBzPKHuls', 'Live action returns YouTube playlist URL');

  // Test SWE Roadmap queries
  const iSwe = classifyIntent('JARVIS show software engineer roadmap');
  assert(iSwe.intent === 'OPEN_SWE_ROADMAP', 'Classifies SWE Roadmap query as OPEN_SWE_ROADMAP');

  const actSwe = resolveAction('OPEN_SWE_ROADMAP');
  assert(actSwe.type === 'open_swe_roadmap', 'Action type is open_swe_roadmap');
  assert(actSwe.params.tab === 'swe', 'Action target tab is swe');

  const chatSweRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open SWE roadmap',
    mode: 'study'
  });

  assert(chatSweRes.status === 200, 'POST /api/jarvis/chat for SWE Roadmap returned 200');
  assert(chatSweRes.body.action.type === 'open_swe_roadmap', 'Live action returns open_swe_roadmap');

  // Test Placement Roadmap queries
  const iPlacement = classifyIntent('JARVIS show placement preparation roadmap');
  assert(iPlacement.intent === 'OPEN_PLACEMENT_ROADMAP', 'Classifies Placement Roadmap query');

  const actPlacement = resolveAction('OPEN_PLACEMENT_ROADMAP');
  assert(actPlacement.type === 'open_placement_roadmap', 'Action type is open_placement_roadmap');
  assert(actPlacement.params.tab === 'placement', 'Target tab is placement');

  const chatPlacementRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open placement roadmap',
    mode: 'study'
  });

  assert(chatPlacementRes.status === 200, 'POST /api/jarvis/chat for Placement Roadmap returned 200');
  assert(chatPlacementRes.body.action.type === 'open_placement_roadmap', 'Live action returns open_placement_roadmap');

  // Test Internship Roadmap queries
  const iInternship = classifyIntent('JARVIS show internship preparation roadmap');
  assert(iInternship.intent === 'OPEN_INTERNSHIP_ROADMAP', 'Classifies Internship Roadmap query');

  const actInternship = resolveAction('OPEN_INTERNSHIP_ROADMAP');
  assert(actInternship.type === 'open_internship_roadmap', 'Action type is open_internship_roadmap');
  assert(actInternship.params.tab === 'intern', 'Target tab is intern');

  const chatInternshipRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/jarvis/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'JARVIS open internship roadmap',
    mode: 'study'
  });

  assert(chatInternshipRes.status === 200, 'POST /api/jarvis/chat for Internship Roadmap returned 200');
  assert(chatInternshipRes.body.action.type === 'open_internship_roadmap', 'Live action returns open_internship_roadmap');

  // ── 4. Codebase Cleanup & Resource Links Verification ──
  console.log('\n4. Testing Codebase Cleanliness & External Resource Links...');
  const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  assert(!appJs.includes('http://localhost:3000'), 'app.js has zero occurrences of http://localhost:3000');
  assert(appJs.includes('API_BASE_URL'), 'app.js defines and uses API_BASE_URL');
  assert(appJs.includes('https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud'), 'app.js contains Google Drive question papers link');
  assert(appJs.includes('https://www.indiabix.com/aptitude/questions-and-answers/'), 'app.js contains IndiaBIX Aptitude link');
  assert(appJs.includes('https://www.geeksforgeeks.org/aptitude/aptitude-questions-and-answers/'), 'app.js contains GeeksforGeeks Aptitude link');
  assert(appJs.includes('https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/pyq-questions?q=68ecac7295474565f43ef40d'), 'app.js contains Knowledge Gate PYQ link');
  assert(appJs.includes('https://www.knowledgegate.ai/learn/GATE-GUIDANCE-BY-SANCHIT-SIR/practice-questions?q=6a1d2962cc6fe47e57ce7427'), 'app.js contains Knowledge Gate Practice link');
  assert(appJs.includes('https://youtube.com/playlist?list=PLmXKhU9FNesTaKDC-MKWt-rFuB8OwqrCY&si=z2TEtNMoBzPKHuls'), 'app.js contains YouTube GATE playlist link');
  assert(appJs.includes('SWE_ROADMAP_STEPS'), 'app.js defines SWE_ROADMAP_STEPS');
  assert(appJs.includes('Mindset & Preparation'), 'app.js contains Step 1: Mindset & Preparation');
  assert(appJs.includes('Get Hired / Grow Further'), 'app.js contains Step 12: Get Hired / Grow Further');
  assert(appJs.includes('Consistency beats talent when talent doesn\'t work hard.'), 'app.js contains Remember quote');

  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert(indexHtml.includes('https://drive.google.com/drive/folders/1xUn7rGTzKlfvJDoo4SzCRi8jRlBD63ud'), 'index.html contains Google Drive question papers link');
  assert(indexHtml.includes('swe-roadmap-modal'), 'index.html contains swe-roadmap-modal');
  assert(indexHtml.includes('gate-roadmap-modal'), 'index.html contains gate-roadmap-modal');
  assert(indexHtml.includes('placement-roadmap-modal'), 'index.html contains placement-roadmap-modal');
  assert(indexHtml.includes('internship-roadmap-modal'), 'index.html contains internship-roadmap-modal');

  // GATE 2027 CS Roadmap Verifications
  assert(appJs.includes('GATE_2027_PHASES'), 'app.js defines GATE_2027_PHASES');
  assert(appJs.includes('Concept Completion'), 'app.js includes Phase 1: Concept Completion (Sept 2026)');
  assert(appJs.includes('GATE_2027_SUBJECTS'), 'app.js defines GATE_2027_SUBJECTS');
  assert(appJs.includes('Discrete Mathematics'), 'app.js contains Discrete Mathematics');
  assert(appJs.includes('Cryptography & Network Security'), 'app.js contains Cryptography & Network Security');
  assert(appJs.includes('GATE_2027_MONTHLY_PLAN'), 'app.js defines GATE_2027_MONTHLY_PLAN');
  assert(appJs.includes('Discipline today, a better tomorrow.'), 'app.js contains IIT Madras roadmap motto');
  assert(appJs.includes('Same You, But Stronger for GATE 2027.'), 'app.js contains GATE 2027 closing quote');

  // Placement Roadmap Verifications
  assert(appJs.includes('PLACEMENT_ROADMAP_PHASES'), 'app.js defines PLACEMENT_ROADMAP_PHASES');
  assert(appJs.includes('PLACEMENT_ROADMAP_AREAS'), 'app.js defines PLACEMENT_ROADMAP_AREAS');
  assert(appJs.includes('Opportunities don\'t happen, you create them.'), 'app.js contains Placement quote');
  assert(appJs.includes('Prepared Mind. Better Opportunities. Brighter Future.'), 'app.js contains Placement outcome');

  // Internship Roadmap Verifications
  assert(appJs.includes('INTERNSHIP_ROADMAP_PHASES'), 'app.js defines INTERNSHIP_ROADMAP_PHASES');
  assert(appJs.includes('INTERNSHIP_ROADMAP_AREAS'), 'app.js defines INTERNSHIP_ROADMAP_AREAS');
  assert(appJs.includes('An internship today, a stronger tomorrow.'), 'app.js contains Internship quote');
  assert(appJs.includes('Today\'s preparation leads to tomorrow\'s opportunities.'), 'app.js contains Internship outcome');
  assert(appJs.includes('https://internshala.com'), 'app.js contains Internshala link');
  assert(appJs.includes('https://wellfound.com'), 'app.js contains Wellfound link');

  console.log('\n======================================================');
  console.log('✅ ALL ROADMAPS (SWE, GATE, PLACEMENT, INTERNSHIP) VERIFIED (100%)');
  console.log('======================================================\n');
}

runSuite().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
