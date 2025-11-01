import { test, expect } from '@playwright/test';

test.describe('VerbaDeck - Create from Scratch Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show Create from Scratch tab and UI components', async ({ page }) => {
    // Click Create from Scratch tab
    const createTab = page.getByRole('button', { name: /Create from Scratch/i });
    await expect(createTab).toBeVisible();
    await createTab.click();

    // Verify header card is visible
    await expect(page.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();
    await expect(page.getByText(/Describe your presentation topic/i)).toBeVisible();

    // Verify description textarea
    const textarea = page.getByPlaceholder(/Describe your topic/i);
    await expect(textarea).toBeVisible();

    // Verify label
    await expect(page.getByText("What's your presentation about?")).toBeVisible();
  });

  test('should display all 8 tone options with correct styling', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify tone selector label
    await expect(page.getByText('Presentation Tone:')).toBeVisible();
    await expect(page.getByText('Choose the writing style for your presentation')).toBeVisible();

    // Verify all 8 tone options are visible
    const expectedTones = [
      { label: 'Professional', icon: '💼' },
      { label: 'Witty & Engaging', icon: '✨' },
      { label: 'Deeply Insightful', icon: '🧠' },
      { label: 'Conversational', icon: '💬' },
      { label: 'Bold & Provocative', icon: '🔥' },
      { label: 'Technical Expert', icon: '🔬' },
      { label: 'Storytelling', icon: '📖' },
      { label: 'Sarcastic & Sharp', icon: '😏' }
    ];

    for (const tone of expectedTones) {
      await expect(page.getByText(tone.label)).toBeVisible();
      await expect(page.locator(`text=${tone.icon}`)).toBeVisible();
    }

    // Professional should be selected by default
    const professionalButton = page.locator('button:has-text("Professional")').first();
    await expect(professionalButton).toHaveClass(/bg-blue-50/);
    await expect(professionalButton).toHaveClass(/border-blue-500/);
  });

  test('should allow selecting different tones', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Click Witty & Engaging tone
    const wittyButton = page.locator('button:has-text("Witty & Engaging")').first();
    await wittyButton.click();

    // Verify it's selected (blue background and border)
    await expect(wittyButton).toHaveClass(/bg-blue-50/);
    await expect(wittyButton).toHaveClass(/border-blue-500/);

    // Click Sarcastic tone
    const sarcasticButton = page.locator('button:has-text("Sarcastic & Sharp")').first();
    await sarcasticButton.click();

    // Verify it's now selected
    await expect(sarcasticButton).toHaveClass(/bg-blue-50/);
    await expect(sarcasticButton).toHaveClass(/border-blue-500/);
  });

  test('should display and interact with number of slides slider', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify slider label and value display
    await expect(page.getByText('Number of Slides')).toBeVisible();

    // Default should be 5
    await expect(page.getByText('5', { exact: true })).toBeVisible();

    // Find slider
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();

    // Verify min and max attributes
    await expect(slider).toHaveAttribute('min', '3');
    await expect(slider).toHaveAttribute('max', '20');
    await expect(slider).toHaveAttribute('value', '5');

    // Change slider value
    await slider.fill('10');
    await expect(page.getByText('10', { exact: true })).toBeVisible();

    // Change to max
    await slider.fill('20');
    await expect(page.getByText('20', { exact: true })).toBeVisible();
  });

  test('should display target audience selector', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify audience selector label
    await expect(page.getByText('Target Audience:')).toBeVisible();

    // Verify audience options
    await expect(page.getByText('General Audience')).toBeVisible();
    await expect(page.getByText('Technical/Expert')).toBeVisible();
    await expect(page.getByText('Business Executive')).toBeVisible();
    await expect(page.getByText('Students/Academic')).toBeVisible();

    // General should be selected by default
    const generalButton = page.locator('button:has-text("General Audience")').first();
    await expect(generalButton).toHaveClass(/bg-blue-50/);
  });

  test('should toggle include images switch', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Find the include images toggle
    await expect(page.getByText('Include Images')).toBeVisible();

    const imageToggle = page.locator('button[role="switch"]').first();
    await expect(imageToggle).toBeVisible();

    // Click to enable images
    await imageToggle.click();

    // Verify image mode options appear
    await expect(page.getByText('AI-Generated Prompts')).toBeVisible();
    await expect(page.getByText('Manual Upload')).toBeVisible();
  });

  test('should show image upload grid when manual upload is selected', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Enable images
    const imageToggle = page.locator('button[role="switch"]').first();
    await imageToggle.click();

    // Select manual upload
    const uploadButton = page.locator('button:has-text("Manual Upload")').first();
    await uploadButton.click();

    // Verify upload grid appears with 5 slots (default num slides)
    await expect(page.getByText('Slide 1')).toBeVisible();
    await expect(page.getByText('Slide 2')).toBeVisible();
    await expect(page.getByText('Slide 3')).toBeVisible();
    await expect(page.getByText('Slide 4')).toBeVisible();
    await expect(page.getByText('Slide 5')).toBeVisible();

    // Change slider to 8 slides
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('8');

    // Verify grid updates to show 8 slots
    await expect(page.getByText('Slide 8')).toBeVisible();
  });

  test('should disable Generate button when description is empty', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Find Generate button
    const generateButton = page.getByRole('button', { name: /Generate Presentation/i });
    await expect(generateButton).toBeVisible();

    // Should be disabled when empty
    await expect(generateButton).toBeDisabled();

    // Enter text
    const textarea = page.getByPlaceholder(/Describe your topic/i);
    await textarea.fill('A presentation about climate change solutions');

    // Should now be enabled
    await expect(generateButton).toBeEnabled();

    // Clear text
    await textarea.clear();

    // Should be disabled again
    await expect(generateButton).toBeDisabled();
  });

  test('should validate NO purple colors in Create from Scratch UI', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Take full page screenshot for manual color inspection
    await page.screenshot({
      path: 'test-results/create-from-scratch-color-check.png',
      fullPage: true,
    });

    // Check that selected tone uses BLUE not purple
    const professionalButton = page.locator('button:has-text("Professional")').first();
    const bgColor = await professionalButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Blue-50 is rgb(239, 246, 255), not purple
    // This is a basic check - screenshot provides visual verification
    expect(bgColor).not.toContain('168, 85, 247'); // Purple rgb
  });

  test('should use VerbaDeck blue theme consistently', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Click Generate button area to check blue color
    const generateButton = page.getByRole('button', { name: /Generate Presentation/i });

    const buttonColor = await generateButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should be blue-600 (rgb(37, 99, 235)) or similar blue
    // At minimum, should not be purple
    expect(buttonColor).not.toContain('168, 85, 247');
  });

  test('visual regression: Create from Scratch full view', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Fill out the form with sample data
    await page.getByPlaceholder(/Describe your topic/i).fill('Building a successful AI-powered SaaS startup from scratch');

    // Select Witty tone
    await page.locator('button:has-text("Witty & Engaging")').first().click();

    // Set 10 slides
    await page.locator('input[type="range"]').first().fill('10');

    // Select Technical audience
    await page.locator('button:has-text("Technical/Expert")').first().click();

    // Take full screenshot
    await page.screenshot({
      path: 'test-results/create-from-scratch-filled.png',
      fullPage: true,
    });
  });

  test('visual regression: Create from Scratch with images enabled', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Enable images
    const imageToggle = page.locator('button[role="switch"]').first();
    await imageToggle.click();

    // Select manual upload
    const uploadButton = page.locator('button:has-text("Manual Upload")').first();
    await uploadButton.click();

    // Set 8 slides
    await page.locator('input[type="range"]').first().fill('8');

    // Take screenshot showing image grid
    await page.screenshot({
      path: 'test-results/create-from-scratch-with-images.png',
      fullPage: true,
    });
  });

  test('responsive: mobile portrait view (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify UI is usable on mobile
    await expect(page.getByText("What's your presentation about?")).toBeVisible();
    await expect(page.getByText('Presentation Tone:')).toBeVisible();

    // Tone buttons should be in 2-column grid on mobile
    const toneButtons = page.locator('button:has-text("Professional")').first();
    await expect(toneButtons).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/create-from-scratch-mobile.png',
      fullPage: true,
    });
  });

  test('responsive: desktop view (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify full layout on desktop
    await expect(page.getByText("What's your presentation about?")).toBeVisible();

    // Take desktop screenshot
    await page.screenshot({
      path: 'test-results/create-from-scratch-desktop.png',
      fullPage: true,
    });
  });
});
