import { test, expect } from '@playwright/test';

test.describe('Goal Picker - Process Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/create/process');
    await page.waitForLoadState('networkidle');
  });

  test('shows goal picker when unstructured text is entered and Process clicked', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('I want to talk about our new product launch and how it will change the market.');
    await page.locator('button:has-text("Process with AI")').click();
    await expect(page.getByText('What type of presentation is this?')).toBeVisible();
    await expect(page.getByText('Pitch')).toBeVisible();
    await expect(page.getByText('Training')).toBeVisible();
    await expect(page.getByText('Status Update')).toBeVisible();
    await expect(page.getByText('Keynote')).toBeVisible();
  });

  test('skip link bypasses goal picker', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('Some unstructured content about our product.');
    await page.locator('button:has-text("Process with AI")').click();
    await page.getByText('Skip').click();
    // Goal picker should be hidden
    await expect(page.getByText('What type of presentation is this?')).not.toBeVisible();
  });

  test('does NOT show goal picker for structured text with SECTION markers', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('SECTION 1: INTRODUCTION\nHello world.\n\nSECTION 2: BODY\nMain content here.');
    await page.locator('button:has-text("Process with AI")').click();
    // Should NOT show goal picker - goes straight to processing
    await expect(page.getByText('What type of presentation is this?')).not.toBeVisible();
  });
});

test.describe('Q&A Side Panel', () => {
  test('Q&A button visible in presenter TopBar', async ({ page }) => {
    // Load a presentation via auto-save
    const fakeAutoSave = JSON.stringify({
      version: '1.0', title: 'Test', created: new Date().toISOString(), modified: new Date().toISOString(),
      sections: [
        { id: '1', heading: 'Slide 1', content: 'Test content for slide one.', advanceToken: 'next', selectedTriggers: ['next'] },
        { id: '2', heading: 'Slide 2', content: 'Test content for slide two.', advanceToken: 'done', selectedTriggers: ['done'] },
      ],
      knowledgeBase: [], settings: {}, metadata: {},
    });

    await page.goto('http://localhost:5174');
    await page.evaluate((d) => localStorage.setItem('verbadeck-autosave', d), fakeAutoSave);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByTestId('resume-recovery').click();
    await page.waitForLoadState('networkidle');

    // Navigate to presenter
    await page.click('a:has-text("Presenter")');
    await page.waitForTimeout(1000);

    // Q&A mode toggle should be visible in presenter view
    await expect(page.getByText('Q&A Mode', { exact: false })).toBeVisible();
  });
});
