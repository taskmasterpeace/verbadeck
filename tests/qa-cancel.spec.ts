import { test, expect } from '@playwright/test';

test.describe('Q&A Cancel Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
  });

  test('should show cancel button and cancel word in settings', async ({ page }) => {
    // Click settings button
    await page.getByTitle('Settings & Help').click();

    // Check that Q&A Cancel Word section is visible
    await expect(page.getByText('Q&A Cancel Word')).toBeVisible();

    // Check default cancel word input
    const cancelWordInput = page.getByPlaceholder('cancel');
    await expect(cancelWordInput).toBeVisible();
    await expect(cancelWordInput).toHaveValue('cancel');

    // Test changing cancel word
    await cancelWordInput.fill('stop');
    await expect(cancelWordInput).toHaveValue('stop');

    // Close settings
    await page.getByRole('button', { name: 'Close' }).last().click();
  });

  test('should show cancel button when Q&A is processing', async ({ page }) => {
    // First, create a simple presentation
    await page.getByText('Process Existing Content').click();

    // Fill in script
    const scriptText = `Welcome to my presentation about AI.

    What is artificial intelligence?

    Thank you for your attention.`;

    await page.getByPlaceholder('Paste your presentation script').fill(scriptText);
    await page.getByRole('button', { name: /Generate with AI/ }).click();

    // Wait for processing to complete
    await page.waitForSelector('text=Edit Sections', { timeout: 30000 });

    // Switch to presenter mode
    await page.getByRole('button', { name: /Present/ }).click();

    // Enable Q&A mode
    await page.getByRole('button', { name: /Q&A/ }).click();

    // Manually ask a question (to trigger the Q&A panel)
    await page.getByRole('button', { name: 'Ask' }).click();

    // Type a question
    await page.getByPlaceholder('Type your question').fill('What is AI?');
    await page.getByRole('button', { name: 'Submit Question' }).click();

    // Wait for Q&A panel to show loading state
    await expect(page.getByText('Generating answers with AI')).toBeVisible({ timeout: 5000 });

    // Check that cancel button appears
    await expect(page.getByRole('button', { name: 'Cancel Question' })).toBeVisible();

    // Check that cancel word instruction appears
    await expect(page.getByText('Say "cancel" to cancel this question')).toBeVisible();

    // Click cancel button
    await page.getByRole('button', { name: 'Cancel Question' }).click();

    // Q&A panel should close after cancel
    await expect(page.getByText('Generating answers with AI')).not.toBeVisible({ timeout: 3000 });
  });
});
