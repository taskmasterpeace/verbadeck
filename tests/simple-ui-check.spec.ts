import { test, expect } from '@playwright/test';

test('simple UI check - does app load?', async ({ page }) => {
  console.log('🔍 Navigating to app...');
  await page.goto('http://localhost:5175');

  console.log('⏳ Waiting 5 seconds for app to load...');
  await page.waitForTimeout(5000);

  // Take screenshot to see what's there
  await page.screenshot({ path: 'tests/screenshots/simple-app-loaded.png', fullPage: true });
  console.log('📸 Screenshot saved');

  // Get page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);

  // Get all text content to see what's on the page
  const bodyText = await page.locator('body').textContent();
  console.log(`📝 Body contains: ${bodyText?.substring(0, 200)}...`);

  // Try to find any button
  const buttons = await page.locator('button').count();
  console.log(`🔘 Found ${buttons} buttons on the page`);

  // List first 10 buttons
  for (let i = 0; i < Math.min(buttons, 10); i++) {
    const buttonText = await page.locator('button').nth(i).textContent();
    console.log(`  Button ${i + 1}: "${buttonText?.trim()}"`);
  }

  // Check console for errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`❌ Console error: ${msg.text()}`);
    }
  });

  console.log('✅ Simple check complete');
});
