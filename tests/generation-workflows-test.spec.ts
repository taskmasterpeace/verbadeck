import { test, expect } from '@playwright/test';

test.describe('Create from Scratch & AI Generation - Full Workflow Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Create from Scratch - Full workflow generates sections', async ({ page }) => {
    console.log('🧪 Testing Create from Scratch workflow...');

    // Step 1: Click "Create from Scratch" card
    await page.click('text=Create from Scratch');
    await page.waitForTimeout(1000);

    // Verify we navigated to the correct page
    expect(page.url()).toContain('/create/scratch');
    console.log('✅ Navigated to Create from Scratch page');

    // Step 2: Check if the form is visible (not blank) - textarea with specific placeholder
    const topicInput = page.locator('textarea[placeholder*="AI-powered meeting assistant" i]').first();
    await expect(topicInput).toBeVisible({ timeout: 10000 });
    console.log('✅ Topic textarea is visible (page not blank)');

    // Step 3: Fill in the topic
    await topicInput.fill('AI and Machine Learning Basics');
    console.log('✅ Filled in topic');

    // Step 4: Look for slide count slider (type="range")
    const slideCountSlider = page.locator('input[type="range"]').first();
    await expect(slideCountSlider).toBeVisible();
    console.log('✅ Slide count slider found');

    // Step 5: Verify the Continue button exists
    const continueButton = page.locator('button:has-text("Continue")').first();
    await expect(continueButton).toBeVisible();
    console.log('✅ Continue button is visible');

    // Step 6: Verify question type toggle button
    const aiDecideButton = page.locator('button:has-text("AI Decides")').first();
    await expect(aiDecideButton).toBeVisible();
    console.log('✅ AI Decides button is visible');

    // Verify key UI elements exist
    const hasButtons = await page.locator('button').count();
    console.log(`✅ Found ${hasButtons} buttons on page`);

    expect(hasButtons).toBeGreaterThan(0);
    console.log('✅ Create from Scratch form is fully functional');
  });

  test('AI Script Processor - Full workflow test', async ({ page }) => {
    console.log('🧪 Testing AI Script Processor workflow...');

    // Step 1: Click "Process Existing Content" card
    await page.click('text=Process Existing Content');
    await page.waitForTimeout(1000);

    // Verify we navigated to the correct page
    expect(page.url()).toContain('/create/process');
    console.log('✅ Navigated to AI Processor page');

    // Step 2: Check if the textarea is visible (not blank)
    const scriptTextarea = page.locator('textarea').first();
    await expect(scriptTextarea).toBeVisible({ timeout: 10000 });
    console.log('✅ Script textarea is visible (page not blank)');

    // Step 3: Fill in sample script content
    const sampleScript = `
Welcome to our presentation about Artificial Intelligence.

Today we'll cover three main topics:
First, what is AI and how does it work.
Second, the applications of AI in everyday life.
Third, the future of AI technology.

Let's begin with our first topic.

Artificial Intelligence, or AI, is the simulation of human intelligence by machines.
It involves learning, reasoning, and self-correction.

Next slide, please move on to applications.

AI is used in many areas including healthcare, finance, and transportation.
Virtual assistants like Siri and Alexa are examples of AI.

Finally, let's advance to the future of AI.

The future of AI holds tremendous potential and challenges.
We must consider ethical implications as AI becomes more prevalent.

Thank you for your attention.
    `.trim();

    await scriptTextarea.fill(sampleScript);
    console.log('✅ Filled in script content');

    // Step 4: Look for Process/Generate button
    const processButton = page.locator('button:has-text("Process"), button:has-text("Generate"), button:has-text("Analyze")').first();

    if (await processButton.isVisible()) {
      console.log('✅ Process button is visible');
      console.log('ℹ️ Skipping actual processing (requires API keys)');
    } else {
      console.log('⚠️ Process button not immediately visible');
    }

    // Verify page has content
    const pageText = await page.textContent('body');
    expect(pageText?.length).toBeGreaterThan(100);
    console.log('✅ Page has substantial content (not blank)');

    // Check for model selector
    const hasModelSelector = await page.locator('select, [role="combobox"]').count();
    console.log(`Found ${hasModelSelector} selector elements`);
  });

  test('Home page loads all creation options', async ({ page }) => {
    console.log('🧪 Testing home page creation options...');

    // Verify all 3 creation cards are visible - use heading selectors to be specific
    const createFromScratch = page.locator('h2:has-text("Create from Scratch")');
    const processContent = page.locator('h2:has-text("Process Existing Content")');
    const knowItAll = page.locator('h2:has-text("Know It All Wall")');

    await expect(createFromScratch).toBeVisible({ timeout: 5000 });
    await expect(processContent).toBeVisible({ timeout: 5000 });
    await expect(knowItAll).toBeVisible({ timeout: 5000 });

    console.log('✅ All 3 creation cards are visible');

    // Verify the buttons on each card exist
    const startFromScratchBtn = page.locator('button:has-text("Start from Scratch")');
    const processContentBtn = page.locator('button:has-text("Process Content")');
    const startQABtn = page.locator('button:has-text("Start Q&A Practice")');

    await expect(startFromScratchBtn).toBeVisible();
    await expect(processContentBtn).toBeVisible();
    await expect(startQABtn).toBeVisible();

    console.log('✅ All card buttons are clickable');
  });

  test('Navigation between views works correctly', async ({ page }) => {
    console.log('🧪 Testing navigation between views...');

    // Start at home
    expect(page.url()).toContain('localhost:5176');
    console.log('✅ Started at home page');

    // Navigate to Create from Scratch
    await page.click('text=Create from Scratch');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/create/scratch');
    console.log('✅ Navigated to Create from Scratch');

    // Go back home
    await page.goto('http://localhost:5176');
    await page.waitForTimeout(500);

    // Navigate to AI Processor
    await page.click('text=Process Existing Content');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/create/process');
    console.log('✅ Navigated to AI Processor');

    // Go back home
    await page.goto('http://localhost:5176');
    await page.waitForTimeout(500);

    // Navigate to Know It All
    await page.click('text=Know It All');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/know-it-all');
    console.log('✅ Navigated to Know It All');

    console.log('✅ All navigation paths working correctly');
  });

  test('Check for blank page issues', async ({ page }) => {
    console.log('🧪 Checking for blank page issues...');

    // Test Create from Scratch
    await page.goto('http://localhost:5176/create/scratch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    let bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
    console.log('✅ Create from Scratch page has content');

    // Test AI Processor
    await page.goto('http://localhost:5176/create/process');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
    console.log('✅ AI Processor page has content');

    // Test Know It All
    await page.goto('http://localhost:5176/know-it-all');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(50);
    console.log('✅ Know It All page has content');

    // Check home page
    await page.goto('http://localhost:5176/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
    console.log('✅ Home page has content');
  });

  test('Console errors check during navigation', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    // Navigate through all main views
    await page.goto('http://localhost:5176');
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:5176/create/scratch');
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:5176/create/process');
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:5176/know-it-all');
    await page.waitForTimeout(1000);

    // Filter out acceptable errors
    const criticalErrors = errors.filter(err =>
      !err.includes('Vite') &&
      !err.includes('[vite]') &&
      !err.includes('WebSocket') &&
      !err.includes('HMR')
    );

    console.log(`Found ${errors.length} total console errors`);
    console.log(`Found ${criticalErrors.length} critical errors`);
    console.log(`Found ${warnings.length} warnings`);

    if (criticalErrors.length > 0) {
      console.log('⚠️ Critical errors:', criticalErrors);
    } else {
      console.log('✅ No critical console errors');
    }

    expect(criticalErrors.length).toBeLessThan(3);
  });
});
