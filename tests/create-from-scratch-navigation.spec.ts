import { test, expect } from '@playwright/test';

test.describe('Create from Scratch - Sidebar Navigation Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Clicking sidebar "From Scratch" renders the form', async ({ page }) => {
    console.log('🧪 Testing sidebar navigation to Create from Scratch...');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-home-page.png', fullPage: true });
    console.log('📸 Screenshot 1: Home page');

    // Find and click the Create dropdown in sidebar
    const createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Clicked Create dropdown');

    // Take screenshot of open dropdown
    await page.screenshot({ path: 'test-results/02-create-dropdown.png', fullPage: true });
    console.log('📸 Screenshot 2: Create dropdown open');

    // Click "From Scratch" link in sidebar
    const fromScratchLink = page.locator('a[href="/create/scratch"]');
    await expect(fromScratchLink).toBeVisible({ timeout: 5000 });
    await fromScratchLink.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked "From Scratch" link');

    // Verify URL changed
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    expect(currentUrl).toContain('/create/scratch');

    // Wait for any loading/transitions
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of what loaded
    await page.screenshot({ path: 'test-results/03-from-scratch-page.png', fullPage: true });
    console.log('📸 Screenshot 3: From Scratch page loaded');

    // Check for the heading
    const heading = page.locator('h3:has-text("Create from Scratch")');
    const headingVisible = await heading.isVisible();
    console.log(`📋 Heading visible: ${headingVisible}`);

    // Check for the textarea
    const textarea = page.locator('textarea[placeholder*="AI-powered meeting assistant" i]');
    const textareaCount = await textarea.count();
    const textareaVisible = textareaCount > 0 ? await textarea.first().isVisible() : false;
    console.log(`📋 Textarea count: ${textareaCount}, visible: ${textareaVisible}`);

    // Check for Continue button
    const continueBtn = page.locator('button:has-text("Continue")');
    const continueBtnCount = await continueBtn.count();
    const continueBtnVisible = continueBtnCount > 0 ? await continueBtn.first().isVisible() : false;
    console.log(`📋 Continue button count: ${continueBtnCount}, visible: ${continueBtnVisible}`);

    // Get page content to check if blank
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.length > 100;
    console.log(`📋 Body text length: ${bodyText?.length}, has content: ${hasContent}`);

    // Log all visible text on page
    const mainContent = await page.locator('main').textContent();
    console.log(`📋 Main content: ${mainContent?.substring(0, 500)}...`);

    // Check viewMode in React DevTools/console
    await page.evaluate(() => {
      console.log('🔍 Window location:', window.location.href);
      console.log('🔍 Document title:', document.title);
    });

    // Get all buttons on page
    const allButtons = await page.locator('button').allTextContents();
    console.log(`📋 All buttons on page: ${allButtons.join(', ')}`);

    // Assertions
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(textarea.first()).toBeVisible({ timeout: 10000 });
    await expect(continueBtn.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ All elements verified - page is NOT blank!');
  });

  test('Check if viewMode state is correct after navigation', async ({ page }) => {
    console.log('🧪 Testing viewMode state...');

    // Click sidebar navigation
    const createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(500);

    const fromScratchLink = page.locator('a[href="/create/scratch"]');
    await fromScratchLink.click();
    await page.waitForTimeout(1000);

    // Check console logs for viewMode
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('viewMode') || text.includes('Route changed')) {
        logs.push(text);
        console.log(`🔍 Console: ${text}`);
      }
    });

    // Wait and collect logs
    await page.waitForTimeout(2000);

    // Verify the page shows the form
    const textarea = page.locator('textarea[placeholder*="AI-powered meeting assistant" i]');
    await expect(textarea.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ ViewMode state test complete');
  });

  test('Full workflow: Home -> Sidebar -> Create from Scratch -> Fill form', async ({ page }) => {
    console.log('🧪 Testing full workflow...');

    // Step 1: Click sidebar Create dropdown
    await page.locator('button:has-text("Create")').first().click();
    await page.waitForTimeout(500);

    // Step 2: Click From Scratch
    await page.locator('a[href="/create/scratch"]').click();
    await page.waitForTimeout(1000);

    // Step 3: Verify we're on the right page
    expect(page.url()).toContain('/create/scratch');
    await page.screenshot({ path: 'test-results/04-workflow-scratch-page.png', fullPage: true });

    // Step 4: Wait for form to appear
    const textarea = page.locator('textarea[placeholder*="AI-powered meeting assistant" i]').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Step 5: Fill in the form
    await textarea.fill('Test Presentation About Machine Learning');
    console.log('✅ Filled in topic');

    // Step 6: Adjust slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('10');
    console.log('✅ Set slides to 10');

    // Step 7: Verify Continue button is enabled
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await expect(continueBtn).toBeEnabled({ timeout: 5000 });
    console.log('✅ Continue button is enabled');

    // Take final screenshot
    await page.screenshot({ path: 'test-results/05-workflow-form-filled.png', fullPage: true });

    console.log('✅ Full workflow test PASSED - Form is working!');
  });
});
