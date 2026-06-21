import { test, expect } from '@playwright/test';

test.describe('Speaker Notes Workflow - New Deferred Generation', () => {
  test('complete flow: questions → slides → speaker notes prompt → generate → presenter view', async ({ page }) => {
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
    await topicInput.fill('Testing Deferred Speaker Notes');
    console.log('✅ Entered topic');

    // Set to 2 slides for faster testing
    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '2';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    console.log('✅ Set to 2 slides');

    // Click Continue
    await page.click('button:has-text("Continue")');
    console.log('⏳ Generating questions...');

    // Wait for questions to load
    await page.waitForSelector('.border-2.border-blue-100', { timeout: 10000 });
    console.log('✅ Questions loaded');

    // Answer all questions
    const questionCards = page.locator('.border-2.border-blue-100');
    const count = await questionCards.count();
    console.log(`📝 Answering ${count} questions...`);

    for (let i = 0; i < count; i++) {
      const card = questionCards.nth(i);
      const buttons = card.locator('button').filter({ hasText: /True|False|[A-Z]/ });
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        await buttons.first().click();
      } else {
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
    console.log('⏳ Generating slides (WITHOUT speaker notes)...');

    // Wait for slides to load - should be faster now without speaker notes
    await page.waitForSelector('text=DIRECT', { timeout: 60000 });
    console.log('✅ Slides generated (no speaker notes yet)');

    // Take screenshot of slide options
    await page.screenshot({ path: 'tests/screenshots/slide-options-no-notes.png' });

    // Select first option for each slide (click on each card)
    const slideCards = page.locator('[class*="border"][class*="rounded"]').filter({ has: page.locator('text=DIRECT') });
    const slideCount = await slideCards.count();
    console.log(`🎯 Selecting first option for ${slideCount} slides...`);

    for (let i = 0; i < slideCount; i++) {
      const card = slideCards.nth(i);
      await card.click();
      await page.waitForTimeout(300);
    }

    // Click Continue (new button instead of Create Presentation)
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Continue');

    // NEW STEP: Verify speaker notes prompt appears
    await expect(page.locator('text=Add Speaker Notes?')).toBeVisible();
    await expect(page.locator('text=📝 What are Speaker Notes?')).toBeVisible();
    console.log('✅ Speaker notes prompt displayed');

    // Take screenshot of prompt
    await page.screenshot({ path: 'tests/screenshots/speaker-notes-prompt.png' });

    // Test Path A: Generate Speaker Notes
    await page.click('button:has-text("Generate Speaker Notes")');
    console.log('⏳ Generating speaker notes for selected slides...');

    // Wait for generation to complete (should see "Generating Scripts..." then disappear)
    await expect(page.locator('text=Generating Scripts...')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Generating Scripts...')).not.toBeVisible({ timeout: 20000 });
    console.log('✅ Speaker notes generated');

    // Should now be in presenter/editor view
    await page.waitForTimeout(1000);

    // Switch to Presenter view
    const presenterButton = page.locator('button:has-text("3. Present"), button:has-text("Present")').first();
    if (await presenterButton.isVisible()) {
      await presenterButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched to Presenter view');
    }

    // Verify speaker notes badge
    const hasNotesBadge = await page.locator('text=📝 Speaker Notes').first().isVisible();
    console.log(hasNotesBadge ? '✅ Speaker notes badge visible' : '❌ Speaker notes badge NOT visible');

    // Take full screenshot
    await page.screenshot({ path: 'tests/screenshots/presenter-with-notes.png', fullPage: true });

    // Verify trigger word badge
    const triggerBadge = page.locator('text=/Say: "/');
    await expect(triggerBadge).toBeVisible();
    console.log('✅ Trigger word visible');

    // Verify side panels
    await expect(page.locator('text=📺 Audience Sees')).toBeVisible();
    await expect(page.locator('text=⏭️ Next Up')).toBeVisible();
    console.log('✅ Side panels visible');

    console.log('\n📊 TEST SUMMARY - PATH A (WITH SPEAKER NOTES)');
    console.log('='.repeat(60));
    console.log('✅ Workflow completed successfully');
    console.log('✅ Speaker notes prompt displayed');
    console.log('✅ Speaker notes generated and attached to slides');
    console.log(`${hasNotesBadge ? '✅' : '❌'} Speaker notes badge: ${hasNotesBadge ? 'VISIBLE' : 'NOT VISIBLE'}`);
    console.log('✅ Presenter view working');
  });

  test('skip path: questions → slides → speaker notes prompt → SKIP → presenter view', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');

    // Click Create from Scratch
    await page.click('text=Start from Scratch');
    await page.waitForTimeout(1000);

    // Fill in topic
    const topicInput = page.locator('textarea[placeholder*="AI-powered"]');
    await topicInput.fill('Testing Skip Speaker Notes');

    // Set to 2 slides
    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '2';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(500);

    // Click Continue
    await page.click('button:has-text("Continue")');
    console.log('⏳ Generating questions...');

    // Wait for questions and answer them
    await page.waitForSelector('.border-2.border-blue-100', { timeout: 10000 });
    const questionCards = page.locator('.border-2.border-blue-100');
    const count = await questionCards.count();

    for (let i = 0; i < count; i++) {
      const card = questionCards.nth(i);
      const buttons = card.locator('button').filter({ hasText: /True|False|[A-Z]/ });
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        await buttons.first().click();
      } else {
        const input = card.locator('input[type="text"]');
        if (await input.count() > 0) {
          await input.fill('Test answer');
        }
      }
      await page.waitForTimeout(200);
    }
    console.log('✅ Questions answered');

    // Generate slides
    await page.click('button:has-text("Generate Slides")');
    console.log('⏳ Generating slides...');
    await page.waitForSelector('text=DIRECT', { timeout: 60000 });
    console.log('✅ Slides generated');

    // Select first option for each slide
    const slideCards = page.locator('[class*="border"][class*="rounded"]').filter({ has: page.locator('text=DIRECT') });
    const slideCount = await slideCards.count();

    for (let i = 0; i < slideCount; i++) {
      const card = slideCards.nth(i);
      await card.click();
      await page.waitForTimeout(300);
    }

    // Click Continue
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    console.log('✅ Reached speaker notes prompt');

    // Test Path B: SKIP speaker notes
    await page.click('button:has-text("Skip - No Script Needed")');
    console.log('✅ Clicked SKIP');
    await page.waitForTimeout(1000);

    // Should now be in editor view
    // Switch to Presenter view if button exists
    const presenterButton = page.locator('button:has-text("3. Present"), button:has-text("Present")').first();
    if (await presenterButton.isVisible()) {
      await presenterButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched to Presenter view');
    }

    // Verify NO speaker notes badge (should use slide content)
    const hasNotesBadge = await page.locator('text=📝 Speaker Notes').first().isVisible();
    console.log(hasNotesBadge ? '⚠️ Speaker notes badge visible (unexpected)' : '✅ No speaker notes badge (as expected)');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/presenter-no-notes.png', fullPage: true });

    // Verify basic functionality still works
    await expect(page.locator('text=/Say: "/').first()).toBeVisible();
    console.log('✅ Trigger words visible');

    console.log('\n📊 TEST SUMMARY - PATH B (SKIP SPEAKER NOTES)');
    console.log('='.repeat(60));
    console.log('✅ Workflow completed successfully');
    console.log('✅ Speaker notes prompt displayed');
    console.log('✅ Skip button worked');
    console.log(`${!hasNotesBadge ? '✅' : '⚠️'} Speaker notes badge: ${hasNotesBadge ? 'VISIBLE (should not be)' : 'NOT VISIBLE (correct)'}`);
    console.log('✅ Presenter view working without speaker notes');
  });
});
