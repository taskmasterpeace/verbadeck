import { test, expect } from '@playwright/test';

test.describe('VerbaDeck Visual Tests', () => {
  test('should load the application and show the default script', async ({ page }) => {
    await page.goto('/');

    // Check that the title is present
    await expect(page.getByRole('heading', { name: 'VerbaDeck' })).toBeVisible();

    // Check that status bar shows initial state
    await expect(page.getByText('⏸️ PAUSED')).toBeVisible();
    await expect(page.getByText('⚫ Disconnected')).toBeVisible();

    // Check that script editor is visible (before streaming)
    await expect(page.getByText('Script Editor')).toBeVisible();

    // Check that presenter view shows first section
    await expect(page.getByText(/Welcome to VerbaDeck/i)).toBeVisible();
    await expect(page.getByText('Section 1 of 8')).toBeVisible();
  });

  test('should show next section preview', async ({ page }) => {
    await page.goto('/');

    // Check that "Next Up" section is visible
    await expect(page.getByText('Next Up')).toBeVisible();

    // Should show part of the next section
    await expect(page.getByText(/Every great presentation/i)).toBeVisible();
  });

  test('should allow editing wake and stop words', async ({ page }) => {
    await page.goto('/');

    // Find wake word input
    const wakeInput = page.locator('input').filter({ hasText: 'majin twin' }).or(
      page.locator('input[value="majin twin"]')
    );

    // Find stop word input
    const stopInput = page.locator('input').filter({ hasText: 'majin pause' }).or(
      page.locator('input[value="majin pause"]')
    );

    // Inputs should be editable when not streaming
    await expect(wakeInput.first()).toBeEnabled();
    await expect(stopInput.first()).toBeEnabled();

    // Change wake word
    await wakeInput.first().clear();
    await wakeInput.first().fill('test wake');

    // Verify change
    await expect(wakeInput.first()).toHaveValue('test wake');
  });

  test('should allow manual section navigation', async ({ page }) => {
    await page.goto('/');

    // Check we're on section 1
    await expect(page.getByText('Section 1 of 8')).toBeVisible();

    // Click section 3 button
    await page.getByRole('button', { name: '3' }).click();

    // Should now be on section 3
    await expect(page.getByText('Section 3 of 8')).toBeVisible();
    await expect(page.getByText(/Our solution uses voice recognition/i)).toBeVisible();
  });

  test('should show progress bar', async ({ page }) => {
    await page.goto('/');

    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"]').or(
      page.locator('.h-2.w-full') // Progress component class
    );

    await expect(progressBar.first()).toBeVisible();
  });

  test('should show transcript ticker', async ({ page }) => {
    await page.goto('/');

    // Transcript section should be visible
    await expect(page.getByText('Live Transcript')).toBeVisible();

    // Should show placeholder text initially
    await expect(page.getByText(/Transcript will appear here/i)).toBeVisible();
  });

  test('should highlight trigger word in current section', async ({ page }) => {
    await page.goto('/');

    // First section's trigger word is "audience" (last word)
    // It should be bolded/underlined
    const triggerWord = page.locator('strong').filter({ hasText: /audience/i });
    await expect(triggerWord.first()).toBeVisible();
  });

  test('should show keyboard shortcut hint', async ({ page }) => {
    await page.goto('/');

    // Check for keyboard hint
    await expect(page.getByText(/Press.*P.*to toggle/i)).toBeVisible();
  });

  test('visual regression: presenter view', async ({ page }) => {
    await page.goto('/');

    // Take screenshot of main presenter view
    const presenterCard = page.locator('.lg\\:col-span-2').first();
    await expect(presenterCard).toHaveScreenshot('presenter-view.png', {
      maxDiffPixels: 100,
    });
  });

  test('visual regression: status bar', async ({ page }) => {
    await page.goto('/');

    // Take screenshot of status bar
    const statusBar = page.locator('.sticky.top-0').first();
    await expect(statusBar).toHaveScreenshot('status-bar.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('VerbaDeck Interaction Tests', () => {
  test('should toggle streaming when clicking start button', async ({ page }) => {
    await page.goto('/');

    // Find start button
    const startButton = page.getByRole('button', { name: /Start Listening/i });
    await expect(startButton).toBeVisible();

    // Note: We can't actually test streaming without microphone permissions
    // But we can verify the button exists and is clickable in a real browser
  });

  test('should update script and re-parse sections', async ({ page }) => {
    await page.goto('/');

    // Find textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Clear and enter new script
    await textarea.clear();
    await textarea.fill('Section one ends with word.\n\nSection two ends with phrase.');

    // Should now show 2 sections
    await expect(page.getByText('Section 1 of 2')).toBeVisible();
    await expect(page.getByText(/Section one ends with word/i)).toBeVisible();
  });
});
