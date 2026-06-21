import { test, expect } from '@playwright/test';

test.describe('TalkAdvantage Pro Loading from Library', () => {
  test('should load all 13 slides and display in Presenter view', async ({ page }) => {
    // Capture all console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`Browser console: [${msg.type()}]`, msg.text());
    });

    // Clear localStorage to start fresh
    await page.goto('http://localhost:5177');
    await page.evaluate(() => localStorage.clear());

    // Navigate directly to Library page
    await page.goto('http://localhost:5177/library');

    // Wait for Library page to load
    await page.waitForSelector('text=Sample Presentations', { timeout: 10000 });

    // Click TalkAdvantage Pro button
    const talkAdvantageButton = page.locator('button', { hasText: 'TalkAdvantage Pro' });
    await talkAdvantageButton.click();

    // Should navigate to /presenter
    await page.waitForURL('**/presenter', { timeout: 10000 });

    // Wait for presenter view to render
    await page.waitForTimeout(2000);

    // Check that presenter view is NOT empty
    const noSectionsText = await page.locator('text=No sections loaded').count();
    expect(noSectionsText).toBe(0);

    // Check for slide content - should see "Section 1 of 13" (use first() to handle multiple matches)
    const sectionCounter = page.locator('text=Section 1 of 13').first();
    await expect(sectionCounter).toBeVisible();

    // Check for TalkAdvantage Pro specific heading
    const firstHeading = page.locator('h2.text-3xl');
    await expect(firstHeading).toBeVisible();

    console.log('\n============ ALL CONSOLE LOGS ============');
    consoleLogs.forEach(log => console.log(log));
    console.log('==========================================\n');
    console.log('✅ Test passed: TalkAdvantage Pro loaded all 13 slides successfully');
  });
});
