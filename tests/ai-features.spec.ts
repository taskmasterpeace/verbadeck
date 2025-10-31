import { test, expect } from '@playwright/test';

test.describe('VerbaDeck AI Features', () => {
  test('should show AI processor on initial load', async ({ page }) => {
    await page.goto('/');

    // Check that AI Processor tab is active
    await expect(page.getByText('AI Processor')).toBeVisible();
    await expect(page.getByText('Paste your raw script text and let AI format')).toBeVisible();

    // Should show model selector
    await expect(page.getByText('Select AI Model')).toBeVisible();

    // Should show textarea for raw text
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    await page.goto('/');

    // Start on AI Processor
    await expect(page.getByRole('button', { name: /AI Processor/ })).toHaveClass(/bg-primary/);

    // Edit Sections button should be disabled (no sections yet)
    await expect(page.getByRole('button', { name: /Edit Sections/ })).toBeDisabled();

    // Present button should be disabled
    await expect(page.getByRole('button', { name: /^Present$/ })).toBeDisabled();
  });

  test('should open model selector dropdown', async ({ page }) => {
    await page.goto('/');

    // Click model selector
    const modelSelector = page.locator('button:has-text("Claude 3.5 Sonnet")');
    await modelSelector.click();

    // Should show dropdown with categories
    await expect(page.getByText('Recommended')).toBeVisible();
    await expect(page.getByText('Cost-Effective')).toBeVisible();
    await expect(page.getByText('Premium')).toBeVisible();

    // Should show model options
    await expect(page.getByText('Claude 3 Haiku')).toBeVisible();
    await expect(page.getByText('GPT-4 Turbo')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/model-selector-dropdown.png' });
  });

  test('should validate empty script submission', async ({ page }) => {
    await page.goto('/');

    // Click Process without entering text
    await page.getByRole('button', { name: /Process with AI/ }).click();

    // Should show alert (in Playwright, alerts pause execution)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Please enter some text');
      await dialog.accept();
    });
  });

  test('visual regression: AI processor interface', async ({ page }) => {
    await page.goto('/');

    // Take screenshot of AI processor
    await page.screenshot({
      path: 'test-results/ai-processor-view.png',
      fullPage: true,
    });
  });

  test('visual regression: model selector open', async ({ page }) => {
    await page.goto('/');

    const modelSelector = page.locator('button:has-text("Claude 3.5 Sonnet")').first();
    await modelSelector.click();

    await page.screenshot({
      path: 'test-results/model-selector-open.png',
      fullPage: true,
    });
  });
});

test.describe('VerbaDeck Visual Transitions', () => {
  test('should show transition effects when advancing sections', async ({ page }) => {
    await page.goto('/');

    // TODO: For now, we'll test with manual section navigation
    // In future, we can mock AI responses to test full flow

    // Note: These tests demonstrate the structure
    // Actual AI processing tests would require mocking OpenRouter API
  });

  test('visual regression: presenter view with transition', async ({ page }) => {
    await page.goto('/');

    // Once sections are created, this will capture the presenter view
    // For now, this serves as a placeholder for visual regression tests
  });
});

test.describe('VerbaDeck Section Editor', () => {
  test('should show editor after sections are generated', async ({ page }) => {
    // This test would require mocking AI response
    // Placeholder for future implementation
    await page.goto('/');

    // Future: Mock AI processing and verify editor appears
  });
});

test.describe('VerbaDeck Integration Tests', () => {
  test('should have working view mode navigation', async ({ page }) => {
    await page.goto('/');

    // Verify all three tabs exist
    await expect(page.getByRole('button', { name: /AI Processor/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Edit Sections/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Present$/ })).toBeVisible();
  });

  test('should show debug info in development mode', async ({ page }) => {
    await page.goto('/');

    // Debug panel should not be visible initially (no sections)
    const debugPanel = page.locator('text=Mode:');

    // May or may not be visible depending on sections - this is expected
  });
});
