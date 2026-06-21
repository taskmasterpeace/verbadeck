import { test, expect } from '@playwright/test';

test.describe('Sidebar Layout Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5177/demo/layout');
  });

  test('should render the page without errors', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    await expect(page.locator('body')).toBeVisible();

    // Take a screenshot to verify basic layout
    await page.screenshot({ path: 'tests/screenshots/sidebar-layout-home.png' });
  });

  test('should have functional sidebar navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if sidebar is visible (desktop view)
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Check for navigation items
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Create')).toBeVisible();
    await expect(page.getByText('Editor')).toBeVisible();
    await expect(page.getByText('Presenter')).toBeVisible();
    await expect(page.getByText('Know It All')).toBeVisible();
    await expect(page.getByText('Library')).toBeVisible();
  });

  test('should verify responsive design', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/sidebar-layout-desktop.png' });

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/sidebar-layout-tablet.png' });

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/sidebar-layout-mobile.png' });
  });
});
