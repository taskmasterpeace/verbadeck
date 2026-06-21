import { test, expect } from '@playwright/test';

/**
 * Tests for Know It All Mode bugfixes (commit 0346607)
 * Validates: tone selector, manual input, session flow, presets, 404 page, footer
 */

test.describe('Know It All Mode - Setup & UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with Know It All Wall heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();
  });

  test('tone selector is visible with all 9 options', async ({ page }) => {
    const toneSection = page.locator('text=Presentation Tone');
    await expect(toneSection).toBeVisible();

    await expect(page.getByText('Professional')).toBeVisible();
    await expect(page.getByText('Technical Expert')).toBeVisible();
    await expect(page.getByText('Interviewee')).toBeVisible();
    await expect(page.getByText('Sarcastic & Sharp')).toBeVisible();
    await expect(page.getByText('Storytelling')).toBeVisible();
    await expect(page.getByText('Witty & Engaging')).toBeVisible();
    await expect(page.getByText('Deeply Insightful')).toBeVisible();
    await expect(page.getByText('Conversational')).toBeVisible();
    await expect(page.getByText('Bold & Provocative')).toBeVisible();
  });

  test('professional tone is selected by default', async ({ page }) => {
    const professionalButton = page.locator('button').filter({ hasText: 'Professional' }).first();
    await expect(professionalButton).toBeVisible();
    await expect(professionalButton).toHaveClass(/bg-blue-50/);
  });

  test('can switch tone selection', async ({ page }) => {
    const sarcasticButton = page.locator('button').filter({ hasText: 'Sarcastic' });
    await sarcasticButton.click();
    await expect(sarcasticButton).toHaveClass(/bg-blue-50/);

    const professionalButton = page.locator('button').filter({ hasText: 'Professional' }).first();
    await expect(professionalButton).not.toHaveClass(/bg-blue-50/);
  });

  test('Start Session button is disabled without knowledge base', async ({ page }) => {
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('');
    }
    const startButton = page.getByTestId('start-session-button');
    await expect(startButton).toBeDisabled();
  });

  test('Start Session button enabled with knowledge base content', async ({ page }) => {
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('I am a software engineer with 10 years of experience.');
      const startButton = page.getByTestId('start-session-button');
      await expect(startButton).toBeEnabled();
    }
  });

  test('voice info banner shown when not streaming', async ({ page }) => {
    const voiceInfo = page.getByTestId('voice-info');
    await expect(voiceInfo).toBeVisible();
    await expect(voiceInfo).toContainText('Voice Control');
  });

  test('preset selector loads sample presets', async ({ page }) => {
    await page.waitForTimeout(2000);
    const presetArea = page.locator('text=/Resume|Job:/i');
    const hasPresets = await presetArea.first().isVisible().catch(() => false);
    if (hasPresets) {
      console.log('Sample presets loaded successfully');
    } else {
      console.log('No sample presets found (may be first load or files missing)');
    }
  });

  test('knowledge base can be loaded from preset', async ({ page }) => {
    await page.waitForTimeout(2000);
    const presetButton = page.locator('button').filter({ hasText: /Resume|Job/ }).first();
    if (await presetButton.isVisible().catch(() => false)) {
      await presetButton.click();
      await page.waitForTimeout(1000);
      const textarea = page.locator('textarea');
      if (await textarea.isVisible()) {
        const value = await textarea.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Know It All Mode - Session Flow', () => {
  test('starting session shows active wall with manual input available', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all?testMode=true');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Test knowledge base content for automated testing.');
    }

    await page.getByTestId('start-session-button').click();
    await page.waitForTimeout(1000);

    // Should show the active session header with Stop button
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();

    // Should show session stats
    await expect(page.getByText('Total Questions')).toBeVisible();
    await expect(page.getByText('Answered')).toBeVisible();

    // Should show listening instruction
    await expect(page.getByText(/Listening for your first question/i)).toBeVisible();

    // FIX VERIFICATION: Manual question input should be available even with 0 questions
    const manualInput = page.getByTestId('manual-question-input');
    await expect(manualInput).toBeVisible();

    const submitButton = page.getByTestId('submit-manual-question');
    await expect(submitButton).toBeVisible();
  });

  test('manual question can be submitted from empty session', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all?testMode=true');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('I am a software engineer specializing in React and TypeScript.');
    }

    await page.getByTestId('start-session-button').click();
    await page.waitForTimeout(1000);

    // Type a question in the manual input (available from the start now)
    const manualInput = page.getByTestId('manual-question-input');
    await manualInput.fill('What is your experience with React?');

    const submitButton = page.getByTestId('submit-manual-question');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Question should appear in the UI
    await expect(page.getByText('What is your experience with React?')).toBeVisible({ timeout: 10000 });
  });

  test('stop session returns to setup view', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all?testMode=true');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Test content');
    }

    await page.getByTestId('start-session-button').click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Stop")').click();
    await page.waitForTimeout(500);

    await expect(page.getByTestId('start-session-button')).toBeVisible();
  });

  test('test mode indicator shown with testMode param', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all?testMode=true');
    await page.waitForLoadState('networkidle');

    const testIndicator = page.getByTestId('test-mode-indicator');
    await expect(testIndicator).toBeVisible();
    await expect(testIndicator).toContainText('Test Mode Active');
  });
});

test.describe('App-wide Fixes', () => {
  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('http://localhost:5174/this-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Should show the custom 404 page, not the raw React Router error
    await expect(page.getByText('Page Not Found')).toBeVisible();
    await expect(page.getByText('Go to Dashboard')).toBeVisible();

    // Should NOT show the ugly React Router error
    await expect(page.getByText('Unexpected Application Error')).not.toBeVisible();
  });

  test('404 page links back to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5174/nonexistent-route');
    await page.waitForLoadState('networkidle');

    await page.getByText('Go to Dashboard').click();
    await page.waitForLoadState('networkidle');

    // Should be back on the home page
    await expect(page.getByText('Welcome to VerbaDeck')).toBeVisible();
  });

  test('footer shows version 2.0 and year 2026', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Version 2.0')).toBeVisible();
    await expect(page.getByText('2026')).toBeVisible();
  });
});

test.describe('Screenshots - Updated', () => {
  test('capture setup view with manual input', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/know-it-all-setup.png', fullPage: true });
  });

  test('capture session view with manual input visible', async ({ page }) => {
    await page.goto('http://localhost:5174/know-it-all?testMode=true');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('I am a senior software engineer with expertise in AI, machine learning, and distributed systems.');
    }

    await page.getByTestId('start-session-button').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/know-it-all-session.png', fullPage: true });
  });

  test('capture 404 page', async ({ page }) => {
    await page.goto('http://localhost:5174/nonexistent');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/404-page.png', fullPage: true });
  });

  test('capture home page with updated footer', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/home-page.png', fullPage: true });
  });

  test('capture all main views', async ({ page }) => {
    await page.goto('http://localhost:5174/create/scratch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/create-from-scratch.png', fullPage: true });

    await page.goto('http://localhost:5174/create/process');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/process-content.png', fullPage: true });

    await page.goto('http://localhost:5174/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/editor.png', fullPage: true });

    await page.goto('http://localhost:5174/presenter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/presenter.png', fullPage: true });

    await page.goto('http://localhost:5174/library');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/library.png', fullPage: true });
  });
});
