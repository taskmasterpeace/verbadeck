import { test, expect } from '@playwright/test';

test.describe('TalkAdvantage Pro Slide Screenshots', () => {
  test('capture screenshots of dense slides 7-12', async ({ page }) => {
    // Navigate and load TalkAdvantage Pro
    await page.goto('http://localhost:5177/library');
    await page.waitForSelector('text=Sample Presentations', { timeout: 10000 });

    const talkAdvantageButton = page.locator('button', { hasText: 'TalkAdvantage Pro' });
    await talkAdvantageButton.click();

    await page.waitForURL('**/presenter', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Get all slide number buttons
    const slideButtons = page.locator('button:has-text("1"), button:has-text("2"), button:has-text("3"), button:has-text("4"), button:has-text("5"), button:has-text("6"), button:has-text("7"), button:has-text("8"), button:has-text("9"), button:has-text("10"), button:has-text("11"), button:has-text("12"), button:has-text("13")');

    // Screenshot key slides
    const slidesToCapture = [1, 3, 7, 9, 10, 11, 12, 13];

    for (const slideNum of slidesToCapture) {
      // Click slide button (index is slideNum - 1)
      const buttons = await page.locator('.px-2.py-1.rounded').all();
      if (buttons[slideNum - 1]) {
        await buttons[slideNum - 1].click();
        await page.waitForTimeout(500); // Wait for content to load

        // Take screenshot of left panel (presenter notes)
        const presenterPanel = page.locator('.flex-\\[7\\]').first();
        await presenterPanel.screenshot({
          path: `tests/screenshots/talkadvantage-slide-${slideNum}.png`,
        });

        console.log(`✅ Captured slide ${slideNum}`);
      }
    }

    // Also take full-page screenshots of the densest slides
    for (const slideNum of [9, 12]) {
      const buttons = await page.locator('.px-2.py-1.rounded').all();
      if (buttons[slideNum - 1]) {
        await buttons[slideNum - 1].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `tests/screenshots/talkadvantage-slide-${slideNum}-fullpage.png`,
          fullPage: true,
        });

        console.log(`✅ Captured full-page slide ${slideNum}`);
      }
    }
  });
});
