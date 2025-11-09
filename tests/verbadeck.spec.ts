import { test, expect } from '@playwright/test';

/**
 * VerbaDeck Main Application Tests
 * Updated for new UX flow with landing page and progressive workflow
 */

test.describe('VerbaDeck - Landing Page', () => {
  test('should load landing page with 3 creation paths', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check VerbaDeck branding
    await expect(page.getByText('VerbaDeck')).toBeVisible();

    // Check welcome message
    await expect(page.getByText('Welcome to VerbaDeck')).toBeVisible();

    // Check all 3 creation paths
    await expect(page.getByText('Create from Scratch')).toBeVisible();
    await expect(page.getByText('Process Existing Content')).toBeVisible();
    await expect(page.getByText('Know It All Wall')).toBeVisible();

    // Check workflow navigation (should show disabled Present button)
    await expect(page.locator('button:has-text("1. Create")')).toBeVisible();
    await expect(page.locator('button:has-text("2. Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("3. Present")')).toBeVisible();
    // Note: Voice button is separate in top right, not part of workflow steps

    console.log('✅ Landing page loads correctly');
  });

  test('should show 3 creation path buttons', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // All 3 action buttons should be present
    const startFromScratch = page.locator('button:has-text("Start from Scratch")');
    const processContent = page.locator('button:has-text("Process Content")');
    const startQA = page.locator('button:has-text("Start Q&A Practice")');

    await expect(startFromScratch).toBeVisible();
    await expect(processContent).toBeVisible();
    await expect(startQA).toBeVisible();

    console.log('✅ All creation path buttons present');
  });

  test('should have Library and Load buttons', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check for Library and Load buttons in top right
    await expect(page.locator('button:has-text("Library")')).toBeVisible();
    await expect(page.locator('button:has-text("Load")')).toBeVisible();

    console.log('✅ Library and Load buttons present');
  });

  test('should have Settings button that opens modal', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Find and click settings button
    const settingsButton = page.getByTestId('settings-button');
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();
    await page.waitForTimeout(500);

    // Settings modal should be open (use heading for unique match)
    await expect(page.getByRole('heading', { name: /Settings/ })).toBeVisible();

    // Should have tabs
    await expect(page.locator('button:has-text("🤖 Models")')).toBeVisible();

    console.log('✅ Settings button opens modal');
  });
});

test.describe('VerbaDeck - Process Content Flow', () => {
  test('should navigate to Process Content view', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click Process Content button
    const processButton = page.locator('button:has-text("Process Content")');
    await processButton.click();
    await page.waitForTimeout(1000);

    // Should now show script input area or upload options
    // Check for indication we're in process content mode
    const body = await page.locator('body').textContent();

    // Should have moved away from landing page
    const hasWelcome = body?.includes('Choose your path');
    expect(hasWelcome).toBeFalsy();

    console.log('✅ Navigated to Process Content view');
  });
});

test.describe('VerbaDeck - Create from Scratch Flow', () => {
  test('should navigate to Create from Scratch view', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click Start from Scratch button
    const scratchButton = page.locator('button:has-text("Start from Scratch")');
    await scratchButton.click();
    await page.waitForTimeout(1000);

    // Should now show question interface
    const body = await page.locator('body').textContent();

    // Should have moved away from landing page
    const hasWelcome = body?.includes('Choose your path');
    expect(hasWelcome).toBeFalsy();

    console.log('✅ Navigated to Create from Scratch view');
  });
});

test.describe('VerbaDeck - Know It All Wall Flow', () => {
  test('should navigate to Know It All Wall view', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click Start Q&A Practice button
    const qaButton = page.locator('button:has-text("Start Q&A Practice")');
    await qaButton.click();
    await page.waitForTimeout(1000);

    // Should now show Q&A practice interface
    const body = await page.locator('body').textContent();

    // Should have moved away from landing page
    const hasWelcome = body?.includes('Choose your path');
    expect(hasWelcome).toBeFalsy();

    console.log('✅ Navigated to Know It All Wall view');
  });
});

test.describe('VerbaDeck - Workflow Navigation', () => {
  test('should show progressive workflow steps in top bar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Workflow steps should be visible (1-3 only, Voice button is separate)
    const createButton = page.locator('button:has-text("1. Create")');
    const editButton = page.locator('button:has-text("2. Edit")');
    const presentButton = page.locator('button:has-text("3. Present")');

    await expect(createButton).toBeVisible();
    await expect(editButton).toBeVisible();
    await expect(presentButton).toBeVisible();
    // Note: Voice button is separate in top right, not workflow step 4

    console.log('✅ Workflow steps visible');
  });

  test('should have Present button disabled when no content', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Present button should be disabled (no content created yet)
    const presentButton = page.locator('button:has-text("3. Present")');
    await expect(presentButton).toBeDisabled();

    console.log('✅ Present button correctly disabled without content');
  });

  test('should show Edit count as (0) when no content', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Edit button should show (0) indicating no sections
    await expect(page.locator('button:has-text("2. Edit (0)")')).toBeVisible();

    console.log('✅ Edit count shows (0) correctly');
  });
});

test.describe('VerbaDeck - Voice Control', () => {
  test('should have Voice button in top right', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Voice button should be in top right corner (blue, prominent)
    const voiceButton = page.locator('button:has-text("🎤 Voice")');
    await expect(voiceButton).toBeVisible();

    console.log('✅ Voice button present');
  });
});

test.describe('VerbaDeck - Footer', () => {
  test('should show Machine King Labs branding', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check for footer branding
    await expect(page.getByText('Machine King Labs')).toBeVisible();

    console.log('✅ Footer branding present');
  });

  test('should show version information', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check for version info
    await expect(page.locator('text=/Version \\d+\\.\\d+/')).toBeVisible();

    console.log('✅ Version info present');
  });
});

/**
 * NOTE: Tests for presenter view, live transcript, and section navigation
 * require creating content first (via one of the 3 creation paths).
 *
 * See tests/speaker-notes-workflow.spec.ts for full integration tests
 * that go through the complete Create → Edit → Present → Voice flow.
 */
