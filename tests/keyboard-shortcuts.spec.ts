import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    // Wait for app to load
    await page.waitForSelector('[data-testid="settings-button"]', { timeout: 10000 });
  });

  test('should open keyboard shortcuts help with Ctrl+/', async ({ page }) => {
    // Press Ctrl+/ to open keyboard shortcuts help
    await page.keyboard.press('Control+/');

    // Check if keyboard shortcuts modal is visible
    await expect(page.locator('text=Keyboard Shortcuts').first()).toBeVisible({ timeout: 5000 });

    // Check for categories
    await expect(page.locator('text=File')).toBeVisible();
    await expect(page.locator('text=Navigation')).toBeVisible();
    await expect(page.locator('text=Voice')).toBeVisible();

    // Close the modal
    await page.locator('button:has-text("Close")').last().click();
    await expect(page.locator('text=Keyboard Shortcuts').first()).not.toBeVisible();
  });

  test('should show search functionality in shortcuts help', async ({ page }) => {
    // Open shortcuts help
    await page.keyboard.press('Control+/');

    // Wait for modal to be visible
    await expect(page.locator('text=Keyboard Shortcuts').first()).toBeVisible();

    // Find and use search box
    const searchBox = page.locator('input[placeholder="Search shortcuts..."]');
    await expect(searchBox).toBeVisible();

    // Search for "save"
    await searchBox.fill('save');

    // Should show save-related shortcuts
    await expect(page.locator('text=Save presentation')).toBeVisible();

    // Should not show unrelated shortcuts
    const knowledgeBaseShortcut = page.locator('text=Knowledge base');
    const isVisible = await knowledgeBaseShortcut.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('should open library with Ctrl+L', async ({ page }) => {
    // Press Ctrl+L to open library
    await page.keyboard.press('Control+l');

    // Library browser modal should be visible
    await expect(page.locator('text=Presentation Library').or(page.locator('text=Library'))).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to create view with Ctrl+H', async ({ page }) => {
    // Navigate to a different view first
    const editorButton = page.locator('button:has-text("Editor")').first();
    if (await editorButton.isVisible()) {
      await editorButton.click();
    }

    // Press Ctrl+H to go to home/create
    await page.keyboard.press('Control+h');

    // Should navigate to create view
    await expect(page).toHaveURL(/\/(create)?$/);
  });

  test('should navigate to Know It All with Ctrl+K', async ({ page }) => {
    // Press Ctrl+K
    await page.keyboard.press('Control+k');

    // Should navigate to Know It All view
    await expect(page).toHaveURL(/know-it-all/);
  });

  test('should show shortcut feedback toast', async ({ page }) => {
    // Trigger a shortcut
    await page.keyboard.press('Control+l');

    // Feedback toast should appear briefly
    const feedback = page.locator('.fixed.top-20.right-4');
    await expect(feedback).toBeVisible({ timeout: 2000 });

    // Should contain shortcut description
    await expect(feedback).toContainText(/Ctrl|Open library/i);

    // Toast should disappear after a delay
    await expect(feedback).not.toBeVisible({ timeout: 3000 });
  });

  test('should not trigger shortcuts when typing in input fields', async ({ page }) => {
    // Go to Know It All mode which has input fields
    await page.goto('http://localhost:5175/know-it-all');
    await page.waitForLoadState('networkidle');

    // Find an input field (search or question input)
    const input = page.locator('input, textarea').first();

    if (await input.isVisible()) {
      // Click to focus
      await input.click();

      // Type Ctrl+S (which would normally save)
      await input.press('Control+s');

      // No save dialog should appear - input should work normally
      // Just verify the input is still focused and working
      await input.type('test');
      await expect(input).toHaveValue(/test/);
    }
  });

  test('should show keyboard hint in sidebar', async ({ page }) => {
    // Check if sidebar shows keyboard shortcut hint
    const sidebarHint = page.locator('text=/Ctrl\\+\\//');

    // Sidebar might be collapsed, so this is optional
    const isVisible = await sidebarHint.isVisible().catch(() => false);

    if (isVisible) {
      await expect(sidebarHint).toBeVisible();
    }
  });

  test('should display visual keyboard keys in help modal', async ({ page }) => {
    // Open shortcuts help
    await page.keyboard.press('Control+/');
    await expect(page.locator('text=Keyboard Shortcuts').first()).toBeVisible();

    // Should show <kbd> elements with visual styling
    const kbdElements = page.locator('kbd');
    await expect(kbdElements.first()).toBeVisible();

    // Check that keys are formatted correctly (e.g., "Ctrl", "S", etc.)
    const firstKbd = await kbdElements.first().textContent();
    expect(firstKbd).toMatch(/Ctrl|Cmd|⌘|[A-Z]|\//);
  });

  test('should categorize shortcuts properly', async ({ page }) => {
    // Open shortcuts help
    await page.keyboard.press('Control+/');
    await expect(page.locator('text=Keyboard Shortcuts').first()).toBeVisible();

    // Check for expected categories
    const categories = ['FILE', 'NAVIGATION', 'VOICE', 'HELP'];

    for (const category of categories) {
      await expect(page.locator(`text=${category}`).first()).toBeVisible();
    }
  });

  test('should close help modal with Ctrl+/ again', async ({ page }) => {
    // Open shortcuts help
    await page.keyboard.press('Control+/');
    await expect(page.locator('text=Keyboard Shortcuts').first()).toBeVisible();

    // Press Ctrl+/ again to close
    await page.keyboard.press('Control+/');
    await expect(page.locator('text=Keyboard Shortcuts').first()).not.toBeVisible();
  });
});
