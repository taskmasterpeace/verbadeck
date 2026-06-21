/**
 * Manual exploration test — click through the app, screenshot everything,
 * test Q&A anticipation, FAQs, editor, presenter, Know It All Wall
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5175';

test.describe('App Exploration', () => {
  test.setTimeout(120000); // 2 min per test

  test('1. Home page loads correctly', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/explore-01-home.png', fullPage: true });

    // Check the 3 main cards exist
    const main = page.locator('main');
    await expect(main).toBeVisible();
    console.log('HOME: Page loaded');

    // Log all visible buttons/links
    const buttons = await page.locator('button:visible, a:visible').allTextContents();
    console.log('HOME buttons:', buttons.filter(b => b.trim()).join(' | '));
  });

  test('2. Process with AI — generate sections from sample text', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Navigate to Process with AI
    const processCard = page.locator('main').getByText('Process with AI');
    if (await processCard.isVisible()) {
      await processCard.click();
    } else {
      await page.goto(`${BASE}/create/process`);
    }
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/explore-02-process-ai.png', fullPage: true });
    console.log('PROCESS AI: Page loaded');

    // Find the textarea and enter sample content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill(`The Future of AI in Business

Artificial intelligence is transforming how companies operate. From customer service chatbots to predictive analytics, AI tools are becoming essential for competitive advantage.

Key Benefits of AI Adoption:
- Increased efficiency through automation
- Better decision making with data insights
- Enhanced customer experiences
- Cost reduction in operations

Implementation Challenges:
Companies face significant hurdles when adopting AI. Data quality remains the biggest obstacle, followed by talent acquisition and change management.

The ROI of AI investments typically shows within 12-18 months for well-planned deployments. Companies that start small and scale gradually see the best results.

Looking ahead, generative AI will reshape content creation, software development, and creative industries. The companies that embrace these tools today will lead tomorrow.`);
      console.log('PROCESS AI: Filled textarea with sample content');
    }

    await page.screenshot({ path: 'tests/screenshots/explore-02b-process-filled.png', fullPage: true });

    // Click process button
    const processBtn = page.locator('button').filter({ hasText: /process|generate/i }).first();
    if (await processBtn.isVisible()) {
      console.log('PROCESS AI: Clicking process button...');
      await processBtn.click();

      // Wait for processing (up to 30s)
      try {
        await page.waitForURL('**/editor**', { timeout: 30000 });
        console.log('PROCESS AI: Redirected to editor!');
      } catch {
        console.log('PROCESS AI: Did not redirect to editor within 30s');
      }
      await page.screenshot({ path: 'tests/screenshots/explore-02c-after-process.png', fullPage: true });
    }
  });

  test('3. Editor — explore tabs, Q&A anticipation, FAQs', async ({ page }) => {
    // First generate content
    await page.goto(`${BASE}/create/process`);
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill(`AI is transforming business operations. Companies using AI see 30% efficiency gains.

Key areas: customer service automation, predictive analytics, content generation.

Implementation requires careful planning: data quality, team training, and phased rollouts are critical for success.

The future belongs to companies that embrace AI tools today.`);
    }

    const processBtn = page.locator('button').filter({ hasText: /process|generate/i }).first();
    if (await processBtn.isVisible()) {
      await processBtn.click();
      try {
        await page.waitForURL('**/editor**', { timeout: 30000 });
      } catch {
        // Navigate manually
        await page.goto(`${BASE}/editor`);
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/explore-03-editor.png', fullPage: true });
    console.log('EDITOR: Page loaded');

    // Log all tabs visible
    const tabs = await page.locator('[role="tab"], button').allTextContents();
    console.log('EDITOR tabs/buttons:', tabs.filter(t => t.trim()).slice(0, 20).join(' | '));

    // Click Knowledge Base tab
    const kbTab = page.locator('button').filter({ hasText: /knowledge base/i }).first();
    if (await kbTab.isVisible()) {
      await kbTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/explore-03b-knowledge-base-tab.png', fullPage: true });
      console.log('EDITOR: Knowledge Base tab opened');

      // Look for Anticipate Questions button
      const anticipateBtn = page.locator('button').filter({ hasText: /anticipat/i }).first();
      if (await anticipateBtn.isVisible()) {
        console.log('EDITOR: Found Anticipate Questions button, clicking...');
        await anticipateBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/explore-03c-anticipate-loading.png', fullPage: true });

        // Wait for results (up to 20s)
        try {
          await page.waitForSelector('text=/likelihood|category|question/i', { timeout: 20000 });
          console.log('EDITOR: Q&A predictions loaded!');
        } catch {
          console.log('EDITOR: Q&A predictions did not load in 20s');
        }
        await page.screenshot({ path: 'tests/screenshots/explore-03d-anticipate-results.png', fullPage: true });

        // Try clicking "Prepare Answer" on first question
        const prepareBtn = page.locator('button').filter({ hasText: /prepare answer/i }).first();
        if (await prepareBtn.isVisible()) {
          console.log('EDITOR: Clicking Prepare Answer...');
          await prepareBtn.click();

          try {
            await page.waitForSelector('text=/short answer|detailed|confidence/i', { timeout: 20000 });
            console.log('EDITOR: Answer prepared!');
          } catch {
            console.log('EDITOR: Answer did not generate in 20s');
          }
          await page.screenshot({ path: 'tests/screenshots/explore-03e-prepared-answer.png', fullPage: true });
        }
      }

      // Try Auto-Generate FAQs
      const faqBtn = page.locator('button').filter({ hasText: /auto.*generate.*faq|generate.*faq/i }).first();
      if (await faqBtn.isVisible()) {
        console.log('EDITOR: Found Auto-Generate FAQs button, clicking...');
        await faqBtn.click();
        await page.waitForTimeout(2000);

        // Check for errors
        const errorVisible = await page.locator('text=/error|failed/i').isVisible().catch(() => false);
        if (errorVisible) {
          console.log('EDITOR: FAQ generation showed an error!');
        }

        await page.screenshot({ path: 'tests/screenshots/explore-03f-faq-results.png', fullPage: true });

        // Wait more for FAQs
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'tests/screenshots/explore-03g-faq-after-wait.png', fullPage: true });
        console.log('EDITOR: FAQ generation complete (or failed)');
      }
    }

    // Scroll down to see everything
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/explore-03h-editor-bottom.png', fullPage: true });
  });

  test('4. Presenter view', async ({ page }) => {
    await page.goto(`${BASE}/presenter`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/explore-04-presenter.png', fullPage: true });
    console.log('PRESENTER: Page loaded');

    // Log what's visible
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('PRESENTER headings:', headings.filter(h => h.trim()).join(' | '));

    const buttons = await page.locator('button:visible').allTextContents();
    console.log('PRESENTER buttons:', buttons.filter(b => b.trim()).join(' | '));
  });

  test('5. Know It All Wall — start session', async ({ page }) => {
    await page.goto(`${BASE}/know-it-all?testMode=true`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/explore-05-know-it-all.png', fullPage: true });
    console.log('KNOW IT ALL: Page loaded');

    // Check for start session button
    const startBtn = page.getByTestId('start-session-button');
    if (await startBtn.isVisible()) {
      // Need knowledge base content first - check if there's a preset
      const presetBtn = page.locator('button').filter({ hasText: /resume|sample|preset/i }).first();
      if (await presetBtn.isVisible()) {
        console.log('KNOW IT ALL: Loading preset...');
        await presetBtn.click();
        await page.waitForTimeout(500);

        // Look for load/use button
        const loadBtn = page.locator('button').filter({ hasText: /load|use|replace/i }).first();
        if (await loadBtn.isVisible()) {
          await loadBtn.click();
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({ path: 'tests/screenshots/explore-05b-before-start.png', fullPage: true });

      // Start session
      if (await startBtn.isEnabled()) {
        await startBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/explore-05c-session-active.png', fullPage: true });
        console.log('KNOW IT ALL: Session started');

        // Check for stats bar, pause button, queue toggle
        const statsBar = page.locator('text=/asked|answered|pending/i').first();
        if (await statsBar.isVisible()) {
          console.log('KNOW IT ALL: Stats bar visible');
        }

        // Check for manual question input
        const manualInput = page.getByTestId('manual-question-input');
        if (await manualInput.isVisible()) {
          await manualInput.fill('What are the key benefits of AI?');
          const askBtn = page.getByTestId('submit-manual-question');
          if (await askBtn.isVisible()) {
            await askBtn.click();
            console.log('KNOW IT ALL: Submitted manual question');

            // Wait for answer generation
            await page.waitForTimeout(10000);
            await page.screenshot({ path: 'tests/screenshots/explore-05d-question-answered.png', fullPage: true });
          }
        }
      } else {
        console.log('KNOW IT ALL: Start button disabled (no knowledge base)');
      }
    }
  });

  test('6. Sidebar navigation — click all routes', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const routes = [
      { name: 'Home', path: '/' },
      { name: 'Create from Scratch', path: '/create/scratch' },
      { name: 'Process with AI', path: '/create/process' },
      { name: 'Know It All Wall', path: '/know-it-all' },
      { name: 'Presenter', path: '/presenter' },
    ];

    for (const route of routes) {
      await page.goto(`${BASE}${route.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const title = await page.title();
      const hasError = await page.locator('text=/error|failed|crash/i').isVisible().catch(() => false);
      console.log(`ROUTE ${route.name} (${route.path}): title="${title}" error=${hasError}`);

      await page.screenshot({ path: `tests/screenshots/explore-06-route-${route.name.replace(/\s+/g, '-').toLowerCase()}.png`, fullPage: true });
    }
  });
});
