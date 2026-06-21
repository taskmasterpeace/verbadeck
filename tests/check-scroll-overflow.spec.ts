import { test, expect } from '@playwright/test';

test.describe('Audience View - Scroll Overflow Check', () => {
  test('should not have scrolling on dense two-column slides', async ({ page, context }) => {
    // Navigate to app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Go to library
    const libraryButton = page.getByRole('button', { name: /library/i });
    await libraryButton.click();
    await page.waitForTimeout(500);

    // Load Adaptive Layout Showcase
    const showcaseCard = page.locator('text=Adaptive Layout Showcase').first();
    await showcaseCard.click();
    await page.waitForTimeout(1000);

    // Open audience view in new tab
    const audienceButton = page.getByRole('button', { name: /open audience view/i });
    const [audiencePage] = await Promise.all([
      context.waitForEvent('page'),
      audienceButton.click()
    ]);
    await audiencePage.waitForLoadState('networkidle');

    // Check slides 4, 5, and 6 for overflow
    const slidesToCheck = [
      { index: 3, name: 'Slide 4 (Dense Content - Two Column Layout)' },
      { index: 4, name: 'Slide 5 (Dense + Image)' },
      { index: 5, name: 'Slide 6 (Maximum Capacity Demo)' }
    ];

    for (const slide of slidesToCheck) {
      console.log(`\n=== Checking ${slide.name} ===`);

      // Navigate to slide on presenter view
      await page.keyboard.press('End'); // Go to last slide first
      await page.waitForTimeout(300);

      // Use arrow keys to get to specific slide
      await page.keyboard.press('Home'); // Go to first slide
      await page.waitForTimeout(300);

      for (let i = 0; i < slide.index; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
      }

      await page.waitForTimeout(1000);

      // Check overflow on audience page
      const scrollInfo = await audiencePage.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;

        return {
          bodyScrollHeight: body.scrollHeight,
          bodyClientHeight: body.clientHeight,
          htmlScrollHeight: html.scrollHeight,
          htmlClientHeight: html.clientHeight,
          windowInnerHeight: window.innerHeight,
          hasVerticalScrollbar: body.scrollHeight > body.clientHeight || html.scrollHeight > html.clientHeight,
          actualScrollTop: window.scrollY || document.documentElement.scrollTop
        };
      });

      console.log('Scroll Info:', scrollInfo);

      // Take screenshot
      await audiencePage.screenshot({
        path: `.playwright-mcp/scroll-check-slide-${slide.index + 1}.png`,
        fullPage: true
      });

      // Assert no scrollbar
      if (scrollInfo.hasVerticalScrollbar) {
        console.log(`❌ OVERFLOW DETECTED on ${slide.name}`);
        console.log(`   Body: ${scrollInfo.bodyScrollHeight}px content in ${scrollInfo.bodyClientHeight}px viewport`);
        console.log(`   Overflow: ${scrollInfo.bodyScrollHeight - scrollInfo.bodyClientHeight}px`);
      } else {
        console.log(`✅ No overflow on ${slide.name}`);
      }

      expect(scrollInfo.hasVerticalScrollbar, `${slide.name} should not have vertical scrollbar`).toBe(false);
    }

    await audiencePage.close();
  });
});
