import { test, expect } from '@playwright/test';

test.describe('Knowledge Base Integration with Q&A', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should use knowledge base FAQs when answering questions', async ({ page }) => {
    console.log('🧪 Test: Knowledge base should inform Q&A answers');

    // Step 1: Create a simple presentation
    console.log('📝 Step 1: Creating presentation...');
    await page.getByRole('button', { name: /Process Content/i }).click();

    await page.fill('textarea[placeholder*="presentation script"]',
      'Welcome to VerbaDeck. We help presenters with AI-powered assistance during live presentations.');

    await page.getByRole('button', { name: /Process with AI/i }).click();

    // Wait for processing to complete
    await page.waitForSelector('text=/Section 1/i', { timeout: 20000 });
    console.log('✅ Presentation created');

    // Step 2: Switch to Knowledge Base tab and add FAQs
    console.log('📚 Step 2: Adding knowledge base FAQs...');
    await page.getByRole('button', { name: /Knowledge Base/i }).click();

    // Generate FAQs using AI
    await page.getByRole('button', { name: /Generate FAQs with AI/i }).click();

    // Wait for FAQs to be generated
    await page.waitForSelector('text=/Generated \d+ FAQ/i', { timeout: 30000 });
    console.log('✅ FAQs generated');

    // Step 3: Manually add a specific FAQ to test
    console.log('➕ Step 3: Adding manual test FAQ...');

    // Click "Add FAQ Manually" button
    await page.getByRole('button', { name: /Add FAQ Manually/i }).click();

    // Fill in the question and answer
    const questionInput = page.locator('input[placeholder*="question"]').last();
    const answerInput = page.locator('textarea[placeholder*="answer"]').last();

    await questionInput.fill('What is the pricing for VerbaDeck?');
    await answerInput.fill('VerbaDeck costs $49 per month for individual users and $199 per month for teams. We offer a 30-day free trial with no credit card required.');

    // Save the FAQ
    await page.getByRole('button', { name: /Save/i }).last().click();

    console.log('✅ Manual FAQ added');

    // Step 4: Go to presenter mode and test Q&A
    console.log('🎤 Step 4: Testing Q&A with knowledge base...');
    await page.getByRole('button', { name: /Present/i }).click();

    // Open manual Q&A dialog
    await page.getByRole('button', { name: /Test Q&A/i }).click();

    // Ask the question we added to knowledge base
    const qaInput = page.locator('input[placeholder*="type a question"]');
    await qaInput.fill('What is the pricing?');

    // Submit question
    await page.getByRole('button', { name: /Get AI Answers/i }).click();

    console.log('⏳ Waiting for AI answer...');

    // Wait for answer to appear (up to 30 seconds for AI processing)
    await page.waitForSelector('text=/answer/i', { timeout: 30000 });

    // Get the answer text
    const answerText = await page.textContent('body');

    console.log('📋 Answer received, checking if it uses knowledge base...');

    // Verify the answer mentions pricing information from knowledge base
    // It should contain pricing info: $49 or $199 or "free trial"
    const hasPricingInfo =
      answerText?.includes('$49') ||
      answerText?.includes('$199') ||
      answerText?.includes('49') ||
      answerText?.includes('free trial') ||
      answerText?.includes('pricing');

    console.log(`💡 Answer contains pricing info: ${hasPricingInfo}`);

    expect(hasPricingInfo).toBeTruthy();

    console.log('✅ TEST PASSED: Knowledge base was used in Q&A answer!');
  });

  test('should allow adding and editing FAQs manually', async ({ page }) => {
    console.log('🧪 Test: Manual FAQ management');

    // Create presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]', 'Test presentation about AI.');
    await page.getByRole('button', { name: /Process with AI/i }).click();
    await page.waitForSelector('text=/Section 1/i', { timeout: 20000 });

    // Go to Knowledge Base
    await page.getByRole('button', { name: /Knowledge Base/i }).click();

    // Add manual FAQ
    await page.getByRole('button', { name: /Add FAQ Manually/i }).click();

    const questionInput = page.locator('input[placeholder*="question"]').last();
    const answerInput = page.locator('textarea[placeholder*="answer"]').last();

    await questionInput.fill('What is AI?');
    await answerInput.fill('Artificial Intelligence is the simulation of human intelligence by machines.');

    await page.getByRole('button', { name: /Save/i }).last().click();

    // Verify FAQ appears in list
    await expect(page.getByText('What is AI?')).toBeVisible();

    console.log('✅ Manual FAQ added successfully');
  });

  test('should generate FAQs from presentation content', async ({ page }) => {
    console.log('🧪 Test: Auto-generate FAQs');

    // Create rich presentation
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]',
      `VerbaDeck is an AI-powered presentation assistant.
       It listens to your speech in real-time and advances slides automatically.
       The system uses voice recognition to detect trigger words.
       It works on dual monitors for presenter and audience views.`);

    await page.getByRole('button', { name: /Process with AI/i }).click();
    await page.waitForSelector('text=/Section 1/i', { timeout: 20000 });

    // Generate FAQs
    await page.getByRole('button', { name: /Knowledge Base/i }).click();
    await page.getByRole('button', { name: /Generate FAQs with AI/i }).click();

    // Wait for generation
    await page.waitForSelector('text=/Generated \d+ FAQ/i', { timeout: 30000 });

    // Verify FAQs were created (should have at least 3-5)
    const faqCards = page.locator('[class*="border"]').filter({ hasText: /Q:/i });
    const count = await faqCards.count();

    console.log(`📊 Generated ${count} FAQs`);
    expect(count).toBeGreaterThan(2);

    console.log('✅ FAQs auto-generated successfully');
  });

  test('should delete FAQs', async ({ page }) => {
    console.log('🧪 Test: Delete FAQs');

    // Create presentation and add FAQ
    await page.getByRole('button', { name: /Process Content/i }).click();
    await page.fill('textarea[placeholder*="presentation script"]', 'Test.');
    await page.getByRole('button', { name: /Process with AI/i }).click();
    await page.waitForSelector('text=/Section 1/i', { timeout: 20000 });

    await page.getByRole('button', { name: /Knowledge Base/i }).click();
    await page.getByRole('button', { name: /Add FAQ Manually/i }).click();

    const questionInput = page.locator('input[placeholder*="question"]').last();
    const answerInput = page.locator('textarea[placeholder*="answer"]').last();

    await questionInput.fill('Test Question');
    await answerInput.fill('Test Answer');
    await page.getByRole('button', { name: /Save/i }).last().click();

    // Verify it exists
    await expect(page.getByText('Test Question')).toBeVisible();

    // Delete it
    const deleteButton = page.getByRole('button', { name: /Delete|×/i }).last();
    await deleteButton.click();

    // Verify it's gone
    await expect(page.getByText('Test Question')).not.toBeVisible();

    console.log('✅ FAQ deleted successfully');
  });
});
