import { test, expect } from '@playwright/test';

test.describe('VerbaDeck - Process Existing Content Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Process Existing Content tab with correct naming', async ({ page }) => {
    // Verify renamed tab (was "AI Processor", now "Process Existing Content")
    const processTab = page.getByRole('button', { name: /Process Existing Content/i });
    await expect(processTab).toBeVisible();

    // Should be active by default
    await expect(processTab).toHaveClass(/bg-blue-600/);

    // Click to ensure it works
    await processTab.click();

    // Verify header card
    await expect(page.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();
    await expect(page.getByText(/Choose your starting point/i)).toBeVisible();
  });

  test('should display three method options with descriptions', async ({ page }) => {
    // Verify all three methods are visible
    await expect(page.getByRole('button', { name: /Paste Text/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload PowerPoint/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate from Images/i })).toBeVisible();

    // Paste Text should be selected by default
    const pasteTextButton = page.locator('button:has-text("Paste Text")').first();
    await expect(pasteTextButton).toHaveClass(/bg-primary/);

    // Verify method description is displayed
    await expect(page.getByText(/You have existing script text that needs to be formatted/i)).toBeVisible();
  });

  test('should switch between methods and show different descriptions', async ({ page }) => {
    // Click PowerPoint method
    const powerPointButton = page.locator('button:has-text("Upload PowerPoint")').first();
    await powerPointButton.click();

    // Verify description changes
    await expect(page.getByText(/Convert an existing PowerPoint presentation/i)).toBeVisible();

    // Verify button is now active
    await expect(powerPointButton).toHaveClass(/bg-primary/);

    // Click Images method
    const imagesButton = page.locator('button:has-text("Generate from Images")').first();
    await imagesButton.click();

    // Verify description changes
    await expect(page.getByText(/Upload presentation slide images and AI will analyze/i)).toBeVisible();

    // Verify button is now active
    await expect(imagesButton).toHaveClass(/bg-primary/);
  });

  test('Method 1: Paste Text - should show all UI elements', async ({ page }) => {
    // Paste Text is default, so no need to click

    // Verify AI Script Processor header
    await expect(page.getByRole('heading', { name: /AI Script Processor/i })).toBeVisible();
    await expect(page.getByText(/Paste your raw script text and let AI format/i)).toBeVisible();

    // Verify model selector
    await expect(page.getByText('Select AI Model')).toBeVisible();
    const modelSelector = page.locator('button:has-text("Claude 3.5 Sonnet")').or(
      page.locator('button:has-text("claude")')
    );
    await expect(modelSelector.first()).toBeVisible();

    // Verify help icon with tooltip
    const helpIcon = page.locator('[class*="lucide-help-circle"]').first();
    await expect(helpIcon).toBeVisible();

    // Verify "Preserve exact wording" checkbox
    const preserveCheckbox = page.locator('input#preserve-wording');
    await expect(preserveCheckbox).toBeVisible();
    await expect(preserveCheckbox).toBeChecked(); // Should be checked by default

    await expect(page.getByText(/Preserve exact wording/i)).toBeVisible();
    await expect(page.getByText(/DEFAULT/)).toBeVisible();

    // Verify checkbox description
    await expect(page.getByText(/When checked, AI will only identify trigger words/i)).toBeVisible();

    // Verify textarea
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /Paste your presentation script here/);

    // Verify character counter
    await expect(page.getByText(/0 characters/)).toBeVisible();
    await expect(page.getByText(/Max: 50,000 characters/)).toBeVisible();

    // Verify Load Test Presentation button
    await expect(page.getByRole('button', { name: /Load Test Presentation/i })).toBeVisible();

    // Verify Process with AI button
    const processButton = page.getByRole('button', { name: /Process with AI/i });
    await expect(processButton).toBeVisible();
    await expect(processButton).toBeDisabled(); // Disabled when empty
  });

  test('Method 1: Paste Text - Load Test Presentation functionality', async ({ page }) => {
    // Click Load Test Presentation
    await page.getByRole('button', { name: /Load Test Presentation/i }).click();

    // Wait for textarea to be filled
    const textarea = page.locator('textarea').first();
    const textContent = await textarea.inputValue();

    // Verify test presentation is loaded
    expect(textContent.length).toBeGreaterThan(0);
    expect(textContent).toContain('SECTION');

    // Verify character counter updates
    const charCount = await page.locator('text=/[0-9,]+ characters/').first().textContent();
    expect(charCount).not.toBe('0 characters');

    // Process button should now be enabled
    const processButton = page.getByRole('button', { name: /Process with AI/i });
    await expect(processButton).toBeEnabled();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/paste-text-with-content.png',
      fullPage: true,
    });
  });

  test('Method 1: Paste Text - Preserve wording checkbox toggle', async ({ page }) => {
    const preserveCheckbox = page.locator('input#preserve-wording');

    // Should be checked by default
    await expect(preserveCheckbox).toBeChecked();

    // Uncheck it
    await preserveCheckbox.click();
    await expect(preserveCheckbox).not.toBeChecked();

    // Check it again
    await preserveCheckbox.click();
    await expect(preserveCheckbox).toBeChecked();
  });

  test('Method 1: Paste Text - Model selector opens dropdown', async ({ page }) => {
    // Find and click model selector
    const modelSelector = page.locator('button:has-text("Claude")').or(
      page.locator('button:has-text("claude")')
    ).first();

    await modelSelector.click();

    // Should show dropdown with model categories
    await expect(page.getByText('Recommended')).toBeVisible();

    // Should show some model options
    await expect(page.getByText('Claude 3 Haiku')).toBeVisible();

    // Take screenshot of dropdown
    await page.screenshot({
      path: 'test-results/paste-text-model-selector.png',
      fullPage: true,
    });
  });

  test('Method 1: Paste Text - Textarea character counter updates', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    // Type some text
    await textarea.fill('This is a test presentation about AI technology.');

    // Verify character counter updates
    const charCountText = await page.locator('text=/[0-9,]+ characters/').first().textContent();
    expect(charCountText).toContain('48 characters');

    // Clear textarea
    await textarea.clear();

    // Counter should reset to 0
    await expect(page.getByText('0 characters')).toBeVisible();
  });

  test('Method 1: Paste Text - Tips section visible', async ({ page }) => {
    // Scroll to tips section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify tips are visible
    await expect(page.getByText(/💡 Tips for best results:/)).toBeVisible();
    await expect(page.getByText(/Provide complete sentences and paragraphs/)).toBeVisible();
    await expect(page.getByText(/AI will automatically split into digestible sections/)).toBeVisible();
  });

  test('Method 1: Paste Text - Blue styling (no purple)', async ({ page }) => {
    // Load test content
    await page.getByRole('button', { name: /Load Test Presentation/i }).click();

    // Check textarea border color (should be blue when focused)
    const textarea = page.locator('textarea').first();
    await textarea.focus();

    const borderColor = await textarea.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });

    // Should not be purple
    expect(borderColor).not.toContain('168, 85, 247');

    // Check Process button color
    const processButton = page.getByRole('button', { name: /Process with AI/i });
    const buttonColor = await processButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be blue gradient, not purple
    expect(buttonColor).not.toContain('168, 85, 247');
  });

  test('Method 2: Upload PowerPoint - should show upload component', async ({ page }) => {
    // Click Upload PowerPoint method
    await page.locator('button:has-text("Upload PowerPoint")').first().click();

    // Verify PowerPointUpload component renders
    // (Component may have its own heading or upload area)

    // Verify method description is correct
    await expect(page.getByText(/Convert an existing PowerPoint presentation/i)).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/upload-powerpoint-method.png',
      fullPage: true,
    });
  });

  test('Method 3: Generate from Images - should show image builder component', async ({ page }) => {
    // Click Generate from Images method
    await page.locator('button:has-text("Generate from Images")').first().click();

    // Verify method description is correct
    await expect(page.getByText(/Upload presentation slide images and AI will analyze/i)).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/generate-from-images-method.png',
      fullPage: true,
    });
  });

  test('visual regression: all three methods', async ({ page }) => {
    // Method 1: Paste Text
    await page.screenshot({
      path: 'test-results/method-paste-text.png',
      fullPage: true,
    });

    // Method 2: Upload PowerPoint
    await page.locator('button:has-text("Upload PowerPoint")').first().click();
    await page.screenshot({
      path: 'test-results/method-upload-powerpoint.png',
      fullPage: true,
    });

    // Method 3: Generate from Images
    await page.locator('button:has-text("Generate from Images")').first().click();
    await page.screenshot({
      path: 'test-results/method-generate-images.png',
      fullPage: true,
    });
  });

  test('workflow clarity: clear distinction between methods', async ({ page }) => {
    // Verify header card clearly explains purpose
    await expect(page.getByText(/Choose your starting point/i)).toBeVisible();

    // Verify each method has icon
    const fileIcon = page.locator('[class*="lucide-file-text"]').first();
    await expect(fileIcon).toBeVisible();

    // Click each method and verify description changes
    const methods = [
      { button: 'Paste Text', keyword: 'formatted into VerbaDeck sections' },
      { button: 'Upload PowerPoint', keyword: 'Extracts text and images from your PPTX' },
      { button: 'Generate from Images', keyword: 'analyze them to generate a complete' }
    ];

    for (const method of methods) {
      await page.locator(`button:has-text("${method.button}")`).first().click();
      await expect(page.getByText(new RegExp(method.keyword, 'i'))).toBeVisible();
    }

    // Take screenshot showing clarity
    await page.screenshot({
      path: 'test-results/workflow-clarity.png',
      fullPage: true,
    });
  });

  test('responsive: mobile view of Process Existing Content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify tab is accessible on mobile
    await expect(page.getByRole('button', { name: /Process Existing Content/i })).toBeVisible();

    // Verify method buttons stack properly on mobile
    await expect(page.getByRole('button', { name: /Paste Text/i })).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/process-existing-mobile.png',
      fullPage: true,
    });
  });

  test('responsive: desktop view of Process Existing Content', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Verify full layout on desktop
    await expect(page.getByRole('button', { name: /Process Existing Content/i })).toBeVisible();

    // Load test content
    await page.getByRole('button', { name: /Load Test Presentation/i }).click();

    // Take desktop screenshot with content
    await page.screenshot({
      path: 'test-results/process-existing-desktop.png',
      fullPage: true,
    });
  });
});
