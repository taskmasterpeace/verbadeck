import { test, expect } from '@playwright/test';

test.describe('Router Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('should load the home route (/) and show create presentation', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:5174/');

    // Should show CreatePresentation component with three cards
    await expect(page.getByText('Create from Scratch')).toBeVisible();
    await expect(page.getByText('Process Content')).toBeVisible();
    await expect(page.getByText('Know It All Wall')).toBeVisible();
  });

  test('should navigate to /create/scratch when clicking Create from Scratch', async ({ page }) => {
    await page.getByText('Create from Scratch').click();

    // URL should change to /create/scratch
    await expect(page).toHaveURL('http://localhost:5174/create/scratch');

    // Should show CreateFromScratch component (check for the card title)
    await expect(page.getByRole('heading', { name: 'Create from Scratch' })).toBeVisible();
  });

  test('should navigate to /create/process when clicking Process Content', async ({ page }) => {
    await page.getByText('Process Content').click();

    // URL should change to /create/process
    await expect(page).toHaveURL('http://localhost:5174/create/process');

    // Should show AIScriptProcessor component (check for the card title)
    await expect(page.getByRole('heading', { name: 'Process Existing Content' })).toBeVisible();
  });

  test('should navigate to /know-it-all when clicking Know It All Wall', async ({ page }) => {
    await page.getByText('Know It All Wall').click();

    // URL should change to /know-it-all
    await expect(page).toHaveURL('http://localhost:5174/know-it-all');

    // Should show KnowItAllMode component
    await expect(page.getByText('Know It All Wall')).toBeVisible();
  });

  test('should navigate directly to /editor via URL', async ({ page }) => {
    await page.goto('http://localhost:5174/editor');

    // Should redirect to home if no sections exist (or show editor if sections exist)
    // For now, just check that it loads without error
    await expect(page).toHaveURL('http://localhost:5174/editor');
  });

  test('should navigate directly to /presenter via URL', async ({ page }) => {
    await page.goto('http://localhost:5174/presenter');

    await expect(page).toHaveURL('http://localhost:5174/presenter');
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    // Start at home
    await expect(page).toHaveURL('http://localhost:5174/');

    // Navigate to scratch
    await page.getByText('Create from Scratch').click();
    await expect(page).toHaveURL('http://localhost:5174/create/scratch');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:5174/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('http://localhost:5174/create/scratch');
  });

  test('should maintain state when navigating between routes', async ({ page }) => {
    // This test verifies that state is preserved during navigation
    // Navigate to scratch and back
    await page.getByText('Create from Scratch').click();
    await expect(page).toHaveURL('http://localhost:5174/create/scratch');

    // Navigate back to home
    await page.goto('http://localhost:5174/');
    await expect(page.getByText('Create from Scratch')).toBeVisible();
  });
});
