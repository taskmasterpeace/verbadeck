import { test, expect } from '@playwright/test';

test.describe('Prompt Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should open Settings modal and navigate to Prompts tab', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Click Settings button
    await page.getByRole('button', { name: /Settings/i }).click();

    // Wait for modal to appear
    await expect(page.getByText('Settings & Help')).toBeVisible();

    // Click Prompts tab
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Should show prompt editor
    await expect(page.getByText('Prompt Editor (Developer Mode)')).toBeVisible();
    await expect(page.getByText(/Edit AI prompts to fine-tune responses/i)).toBeVisible();
  });

  test('should expand operation and show prompt editor', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Expand processScript operation
    await page.getByText('processScript').click();

    // Should show editor textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Should show prompt content
    const promptText = await textarea.inputValue();
    expect(promptText.length).toBeGreaterThan(100); // Prompt should have substantial content
    expect(promptText).toContain('JSON'); // All prompts should mention JSON format
  });

  test('should edit, save, and persist prompt', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Expand suggestTriggers (simpler prompt)
    await page.getByText('suggestTriggers').click();

    // Wait for textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Get original prompt
    const originalPrompt = await textarea.inputValue();

    // Edit the prompt
    const customPrompt = originalPrompt + '\n\n// CUSTOM EDIT FOR TESTING';
    await textarea.fill(customPrompt);

    // Should show unsaved changes indicator
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    // Save button should be enabled
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Should show saved state
    await expect(page.getByText('Saved!')).toBeVisible({ timeout: 2000 });

    // Should show "Modified" badge on the button
    await expect(page.getByRole('button', { name: /suggestTriggers Modified/i })).toBeVisible();

    // Close and reopen to verify persistence
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();
    await page.getByText('suggestTriggers').click();

    // Should still have custom edit
    const savedPrompt = await textarea.inputValue();
    expect(savedPrompt).toBe(customPrompt);
    await expect(page.getByRole('button', { name: /suggestTriggers Modified/i })).toBeVisible();
  });

  test('should reset individual prompt to default', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts and edit a prompt
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();
    await page.getByText('suggestTriggers').click();

    const textarea = page.locator('textarea');
    const originalPrompt = await textarea.inputValue();

    // Make an edit and save
    await textarea.fill(originalPrompt + '\n\nCUSTOM EDIT');
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page.getByText('Saved!')).toBeVisible({ timeout: 2000 });

    // Click Reset to Default
    await page.getByRole('button', { name: /Reset to Default/i }).click();

    // Should restore original prompt
    const restoredPrompt = await textarea.inputValue();
    expect(restoredPrompt).toBe(originalPrompt);

    // Modified badge should be gone - check the count shows 0
    await expect(page.getByText(/0 of \d+ prompts modified/)).toBeVisible();
  });

  test('should reset all prompts to defaults', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Edit two different prompts
    await page.getByText('suggestTriggers').click();
    let textarea = page.locator('textarea');
    await textarea.fill((await textarea.inputValue()) + '\n\nEDIT 1');
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page.getByText('Saved!')).toBeVisible({ timeout: 2000 });

    // Collapse first, expand second
    await page.getByText('suggestTriggers').click();
    await page.getByText('generateFAQs').click();
    textarea = page.locator('textarea');
    await textarea.fill((await textarea.inputValue()) + '\n\nEDIT 2');
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page.getByText('Saved!')).toBeVisible({ timeout: 2000 });

    // Should show "2 of X prompts modified"
    await expect(page.getByText(/2 of \d+ prompts modified/)).toBeVisible();

    // Click Reset All (with confirmation)
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Reset All to Defaults/i }).click();

    // Should show "0 of X prompts modified"
    await expect(page.getByText(/0 of \d+ prompts modified/)).toBeVisible();

    // Reset All button should be disabled
    await expect(page.getByRole('button', { name: /Reset All to Defaults/i })).toBeDisabled();
  });

  test('should display parameters info for each operation', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Expand answerQuestion (has complex parameters)
    await page.getByText('answerQuestion').click();

    // Should show parameters section
    await expect(page.getByText('Parameters:')).toBeVisible();

    // Should show parameter values in JSON format
    const parametersText = await page.locator('pre').textContent();
    expect(parametersText).toContain('question');
    expect(parametersText).toContain('presentationContent');
  });

  test('should show warning about JSON format requirements', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open Settings > Prompts
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();

    // Should show warning
    await expect(page.getByText(/Warning:/i)).toBeVisible();
    await expect(page.getByText(/Editing prompts can break JSON output/i)).toBeVisible();
  });

  test('should persist prompts across page reloads', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Edit and save a prompt
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();
    await page.getByText('suggestTriggers').click();

    const textarea = page.locator('textarea');
    const customPrompt = (await textarea.inputValue()) + '\n\n// TEST PERSISTENCE';
    await textarea.fill(customPrompt);
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page.getByText('Saved!')).toBeVisible({ timeout: 2000 });

    // Reload the entire page
    await page.reload();

    // Re-open settings
    await page.getByRole('button', { name: /Settings/i }).click();
    await page.getByRole('button', { name: /📝 Prompts/i }).click();
    await page.getByText('suggestTriggers').click();

    // Should still have the custom prompt
    const persistedPrompt = await page.locator('textarea').inputValue();
    expect(persistedPrompt).toBe(customPrompt);
  });
});
