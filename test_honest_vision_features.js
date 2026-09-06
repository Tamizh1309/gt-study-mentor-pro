const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching Honest Vision Signature Features Test Suite...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  [Browser Console Error]:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('  [Page Error]:', err.message);
    errors.push(err.message);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // 1. Check Career Sync Matrix on Home
    console.log('Testing Feature 1: Career Sync Matrix on Home...');
    const careerSyncCards = await page.$$('#career-sync-grid-home .career-sync-card');
    console.log(`  Found ${careerSyncCards.length} career sync cards.`);
    if (careerSyncCards.length < 4) {
      throw new Error(`Expected at least 4 Career Sync cards, found ${careerSyncCards.length}`);
    }
    await page.screenshot({ path: 'test_career_sync.png' });

    // 2. Test JARVIS Daily Intelligence Briefing Modal
    console.log('Testing Feature 2: JARVIS Daily Intelligence Briefing Modal...');
    await page.evaluate(() => window.openJarvisBriefingModal());
    await new Promise(r => setTimeout(r, 600));

    const briefingModalVisible = await page.$eval('#jarvis-briefing-modal', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none';
    });
    console.log(`  JARVIS Briefing modal visible: ${briefingModalVisible}`);
    if (!briefingModalVisible) throw new Error('JARVIS Briefing modal failed to open');

    const briefingStats = await page.evaluate(() => {
      return {
        revisions: document.getElementById('briefing-stat-revisions')?.textContent,
        gaps: document.getElementById('briefing-stat-gaps')?.textContent,
        tasks: document.getElementById('briefing-stat-tasks')?.textContent,
        topic: document.getElementById('briefing-priority-topic')?.textContent
      };
    });
    console.log('  Briefing Stats audited:', briefingStats);
    await page.screenshot({ path: 'test_briefing_modal.png' });

    // Close briefing modal
    await page.evaluate(() => window.closeModal('jarvis-briefing-modal'));
    await new Promise(r => setTimeout(r, 400));

    // 3. Test 90-Day 3-Phase Milestone Modal
    console.log('Testing Feature 3: 90-Day 3-Phase Milestone System...');
    await page.evaluate(() => window.openPhaseMilestoneModal());
    await new Promise(r => setTimeout(r, 600));

    const phaseModalVisible = await page.$eval('#phase-milestone-modal', el => {
      return window.getComputedStyle(el).display !== 'none';
    });
    console.log(`  Phase Milestone modal visible: ${phaseModalVisible}`);
    if (!phaseModalVisible) throw new Error('Phase Milestone modal failed to open');

    const phaseCardCount = await page.$$('#phase-cards-container .phase-card');
    console.log(`  Rendered ${phaseCardCount.length} operational phases (Foundation, Depth, Peak).`);
    if (phaseCardCount.length !== 3) throw new Error(`Expected 3 phases, found ${phaseCardCount.length}`);
    await page.screenshot({ path: 'test_phase_modal.png' });

    await page.evaluate(() => window.closeModal('phase-milestone-modal'));
    await new Promise(r => setTimeout(r, 400));

    // 4. Test Adaptive Practice Rationale HUD in Practice View
    console.log('Testing Feature 4: Adaptive Practice Rationale HUD...');
    await page.evaluate(() => window.navigateToView('practice', 'dsa'));
    await new Promise(r => setTimeout(r, 800));

    const hudVisible = await page.$eval('#adaptive-practice-hud', el => {
      return el.innerHTML.includes('JARVIS Selected This Question For You');
    });
    console.log(`  Adaptive Practice HUD active with rationale: ${hudVisible}`);
    if (!hudVisible) throw new Error('Adaptive Practice HUD failed to render');
    await page.screenshot({ path: 'test_adaptive_hud.png' });

    // 5. Test Starting Adaptive Question Modal & Interactive Evaluation
    console.log('Testing Feature 5: Starting Adaptive Question & Submitting Option...');
    await page.evaluate(() => window.startAdaptiveQuestion('dsa'));
    await new Promise(r => setTimeout(r, 600));

    const qModalVisible = await page.$eval('#adaptive-question-modal', el => {
      return window.getComputedStyle(el).display !== 'none';
    });
    console.log(`  Adaptive Question modal visible: ${qModalVisible}`);
    if (!qModalVisible) throw new Error('Adaptive Question modal failed to open');

    // Click option A
    const options = await page.$$('#adaptive-options-list .quiz-option-btn');
    console.log(`  Found ${options.length} options. Clicking option 0 (Correct)...`);
    await options[0].click();
    await new Promise(r => setTimeout(r, 600));

    const feedbackText = await page.$eval('#adaptive-feedback-box', el => el.textContent);
    console.log(`  Evaluation Feedback: ${feedbackText.slice(0, 50)}...`);
    if (!feedbackText.includes('Correct')) {
      throw new Error('Expected feedback to indicate correct answer');
    }
    await page.screenshot({ path: 'test_adaptive_question_evaluated.png' });

    console.log('\n🎉 ALL 5 HONEST VISION SIGNATURE FEATURES VALIDATED SUCCESSFULLY!');
    console.log('Total tracking errors:', errors.length);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
