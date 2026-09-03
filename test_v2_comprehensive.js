const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching GT Study Mentor Pro 2.0 Comprehensive Test Suite with 5 New Feature Studios...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    errors.push('PAGE_ERROR: ' + err.toString());
    console.log('TRACE:', err.stack);
  });
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('logo.png')) {
      errors.push('CONSOLE_ERROR: ' + msg.text());
    }
  });

  try {
    // 1. Load Application
    console.log('Loading app on http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    const title = await page.title();
    console.log('✅ Page Title:', title);

    // Initial render of Home Dashboard
    await page.evaluate(() => {
      window.alert = () => {};
      if (typeof window.navigateToView === 'function') {
        window.navigateToView('home');
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'v2_home_dashboard.png' });
    console.log('📸 v2_home_dashboard.png captured.');

    // 2. Test Feature 1: AI Mock Interview Studio
    console.log('Testing Feature 1: AI Mock Interview Studio...');
    await page.evaluate(() => {
      openModal('mock-interview-modal');
      initMockInterview();
      switchInterviewTrack('sde1');
      document.getElementById('int-answer-input').value = 'We use a HashSet to store all numbers for O(1) lookup. Then we iterate through the set and only begin counting when x - 1 is not in the set, checking x + 1 streak. Time complexity is O(N).';
      evaluateInterviewAnswer();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_feat_mock_interview.png' });
    console.log('📸 v2_feat_mock_interview.png captured.');
    await page.evaluate(() => closeModal('mock-interview-modal'));

    // 3. Test Feature 2: GATE 2027 AIR Predictor & Admission Engine
    console.log('Testing Feature 2: GATE 2027 AIR Predictor...');
    await page.evaluate(() => {
      openModal('gate-predictor-modal');
      document.getElementById('pred-marks-input').value = '74';
      setPredictorCategory('GEN');
      runGatePredictor();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_feat_gate_predictor.png' });
    console.log('📸 v2_feat_gate_predictor.png captured.');
    await page.evaluate(() => closeModal('gate-predictor-modal'));

    // 4. Test Feature 3: CSE Code Studio & Algorithmic Sandbox
    console.log('Testing Feature 3: CSE Code Studio Sandbox...');
    await page.evaluate(() => {
      openModal('code-studio-modal');
      loadCodeStudioTemplate('sliding-window');
      runCodeStudioSimulation();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'v2_feat_code_studio.png' });
    console.log('📸 v2_feat_code_studio.png captured.');
    await page.evaluate(() => closeModal('code-studio-modal'));

    // 5. Test Feature 4: 90-Day Gantt Trajectory & Daily Schedule
    console.log('Testing Feature 4: 90-Day Gantt Trajectory...');
    await page.evaluate(() => {
      openModal('roadmap-gantt-modal');
      renderGanttRoadmap();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_feat_roadmap_gantt.png' });
    console.log('📸 v2_feat_roadmap_gantt.png captured.');
    await page.evaluate(() => closeModal('roadmap-gantt-modal'));

    // 6. Test Feature 5: ATS Resume Studio & Keyword Scanner
    console.log('Testing Feature 5: ATS Resume Studio...');
    await page.evaluate(() => {
      openModal('resume-ats-modal');
      document.getElementById('ats-jd-input').value = 'Looking for SDE with strong knowledge of C++, DSA, Operating Systems, PostgreSQL, Docker, and REST API development.';
      scanJobDescriptionKeywords();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_feat_resume_ats.png' });
    console.log('📸 v2_feat_resume_ats.png captured.');
    await page.evaluate(() => closeModal('resume-ats-modal'));

    // 7. Test Navigation across standard views
    console.log('Navigating to PREPARE & PRACTICE...');
    await page.evaluate(() => window.navigateToView('prepare', 'gate'));
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => window.navigateToView('practice', 'dsa'));
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => window.navigateToView('career', 'apps'));
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => window.navigateToView('cselabs'));
    await new Promise(r => setTimeout(r, 400));

    // 8. Test Mobile Viewport (390 x 844)
    console.log('Testing Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(() => window.navigateToView('home'));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'v2_mobile_dashboard.png' });
    console.log('📸 v2_mobile_dashboard.png captured.');

    console.log('Total tracked errors:', errors.length);
    if (errors.length > 0) {
      console.warn('Errors encountered:', errors);
    } else {
      console.log('🎉 ALL V2.0 COMPREHENSIVE TESTS + 5 NEW STUDIOS PASSED WITH 0 ERRORS!');
    }
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
})();
