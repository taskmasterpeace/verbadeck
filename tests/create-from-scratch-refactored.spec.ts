import { test, expect } from '@playwright/test';

test.describe('CreateFromScratch Refactored', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
  });

  test('should complete full wizard flow', async ({ page }) => {
    // Step 1: Enter topic and start wizard
    await page.getByText('Create from Scratch').click();

    // Verify we're on step 1 (topic input)
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await expect(page.getByText('Describe your presentation topic')).toBeVisible();

    // Fill in topic
    const topicInput = page.getByPlaceholder(/AI-powered meeting assistant/);
    await topicInput.fill('AI-powered presentation assistant');

    // Verify slide count is visible and adjustable
    await expect(page.getByText('Number of Slides')).toBeVisible();
    const slideCountDisplay = page.locator('text=/^\\d+$/').filter({ hasText: /^\d+$/ }).first();
    await expect(slideCountDisplay).toBeVisible();

    // Continue to questions
    const continueButton = page.getByRole('button', { name: /Continue|Generating Questions/ });
    await continueButton.click();

    // Wait for questions to load (Step 2)
    await expect(page.getByText('Step 2 of 4')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Answer a few questions')).toBeVisible();

    // Answer all questions (should have 4 questions)
    const questionCards = page.locator('.border-blue-100').filter({ has: page.locator('text=/^\\d+$/') });
    const questionCount = await questionCards.count();
    expect(questionCount).toBeGreaterThan(0);

    // Answer each question
    for (let i = 0; i < questionCount; i++) {
      const card = questionCards.nth(i);

      // Try to find multiple choice options
      const mcOptions = card.locator('button').filter({ hasText: /.+/ }).first();
      if (await mcOptions.isVisible({ timeout: 1000 }).catch(() => false)) {
        await mcOptions.click();
      } else {
        // Try true/false buttons
        const trueButton = card.getByText('✓ True');
        if (await trueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await trueButton.click();
        } else {
          // Fill in text input
          const textInput = card.locator('input[type="text"]').first();
          await textInput.fill('Test answer');
        }
      }
    }

    // Continue to slides
    const generateSlidesButton = page.getByRole('button', { name: /Generate Slides|Generating Slides/ });
    await generateSlidesButton.click();

    // Wait for slides to load (Step 3)
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Choose your preferred slide options')).toBeVisible();

    // Verify slides are present
    const slideCards = page.locator('.border-blue-100').filter({ has: page.locator('text=/Choose the version you prefer/i') });
    const slideCount = await slideCards.count();
    expect(slideCount).toBeGreaterThan(0);

    // Select an option for each slide (first option is pre-selected)
    // Just verify we can click on different options
    const firstSlideOptions = slideCards.first().locator('button').filter({ hasText: /Trigger:/ });
    if (await firstSlideOptions.count() > 1) {
      await firstSlideOptions.nth(1).click();
    }

    // Continue to speaker notes
    const continueToNotesButton = page.getByRole('button', { name: /Continue/ }).last();
    await continueToNotesButton.click();

    // Wait for speaker notes prompt (Step 4)
    await expect(page.getByText('Add Speaker Notes?')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/What are Speaker Notes/i)).toBeVisible();

    // Skip speaker notes
    const skipButton = page.getByRole('button', { name: /Skip - No Script Needed/ });
    await skipButton.click();

    // Verify we've navigated to editor view (sections generated)
    await expect(page.locator('.border-blue-100').first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow back navigation through wizard', async ({ page }) => {
    // Step 1: Enter topic and start wizard
    await page.getByText('Create from Scratch').click();

    const topicInput = page.getByPlaceholder(/AI-powered meeting assistant/);
    await topicInput.fill('Test presentation');

    const continueButton = page.getByRole('button', { name: /Continue/ });
    await continueButton.click();

    // Wait for Step 2
    await expect(page.getByText('Step 2 of 4')).toBeVisible({ timeout: 15000 });

    // Click Back button
    const backButton = page.getByRole('button', { name: /Back/ }).first();
    await backButton.click();

    // Verify we're back on Step 1
    await expect(page.getByText('Step 1 of 4')).toBeVisible();
    await expect(topicInput).toHaveValue('Test presentation'); // Topic should be preserved
  });

  test('should preserve form state when navigating back', async ({ page }) => {
    await page.getByText('Create from Scratch').click();

    // Fill topic with 8 slides
    const topicInput = page.getByPlaceholder(/AI-powered meeting assistant/);
    await topicInput.fill('State preservation test');

    const slideSlider = page.locator('input[type="range"]');
    await slideSlider.fill('8');

    // Verify slide count
    const slideCountDisplay = page.locator('text=/^8$/').first();
    await expect(slideCountDisplay).toBeVisible();

    // Continue
    await page.getByRole('button', { name: /Continue/ }).click();
    await expect(page.getByText('Step 2 of 4')).toBeVisible({ timeout: 15000 });

    // Go back
    await page.getByRole('button', { name: /Back/ }).first().click();
    await expect(page.getByText('Step 1 of 4')).toBeVisible();

    // Verify state is preserved
    await expect(topicInput).toHaveValue('State preservation test');
    await expect(slideCountDisplay).toBeVisible();
  });

  test('should show error when continuing without topic', async ({ page }) => {
    await page.getByText('Create from Scratch').click();

    // Try to continue without entering topic
    const continueButton = page.getByRole('button', { name: /Continue/ });

    // Button should be disabled
    await expect(continueButton).toBeDisabled();
  });

  test('should show error when continuing with unanswered questions', async ({ page }) => {
    await page.getByText('Create from Scratch').click();

    const topicInput = page.getByPlaceholder(/AI-powered meeting assistant/);
    await topicInput.fill('Test presentation');

    await page.getByRole('button', { name: /Continue/ }).click();
    await expect(page.getByText('Step 2 of 4')).toBeVisible({ timeout: 15000 });

    // Don't answer questions, try to continue
    const generateSlidesButton = page.getByRole('button', { name: /Generate Slides/ });

    // Button should be disabled when not all questions are answered
    await expect(generateSlidesButton).toBeDisabled();
  });
});
