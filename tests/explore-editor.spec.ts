/**
 * Focused exploration: Generate content → Editor → Knowledge Base → Q&A → FAQs
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5175';

test.describe.serial('Editor Deep Exploration', () => {
  test.setTimeout(180000);

  test('Generate content and explore editor fully', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('requestfailed', req => {
      errors.push(`FAILED: ${req.method()} ${req.url()} ${req.failure()?.errorText}`);
    });

    // Step 1: Go to Process page and fill content
    await page.goto(`${BASE}/create/process`);
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill(`The Future of AI in Business

Artificial intelligence is transforming how companies operate. From customer service chatbots to predictive analytics, AI tools are becoming essential.

Key Benefits: Increased efficiency through automation, better decision making with data insights, enhanced customer experiences, and cost reduction.

Implementation Challenges: Data quality remains the biggest obstacle, followed by talent acquisition and change management.

The ROI shows within 12-18 months for well-planned deployments. Companies that start small and scale gradually see the best results.

Looking ahead, generative AI will reshape content creation and software development.`);

    // Scroll down to see Process button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Click the big "Process with AI" button (in main content, not sidebar)
    const processBtn = page.locator('main button, main >> text="Process with AI"').filter({ hasText: 'Process with AI' }).first();
    console.log('Process button visible:', await processBtn.isVisible().catch(() => false));
    await page.screenshot({ path: 'tests/screenshots/editor-01-before-process.png', fullPage: true });

    if (await processBtn.isVisible()) {
      await processBtn.click();
      console.log('Clicked Process with AI');
      await page.waitForTimeout(2000);

      // Check if goal picker appeared
      const skipLink = page.getByText('Skip', { exact: false }).filter({ hasText: /skip/i });
      const pitchCard = page.getByText('Pitch', { exact: false });

      await page.screenshot({ path: 'tests/screenshots/editor-01b-after-click.png', fullPage: true });

      // Try skip or pick a goal
      if (await skipLink.isVisible().catch(() => false)) {
        await skipLink.click();
        console.log('Clicked Skip');
        await page.waitForTimeout(500);
        // Need to click "Process with AI" again after skip
        const processAgain = page.locator('main button').filter({ hasText: 'Process with AI' }).first();
        if (await processAgain.isVisible()) {
          await processAgain.click();
          console.log('Clicked Process with AI again after Skip');
        }
      } else if (await pitchCard.isVisible().catch(() => false)) {
        await pitchCard.first().click();
        console.log('Selected Pitch');
        await page.waitForTimeout(500);
        // Need to click "Process with AI" again after goal selection
        const processAgain = page.locator('main button').filter({ hasText: 'Process with AI' }).first();
        if (await processAgain.isVisible()) {
          await processAgain.click();
          console.log('Clicked Process with AI again after goal');
        }
      }

      // Now wait for processing to complete and redirect
      console.log('Waiting for AI processing...');

      // Monitor for the navigation to editor
      try {
        await page.waitForURL('**/editor**', { timeout: 60000 });
        console.log('SUCCESS: Redirected to editor!');
      } catch {
        console.log('TIMEOUT: Still on', page.url());
        await page.screenshot({ path: 'tests/screenshots/editor-01c-stuck.png', fullPage: true });

        // Try navigating to editor manually — maybe content was saved to store
        await page.goto(`${BASE}/editor`);
        await page.waitForTimeout(2000);
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/editor-02-editor.png', fullPage: true });

    // Check if sections exist
    const sectionCount = await page.locator('[data-section], [data-testid*="section"]').count();
    const headings = await page.locator('h2, h3, h4').allTextContents();
    console.log('Sections found:', sectionCount, 'Headings:', headings.filter(h => h.trim()).join(' | '));

    // Find ALL buttons on the page
    const allBtns = await page.locator('button:visible').allTextContents();
    console.log('All buttons:', allBtns.filter(b => b.trim()).join(' | '));

    // Scroll through full page
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log('Page height:', pageHeight);

    for (let y = 0; y < pageHeight; y += 600) {
      await page.evaluate((s) => window.scrollTo(0, s), y);
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: 'tests/screenshots/editor-03-full.png', fullPage: true });

    // Try to find KB/Q&A elements anywhere
    const kbBtn = page.locator('button:visible').filter({ hasText: /knowledge/i }).first();
    const anticipateBtn = page.locator('button:visible').filter({ hasText: /anticipat/i }).first();
    const faqBtn = page.locator('button:visible').filter({ hasText: /faq/i }).first();

    console.log('KB visible:', await kbBtn.isVisible().catch(() => false));
    console.log('Anticipate visible:', await anticipateBtn.isVisible().catch(() => false));
    console.log('FAQ visible:', await faqBtn.isVisible().catch(() => false));

    // If editor has content, try clicking through tabs
    if (await kbBtn.isVisible().catch(() => false)) {
      // Click Knowledge Base
      if (await kbBtn.isVisible().catch(() => false)) {
        await kbBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/editor-04-kb.png', fullPage: true });

        // Anticipate Questions
        const antBtn = page.locator('button:visible').filter({ hasText: /anticipat/i }).first();
        if (await antBtn.isVisible().catch(() => false)) {
          await antBtn.click();
          console.log('Clicked Anticipate Questions, waiting...');
          await page.waitForTimeout(15000);
          await page.screenshot({ path: 'tests/screenshots/editor-05-anticipate.png', fullPage: true });

          // Scroll
          await page.evaluate(() => window.scrollTo(0, 600));
          await page.screenshot({ path: 'tests/screenshots/editor-05b-anticipate-scroll.png', fullPage: true });

          // Prepare Answer
          const prepBtn = page.locator('button:visible').filter({ hasText: /prepare answer/i }).first();
          if (await prepBtn.isVisible().catch(() => false)) {
            await prepBtn.click();
            console.log('Clicked Prepare Answer, waiting...');
            await page.waitForTimeout(15000);
            await page.screenshot({ path: 'tests/screenshots/editor-06-prepared.png', fullPage: true });
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.screenshot({ path: 'tests/screenshots/editor-06b-prepared-bottom.png', fullPage: true });
          }
        }

        // FAQ
        const faqGenBtn = page.locator('button:visible').filter({ hasText: /generate.*faq|auto.*faq/i }).first();
        if (await faqGenBtn.isVisible().catch(() => false)) {
          const faqRespPromise = page.waitForResponse(r => r.url().includes('generate-faqs'), { timeout: 20000 }).catch(() => null);
          await faqGenBtn.click();
          console.log('Clicked Auto-Generate FAQs...');
          const faqResp = await faqRespPromise;
          console.log('FAQ response:', faqResp?.status());
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'tests/screenshots/editor-07-faqs.png', fullPage: true });
        }
      }
    } else {
      console.log('NO CONTENT in editor — cannot test KB/Q&A features');
    }

    // Presenter
    await page.goto(`${BASE}/presenter`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/editor-08-presenter.png', fullPage: true });

    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.slice(0, 10).forEach(e => console.log('  ', e.substring(0, 200)));
    }
  });
});
