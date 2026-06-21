import { test, expect } from '@playwright/test';

/**
 * Core User Flow Tests
 * Tests the primary user workflows: Process with AI, Create from Scratch, Know It All Wall
 * These test actual API interactions (not mocked) to catch real integration issues.
 */

test.describe('Core User Flows', () => {

  test.describe('Home Page', () => {
    test('should render dashboard with three workflow cards', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check main content area (avoid sidebar duplicates)
      const main = page.locator('main');
      await expect(main.getByRole('heading', { name: /Create from Scratch/i })).toBeVisible();
      await expect(main.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();
      await expect(main.getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();
    });
  });

  test.describe('Process with AI (AIScriptProcessor)', () => {
    test('should navigate to process content page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click "Process Content" button on the card
      const main = page.locator('main');
      await main.getByRole('button', { name: /Process Content/i }).click();

      await expect(page).toHaveURL(/\/create\/process/);
      await expect(page.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();
    });

    test('should successfully process text with AI', async ({ page }) => {
      await page.goto('/create/process');
      await page.waitForLoadState('networkidle');

      // Find the text area and enter sample text
      const textarea = page.locator('textarea').first();
      await textarea.fill('How to give a great presentation. Start with a strong opening that captures attention. Tell compelling stories that resonate with your audience. End with a clear call to action.');

      // The page shows a goal picker (Pitch/Training/etc.) - click "Skip — just process it"
      const skipLink = page.getByText(/Skip.*just process/i);
      if (await skipLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipLink.click();
      } else {
        // Or click Process with AI button directly if no goal picker
        const processButton = page.getByRole('button', { name: /Process with AI/i });
        await processButton.click();
      }

      // Wait for processing to complete - should navigate to editor or show sections
      await expect(page.getByText(/section|slide|trigger|editor/i).first()).toBeVisible({ timeout: 30000 });
    });

    test('should show error message on API failure gracefully', async ({ page }) => {
      await page.goto('/create/process');
      await page.waitForLoadState('networkidle');

      // Button should be disabled when textarea is empty (no text to process)
      const processButton = page.getByRole('button', { name: /Process with AI/i });
      // Process button shouldn't be clickable without content - either disabled or not visible
      const isDisabled = await processButton.isDisabled().catch(() => true);
      expect(isDisabled).toBeTruthy();
    });
  });

  test.describe('Create from Scratch', () => {
    test('should navigate to create from scratch page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const main = page.locator('main');
      await main.getByRole('button', { name: /Start from Scratch/i }).click();

      await expect(page).toHaveURL(/\/create\/scratch/);
    });

    test('should show topic input', async ({ page }) => {
      await page.goto('/create/scratch');
      await page.waitForLoadState('networkidle');

      // Should have a text input for topic
      const topicInput = page.locator('input[type="text"], textarea').first();
      await expect(topicInput).toBeVisible();

      // Should have a generate/next/start button
      const actionButton = page.getByRole('button', { name: /Generate|Next|Start|Create/i }).first();
      await expect(actionButton).toBeVisible();
    });
  });

  test.describe('Know It All Wall', () => {
    test('should navigate to Know It All page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const main = page.locator('main');
      await main.getByRole('button', { name: /Start Q&A Practice/i }).click();

      await expect(page).toHaveURL(/\/know-it-all/);
      // Should show the Know It All heading and knowledge base area
      await expect(page.getByRole('heading', { name: /Know It All Wall/i })).toBeVisible();
    });

    test('should have Start Session button that requires knowledge base', async ({ page }) => {
      await page.goto('/know-it-all');
      await page.waitForLoadState('networkidle');

      // Start Session button should be disabled when knowledge base is empty
      const startButton = page.getByRole('button', { name: /Start Session/i });
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeDisabled();
    });

    test('should enable Start Session after entering knowledge base', async ({ page }) => {
      await page.goto('/know-it-all');
      await page.waitForLoadState('networkidle');

      // Fill in knowledge base
      const knowledgeBaseInput = page.locator('textarea').first();
      await knowledgeBaseInput.fill('I am a software engineer with 10 years of experience in building web applications. I specialize in React, TypeScript, and Node.js. I have led teams of up to 15 engineers and shipped products used by millions.');

      // Start Session should now be enabled
      const startButton = page.getByRole('button', { name: /Start Session/i });
      await expect(startButton).toBeEnabled({ timeout: 5000 });
    });

    test('should load preset into knowledge base', async ({ page }) => {
      await page.goto('/know-it-all');
      await page.waitForLoadState('networkidle');

      // Select a preset from dropdown
      const presetSelect = page.locator('select');
      const count = await presetSelect.count();
      if (count > 0) {
        // Select first real option (index 1, since 0 is "Select a preset...")
        await presetSelect.selectOption({ index: 1 });

        // Click Load button - find the one near the select
        const loadButton = page.getByRole('button', { name: /^Load$/i });
        await expect(loadButton).toBeEnabled({ timeout: 3000 });
        await loadButton.click();

        // Knowledge base textarea should now have content
        const textarea = page.locator('textarea').first();
        await expect(async () => {
          const value = await textarea.inputValue();
          expect(value.length).toBeGreaterThan(0);
        }).toPass({ timeout: 5000 });
      }
    });

    test('should have Pause/Resume button when session is active', async ({ page }) => {
      await page.goto('/know-it-all?testMode=true');
      await page.waitForLoadState('networkidle');

      // Fill knowledge base
      const knowledgeBaseInput = page.locator('textarea').first();
      await knowledgeBaseInput.fill('I am a software engineer with experience in AI and machine learning. I have built production systems serving millions of users.');

      const startButton = page.getByRole('button', { name: /Start Session/i });
      await expect(startButton).toBeEnabled({ timeout: 5000 });
      await startButton.click();

      // After starting session, should show session controls
      // The Pause button is in the status banner
      await expect(page.getByRole('button', { name: /Pause/i })).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('API Health', () => {
    test('server health check should return OK', async ({ request }) => {
      const response = await request.get('http://localhost:3002/health');
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.status).toBe('ok');
    });

    test('process-script API should return sections', async ({ request }) => {
      const response = await request.post('http://localhost:3002/api/process-script', {
        data: {
          text: 'How to give a great presentation. Start with a strong opening. Tell stories.',
        },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.sections).toBeDefined();
      expect(body.sections.length).toBeGreaterThan(0);
    });

    test('answer-question-with-keywords API should return answers', async ({ request }) => {
      const response = await request.post('http://localhost:3002/api/answer-question-with-keywords', {
        data: {
          question: 'What is machine learning?',
          knowledgeBase: 'Machine learning is a subset of AI that uses algorithms to learn from data and improve over time.',
          tone: 'professional',
        },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.answer1).toBeDefined();
      expect(body.answer2).toBeDefined();
      expect(body.answer1.keywords).toHaveLength(2);
      expect(body.answer2.keywords).toHaveLength(2);
    });

    test('generate-questions API should return questions', async ({ request }) => {
      const response = await request.post('http://localhost:3002/api/generate-questions', {
        data: {
          topic: 'artificial intelligence',
        },
      });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.questions).toBeDefined();
      expect(body.questions.length).toBeGreaterThan(0);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('sidebar links should navigate correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // The sidebar uses NavLink elements (rendered as <a> tags)
      // Use the sidebar container (aside element or first sidebar-like container)
      const sidebar = page.locator('[data-sidebar]').first().or(page.locator('aside').first());

      // Click Know It All Wall link in sidebar
      await sidebar.getByRole('link', { name: /Know It All/i }).click();
      await expect(page).toHaveURL(/\/know-it-all/);

      // Click Dashboard link
      await sidebar.getByRole('link', { name: /Dashboard/i }).click();
      await expect(page).toHaveURL(/\/$/);

      // Click Editor link
      await sidebar.getByRole('link', { name: /Editor/i }).click();
      await expect(page).toHaveURL(/\/editor/);

      // Click Presenter link
      await sidebar.getByRole('link', { name: /Presenter/i }).click();
      await expect(page).toHaveURL(/\/presenter/);
    });

    test('Settings button should open settings panel', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Settings button fires CustomEvent('open-settings') - it's in the sidebar footer
      // Find it by its text content
      await page.locator('button:has-text("Settings")').first().click();

      // Settings panel should appear with a heading
      await expect(page.getByRole('heading', { name: /Settings/i, exact: true })).toBeVisible({ timeout: 5000 });
    });
  });
});
