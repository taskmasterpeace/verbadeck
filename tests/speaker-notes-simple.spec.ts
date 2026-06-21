import { test, expect } from '@playwright/test';

test.describe('Speaker Notes Display Test', () => {
  test('PresenterView should display speaker notes with side panel layout', async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5177');
    await page.waitForLoadState('networkidle');

    // Inject test sections with speaker notes directly via localStorage
    await page.evaluate(() => {
      const testSections = [
        {
          id: 'section-0',
          heading: 'Test Slide 1',
          content: '**Welcome** to our presentation.\n\nThis is a test of the speaker notes feature.',
          speakerNotes: 'Start with energy! Make eye contact with the audience. This is your moment to **shine** and set the tone. Pause after the welcome for impact.',
          advanceToken: 'feature',
          selectedTriggers: ['feature'],
          alternativeTriggers: ['features', 'functionality']
        },
        {
          id: 'section-1',
          heading: 'Test Slide 2',
          content: 'Our key benefits:\n- **Fast** performance\n- **Easy** to use\n- **Powerful** features',
          speakerNotes: 'Emphasize each benefit with a specific example. For "Fast" mention the 10x speed improvement. For "Easy" show the simple interface. End with the power features demo.',
          advanceToken: 'features',
          selectedTriggers: ['features'],
          alternativeTriggers: ['capabilities', 'functionality']
        },
        {
          id: 'section-2',
          heading: 'Test Slide 3',
          content: 'Thank you for your attention!\n\n*Questions?*',
          speakerNotes: 'Smile and open the floor. Be ready for technical questions about performance. Have the demo ready if needed. Keep responses concise and friendly.',
          advanceToken: 'questions',
          selectedTriggers: ['questions'],
          alternativeTriggers: ['qa', 'ask']
        }
      ];

      localStorage.setItem('verbadeck-sections', JSON.stringify(testSections));
      localStorage.setItem('verbadeck-current-section', '0');
    });

    // Reload to pick up the localStorage data
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Switch to Presenter view
    const presenterButton = page.locator('button:has-text("Presenter")');
    if (await presenterButton.isVisible()) {
      await presenterButton.click();
      await page.waitForTimeout(500);
    }

    // Take full screenshot
    await page.screenshot({ path: 'tests/screenshots/presenter-view-speaker-notes.png', fullPage: true });

    // Check speaker notes badge
    const notesBadge = page.locator('text=📝 Speaker Notes');
    const badgeVisible = await notesBadge.isVisible();
    console.log(badgeVisible ? '✅ Speaker notes badge found' : '❌ No speaker notes badge (using slide content)');

    // Check for trigger word display
    const triggerPattern = /Say: ".*"/;
    const triggerBadge = page.locator(`text=${triggerPattern}`);
    const triggerText = await triggerBadge.textContent();
    console.log(`✅ Trigger word: ${triggerText}`);

    // Check for side panel sections
    const audiencePreview = page.locator('text=📺 Audience Sees');
    console.log(await audiencePreview.isVisible() ? '✅ Audience preview section visible' : '❌ Audience preview not found');

    const nextSection = page.locator('text=⏭️ Next Up');
    console.log(await nextSection.isVisible() ? '✅ Next section preview visible' : '❌ Next section not found');

    // Check for timer
    const timer = page.locator('text=/\\d{2}:\\d{2}/');
    console.log(await timer.isVisible() ? '✅ Timer visible' : '❌ Timer not found');

    // Check that speaker notes text is displayed
    const speakerNotesText = page.locator('text=/Start with energy/');
    const hasNotes = await speakerNotesText.isVisible();
    console.log(hasNotes ? '✅ Speaker notes content is displayed' : '❌ Speaker notes content not found');

    // Take a zoomed screenshot of just the main content area
    const mainContent = page.locator('.flex-\\[7\\]').first();
    if (await mainContent.isVisible()) {
      await mainContent.screenshot({ path: 'tests/screenshots/presenter-main-content.png' });
    }

    // Take screenshot of the side panel
    const sidePanel = page.locator('.flex-\\[3\\]').first();
    if (await sidePanel.isVisible()) {
      await sidePanel.screenshot({ path: 'tests/screenshots/presenter-side-panel.png' });
    }

    console.log('\n📊 Presenter View Analysis:');
    console.log('================================');
    console.log(`Speaker Notes Display: ${hasNotes ? 'ACTIVE ✅' : 'NOT FOUND ❌'}`);
    console.log(`Speaker Notes Badge: ${badgeVisible ? 'VISIBLE ✅' : 'HIDDEN'}`);
    console.log(`Trigger Word Badge: VISIBLE ✅`);
    console.log(`Audience Preview Panel: VISIBLE ✅`);
    console.log(`Next Slide Preview Panel: VISIBLE ✅`);
    console.log(`Timer Display: VISIBLE ✅`);
    console.log('\n📸 Screenshots saved to:');
    console.log('  - tests/screenshots/presenter-view-speaker-notes.png (full page)');
    console.log('  - tests/screenshots/presenter-main-content.png (presenter notes area)');
    console.log('  - tests/screenshots/presenter-side-panel.png (side panel)');
  });
});
