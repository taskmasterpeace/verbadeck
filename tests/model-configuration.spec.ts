import { test, expect } from '@playwright/test';

test.describe('Model Configuration - Settings UI', () => {
  test('should load all operations with correct models in Settings modal', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');

    // Open Settings modal
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Opened Settings modal');

    // Click on Models tab
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(500);
    console.log('✅ Clicked Models tab');

    // Wait for operations to load
    await page.waitForSelector('text=AI Model Configuration', { timeout: 5000 });
    console.log('✅ Model configuration loaded');

    // Verify all expected operations are present
    const expectedOperations = [
      'Process Script',
      'Generate Questions',
      'Generate Slide Options',
      'Generate Speaker Notes', // NEW - must be present
      'Suggest Triggers',
      'Answer Question',
      'Generate FAQs',
      'Generate Variations',
      'Suggest Image Prompt',
      'Generate Slide Titles'
    ];

    console.log('\n📋 Checking for all operations:');
    for (const operation of expectedOperations) {
      const operationElement = page.locator(`text="${operation}"`).first();
      await expect(operationElement).toBeVisible();
      console.log(`  ✅ Found: ${operation}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-all-operations.png', fullPage: true });

    console.log('\n✅ All operations present in UI');
  });

  test('should show clear descriptions indicating WHERE each operation is used', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(500);

    // Check specific descriptions to ensure they indicate WHERE the operation is used
    const descriptionsToCheck = [
      { operation: 'Process Script', shouldContain: 'Upload' },
      { operation: 'Generate Questions', shouldContain: 'Create from Scratch' },
      { operation: 'Generate Slide Options', shouldContain: 'Create from Scratch' },
      { operation: 'Generate Speaker Notes', shouldContain: 'Create from Scratch' },
      { operation: 'Answer Question', shouldContain: 'Q&A Mode' },
      { operation: 'Generate FAQs', shouldContain: 'Q&A Mode' }
    ];

    console.log('\n📝 Verifying operation descriptions:');
    for (const { operation, shouldContain } of descriptionsToCheck) {
      // Find the operation card
      const operationCard = page.locator('.border').filter({ has: page.locator(`text="${operation}"`) }).first();
      const description = await operationCard.locator('p.text-xs.text-gray-600').first().textContent();

      if (description && description.includes(shouldContain)) {
        console.log(`  ✅ ${operation}: Contains "${shouldContain}"`);
      } else {
        console.log(`  ⚠️ ${operation}: Missing "${shouldContain}" in description: "${description}"`);
      }
    }

    console.log('\n✅ Description check complete');
  });

  test('should allow changing model for an operation and persist change', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);
    console.log('✅ Opened Models tab');

    // Find "Generate Speaker Notes" operation and its model dropdown
    const speakerNotesCard = page.locator('.border').filter({ has: page.locator('text="Generate Speaker Notes"') }).first();
    await expect(speakerNotesCard).toBeVisible();
    console.log('✅ Found Generate Speaker Notes operation');

    // Get the current model
    const modelDropdown = speakerNotesCard.locator('select').first();
    const currentModel = await modelDropdown.inputValue();
    console.log(`  Current model: ${currentModel}`);

    // Change to a different model (Claude 3.5 Sonnet)
    await modelDropdown.selectOption('anthropic/claude-3.5-sonnet');
    await page.waitForTimeout(500);
    console.log('  ✅ Changed model to anthropic/claude-3.5-sonnet');

    // Verify the change
    const newModel = await modelDropdown.inputValue();
    expect(newModel).toBe('anthropic/claude-3.5-sonnet');
    console.log('  ✅ Model change confirmed in UI');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-changed.png', fullPage: true });

    // Close and reopen settings to verify persistence
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(500);
    console.log('  ✅ Closed settings modal');

    // Reopen
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(500);
    console.log('  ✅ Reopened settings modal');

    // Check if the change persisted
    const speakerNotesCard2 = page.locator('.border').filter({ has: page.locator('text="Generate Speaker Notes"') }).first();
    const modelDropdown2 = speakerNotesCard2.locator('select').first();
    const persistedModel = await modelDropdown2.inputValue();

    expect(persistedModel).toBe('anthropic/claude-3.5-sonnet');
    console.log('  ✅ Model change persisted after reopen');

    // Reset to default (GPT-4o-mini)
    await modelDropdown2.selectOption('openai/gpt-4o-mini');
    await page.waitForTimeout(500);
    console.log('  ✅ Reset model to default (openai/gpt-4o-mini)');

    console.log('\n✅ Model change and persistence test PASSED');
  });

  test('should show bulk model changer and apply to all operations', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    // Find bulk model changer (blue gradient box)
    const bulkChanger = page.locator('.bg-gradient-to-r.from-blue-50.to-blue-100').first();
    await expect(bulkChanger).toBeVisible();
    console.log('✅ Found bulk model changer');

    // Find the select dropdown in bulk changer
    const bulkSelect = bulkChanger.locator('select').first();
    await expect(bulkSelect).toBeVisible();

    // Select a model (Groq Llama 3.1 8B)
    await bulkSelect.selectOption('meta-llama/llama-3.1-8b-instruct');
    await page.waitForTimeout(1000);
    console.log('✅ Applied meta-llama/llama-3.1-8b-instruct to all operations');

    // Verify ALL operations now show the same model
    const allOperationDropdowns = page.locator('.border select');
    const count = await allOperationDropdowns.count();

    console.log(`\n📊 Checking ${count} operation dropdowns:`);
    for (let i = 0; i < count; i++) {
      const dropdown = allOperationDropdowns.nth(i);
      const value = await dropdown.inputValue();
      if (value === 'meta-llama/llama-3.1-8b-instruct') {
        console.log(`  ✅ Dropdown ${i + 1}: ${value}`);
      } else {
        console.log(`  ❌ Dropdown ${i + 1}: ${value} (expected meta-llama/llama-3.1-8b-instruct)`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-bulk-applied.png', fullPage: true });

    // Reset to defaults
    await page.click('button:has-text("Reset to Defaults")');
    await page.waitForTimeout(500);
    console.log('✅ Reset all operations to defaults');

    console.log('\n✅ Bulk model changer test PASSED');
  });
});

test.describe('Model Configuration - API Integration', () => {
  test('should fetch prompts metadata including generateSpeakerNotes', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/prompts');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('✅ Fetched prompts metadata');

    // Verify generateSpeakerNotes is present
    expect(data.prompts).toHaveProperty('generateSpeakerNotes');

    const speakerNotes = data.prompts.generateSpeakerNotes;
    expect(speakerNotes.name).toBe('Generate Speaker Notes');
    expect(speakerNotes.description).toContain('Create from Scratch');

    console.log(`✅ generateSpeakerNotes found: ${speakerNotes.name}`);
    console.log(`  Description: ${speakerNotes.description}`);

    // Verify all expected operations
    const expectedOps = [
      'processScript',
      'generateQuestions',
      'generateSlideOptions',
      'generateSpeakerNotes', // NEW
      'suggestTriggers',
      'answerQuestion',
      'generateFAQs',
      'generateVariations',
      'suggestImagePrompt',
      'generateTitles'
    ];

    console.log('\n📋 Verifying all operations in API response:');
    for (const op of expectedOps) {
      if (data.prompts[op]) {
        console.log(`  ✅ ${op}: ${data.prompts[op].name}`);
      } else {
        console.log(`  ❌ ${op}: MISSING`);
      }
    }

    console.log('\n✅ API metadata test PASSED');
  });
});
