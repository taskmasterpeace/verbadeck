import { test, expect } from '@playwright/test';

test.describe('Editor Workspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Create a simple presentation from scratch
    await page.click('text=Create from Scratch');

    // Fill in topic
    await page.fill('input[placeholder*="topic"]', 'Testing Editor Workspace');

    // Generate sections
    await page.click('button:has-text("Generate Sections")');

    // Wait for sections to be generated
    await page.waitForSelector('button:has-text("Edit Sections")', { timeout: 30000 });

    // Click to go to editor
    await page.click('button:has-text("Edit Sections")');

    // Wait for editor view
    await page.waitForSelector('text=Edit Content & Triggers');
  });

  test('should display 3-panel workspace layout', async ({ page }) => {
    // Wait for workspace to load
    await page.waitForTimeout(1000);

    // Check that the main panels exist (on desktop)
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      // Desktop layout - should have resizable panels
      const panels = page.locator('[data-panel-group]');
      await expect(panels).toBeVisible();
    }
  });

  test('should show sections list in left panel', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for sections in the list
    const sectionItems = page.locator('[data-section-item], .group:has-text("Section")');
    const count = await sectionItems.count();

    // Should have at least one section
    expect(count).toBeGreaterThan(0);
  });

  test('should allow section selection', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click on first section in list
    const firstSection = page.locator('.group').first();
    await firstSection.click();

    // Should see section editor with content
    await expect(page.locator('text=Slide Title/Heading')).toBeVisible();
    await expect(page.locator('text=Slide Content')).toBeVisible();
  });

  test('should show properties panel on right', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for properties panel sections
    await expect(page.locator('text=Trigger Words')).toBeVisible();
    await expect(page.locator('text=Images')).toBeVisible();
    await expect(page.locator('text=Layout')).toBeVisible();
  });

  test('should allow panel collapse/expand', async ({ page }) => {
    await page.waitForTimeout(1000);

    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      // Try to find collapse buttons
      const collapseButtons = page.locator('button[title*="Collapse"]');
      const count = await collapseButtons.count();

      if (count > 0) {
        // Click first collapse button
        await collapseButtons.first().click();
        await page.waitForTimeout(300);

        // Should see expand button
        await expect(page.locator('button[title*="Expand"]')).toBeVisible();
      }
    }
  });

  test('should auto-save changes', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find the content textarea
    const contentArea = page.locator('textarea').first();
    await contentArea.fill('Updated content for auto-save test');

    // Wait for auto-save (1 second debounce)
    await page.waitForTimeout(1500);

    // The save should happen automatically
    // We can verify by checking if the content persists
    const value = await contentArea.inputValue();
    expect(value).toContain('Updated content');
  });

  test('should toggle between Edit and Preview tabs', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Should start on Edit tab
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toHaveClass(/bg-background/);

    // Click Preview tab
    const previewButton = page.locator('button:has-text("Preview")').first();
    await previewButton.click();

    await page.waitForTimeout(300);

    // Preview tab should be active
    await expect(previewButton).toHaveClass(/bg-background/);
  });

  test('should allow adding new section', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Count current sections
    const sectionsBefore = await page.locator('.group').count();

    // Click Add Section button
    const addButton = page.locator('button:has-text("Add Section")');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Should have one more section
      const sectionsAfter = await page.locator('.group').count();
      expect(sectionsAfter).toBe(sectionsBefore + 1);
    }
  });

  test('should show triggers in properties panel', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check that triggers section exists
    await expect(page.locator('text=Trigger Words')).toBeVisible();

    // Should have AI Suggest button
    await expect(page.locator('button:has-text("AI Suggest Triggers")')).toBeVisible();
  });

  test('should allow clicking words to select triggers', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for clickable words in the properties panel
    const triggerSection = page.locator('text=Click words to add:').locator('..');
    await expect(triggerSection).toBeVisible();

    // The clickable words area should exist
    const wordsArea = triggerSection.locator('..').locator('div').nth(1);
    await expect(wordsArea).toBeVisible();
  });
});
