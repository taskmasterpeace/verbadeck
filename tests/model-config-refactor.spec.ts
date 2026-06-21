import { test, expect } from '@playwright/test';

test.describe('Model Configuration Refactoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Navigate to Settings tab
    const settingsTab = page.getByText('Settings', { exact: true });
    await settingsTab.click();
    await page.waitForTimeout(500);
  });

  test('should display configuration summary', async ({ page }) => {
    // Check for configuration summary section
    const summaryHeading = page.getByText('Current Configuration');
    await expect(summaryHeading).toBeVisible();
  });

  test('should show all four presets', async ({ page }) => {
    // Check for preset section
    const presetHeading = page.getByText('🎯 Quick Presets');
    await expect(presetHeading).toBeVisible();

    // Check for all 4 presets
    await expect(page.getByText('Maximum Speed')).toBeVisible();
    await expect(page.getByText('Balanced')).toBeVisible();
    await expect(page.getByText('Quality')).toBeVisible();
    await expect(page.getByText('Free Models')).toBeVisible();
  });

  test('should apply Maximum Speed preset', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('Settings', { exact: true }).click();

    // Click Maximum Speed preset
    const maxSpeedButton = page.getByRole('button', { name: /Maximum Speed/i });
    await maxSpeedButton.click();

    // Check for "Applied!" indicator
    await expect(page.getByText('✓ Applied!')).toBeVisible({ timeout: 2000 });

    // Verify localStorage was updated
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    // All operations should use Groq Llama model
    expect(savedConfig.generateQuestions).toBe('meta-llama/llama-3.1-8b-instruct');
    expect(savedConfig.processScript).toBe('meta-llama/llama-3.1-8b-instruct');
  });

  test('should apply Balanced preset', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByText('Settings', { exact: true }).click();

    // Click Balanced preset
    const balancedButton = page.getByRole('button', { name: /Balanced/i });
    await balancedButton.click();

    // Check for "Applied!" indicator
    await expect(page.getByText('✓ Applied!')).toBeVisible({ timeout: 2000 });

    // Verify localStorage has mixed models
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    // Should have both GPT-4o-mini and Groq models
    expect(savedConfig.generateQuestions).toBe('openai/gpt-4o-mini');
    expect(savedConfig.answerQuestion).toBe('meta-llama/llama-3.1-8b-instruct');
  });

  test('should show categories collapsed/expanded', async ({ page }) => {
    // Check for category section
    const categoryHeading = page.getByText('⚙️ Configure by Feature Area');
    await expect(categoryHeading).toBeVisible();

    // First category (Create from Scratch) should be expanded by default
    const createCategory = page.getByRole('button', { name: /Create from Scratch/i });
    await expect(createCategory).toBeVisible();

    // Check that expanded content is visible
    await expect(page.getByText('Apply to all')).toBeVisible();

    // Click to collapse
    await createCategory.click();
    await page.waitForTimeout(300);

    // Content should be hidden
    await expect(page.getByText('Apply to all')).not.toBeVisible();
  });

  test('should change individual operation model', async ({ page }) => {
    // Expand Create from Scratch category
    const createCategory = page.getByRole('button', { name: /Create from Scratch/i });

    // Get first operation dropdown
    const firstSelect = page.locator('select').first();
    await expect(firstSelect).toBeVisible();

    // Change to Claude model
    await firstSelect.selectOption('anthropic/claude-3.5-sonnet');

    // Verify localStorage was updated
    await page.waitForTimeout(500);
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    // At least one operation should now use Claude
    const values = Object.values(savedConfig);
    expect(values).toContain('anthropic/claude-3.5-sonnet');
  });

  test('should apply model to entire category', async ({ page }) => {
    // Expand Q&A Mode category
    const qaCategory = page.getByRole('button', { name: /Q&A Mode/i });
    await qaCategory.click();
    await page.waitForTimeout(300);

    // Find and use the category bulk changer
    const categorySelect = page.locator('select').filter({ hasText: '-- Select model to apply --' }).first();
    await expect(categorySelect).toBeVisible();

    // Apply Claude to all operations in this category
    await categorySelect.selectOption('anthropic/claude-3.5-sonnet');
    await page.waitForTimeout(500);

    // Verify localStorage
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    // Q&A operations should use Claude
    expect(savedConfig.answerQuestion).toBe('anthropic/claude-3.5-sonnet');
    expect(savedConfig.generateFAQs).toBe('anthropic/claude-3.5-sonnet');
  });

  test('should show help section when expanded', async ({ page }) => {
    // Find and click help button
    const helpButton = page.getByRole('button', { name: /Model Information & Tips/i });
    await expect(helpButton).toBeVisible();
    await helpButton.click();
    await page.waitForTimeout(300);

    // Check help content is visible
    await expect(page.getByText('🔖 Model Capability Icons')).toBeVisible();
    await expect(page.getByText('📊 Recommended Strategy')).toBeVisible();
    await expect(page.getByText('Groq Llama 3.1 8B')).toBeVisible();
  });

  test('should reset to server defaults', async ({ page }) => {
    // Apply a preset first
    const maxSpeedButton = page.getByRole('button', { name: /Maximum Speed/i });
    await maxSpeedButton.click();
    await page.waitForTimeout(1000);

    // Click reset button
    const resetButton = page.getByRole('button', { name: /Reset to Server Defaults/i });
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify localStorage has server defaults
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    // Should match server defaults (balanced mix)
    expect(savedConfig.generateQuestions).toBe('openai/gpt-4o-mini');
    expect(savedConfig.answerQuestion).toBe('meta-llama/llama-3.1-8b-instruct');
  });

  test('should persist configuration across page reloads', async ({ page }) => {
    // Apply Quality preset
    const qualityButton = page.getByRole('button', { name: /Quality/i });
    await qualityButton.click();
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Navigate back to Settings
    await page.getByText('Settings', { exact: true }).click();
    await page.waitForTimeout(500);

    // Verify configuration persisted
    const savedConfig = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('verbadeck-operation-models') || '{}')
    );

    expect(savedConfig.generateQuestions).toBe('anthropic/claude-3.5-sonnet');
    expect(savedConfig.processScript).toBe('anthropic/claude-3.5-sonnet');
  });

  test('should show model badges correctly', async ({ page }) => {
    // Expand a category
    const createCategory = page.getByRole('button', { name: /Create from Scratch/i });

    // Look for model badges
    await expect(page.getByText('⚡ Fast & Cheap', { exact: false })).toBeVisible();
    // Or Quality badge, depending on current config
  });

  test('should expand/collapse operation details', async ({ page }) => {
    // Find an expand button (chevron) for an operation
    const expandButton = page.locator('button[title="Show details"]').first();
    await expect(expandButton).toBeVisible();

    // Click to expand
    await expandButton.click();
    await page.waitForTimeout(300);

    // Should show Operation ID
    await expect(page.getByText('Operation ID:')).toBeVisible();
    await expect(page.getByText('Cost:')).toBeVisible();
    await expect(page.getByText('Context:')).toBeVisible();
  });
});
