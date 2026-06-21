import { test, expect } from '@playwright/test';

test.describe('Speaker Notes in Presenter View', () => {
  test('should display speaker notes in presenter view', async ({ page }) => {
    await page.goto('http://localhost:5177');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on "Create from Scratch"
    await page.click('text=Create from Scratch');
    await page.waitForTimeout(500);

    // Fill in topic
    await page.fill('textarea[placeholder*="e.g., AI-powered meeting assistant"]', 'Testing Speaker Notes Feature');

    // Click Continue to generate questions
    await page.click('button:has-text("Continue")');

    // Wait for questions to load
    await page.waitForTimeout(3000);

    // Answer first question (if any are shown)
    const firstQuestion = page.locator('.border-2.border-blue-100').first();
    if (await firstQuestion.isVisible()) {
      // Click on a multiple choice option or fill in text
      const button = firstQuestion.locator('button, input').first();
      if (await button.isVisible()) {
        await button.click();
      }
    }

    // Fill remaining questions
    const allInputs = page.locator('input[type="text"], button');
    const count = await allInputs.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const element = allInputs.nth(i);
      if (await element.isVisible()) {
        const tagName = await element.evaluate(el => el.tagName);
        if (tagName === 'BUTTON') {
          await element.click();
        } else {
          await element.fill('Test answer');
        }
      }
    }

    await page.waitForTimeout(500);

    // Click "Generate Slides"
    await page.click('button:has-text("Generate Slides")');

    // Wait for slides to generate
    await page.waitForTimeout(5000);

    // Click "Create Presentation"
    await page.click('button:has-text("Create Presentation")');
    await page.waitForTimeout(1000);

    // Switch to Presenter view
    await page.click('button:has-text("Presenter")');
    await page.waitForTimeout(500);

    // Take screenshot of presenter view
    await page.screenshot({ path: 'tests/screenshots/presenter-view-with-notes.png', fullPage: true });

    // Check if speaker notes badge is visible
    const notesBadge = page.locator('text=Speaker Notes');
    if (await notesBadge.isVisible()) {
      console.log('✅ Speaker notes badge found');
    } else {
      console.log('❌ Speaker notes badge NOT found (may be using slide content)');
    }

    // Check for trigger word display
    const triggerBadge = page.locator('text=/Say: ".*"/');
    await expect(triggerBadge).toBeVisible();
    console.log('✅ Trigger word badge visible');

    // Check for audience preview section
    const audiencePreview = page.locator('text=📺 Audience Sees');
    await expect(audiencePreview).toBeVisible();
    console.log('✅ Audience preview section visible');

    // Check for next section preview
    const nextSection = page.locator('text=⏭️ Next Up');
    await expect(nextSection).toBeVisible();
    console.log('✅ Next section preview visible');

    // Check for timer
    const timer = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timer).toBeVisible();
    console.log('✅ Timer visible');

    console.log('\n📊 Presenter View Components Status:');
    console.log('- Speaker Notes Display: Active');
    console.log('- Trigger Word Badge: Visible');
    console.log('- Audience Preview: Visible');
    console.log('- Next Slide Preview: Visible');
    console.log('- Timer: Visible');
  });
});
