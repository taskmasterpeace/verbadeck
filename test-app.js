const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`BROWSER [${msg.type()}]:`, msg.text());
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });

  console.log('Opening http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });

  // Wait a bit to see what happens
  await page.waitForTimeout(3000);

  // Check if there's content
  const bodyText = await page.textContent('body');
  console.log('Body text length:', bodyText?.length || 0);

  // Take a screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved to debug-screenshot.png');

  // Keep browser open for manual inspection
  console.log('Browser will stay open. Press Ctrl+C to close.');
  await page.waitForTimeout(300000); // 5 minutes

  await browser.close();
})();
