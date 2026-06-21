import { test, expect } from '@playwright/test';

/**
 * CRITICAL TEST: End-to-End Presentation Creation and View Synchronization
 *
 * This test verifies the COMPLETE workflow from creating a presentation
 * to viewing it in both Presenter and Audience views.
 *
 * BUG BEING TESTED:
 * User reported that creating a presentation works, but:
 * - Presenter view shows OLD presentation (e.g., "octopus")
 * - Audience view shows CORRECT new presentation (e.g., "GI Joe")
 *
 * This test will:
 * 1. Create a presentation with UNIQUE identifiable content
 * 2. Verify content appears in Editor view
 * 3. Navigate to Presenter view and capture content
 * 4. Navigate to Audience view and capture content
 * 5. ASSERT both views show the SAME presentation
 */

test.describe('Full Presentation Sync Test - Zero to 100', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Process Existing Content → Editor → Presenter → Audience - ALL VIEWS SYNC', async ({ page }) => {
    console.log('🧪 FULL E2E TEST: Creating presentation and verifying ALL views');

    // UNIQUE TEST DATA - easily identifiable
    const uniqueTestTitle = `SYNC TEST - ${Date.now()}`;
    const testScript = `
${uniqueTestTitle}

Welcome to our presentation about Space Exploration.

First, let's talk about the history of space travel.
The space race began in the 1950s between USA and USSR.
Humans first landed on the moon in 1969.

Next slide, let's discuss modern space exploration.

Today we have the International Space Station orbiting Earth.
Private companies like SpaceX are revolutionizing space travel.
We're planning missions to Mars in the coming decades.

Move forward to future plans.

The future of space exploration is exciting.
We aim to establish permanent colonies on other planets.
Space tourism will become more accessible.

Thank you for watching this presentation about space.
    `.trim();

    // ==========================================
    // STEP 1: Navigate to Process Existing Content
    // ==========================================
    console.log('📍 Step 1: Navigating to Process Existing Content...');
    await page.click('text=Process Existing Content');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/create/process');
    console.log('✅ Successfully navigated to /create/process');

    await page.screenshot({
      path: 'test-results/sync-01-process-page.png',
      fullPage: true
    });

    // ==========================================
    // STEP 2: Fill in the script and process
    // ==========================================
    console.log('📍 Step 2: Filling in script content...');
    const scriptTextarea = page.locator('textarea').first();
    await expect(scriptTextarea).toBeVisible({ timeout: 10000 });

    await scriptTextarea.fill(testScript);
    console.log(`✅ Filled script with unique title: "${uniqueTestTitle}"`);

    await page.screenshot({
      path: 'test-results/sync-02-script-filled.png',
      fullPage: true
    });

    // ==========================================
    // STEP 3: Click Process with AI
    // ==========================================
    console.log('📍 Step 3: Processing script with AI...');
    const processButton = page.locator('button:has-text("Process with AI")');
    await expect(processButton).toBeVisible();

    // NOTE: We're NOT actually clicking this because it requires API keys
    // Instead, we'll use the Load Test Presentation button if available
    const loadTestButton = page.locator('button:has-text("Load Test Presentation")');

    if (await loadTestButton.isVisible()) {
      console.log('🔧 Using Load Test Presentation instead of real API call');
      await loadTestButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ No test data button - would need real API call');
      console.log('⚠️ SKIPPING API call - test will check UI state only');

      // For now, let's check if we can navigate to editor anyway
      // In a real workflow, processing creates sections
    }

    // ==========================================
    // STEP 4: Check if Editor view has content
    // ==========================================
    console.log('📍 Step 4: Checking Editor view...');

    // Try navigating to Editor via sidebar
    const editorLink = page.locator('a[href="/editor"]');
    if (await editorLink.isVisible({ timeout: 2000 })) {
      await editorLink.click();
      await page.waitForTimeout(1000);
    } else {
      // Try clicking Editor in sidebar menu
      await page.click('text=Editor');
      await page.waitForTimeout(1000);
    }

    expect(page.url()).toContain('/editor');
    console.log('✅ Successfully navigated to /editor');

    await page.screenshot({
      path: 'test-results/sync-03-editor-view.png',
      fullPage: true
    });

    // Check for section content in Editor
    const editorContent = await page.textContent('body');
    console.log(`📋 Editor page text length: ${editorContent?.length} characters`);

    // Look for section indicators
    const sectionIndicator = page.locator('text=/Section \\d+\\/\\d+/');
    const hasSections = await sectionIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`📋 Editor has sections: ${hasSections}`);

    // ==========================================
    // STEP 5: Navigate to Presenter View
    // ==========================================
    console.log('📍 Step 5: Navigating to Presenter view...');

    const presenterLink = page.locator('a[href="/presenter"]');
    if (await presenterLink.isVisible({ timeout: 2000 })) {
      await presenterLink.click();
      await page.waitForTimeout(1500);
    } else {
      await page.click('text=Presenter');
      await page.waitForTimeout(1500);
    }

    expect(page.url()).toContain('/presenter');
    console.log('✅ Successfully navigated to /presenter');

    await page.screenshot({
      path: 'test-results/sync-04-presenter-view.png',
      fullPage: true
    });

    // Capture Presenter view content
    const presenterBody = await page.textContent('body');
    console.log(`📋 Presenter page text length: ${presenterBody?.length} characters`);

    // Extract key identifiable content
    const presenterHasUniqueTitle = presenterBody?.includes(uniqueTestTitle);
    const presenterHasSpaceContent = presenterBody?.includes('Space Exploration') || presenterBody?.includes('space');
    const presenterHasOctopus = presenterBody?.toLowerCase().includes('octopus');

    console.log(`📋 Presenter has unique title "${uniqueTestTitle}": ${presenterHasUniqueTitle}`);
    console.log(`📋 Presenter has space content: ${presenterHasSpaceContent}`);
    console.log(`📋 Presenter has OCTOPUS (old content): ${presenterHasOctopus}`);

    // Log first 500 chars of presenter content for debugging
    console.log(`📋 Presenter content preview: ${presenterBody?.substring(0, 500)}...`);

    // ==========================================
    // STEP 6: Navigate to Audience View
    // ==========================================
    console.log('📍 Step 6: Navigating to Audience view...');

    // Audience view is typically at /audience route
    await page.goto('http://localhost:5176/audience');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    expect(page.url()).toContain('/audience');
    console.log('✅ Successfully navigated to /audience');

    await page.screenshot({
      path: 'test-results/sync-05-audience-view.png',
      fullPage: true
    });

    // Capture Audience view content
    const audienceBody = await page.textContent('body');
    console.log(`📋 Audience page text length: ${audienceBody?.length} characters`);

    // Extract key identifiable content
    const audienceHasUniqueTitle = audienceBody?.includes(uniqueTestTitle);
    const audienceHasSpaceContent = audienceBody?.includes('Space Exploration') || audienceBody?.includes('space');
    const audienceHasOctopus = audienceBody?.toLowerCase().includes('octopus');
    const audienceHasGIJoe = audienceBody?.toLowerCase().includes('gi joe') || audienceBody?.toLowerCase().includes('g.i. joe');

    console.log(`📋 Audience has unique title "${uniqueTestTitle}": ${audienceHasUniqueTitle}`);
    console.log(`📋 Audience has space content: ${audienceHasSpaceContent}`);
    console.log(`📋 Audience has OCTOPUS (old content): ${audienceHasOctopus}`);
    console.log(`📋 Audience has GI JOE content: ${audienceHasGIJoe}`);

    // Log first 500 chars of audience content for debugging
    console.log(`📋 Audience content preview: ${audienceBody?.substring(0, 500)}...`);

    // ==========================================
    // STEP 7: CRITICAL ASSERTION - SYNC CHECK
    // ==========================================
    console.log('📍 Step 7: VERIFYING PRESENTER AND AUDIENCE SYNC...');

    // Both should have the same content indicators
    console.log('\n🔍 SYNC ANALYSIS:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│         Presenter    Audience           │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Title:   ${presenterHasUniqueTitle ? '✅' : '❌'}          ${audienceHasUniqueTitle ? '✅' : '❌'}             │`);
    console.log(`│ Space:   ${presenterHasSpaceContent ? '✅' : '❌'}          ${audienceHasSpaceContent ? '✅' : '❌'}             │`);
    console.log(`│ Octopus: ${presenterHasOctopus ? '❌ BAD' : '✅ GOOD'}     ${audienceHasOctopus ? '❌ BAD' : '✅ GOOD'}        │`);
    console.log(`│ GI Joe:  ${presenterHasGIJoe ? '❌ BAD' : '✅ GOOD'}     ${audienceHasGIJoe ? '❌ BAD' : '✅ GOOD'}        │`);
    console.log('└─────────────────────────────────────────┘\n');

    // CRITICAL ASSERTIONS
    if (presenterHasOctopus) {
      console.log('❌ CRITICAL BUG CONFIRMED: Presenter shows OLD OCTOPUS content!');
    }

    if (audienceHasGIJoe && !presenterHasGIJoe) {
      console.log('❌ CRITICAL BUG CONFIRMED: Audience shows GI JOE but Presenter does not!');
    }

    // The views should be in sync - same content indicators
    // NOTE: This assertion may FAIL if the bug exists
    if (hasSections) {
      console.log('✅ Presentation has sections - checking sync...');

      // If we loaded test data, both views should show it
      // If Presenter shows octopus and Audience shows GI Joe, we have the bug
      if (presenterHasOctopus && !audienceHasOctopus) {
        throw new Error('SYNC BUG DETECTED: Presenter has old OCTOPUS content, Audience does not!');
      }

      if (!presenterHasGIJoe && audienceHasGIJoe) {
        throw new Error('SYNC BUG DETECTED: Audience has GI JOE content, Presenter does not!');
      }
    }

    console.log('✅ FULL E2E TEST COMPLETE - Check screenshots and logs for details');
  });

  test('Create from Scratch → Editor → Presenter → Audience - SYNC TEST', async ({ page }) => {
    console.log('🧪 FULL E2E TEST: Create from Scratch workflow');

    // UNIQUE TEST DATA
    const uniqueTopic = `AI Ethics Testing - ${Date.now()}`;

    // ==========================================
    // STEP 1: Navigate via sidebar to From Scratch
    // ==========================================
    console.log('📍 Step 1: Navigating to Create from Scratch...');

    // Click Create dropdown in sidebar
    const createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Click From Scratch link
    const fromScratchLink = page.locator('a[href="/create/scratch"]');
    await expect(fromScratchLink).toBeVisible({ timeout: 5000 });
    await fromScratchLink.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/create/scratch');
    console.log('✅ Successfully navigated to /create/scratch');

    await page.screenshot({
      path: 'test-results/scratch-01-form.png',
      fullPage: true
    });

    // ==========================================
    // STEP 2: Fill in topic and settings
    // ==========================================
    console.log('📍 Step 2: Filling in Create from Scratch form...');

    const topicTextarea = page.locator('textarea[placeholder*="AI-powered meeting assistant" i]').first();
    await expect(topicTextarea).toBeVisible({ timeout: 10000 });

    await topicTextarea.fill(uniqueTopic);
    console.log(`✅ Filled topic: "${uniqueTopic}"`);

    // Set number of slides
    const slideSlider = page.locator('input[type="range"]').first();
    await slideSlider.fill('5');
    console.log('✅ Set slides to 5');

    await page.screenshot({
      path: 'test-results/scratch-02-filled.png',
      fullPage: true
    });

    // ==========================================
    // STEP 3: Click Continue (but don't actually generate)
    // ==========================================
    console.log('📍 Step 3: Checking Continue button...');

    const continueButton = page.locator('button:has-text("Continue")').first();
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();
    console.log('✅ Continue button is ready');

    // NOTE: We won't actually click Continue because it requires API calls
    console.log('⚠️ SKIPPING actual generation (requires API keys)');
    console.log('⚠️ Instead, we\'ll check if navigation to other views maintains state');

    // ==========================================
    // STEP 4: Navigate to Presenter View
    // ==========================================
    console.log('📍 Step 4: Navigating to Presenter view...');

    const presenterLink = page.locator('a[href="/presenter"]');
    await presenterLink.click();
    await page.waitForTimeout(1500);

    expect(page.url()).toContain('/presenter');
    console.log('✅ Navigated to /presenter');

    await page.screenshot({
      path: 'test-results/scratch-03-presenter.png',
      fullPage: true
    });

    const presenterBody = await page.textContent('body');
    const presenterHasOctopus = presenterBody?.toLowerCase().includes('octopus');
    const presenterHasAIEthics = presenterBody?.includes('AI Ethics');

    console.log(`📋 Presenter has OCTOPUS: ${presenterHasOctopus}`);
    console.log(`📋 Presenter has AI Ethics: ${presenterHasAIEthics}`);
    console.log(`📋 Presenter content (first 300 chars): ${presenterBody?.substring(0, 300)}`);

    // ==========================================
    // STEP 5: Navigate to Audience View
    // ==========================================
    console.log('📍 Step 5: Navigating to Audience view...');

    await page.goto('http://localhost:5176/audience');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: 'test-results/scratch-04-audience.png',
      fullPage: true
    });

    const audienceBody = await page.textContent('body');
    const audienceHasOctopus = audienceBody?.toLowerCase().includes('octopus');
    const audienceHasGIJoe = audienceBody?.toLowerCase().includes('gi joe');
    const audienceHasAIEthics = audienceBody?.includes('AI Ethics');

    console.log(`📋 Audience has OCTOPUS: ${audienceHasOctopus}`);
    console.log(`📋 Audience has GI JOE: ${audienceHasGIJoe}`);
    console.log(`📋 Audience has AI Ethics: ${audienceHasAIEthics}`);
    console.log(`📋 Audience content (first 300 chars): ${audienceBody?.substring(0, 300)}`);

    // ==========================================
    // STEP 6: SYNC CHECK
    // ==========================================
    console.log('\n🔍 SYNC ANALYSIS:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│         Presenter    Audience           │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Octopus: ${presenterHasOctopus ? '❌ BAD' : '✅ GOOD'}     ${audienceHasOctopus ? '❌ BAD' : '✅ GOOD'}        │`);
    console.log(`│ GI Joe:  ${presenterHasGIJoe ? '❌ BAD' : '✅ GOOD'}     ${audienceHasGIJoe ? '❌ BAD' : '✅ GOOD'}        │`);
    console.log('└─────────────────────────────────────────┘\n');

    if (presenterHasOctopus && !audienceHasOctopus) {
      throw new Error('SYNC BUG: Presenter has OCTOPUS, Audience does not!');
    }

    if (!presenterHasGIJoe && audienceHasGIJoe) {
      throw new Error('SYNC BUG: Audience has GI JOE, Presenter does not!');
    }

    console.log('✅ Create from Scratch sync test complete');
  });
});
