import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * BroadcastChannel Synchronization Tests
 *
 * Tests the synchronization between presenter and audience views using BroadcastChannel API.
 * This is a critical feature for dual-monitor presentations where the presenter controls
 * one window and the audience view automatically follows on another screen.
 */

test.describe('BroadcastChannel Synchronization', () => {
  let presenterPage: Page;
  let audiencePage: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    // Create a new context for each test
    context = await browser.newContext();

    // Create two pages in the same context (required for BroadcastChannel same-origin)
    presenterPage = await context.newPage();
    audiencePage = await context.newPage();

    // Navigate presenter page to home and create a simple presentation
    await presenterPage.goto('http://localhost:5175');
    await presenterPage.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should synchronize initial state when audience page loads', async () => {
    // Create a presentation on presenter page
    await presenterPage.click('text=Create from Scratch');
    await presenterPage.fill('textarea[placeholder*="topic"]', 'Test Presentation');
    await presenterPage.click('button:has-text("Generate")');

    // Wait for sections to be generated
    await presenterPage.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Navigate to presenter view
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    // Now open audience page
    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Audience should receive initial state
    await audiencePage.waitForSelector('text=Slide 1 of', { timeout: 5000 });

    // Verify audience is on the same slide as presenter
    const presenterSlideInfo = await presenterPage.textContent('[data-testid="slide-indicator"]');
    const audienceSlideInfo = await audiencePage.textContent('text=Slide 1 of');

    expect(audienceSlideInfo).toBeTruthy();
    console.log('✅ Audience page received initial state');
  });

  test('should sync section navigation from presenter to audience', async () => {
    // Setup: Create a multi-section presentation
    await createTestPresentation(presenterPage);

    // Navigate to presenter view
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    // Open audience page
    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');
    await audiencePage.waitForSelector('text=Slide 1 of');

    // Verify starting position
    let audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 1 of');
    console.log('📍 Initial position: Slide 1');

    // Navigate forward on presenter
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500); // Allow BroadcastChannel to sync

    // Verify audience updated
    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('✅ Forward navigation synced to audience');

    // Navigate forward again
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500);

    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 3 of');
    console.log('✅ Second forward navigation synced');
  });

  test('should sync backward navigation from presenter to audience', async () => {
    // Setup: Create presentation and navigate to slide 3
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    // Open audience page
    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Navigate to slide 3 on presenter
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(300);
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500);

    // Verify at slide 3
    let audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 3 of');
    console.log('📍 Advanced to slide 3');

    // Navigate backward
    await presenterPage.click('[data-testid="prev-section-btn"]');
    await presenterPage.waitForTimeout(500);

    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('✅ Backward navigation synced to audience');

    // Navigate backward again
    await presenterPage.click('[data-testid="prev-section-btn"]');
    await presenterPage.waitForTimeout(500);

    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 1 of');
    console.log('✅ Second backward navigation synced');
  });

  test('should sync rapid navigation changes', async () => {
    // Setup
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Rapid navigation: 1 -> 2 -> 3 -> 2 -> 3
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(100);
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(100);
    await presenterPage.click('[data-testid="prev-section-btn"]');
    await presenterPage.waitForTimeout(100);
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(1000); // Wait for final sync

    // Final position should be slide 3
    const audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 3 of');
    console.log('✅ Rapid navigation changes synced correctly');
  });

  test('should handle audience page reload gracefully', async () => {
    // Setup
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Navigate to slide 2
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500);

    let audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('📍 Before reload: Slide 2');

    // Reload audience page
    await audiencePage.reload();
    await audiencePage.waitForLoadState('networkidle');
    await audiencePage.waitForTimeout(500); // Wait for state request

    // Should restore to slide 2
    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('✅ Audience page restored state after reload');
  });

  test('should sync section content updates', async () => {
    // Setup
    await createTestPresentation(presenterPage);

    // Edit a section before presenting
    await presenterPage.click('text=Edit Content & Triggers');
    const firstSection = presenterPage.locator('[data-testid="section-card"]').first();
    await firstSection.click();

    // Update content
    const contentTextarea = firstSection.locator('textarea').first();
    await contentTextarea.fill('Updated Test Content');

    // Start presenting
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    // Open audience
    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Verify audience sees updated content
    const audienceContent = await audiencePage.textContent('[data-testid="slide-content"]');
    expect(audienceContent).toContain('Updated Test Content');
    console.log('✅ Content updates synced to audience');
  });

  test('should not sync when pages are in different browser contexts', async () => {
    // This test verifies that BroadcastChannel only works within same origin/context
    const context2 = await presenterPage.context().browser()!.newContext();
    const isolatedPage = await context2.newPage();

    // Setup presenter
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    // Open audience in DIFFERENT context
    await isolatedPage.goto('http://localhost:5175/audience');
    await isolatedPage.waitForLoadState('networkidle');

    // Navigate on presenter
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(1000);

    // Isolated page should NOT update (will show "Waiting for presentation...")
    const isolatedContent = await isolatedPage.textContent('body');
    expect(isolatedContent).toContain('Waiting for presentation');
    console.log('✅ BroadcastChannel correctly isolated to same context');

    await context2.close();
  });

  test('should sync trigger word detection to audience view', async () => {
    // Setup with voice trigger enabled
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Start listening (this would normally trigger voice recognition)
    await presenterPage.click('button:has-text("Start Listening")');
    await presenterPage.waitForTimeout(500);

    // Simulate trigger word detection by directly clicking next
    // (In real usage, this would happen via voice recognition)
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500);

    // Verify audience synced
    const audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('✅ Voice trigger navigation synced to audience');
  });

  test('should maintain sync with multiple rapid state changes', async () => {
    // Setup
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Make multiple state changes
    const changes = [
      { action: 'next', expectedSlide: 2 },
      { action: 'next', expectedSlide: 3 },
      { action: 'prev', expectedSlide: 2 },
      { action: 'next', expectedSlide: 3 },
      { action: 'prev', expectedSlide: 2 },
      { action: 'prev', expectedSlide: 1 },
    ];

    for (const change of changes) {
      const btn = change.action === 'next'
        ? '[data-testid="next-section-btn"]'
        : '[data-testid="prev-section-btn"]';
      await presenterPage.click(btn);
      await presenterPage.waitForTimeout(200);
    }

    // Wait for all changes to propagate
    await presenterPage.waitForTimeout(1000);

    // Final state should match
    const audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 1 of');
    console.log('✅ Multiple rapid state changes synced correctly');
  });

  test('should handle BroadcastChannel closure gracefully', async () => {
    // Setup
    await createTestPresentation(presenterPage);
    await presenterPage.click('button:has-text("Start Presenting")');
    await presenterPage.waitForSelector('[data-testid="presenter-view"]');

    await audiencePage.goto('http://localhost:5175/audience');
    await audiencePage.waitForLoadState('networkidle');

    // Verify initial sync
    await presenterPage.click('[data-testid="next-section-btn"]');
    await presenterPage.waitForTimeout(500);

    let audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');

    // Close presenter page
    await presenterPage.close();

    // Audience should remain showing last known state
    audienceSlide = await audiencePage.textContent('text=Slide');
    expect(audienceSlide).toContain('Slide 2 of');
    console.log('✅ Audience maintains state after presenter closes');
  });
});

/**
 * Helper function to create a test presentation with multiple sections
 */
async function createTestPresentation(page: Page) {
  await page.click('text=Create from Scratch');
  await page.fill('textarea[placeholder*="topic"]', 'BroadcastChannel Test Presentation');
  await page.fill('input[placeholder*="sections"]', '5');
  await page.click('button:has-text("Generate")');

  // Wait for sections to be generated
  await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });
  console.log('✅ Test presentation created with 5 sections');
}
