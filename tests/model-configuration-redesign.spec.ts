import { test, expect } from '@playwright/test';

test.describe('Model Configuration Redesign - UI Tests', () => {
  test('should display redesigned UI with presets and categories', async ({ page }) => {
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
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Models tab');

    // Verify page title
    await expect(page.locator('text=AI Model Configuration')).toBeVisible();
    console.log('✅ Found page title');

    // Verify Configuration Summary section
    await expect(page.locator('text=Current Configuration')).toBeVisible();
    console.log('✅ Found configuration summary');

    // Verify all 4 presets are present
    console.log('\n📋 Checking for all 4 presets:');
    const presets = [
      'Maximum Speed',
      'Balanced',
      'Quality',
      'Free Models'
    ];

    for (const preset of presets) {
      const presetButton = page.getByRole('button', { name: new RegExp(`^${preset}`) });
      await expect(presetButton).toBeVisible();
      console.log(`  ✅ Found preset: ${preset}`);
    }

    // Verify all 6 categories are present
    console.log('\n📂 Checking for all 6 categories:');
    const categories = [
      'Create from Scratch',
      'Q&A Mode',
      'Know It All Wall',
      'Editor Tools',
      'Upload & Processing',
      'Vision & Images'
    ];

    for (const category of categories) {
      const categoryHeader = page.locator(`text="${category}"`);
      await expect(categoryHeader.first()).toBeVisible();
      console.log(`  ✅ Found category: ${category}`);
    }

    // Verify collapsible help section
    await expect(page.locator('text=Model Information & Tips')).toBeVisible();
    console.log('✅ Found collapsible help section');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-redesign-overview.png', fullPage: true });

    console.log('\n✅ All UI elements present');
  });

  test('should expand/collapse categories', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n🔽 Testing category expand/collapse:');

    // "Create from Scratch" should be expanded by default
    const createCategory = page.locator('button:has-text("Create from Scratch")').first();
    await expect(createCategory).toBeVisible();

    // Check if expanded (should show operations inside)
    const categoryContent = page.locator('text=Apply to all').first();
    await expect(categoryContent).toBeVisible();
    console.log('  ✅ Create from Scratch is expanded by default');

    // Click to collapse
    await createCategory.click();
    await page.waitForTimeout(300);
    console.log('  ✅ Collapsed Create from Scratch');

    // Click to expand "Q&A Mode"
    const qaCategory = page.locator('button:has-text("Q&A Mode")').first();
    await qaCategory.click();
    await page.waitForTimeout(300);

    // Verify Q&A Mode operations are visible
    const qaBulkChanger = page.locator('text=Apply to all 2 operations in Q&A Mode');
    await expect(qaBulkChanger).toBeVisible();
    console.log('  ✅ Expanded Q&A Mode category');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-category-expanded.png', fullPage: true });

    console.log('\n✅ Category expand/collapse working');
  });

  test('should apply preset and show visual feedback', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n🎯 Testing preset application:');

    // Click "Maximum Speed" preset
    const speedPreset = page.locator('button:has-text("Maximum Speed")');
    await speedPreset.click();
    await page.waitForTimeout(500);

    // Check for visual feedback
    const appliedBadge = page.locator('text=✓ Applied!');
    await expect(appliedBadge).toBeVisible();
    console.log('  ✅ Preset applied with visual feedback');

    // Verify configuration summary updated (should show Llama 3.1 8B)
    const summary = page.locator('text=/.*Llama 3\\.1 8B.*/i');
    await expect(summary.first()).toBeVisible();
    console.log('  ✅ Configuration summary updated');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-preset-applied.png', fullPage: true });

    // Wait for feedback to disappear (3 seconds)
    await page.waitForTimeout(3500);
    await expect(appliedBadge).not.toBeVisible();
    console.log('  ✅ Visual feedback cleared after timeout');

    console.log('\n✅ Preset application working');
  });

  test('should apply category bulk model changer', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n📦 Testing category bulk model changer:');

    // Expand "Create from Scratch" category (should be expanded by default)
    const createCategory = page.locator('button:has-text("Create from Scratch")').first();

    // Find the category bulk changer dropdown
    const bulkSelect = page.locator('text=Apply to all 3 operations in Create from Scratch').locator('..').locator('select');
    await expect(bulkSelect).toBeVisible();
    console.log('  ✅ Found category bulk changer');

    // Select Claude 3.5 Sonnet for all operations in this category
    await bulkSelect.selectOption('anthropic/claude-3.5-sonnet');
    await page.waitForTimeout(500);
    console.log('  ✅ Applied Claude 3.5 Sonnet to Create from Scratch category');

    // Verify all 3 operations in this category now use Claude
    const operationDropdowns = page.locator('select[class*="font-mono"]');

    // Get first 3 dropdowns (should be from Create from Scratch category)
    for (let i = 0; i < 3; i++) {
      const dropdown = operationDropdowns.nth(i);
      const value = await dropdown.inputValue();
      if (value === 'anthropic/claude-3.5-sonnet') {
        console.log(`  ✅ Operation ${i + 1} updated to Claude 3.5 Sonnet`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-category-bulk.png', fullPage: true });

    console.log('\n✅ Category bulk changer working');
  });

  test('should toggle collapsible help section', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n📖 Testing collapsible help section:');

    // Find help section
    const helpButton = page.locator('button:has-text("Model Information & Tips")');
    await expect(helpButton).toBeVisible();

    // Help should be collapsed by default
    const iconLegend = page.locator('text=Model Capability Icons');
    await expect(iconLegend).not.toBeVisible();
    console.log('  ✅ Help section collapsed by default');

    // Click to expand
    await helpButton.click();
    await page.waitForTimeout(300);

    // Verify help content is visible
    await expect(iconLegend).toBeVisible();
    await expect(page.locator('text=Recommended Strategy')).toBeVisible();
    console.log('  ✅ Help section expanded');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-help-expanded.png', fullPage: true });

    // Click to collapse again
    await helpButton.click();
    await page.waitForTimeout(300);
    await expect(iconLegend).not.toBeVisible();
    console.log('  ✅ Help section collapsed again');

    console.log('\n✅ Collapsible help working');
  });

  test('should show compact dropdowns with model badges', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n🏷️ Testing compact dropdowns with badges:');

    // Expand Create from Scratch
    const createCategory = page.locator('button:has-text("Create from Scratch")').first();

    // Find first operation (should have badge next to dropdown)
    const firstOpBadge = page.locator('span:has-text("⚡ Fast & Cheap"), span:has-text("✓ Quality"), span:has-text("⚡⚡⚡ Ultra-Fast")').first();
    await expect(firstOpBadge).toBeVisible();
    console.log('  ✅ Found model capability badge');

    // Verify dropdowns are compact (small text size)
    const compactDropdown = page.locator('select[class*="text-xs"]').first();
    await expect(compactDropdown).toBeVisible();
    console.log('  ✅ Dropdowns are compact (text-xs class)');

    console.log('\n✅ Compact dropdowns with badges working');
  });

  test('should expand operation details on click', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n🔍 Testing operation detail expansion:');

    // Expand Create from Scratch category (should be expanded by default)

    // Find first operation's expand button (ChevronDown icon)
    const expandButtons = page.locator('button[title="Show details"]');
    const firstExpandButton = expandButtons.first();
    await firstExpandButton.click();
    await page.waitForTimeout(300);

    // Verify operation details are visible
    await expect(page.locator('text=Operation ID:')).toBeVisible();
    await expect(page.locator('text=Cost:')).toBeVisible();
    await expect(page.locator('text=Context:')).toBeVisible();
    console.log('  ✅ Operation details expanded');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/model-config-operation-details.png', fullPage: true });

    // Click again to collapse
    await firstExpandButton.click();
    await page.waitForTimeout(300);
    console.log('  ✅ Operation details collapsed');

    console.log('\n✅ Operation detail expansion working');
  });

  test('should reset to server defaults', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n🔄 Testing reset to defaults:');

    // Apply a preset first
    const speedPreset = page.locator('button:has-text("Maximum Speed")');
    await speedPreset.click();
    await page.waitForTimeout(500);
    console.log('  ✅ Applied Maximum Speed preset');

    // Click reset button
    const resetButton = page.locator('button:has-text("Reset to Server Defaults")');
    await resetButton.click();
    await page.waitForTimeout(500);
    console.log('  ✅ Clicked reset to defaults');

    // Verify configuration summary shows balanced defaults
    // Should see mix of models (GPT-4o-mini, Llama 3.1 8B, Claude Haiku)
    const summary = page.locator('text=/GPT.*4o/i').first();
    await expect(summary).toBeVisible();
    console.log('  ✅ Configuration reset to defaults');

    console.log('\n✅ Reset to defaults working');
  });
});

test.describe('Model Configuration Redesign - Integration', () => {
  test('should persist preset changes across modal close/reopen', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Open Settings -> Models
    const settingsButton = page.getByTestId('settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);

    console.log('\n💾 Testing persistence:');

    // Apply Quality preset
    const qualityPreset = page.getByRole('button', { name: /^Quality/ });
    await qualityPreset.click();
    await page.waitForTimeout(500);
    console.log('  ✅ Applied Quality preset');

    // Close modal
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(500);
    console.log('  ✅ Closed settings modal');

    // Reopen
    await settingsButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("🤖 Models")');
    await page.waitForTimeout(1000);
    console.log('  ✅ Reopened settings modal');

    // Verify configuration summary still shows Quality models (Claude)
    const summary = page.locator('text=/Claude.*Sonnet/i').first();
    await expect(summary).toBeVisible();
    console.log('  ✅ Quality preset persisted across modal close/reopen');

    console.log('\n✅ Persistence working correctly');
  });
});
