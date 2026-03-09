import { test, expect } from '@playwright/test';

test.describe('Auto-Recovery Banner', () => {
  const AUTO_SAVE_KEY = 'verbadeck-autosave';

  const fakeAutoSave = JSON.stringify({
    version: '1.0',
    title: 'Auto-saved Presentation',
    created: new Date(Date.now() - 60000).toISOString(),
    modified: new Date(Date.now() - 60000).toISOString(),
    sections: [
      { id: '1', content: 'Slide one content', advanceToken: 'next', selectedTriggers: ['next'] },
      { id: '2', content: 'Slide two content', advanceToken: 'continue', selectedTriggers: ['continue'] },
      { id: '3', content: 'Slide three content', advanceToken: 'done', selectedTriggers: ['done'] },
    ],
    knowledgeBase: [],
    settings: { selectedTone: 'professional', selectedModel: 'openai/gpt-4o-mini' },
    metadata: { totalSlides: 3 },
  });

  test('shows recovery banner when auto-save data exists', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('3 slides');
  });

  test('does NOT show banner when no auto-save data', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate(() => localStorage.removeItem('verbadeck-autosave'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).not.toBeVisible();
  });

  test('dismiss button hides banner and clears auto-save', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toBeVisible();

    await page.getByTestId('dismiss-recovery').click();
    await expect(banner).not.toBeVisible();

    const autoSave = await page.evaluate(() => localStorage.getItem('verbadeck-autosave'));
    expect(autoSave).toBeNull();
  });

  test('resume button loads presentation and navigates to editor', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('resume-recovery').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/editor/);
    await expect(page.getByText('Slide one content').first()).toBeVisible({ timeout: 5000 });
  });

  test('banner shows relative time since last save', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.evaluate((data) => {
      localStorage.setItem('verbadeck-autosave', data);
    }, fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const banner = page.getByTestId('auto-recovery-banner');
    await expect(banner).toContainText(/ago/);
  });
});
