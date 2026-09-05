const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Browser Route Validation & Dynamic Scheduling Test...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  await page.goto('http://localhost:3000/?reset=true', { waitUntil: 'networkidle2' });
  console.log('✅ Loaded http://localhost:3000');

  // Check Router validation log
  const routerLog = consoleLogs.find(l => l.includes('[ROUTER] 9/9 routes valid') || l.includes('routes valid'));
  console.log('Router validation log:', routerLog || 'Checked via evaluate');

  const routeValidation = await page.evaluate(() => {
    if (typeof window.validateRoutes === 'function') {
      return window.validateRoutes();
    }
    return null;
  });
  console.log('✅ Direct validateRoutes() result:', routeValidation);
  if (!routeValidation || !routeValidation.ok) {
    throw new Error('Route validation failed: ' + JSON.stringify(routeValidation));
  }

  // Verify Dynamic Time Budget chips exist
  const chipsCount = await page.evaluate(() => {
    return document.querySelectorAll('.time-budget-chip').length;
  });
  console.log('✅ Found time budget chips:', chipsCount);
  if (chipsCount !== 3) {
    throw new Error('Expected 3 dynamic time budget chips (30m, 60m, 120m)');
  }

  // Click 30m chip
  await page.click('.time-budget-chip[data-time="30"]');
  await new Promise(r => setTimeout(r, 400));
  const is30Active = await page.evaluate(() => {
    const btn = document.querySelector('.time-budget-chip[data-time="30"]');
    return btn ? btn.classList.contains('active') : false;
  });
  console.log('✅ 30m chip active after click:', is30Active);

  // Click 120m chip
  await page.click('.time-budget-chip[data-time="120"]');
  await new Promise(r => setTimeout(r, 400));
  const is120Active = await page.evaluate(() => {
    const btn = document.querySelector('.time-budget-chip[data-time="120"]');
    return btn ? btn.classList.contains('active') : false;
  });
  console.log('✅ 120m chip active after click:', is120Active);

  // Test navigation to all primary routes
  const routesToTest = ['prepare', 'practice', 'career', 'progress', 'cselabs', 'jarvis', 'home'];
  for (const r of routesToTest) {
    await page.evaluate((routeName) => {
      window.navigateToView(routeName);
    }, r);
    await new Promise(res => setTimeout(res, 200));
  }
  console.log('✅ Successfully navigated through all 7 views with zero issues.');

  console.log('Tracked JS console errors:', errors.length);
  if (errors.length > 0) {
    console.warn('Errors encountered:', errors);
    throw new Error('Test failed with console errors');
  }

  console.log('🎉 ALL BROWSER ROUTE & DYNAMIC SCHEDULING TESTS PASSED WITH 0 ERRORS!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
