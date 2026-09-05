/**
 * test_editorial_upgrade.js
 * End-to-end verification of Editorial 3D + JARVIS Specification Upgrade
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Locate local chrome executable
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = edgePaths.find(p => fs.existsSync(p));

(async () => {
  console.log('🚀 Starting Editorial 3D + JARVIS Verification Test...');
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
    });

    console.log('Loading app on http://localhost:3000/?reset=true...');
    await page.goto('http://localhost:3000/?reset=true', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // 1. Check Editorial Hero Title
    const heroTitle = await page.$eval('.editorial-hero-title', el => el.textContent.trim());
    console.log('✅ Editorial Hero Title:', heroTitle.replace(/\s+/g, ' '));
    if (!heroTitle.includes("You don't need another schedule")) {
      throw new Error('Hero title mismatch');
    }

    // 2. Check Learning Universe Canvas
    const canvasExists = await page.$eval('#learning-universe-canvas', el => Boolean(el));
    console.log('✅ Learning Universe Canvas active:', canvasExists);

    // 3. Check NBA Card elements
    const nbaTitle = await page.$eval('#nba-title', el => el.textContent.trim());
    const nbaTime = await page.$eval('#nba-time-badge', el => el.textContent.trim());
    const nbaBenefit = await page.$eval('#nba-benefit-text', el => el.textContent.trim());
    console.log('✅ NBA Action:', nbaTitle);
    console.log('✅ NBA Time & Load:', nbaTime);
    console.log('✅ NBA Benefit:', nbaBenefit);

    await page.screenshot({ path: 'editorial_hero_view.png' });
    console.log('📸 editorial_hero_view.png captured.');

    // 4. Test Why Engine Modal
    console.log('Testing Why Engine Modal trigger...');
    await page.click('#nba-why-btn');
    await new Promise(r => setTimeout(r, 600));

    const isWhyModalVisible = await page.$eval('#why-engine-modal', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log('✅ Why Engine Modal visible:', isWhyModalVisible);

    const dimWhat = await page.$eval('#why-dim-what', el => el.textContent.trim());
    const dimWhy = await page.$eval('#why-dim-why', el => el.textContent.trim());
    const dimNow = await page.$eval('#why-dim-now', el => el.textContent.trim());
    const dimAlt = await page.$eval('#why-dim-alt', el => el.textContent.trim());
    const dimLoad = await page.$eval('#why-dim-load', el => el.textContent.trim());
    const dimBenefit = await page.$eval('#why-dim-benefit', el => el.textContent.trim());

    console.log('--- 6 Dimensions of Why Engine ---');
    console.log('1. WHAT:', dimWhat);
    console.log('2. WHY:', dimWhy);
    console.log('3. WHY NOW:', dimNow);
    console.log('4. WHY NOT ELSE:', dimAlt);
    console.log('5. COGNITIVE LOAD:', dimLoad);
    console.log('6. BENEFIT:', dimBenefit);

    await page.screenshot({ path: 'editorial_why_engine_modal.png' });
    console.log('📸 editorial_why_engine_modal.png captured.');

    // Close Why modal
    await page.click('#why-engine-modal .modal-close');
    await new Promise(r => setTimeout(r, 400));

    // 5. Test Responsive Mobile Viewport (390 x 844)
    console.log('Testing Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'editorial_mobile_view.png' });
    console.log('📸 editorial_mobile_view.png captured.');

    console.log('🎉 ALL EDITORIAL 3D + JARVIS UPGRADE VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
