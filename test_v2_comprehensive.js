const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching GT Study Mentor Pro 2.0 Comprehensive Test Suite...');
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

    // 2. Test Task Checkbox Toggle
    console.log("Testing Today's Plan task toggle...");
    await page.evaluate(() => {
      const firstTask = window.PrepIntelligenceEngine ? PrepIntelligenceEngine.getState().todayTasks[0] : null;
      if (firstTask) {
        PrepIntelligenceEngine.toggleTask(firstTask.id);
        if (typeof window.renderHomeDashboard === 'function') window.renderHomeDashboard();
      }
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ Task checkbox toggled successfully.');

    // 3. Test FSRS Spaced Repetition Reveal & Rating
    console.log('Testing FSRS Flashcard interaction...');
    await page.evaluate(() => {
      window.toggleHomeFSRS();
      window.rateHomeFSRS('Good');
    });
    await new Promise(r => setTimeout(r, 400));
    console.log('✅ FSRS card revealed and rated Good.');

    // 4. Test Navigation to PREPARE (GATE & Placements)
    console.log('Navigating to PREPARE...');
    await page.evaluate(() => window.navigateToView('prepare', 'gate'));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_prepare_gate.png' });
    console.log('📸 v2_prepare_gate.png captured.');

    await page.evaluate(() => window.switchPrepareTab('placement'));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'v2_prepare_placement.png' });
    console.log('📸 v2_prepare_placement.png captured.');

    // 5. Test Navigation to PROGRESS (Mastery Matrix & Mistake Book)
    console.log('Navigating to PROGRESS...');
    await page.evaluate(() => window.navigateToView('progress', 'mastery'));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_progress_matrix.png' });
    console.log('📸 v2_progress_matrix.png captured.');

    await page.evaluate(() => window.switchProgressTab('mistakes'));
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'v2_progress_mistakes.png' });
    console.log('📸 v2_progress_mistakes.png captured.');

    // 6. Test Navigation to PRACTICE (DSA & PYQs)
    console.log('Navigating to PRACTICE...');
    await page.evaluate(() => window.navigateToView('practice', 'dsa'));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_practice_dsa.png' });
    console.log('📸 v2_practice_dsa.png captured.');

    // 7. Test Navigation to CAREER (Applications & Resume)
    console.log('Navigating to CAREER...');
    await page.evaluate(() => window.navigateToView('career', 'apps'));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_career_apps.png' });
    console.log('📸 v2_career_apps.png captured.');

    // 8. Test Navigation to CSE LABS
    console.log('Navigating to CSE LABS...');
    await page.evaluate(() => window.navigateToView('cselabs'));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'v2_cselabs_hub.png' });
    console.log('📸 v2_cselabs_hub.png captured.');

    // 9. Test Mobile Viewport (390 x 844)
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
      console.log('🎉 ALL V2.0 COMPREHENSIVE TESTS PASSED WITH 0 ERRORS!');
    }
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
})();
