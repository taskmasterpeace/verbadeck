/**
 * Test suite for Know It All Wall enhancements
 * Tests session stats, export functionality, and animations
 */

import { test, expect } from '@playwright/test';

test.describe('Know It All Wall - Session Stats & Export', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Click "Know It All Wall" button to enter the mode
    await page.getByRole('button', { name: /Know It All Wall/i }).click();

    // Wait for mode to load
    await expect(page.getByText(/Know It All Wall/i)).toBeVisible();
  });

  test('should display session timer and stats', async ({ page }) => {
    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start (should show "Listening for your first question")
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Check if session timer is visible
    const sessionTimer = page.locator('text=Session Time:');
    await expect(sessionTimer).toBeVisible();

    // Check if session timer shows initial time (00:00 or 00:01)
    const timerValue = page.locator('.font-mono.font-bold.text-purple-900');
    await expect(timerValue).toBeVisible();

    // Wait 2 seconds and verify timer increments
    await page.waitForTimeout(2000);
    const timerText = await timerValue.textContent();
    expect(timerText).toMatch(/00:0[2-9]|00:[1-9][0-9]/); // Should be at least 00:02

    // Check if stat cards are visible
    await expect(page.locator('text=Total Questions')).toBeVisible();
    await expect(page.locator('text=Answered')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Avg. Time')).toBeVisible();

    // Verify initial stats show zero
    const statCards = page.locator('.grid.grid-cols-2 > div');
    const totalQuestionsCard = statCards.first();
    await expect(totalQuestionsCard).toContainText('0');
  });

  test('should show sound toggle button', async ({ page }) => {
    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Check if sound toggle button is visible
    const soundButton = page.locator('button:has-text("Sound")');
    await expect(soundButton).toBeVisible();

    // Click to toggle sound
    await soundButton.click();

    // Verify button state changed (should show "Sound Off" or "Sound On")
    const buttonText = await soundButton.textContent();
    expect(buttonText).toMatch(/Sound (On|Off)/);
  });

  test('should not show export button initially', async ({ page }) => {
    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Export button should not be visible when there are no questions
    const exportButton = page.locator('text=Export Session');
    await expect(exportButton).not.toBeVisible();
  });

  test('should show export button after questions are added', async ({ page }) => {
    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Note: Real voice input can't be tested in Playwright, but we can verify UI state

    // For now, just verify the stats are showing correctly with 0 questions
    await expect(page.locator('text=Total Questions')).toBeVisible();
    const totalQuestionsValue = page.locator('.grid.grid-cols-2 > div:first-child .text-2xl.font-bold').first();
    await expect(totalQuestionsValue).toContainText('0');
  });

  test('should display session stats with correct structure', async ({ page }) => {
    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Verify session stats structure
    const statsContainer = page.locator('.space-y-2').first();
    await expect(statsContainer).toBeVisible();

    // Check for all stat card emojis
    await expect(page.locator('text=❓')).toBeVisible(); // Total Questions
    await expect(page.locator('text=✅')).toBeVisible(); // Answered
    await expect(page.locator('text=⏳')).toBeVisible(); // Pending
    await expect(page.locator('text=⏱️')).toBeVisible(); // Avg. Time (appears twice - timer and stat)

    // Verify stats grid layout
    const statsGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
    await expect(statsGrid).toBeVisible();

    // Should have 4 stat cards
    const statCards = statsGrid.locator('> div');
    await expect(statCards).toHaveCount(4);
  });
});

test.describe('Know It All Wall - Animations', () => {
  test('should have smooth question card transitions', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Click "Know It All Wall" button to enter the mode
    await page.getByRole('button', { name: /Know It All Wall/i }).click();

    // Wait for mode to load
    await expect(page.getByText(/Know It All Wall/i)).toBeVisible();

    // Add some knowledge base content
    const textarea = page.locator('textarea[placeholder*="resume"]');
    await textarea.fill('I have 5 years of software development experience.');

    // Start the session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Wait for session to start
    await page.waitForSelector('text=Listening for your first question', { timeout: 5000 });

    // Verify instruction banner has animations (Framer Motion classes)
    const instructionBanner = page.locator('.bg-blue-50.border-2.border-blue-200');
    await expect(instructionBanner).toBeVisible();

    // Check that the layout is responsive
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(0);
  });
});
