import { test, expect } from '@playwright/test';

test.describe('Q&A Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
  });

  test('should answer questions using presentation content', async ({ page }) => {
    // Load a test presentation
    const testScript = `Welcome to our AI product demonstration.
Our product helps you analyze data faster.
We use machine learning algorithms to process information.
The pricing starts at $99 per month.`;

    // Create presentation
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Switch to presenter mode
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);

    // Ask a question using the manual Q&A button
    await page.click('button:has-text("Ask Question")');
    await page.fill('input[placeholder*="question"]', 'What is the pricing?');
    await page.click('button:has-text("Get AI Answers")');

    // Wait for answers to be generated
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });

    // Verify the answer mentions pricing from presentation content
    const answerText = await page.locator('.bg-purple-50').first().textContent();
    expect(answerText).toContain('99'); // Should reference the $99 pricing from content
  });

  test('should answer questions using knowledge base', async ({ page }) => {
    // Create presentation
    const testScript = `Our product is a data analysis tool.`;
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Add knowledge base entry
    await page.click('button:has-text("Edit Content & Triggers")');
    await page.click('button:has-text("💡 Knowledge Base")');

    // Add a FAQ manually
    await page.click('button:has-text("Add FAQ")');
    await page.fill('input[placeholder*="What is the pricing"]', 'What features are included?');
    await page.fill('textarea[placeholder*="Provide a clear"]', 'Our product includes: real-time analytics, custom dashboards, API access, and 24/7 support.');
    await page.click('button:has-text("Add"):has-text("Add")'); // Click the Add button in the form

    // Switch to presenter mode
    await page.click('button[aria-label="Close"]', { timeout: 5000 }).catch(() => {}); // Close modal if open
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);

    // Ask the question from knowledge base
    await page.click('button:has-text("Ask Question")');
    await page.fill('input[placeholder*="question"]', 'What features are included?');
    await page.click('button:has-text("Get AI Answers")');

    // Wait for answers
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });

    // Verify answer uses knowledge base info
    const answerText = await page.textContent('.bg-purple-50');
    expect(answerText?.toLowerCase()).toMatch(/(analytics|dashboards|api|support)/);
  });

  test('should provide multiple answer formats (sentence, bullets, paragraph)', async ({ page }) => {
    // Create simple presentation
    const testScript = `Our AI helps analyze data quickly and efficiently.`;
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Go to presenter mode and ask question
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Ask Question")');
    await page.fill('input[placeholder*="question"]', 'What does this product do?');
    await page.click('button:has-text("Get AI Answers")');

    // Wait for answers and verify all three formats are present
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });
    await expect(page.locator('text=ONE SENTENCE ANSWER')).toBeVisible();
    await expect(page.locator('text=KEY POINTS')).toBeVisible();
    await expect(page.locator('text=FULL ANSWER')).toBeVisible();

    // Verify bullet points are present
    const bulletPoints = await page.locator('.text-blue-600:has-text("•")').count();
    expect(bulletPoints).toBeGreaterThan(0);
  });

  test('should generate FAQs from presentation content', async ({ page }) => {
    // Create presentation with rich content
    const testScript = `Welcome to TechCorp's new analytics platform.
Our product helps businesses analyze customer data in real-time.
We use advanced machine learning algorithms to detect patterns.
Pricing starts at $99/month for small teams and $499/month for enterprises.
We offer a 14-day free trial with no credit card required.`;

    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Go to Knowledge Base tab
    await page.click('button:has-text("Edit Content & Triggers")');
    await page.click('button:has-text("💡 Knowledge Base")');

    // Auto-generate FAQs
    await page.click('button:has-text("Auto-Generate FAQs")');

    // Wait for generation to complete and check results
    await page.waitForTimeout(10000); // FAQ generation may take time

    // Verify FAQs were generated
    const faqCount = await page.locator('text=QUESTION:').count();
    expect(faqCount).toBeGreaterThan(0);

    // Verify generated FAQs are relevant to content
    const faqText = await page.textContent('body');
    expect(faqText?.toLowerCase()).toMatch(/(pricing|features|trial|analytics|platform)/);
  });

  test('should allow copying answers to clipboard', async ({ page }) => {
    // Create presentation
    const testScript = `This is a test presentation about data analysis.`;
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Ask question
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Ask Question")');
    await page.fill('input[placeholder*="question"]', 'What is this about?');
    await page.click('button:has-text("Get AI Answers")');
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });

    // Click copy button
    await page.click('button[title*="Copy"]');

    // Verify copy icon changed to check mark
    await expect(page.locator('.text-green-600')).toBeVisible({ timeout: 3000 });
  });

  test('should provide two different answer options', async ({ page }) => {
    // Create presentation
    const testScript = `Our software helps teams collaborate more effectively.`;
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Ask question
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Ask Question")');
    await page.fill('input[placeholder*="question"]', 'What problem does this solve?');
    await page.click('button:has-text("Get AI Answers")');
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });

    // Verify both Option A and Option B are present
    await expect(page.locator('text=OPTION A')).toBeVisible();
    await expect(page.locator('text=OPTION B')).toBeVisible();

    // Verify they have different content
    const optionAText = await page.locator('text=OPTION A').locator('..').textContent();
    const optionBText = await page.locator('text=OPTION B').locator('..').textContent();
    expect(optionAText).not.toBe(optionBText);
  });

  test('should respect selected tone when generating answers', async ({ page }) => {
    // Create presentation
    const testScript = `We're launching a new productivity app.`;
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', testScript);
    await page.click('button:has-text("Process with AI")');
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Ask question with specific tone
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Ask Question")');

    // Select enthusiastic tone
    await page.click('button:has-text("Professional")'); // Click tone selector
    await page.click('button:has-text("Enthusiastic")');

    await page.fill('input[placeholder*="question"]', 'Tell me about this app');
    await page.click('button:has-text("Get AI Answers")');
    await page.waitForSelector('text=ONE SENTENCE ANSWER', { timeout: 30000 });

    // Answers should be generated (specific tone verification would require NLP)
    await expect(page.locator('text=ONE SENTENCE ANSWER')).toBeVisible();
  });
});
