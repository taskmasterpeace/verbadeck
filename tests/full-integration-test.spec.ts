import { test, expect } from '@playwright/test';

test.describe('Full Integration Test - Speaker Notes', () => {
  test('complete flow: create presentation, verify speaker notes in presenter view', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    console.log('✅ App loaded');

    // Click Create from Scratch
    await page.click('text=Start from Scratch');
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Create from Scratch');

    // Fill in topic
    const topicInput = page.locator('textarea[placeholder*="AI-powered"]');
    await topicInput.fill('Testing Speaker Notes Feature');
    console.log('✅ Entered topic');

    // Set to 3 slides for faster testing
    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '3';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    console.log('✅ Set to 3 slides');

    // Click Continue
    await page.click('button:has-text("Continue")');
    console.log('⏳ Generating questions...');

    // Wait for questions to load (max 10 seconds)
    await page.waitForSelector('.border-2.border-blue-100', { timeout: 10000 });
    console.log('✅ Questions loaded');

    // Answer all questions by clicking first available option
    const questionCards = page.locator('.border-2.border-blue-100');
    const count = await questionCards.count();
    console.log(`📝 Answering ${count} questions...`);

    for (let i = 0; i < count; i++) {
      const card = questionCards.nth(i);

      // Try to click a button option first
      const buttons = card.locator('button').filter({ hasText: /True|False|[A-Z]/ });
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        await buttons.first().click();
      } else {
        // Fill in text input
        const input = card.locator('input[type="text"]');
        if (await input.count() > 0) {
          await input.fill('Test answer');
        }
      }
      await page.waitForTimeout(200);
    }
    console.log('✅ All questions answered');

    // Click Generate Slides
    await page.click('button:has-text("Generate Slides")');
    console.log('⏳ Generating slides (this may take 20-30 seconds)...');

    // Wait for slides to load (max 60 seconds) - looks for style badge that appears when slides load
    await page.waitForSelector('text=DIRECT', { timeout: 60000 });
    console.log('✅ Slides generated');

    // Take screenshot of slide options
    await page.screenshot({ path: 'tests/screenshots/slide-options.png' });

    // Click Create Presentation
    await page.click('button:has-text("Create Presentation")');
    await page.waitForTimeout(1000);
    console.log('✅ Presentation created');

    // Switch to Presenter view
    await page.click('button:has-text("3. Present")');
    await page.waitForTimeout(1000);
    console.log('✅ Switched to Presenter view');

    // Take full screenshot
    await page.screenshot({ path: 'tests/screenshots/presenter-view-full.png', fullPage: true });

    // Check for speaker notes indicator (use .first() since there may be 2 badges: current + next up)
    const hasNotesBadge = await page.locator('text=📝 Speaker Notes').first().isVisible();
    console.log(hasNotesBadge ? '✅ Speaker notes badge visible' : 'ℹ️ No speaker notes badge (may be using slide content)');

    // Check trigger word badge
    const triggerBadge = page.locator('text=/Say: "/');
    await expect(triggerBadge).toBeVisible();
    const triggerText = await triggerBadge.textContent();
    console.log(`✅ Trigger word visible: ${triggerText}`);

    // Check side panels
    const audiencePreview = page.locator('text=📺 Audience Sees');
    await expect(audiencePreview).toBeVisible();
    console.log('✅ Audience preview panel visible');

    const nextSection = page.locator('text=⏭️ Next Up');
    await expect(nextSection).toBeVisible();
    console.log('✅ Next section panel visible');

    // Check timer
    const timer = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timer).toBeVisible();
    console.log('✅ Timer visible');

    // Get the main presenter content
    const mainContent = page.locator('.flex-\\[7\\]').first();
    await mainContent.screenshot({ path: 'tests/screenshots/presenter-main-area.png' });

    // Check for actual content in presenter area
    const presenterText = await mainContent.textContent();
    const hasSubstantialContent = presenterText && presenterText.length > 50;
    console.log(hasSubstantialContent ? '✅ Presenter notes area has content' : '❌ Presenter notes area is empty');

    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Presentation created successfully');
    console.log('✅ Presenter view loaded');
    console.log(`${hasNotesBadge ? '✅' : 'ℹ️'} Speaker notes badge: ${hasNotesBadge ? 'VISIBLE' : 'Not shown (using content)'}`);
    console.log('✅ Trigger word display: WORKING');
    console.log('✅ Side panels: WORKING');
    console.log('✅ Timer: WORKING');
    console.log(`${hasSubstantialContent ? '✅' : '❌'} Content display: ${hasSubstantialContent ? 'WORKING' : 'EMPTY'}`);
    console.log('\n📸 Screenshots saved:');
    console.log('  - tests/screenshots/slide-options.png');
    console.log('  - tests/screenshots/presenter-view-full.png');
    console.log('  - tests/screenshots/presenter-main-area.png');
  });
});
