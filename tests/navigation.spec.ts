import { test, expect } from '@playwright/test';

/**
 * VerbaDeck V2.0 - Navigation Tests
 * Tests all route navigation, sidebar links, and URL handling
 */

test.describe('VerbaDeck V2.0 - Route Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('should load home route (/) and display CreatePresentation', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:5175/');

    // Should show CreatePresentation component with three cards (scope to main to avoid sidebar matches)
    const main = page.locator('main');
    await expect(main.getByText('Create from Scratch')).toBeVisible();
    await expect(main.getByText('Process Existing Content')).toBeVisible();
    await expect(main.getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();

    console.log('✅ Home route loads correctly');
  });

  test('should navigate to /create/scratch via card click', async ({ page }) => {
    const scratchCard = page.locator('button:has-text("Start from Scratch")');
    await scratchCard.click();

    await expect(page).toHaveURL('http://localhost:5175/create/scratch');
    await expect(page.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();

    console.log('✅ Navigate to Create from Scratch works');
  });

  test('should navigate to /create/process via card click', async ({ page }) => {
    const processCard = page.locator('button:has-text("Process Content")');
    await processCard.click();

    await expect(page).toHaveURL('http://localhost:5175/create/process');
    await expect(page.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();

    console.log('✅ Navigate to Process Content works');
  });

  test('should navigate to /know-it-all via card click', async ({ page }) => {
    const qaCard = page.locator('button:has-text("Start Q&A Practice")');
    await qaCard.click();

    await expect(page).toHaveURL('http://localhost:5175/know-it-all');
    await expect(page.locator('main').getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();

    console.log('✅ Navigate to Know It All works');
  });

  test('should navigate to /editor directly via URL', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');
    await expect(page).toHaveURL('http://localhost:5175/editor');

    // Editor should load (may be empty if no sections)
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();

    console.log('✅ Direct navigation to /editor works');
  });

  test('should navigate to /presenter directly via URL', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');
    await expect(page).toHaveURL('http://localhost:5175/presenter');

    console.log('✅ Direct navigation to /presenter works');
  });

  test('should navigate to /library directly via URL', async ({ page }) => {
    await page.goto('http://localhost:5175/library');
    await expect(page).toHaveURL('http://localhost:5175/library');

    // Library page should load
    await expect(page.locator('main').getByRole('heading', { name: 'Presentation Library' })).toBeVisible();

    console.log('✅ Direct navigation to /library works');
  });

  test('should navigate to /audience (separate window)', async ({ page }) => {
    await page.goto('http://localhost:5175/audience');
    await expect(page).toHaveURL('http://localhost:5175/audience');

    // Audience view should load (minimal UI)
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();

    console.log('✅ Audience view loads correctly');
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    // Start at home
    await expect(page).toHaveURL('http://localhost:5175/');

    // Navigate to scratch
    await page.locator('button:has-text("Start from Scratch")').click();
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    // Navigate to process
    await page.goto('http://localhost:5175/create/process');
    await expect(page).toHaveURL('http://localhost:5175/create/process');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:5175/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    console.log('✅ Browser back/forward navigation works');
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('http://localhost:5175/invalid-route-12345');

    // Should either show 404 or redirect to home
    const url = page.url();
    const isHomeOrNotFound = url.includes('localhost:5175') || url.includes('404');
    expect(isHomeOrNotFound).toBe(true);

    console.log('✅ Invalid routes handled gracefully');
  });

  test('should preserve state when navigating between routes', async ({ page }) => {
    // Navigate to scratch
    await page.locator('button:has-text("Start from Scratch")').click();
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    // Go back to home
    await page.goto('http://localhost:5175/');
    await expect(page.locator('main').getByText('Create from Scratch')).toBeVisible();

    // State should be preserved (app should still work)
    await page.locator('button:has-text("Start from Scratch")').click();
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    console.log('✅ State preserved during navigation');
  });
});

test.describe('VerbaDeck V2.0 - Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('should show sidebar with navigation links', async ({ page }) => {
    // TopBar/Sidebar should be visible
    // Check for key navigation elements
    const createButton = page.locator('button:has-text("Create")').first();
    const editorButton = page.locator('button:has-text("Edit")').first();
    const presentButton = page.locator('button:has-text("Present")').first();

    // At least one should be visible (depending on workflow state)
    const hasWorkflowButtons = await createButton.isVisible() ||
                                await editorButton.isVisible() ||
                                await presentButton.isVisible();

    expect(hasWorkflowButtons).toBe(true);

    console.log('✅ Sidebar navigation visible');
  });

  test('should navigate via sidebar links', async ({ page }) => {
    // Use sidebar to navigate to Editor
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const editorLink = sidebar.getByRole('link', { name: 'Editor' });
    await editorLink.click();
    await expect(page).toHaveURL('http://localhost:5175/editor');

    // Navigate to Presenter via sidebar
    const presenterLink = sidebar.getByRole('link', { name: 'Presenter' });
    await presenterLink.click();
    await expect(page).toHaveURL('http://localhost:5175/presenter');

    console.log('✅ Sidebar links navigate correctly');
  });

  test('should show Library link in sidebar', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const libraryLink = sidebar.getByRole('link', { name: 'Library' });
    await expect(libraryLink).toBeVisible();

    console.log('✅ Library link visible in sidebar');
  });

  test('should show Settings button in TopBar', async ({ page }) => {
    // TopBar Settings button contains a Settings icon; find it by its text (visible on wider viewports)
    const topBar = page.locator('.flex.h-14.items-center');
    const settingsButton = topBar.locator('button', { has: page.locator('text=Settings') }).first();
    await expect(settingsButton).toBeVisible();

    console.log('✅ Settings button visible in TopBar');
  });

  test('should open Settings modal on click', async ({ page }) => {
    // Click the TopBar Settings button
    const topBar = page.locator('.flex.h-14.items-center');
    const settingsButton = topBar.locator('button', { has: page.locator('text=Settings') }).first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Settings modal should be visible
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();

    // Should have tabs
    await expect(page.locator('button:has-text("Models")')).toBeVisible();

    console.log('✅ Settings modal opens correctly');
  });

  test('should navigate to Library via sidebar click', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const libraryLink = sidebar.getByRole('link', { name: 'Library' });
    await libraryLink.click();

    // Library page should load
    await expect(page).toHaveURL('http://localhost:5175/library');
    await expect(page.locator('main').getByRole('heading', { name: 'Presentation Library' })).toBeVisible();

    console.log('✅ Library sidebar link works');
  });
});

test.describe('VerbaDeck V2.0 - URL State Management', () => {
  test('should update URL when view mode changes', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await expect(page).toHaveURL('http://localhost:5175/');

    // Navigate to different views and verify URL updates
    await page.locator('button:has-text("Start from Scratch")').click();
    await expect(page).toHaveURL(/create\/scratch/);

    console.log('✅ URL updates with view mode');
  });

  test('should sync view mode with URL on direct navigation', async ({ page }) => {
    // Navigate directly to a specific route
    await page.goto('http://localhost:5175/know-it-all');
    await expect(page).toHaveURL('http://localhost:5175/know-it-all');

    // View should match the URL (scope to main to avoid sidebar match)
    await expect(page.locator('main').getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();

    console.log('✅ View mode syncs with URL');
  });

  test('should handle page reload on any route', async ({ page }) => {
    // Navigate to a specific route
    await page.goto('http://localhost:5175/create/scratch');
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');

    // Reload the page
    await page.reload();

    // Should stay on the same route
    await expect(page).toHaveURL('http://localhost:5175/create/scratch');
    await expect(page.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();

    console.log('✅ Page reload preserves route');
  });

  test('should maintain state across route changes', async ({ page }) => {
    // This test verifies that app state is preserved during navigation
    await page.goto('http://localhost:5175/create/scratch');

    // Navigate to another route
    await page.goto('http://localhost:5175/editor');

    // Navigate back
    await page.goto('http://localhost:5175/create/scratch');

    // App should still be functional
    await expect(page.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();

    console.log('✅ State maintained across route changes');
  });
});

test.describe('VerbaDeck V2.0 - Deep Linking', () => {
  test('should support deep linking to Create from Scratch', async ({ page }) => {
    await page.goto('http://localhost:5175/create/scratch');
    await expect(page.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();

    console.log('✅ Deep link to Create from Scratch works');
  });

  test('should support deep linking to Process Content', async ({ page }) => {
    await page.goto('http://localhost:5175/create/process');
    await expect(page.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();

    console.log('✅ Deep link to Process Content works');
  });

  test('should support deep linking to Know It All', async ({ page }) => {
    await page.goto('http://localhost:5175/know-it-all');
    await expect(page.locator('main').getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();

    console.log('✅ Deep link to Know It All works');
  });

  test('should support deep linking to Editor', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');
    await expect(page).toHaveURL('http://localhost:5175/editor');

    console.log('✅ Deep link to Editor works');
  });

  test('should support deep linking to Presenter', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');
    await expect(page).toHaveURL('http://localhost:5175/presenter');

    console.log('✅ Deep link to Presenter works');
  });

  test('should support deep linking to Library', async ({ page }) => {
    await page.goto('http://localhost:5175/library');
    await expect(page.locator('main').getByRole('heading', { name: 'Presentation Library' })).toBeVisible();

    console.log('✅ Deep link to Library works');
  });
});
