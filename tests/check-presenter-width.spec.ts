import { test } from '@playwright/test';

test('Check presenter view actual width', async ({ page }) => {
  await page.goto('http://localhost:5175');
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Wait for page load
  await page.waitForTimeout(2000);

  // Take screenshot of home page
  await page.screenshot({ path: '.playwright-mcp/home-page.png', fullPage: false });

  console.log('✅ Screenshot saved');
  console.log('Viewport: 1920x1080');
  console.log('Check .playwright-mcp/home-page.png to see current state');
});
