import { test, expect } from '@playwright/test';

test.describe('Bulk Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Generate All Images button in editor mode', async ({ page }) => {
    // Create a presentation with multiple sections
    await page.getByRole('button', { name: /Process Content/i }).click();

    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product. This is an amazing innovation. Let me show you the features.');

    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for sections to be created
    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // Verify "Generate All Images with AI" button exists
    const bulkGenerateButton = page.getByRole('button', { name: /Generate All Images with AI/i });
    await expect(bulkGenerateButton).toBeVisible();
  });

  test('should generate images for all sections without images', async ({ page }) => {
    // Create a presentation with 2 sections
    await page.getByRole('button', { name: /Process Content/i }).click();

    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product. This is section one. Now let me show you section two.');

    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for sections
    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    console.log('✅ Sections created, looking for bulk generate button...');

    // Click "Generate All Images with AI"
    const bulkGenerateButton = page.getByRole('button', { name: /Generate All Images with AI/i });
    await expect(bulkGenerateButton).toBeVisible();

    // Handle the confirmation dialog
    page.once('dialog', dialog => {
      console.log('📢 Dialog message:', dialog.message());
      dialog.accept();
    });

    await bulkGenerateButton.click();

    console.log('🎨 Bulk generation started...');

    // Wait for generation to start (button should show "Generating...")
    await expect(page.getByText(/Generating/i)).toBeVisible({ timeout: 5000 });

    console.log('⏳ Waiting for generation to complete...');

    // Wait for success dialog (may take a while for actual generation)
    // We'll wait up to 60 seconds for all images to generate
    await page.waitForSelector('text=/Success.*Generated/i', { timeout: 60000 });

    console.log('✅ Success dialog appeared');

    // Handle success alert
    page.once('dialog', dialog => {
      console.log('📢 Success dialog:', dialog.message());
      dialog.accept();
    });

    // Wait a moment for dialog to clear
    await page.waitForTimeout(1000);

    console.log('🔍 Checking if images actually appeared in sections...');

    // Now verify that images actually appeared in the sections
    // Edit first section to check for image
    await page.getByRole('button', { name: /Edit/i }).first().click();

    // Check if an image preview is visible
    const imagePreview = page.locator('img[alt="Preview"]');
    await expect(imagePreview).toBeVisible({ timeout: 5000 });

    console.log('✅ Image found in first section!');

    // Save and check second section
    await page.getByRole('button', { name: /Save/i }).click();

    // Edit second section
    const editButtons = page.getByRole('button', { name: /Edit/i });
    await editButtons.nth(1).click();

    // Verify second section also has image
    await expect(imagePreview).toBeVisible({ timeout: 5000 });

    console.log('✅ Image found in second section!');
    console.log('🎉 Bulk image generation test PASSED!');
  });

  test('should show progress indicator during bulk generation', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome. This is section one. Here is section two.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // Accept confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    const bulkGenerateButton = page.getByRole('button', { name: /Generate All Images with AI/i });
    await bulkGenerateButton.click();

    // Should show "Generating X/Y..."
    await expect(page.getByText(/Generating \d+\/\d+/i)).toBeVisible({ timeout: 5000 });
  });

  test('should disable button when no sections exist', async ({ page }) => {
    // Start in editor mode but with no sections
    await page.getByRole('button', { name: /Process Content/i }).click();

    // Button should be disabled when no sections
    const bulkGenerateButton = page.getByRole('button', { name: /Generate All Images with AI/i });
    await expect(bulkGenerateButton).toBeDisabled();
  });

  test('should alert if all sections already have images', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // First, add an image manually to the section
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.fill('input[placeholder*="paste image URL"]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    await page.getByRole('button', { name: /Save/i }).click();

    // Now try to bulk generate
    let dialogMessage = '';
    page.once('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.accept();
    });

    await page.getByRole('button', { name: /Generate All Images with AI/i }).click();

    // Wait for dialog to appear
    await page.waitForTimeout(500);

    // Verify message says all sections have images
    expect(dialogMessage).toContain('already have images');
  });
});
