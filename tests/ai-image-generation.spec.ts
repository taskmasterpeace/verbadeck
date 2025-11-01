import { test, expect } from '@playwright/test';

test.describe('AI Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Generate with AI button in section editor', async ({ page }) => {
    // Create a simple presentation first
    await page.getByRole('button', { name: /Process Content/i }).click();

    // Enter some test content
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product. This is an amazing innovation.');

    // Process with AI
    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for sections to be created
    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // Click Edit on first section
    await page.getByRole('button', { name: /Edit/i }).first().click();

    // Verify "Generate with AI" button exists
    const generateButton = page.getByRole('button', { name: /Generate with AI/i });
    await expect(generateButton).toBeVisible();
  });

  test('should open AI Image Generator modal when clicking Generate with AI', async ({ page }) => {
    // Create a simple presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product. This is an amazing innovation.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for sections
    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // Edit first section
    await page.getByRole('button', { name: /Edit/i }).first().click();

    // Click Generate with AI
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Modal should appear
    await expect(page.getByText(/Generate Image with AI/i)).toBeVisible();
    await expect(page.getByText(/Creator mode/i)).toBeVisible();

    // Should have prompt input
    await expect(page.getByPlaceholder(/Describe the image/i)).toBeVisible();

    // Should have aspect ratio buttons
    await expect(page.getByText(/16:9 Widescreen/i)).toBeVisible();
    await expect(page.getByText(/9:16 Portrait/i)).toBeVisible();
    await expect(page.getByText(/1:1 Square/i)).toBeVisible();
  });

  test('should show editor mode when existing image is present', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product. This is an amazing innovation.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for sections
    await page.waitForSelector('text=Section 1', { timeout: 15000 });

    // Edit first section
    await page.getByRole('button', { name: /Edit/i }).first().click();

    // Add an image URL manually first
    await page.fill('input[placeholder*="paste image URL"]',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

    // Now click Generate with AI
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Modal should show editor mode
    await expect(page.getByText(/Edit Image with AI/i)).toBeVisible();
    await expect(page.getByText(/Editor mode/i)).toBeVisible();
  });

  test('should allow aspect ratio selection', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Click different aspect ratios
    const portraitButton = page.getByRole('button', { name: /9:16 Portrait/i });
    await portraitButton.click();

    // Verify it's selected (purple border/background)
    await expect(portraitButton).toHaveClass(/border-purple-500/);

    const squareButton = page.getByRole('button', { name: /1:1 Square/i });
    await squareButton.click();
    await expect(squareButton).toHaveClass(/border-purple-500/);
  });

  test('should have auto-suggest button for prompt', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Our revolutionary cloud platform enables seamless integration.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Auto-suggest button should be visible
    const autoSuggestButton = page.getByRole('button', { name: /Auto-Suggest/i });
    await expect(autoSuggestButton).toBeVisible();
  });

  test('should close modal when clicking Cancel', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Modal is open
    await expect(page.getByText(/Generate Image with AI/i)).toBeVisible();

    // Click Cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Modal should be closed
    await expect(page.getByText(/Generate Image with AI/i)).not.toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Modal is open
    await expect(page.getByText(/Generate Image with AI/i)).toBeVisible();

    // Click X button (Close)
    await page.getByRole('button', { name: /Close/i }).click();

    // Modal should be closed
    await expect(page.getByText(/Generate Image with AI/i)).not.toBeVisible();
  });

  test('should show format options (PNG/JPG)', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Verify PNG/JPG buttons exist
    await expect(page.getByRole('button', { name: /PNG/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /JPG/i })).toBeVisible();
  });

  test('should display cost and speed information', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Should show cost and speed info
    await expect(page.getByText(/~\$0\.04 per image/i)).toBeVisible();
    await expect(page.getByText(/~5-15 seconds/i)).toBeVisible();
  });

  test('should show all 11 aspect ratios', async ({ page }) => {
    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to our product.');
    await page.getByRole('button', { name: /Process with AI/i }).click();

    await page.waitForSelector('text=Section 1', { timeout: 15000 });
    await page.getByRole('button', { name: /Edit/i }).first().click();
    await page.getByRole('button', { name: /Generate with AI/i }).click();

    // Verify all aspect ratios are present
    const expectedRatios = [
      '1:1 Square',
      '16:9 Widescreen',
      '9:16 Portrait',
      '4:3 Traditional',
      '3:4 Portrait',
      '21:9 Ultrawide',
      '2:3 Photo',
      '3:2 Photo',
      '4:5 Portrait',
      '5:4 Landscape',
      'Match Input'
    ];

    for (const ratio of expectedRatios) {
      await expect(page.getByText(ratio, { exact: false })).toBeVisible();
    }
  });
});
