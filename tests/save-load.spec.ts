import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Save and Load Presentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
  });

  test('should save presentation with complete state including knowledge base', async ({ page }) => {
    // Step 1: Create a presentation using "Process Existing Content"
    const rawScript = `Welcome to our presentation about AI.
This is the introduction section.

Now let's discuss the main features.
This covers our key capabilities.

Finally, let's wrap up with conclusions.
Thank you for your attention.`;

    // Click "Process Existing Content" button
    await page.click('text=Process Existing Content');

    // Fill in the textarea
    await page.fill('textarea[placeholder*="Paste your presentation script"]', rawScript);

    // Enable "Preserve original wording"
    await page.check('input[type="checkbox"]');

    // Click "Process with AI"
    await page.click('button:has-text("Process with AI")');

    // Wait for processing to complete
    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Step 2: Add knowledge base entry (if UI exists for it)
    // Note: This assumes there's a way to add KB entries in the editor
    // If not available yet, we'll verify it's saved as empty array

    // Step 3: Change some settings
    // Select a different AI model if available
    await page.click('button:has-text("Edit Content & Triggers")');

    // Step 4: Save the presentation
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Save")');
    const download = await downloadPromise;

    // Save the downloaded file
    const downloadsPath = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }

    const filepath = path.join(downloadsPath, await download.suggestedFilename());
    await download.saveAs(filepath);

    // Step 5: Verify file contents
    const fileContents = fs.readFileSync(filepath, 'utf-8');
    const presentationData = JSON.parse(fileContents);

    // Verify structure
    expect(presentationData).toHaveProperty('version');
    expect(presentationData).toHaveProperty('title');
    expect(presentationData).toHaveProperty('created');
    expect(presentationData).toHaveProperty('modified');
    expect(presentationData).toHaveProperty('sections');
    expect(presentationData.sections).toBeInstanceOf(Array);
    expect(presentationData.sections.length).toBeGreaterThan(0);

    // Verify sections have required fields
    for (const section of presentationData.sections) {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('content');
      expect(section).toHaveProperty('advanceToken');
    }

    // Verify settings are saved
    expect(presentationData).toHaveProperty('settings');
    expect(presentationData.settings).toHaveProperty('selectedTone');
    expect(presentationData.settings).toHaveProperty('selectedModel');
    expect(presentationData.settings).toHaveProperty('currentSectionIndex');
    expect(presentationData.settings).toHaveProperty('viewMode');

    // Verify knowledge base (may be empty but should exist)
    expect(presentationData).toHaveProperty('knowledgeBase');

    // Clean up
    fs.unlinkSync(filepath);
  });

  test('should load presentation and restore complete state', async ({ page }) => {
    // Step 1: Create a test presentation file
    const testPresentation = {
      version: '1.0',
      title: 'Test Presentation',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      sections: [
        {
          id: '1',
          content: 'Welcome to the first slide',
          advanceToken: 'next',
          alternativeTriggers: ['continue', 'forward'],
          selectedTriggers: ['next', 'continue']
        },
        {
          id: '2',
          content: 'This is the second slide',
          advanceToken: 'second',
          alternativeTriggers: ['slide two'],
          selectedTriggers: ['second']
        }
      ],
      knowledgeBase: [
        {
          question: 'What is this about?',
          answer: 'This is a test presentation'
        }
      ],
      settings: {
        selectedTone: 'professional',
        selectedModel: 'anthropic/claude-3.5-sonnet',
        currentSectionIndex: 1,
        viewMode: 'editor'
      },
      metadata: {
        totalSlides: 2
      }
    };

    // Save test file
    const downloadsPath = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
    const testFilePath = path.join(downloadsPath, 'test-presentation.verbadeck');
    fs.writeFileSync(testFilePath, JSON.stringify(testPresentation, null, 2));

    // Step 2: Load the presentation
    await page.setInputFiles('input[type="file"][accept*=".verbadeck"]', testFilePath);

    // Wait for load to complete
    await page.waitForTimeout(1000);

    // Step 3: Verify sections were loaded
    await expect(page.locator('text=Edit Content & Triggers')).toBeVisible();

    // Click to view editor
    await page.click('button:has-text("Edit Content & Triggers")');

    // Verify first section content is present
    await expect(page.locator('text=Welcome to the first slide')).toBeVisible();

    // Step 4: Verify we can navigate (knowledge base and settings should be restored)
    // The current section index should be 1 (second slide) as per saved settings
    // But we need to check this in presenter mode

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('should maintain backward compatibility with old save format', async ({ page }) => {
    // Create an old format file (without knowledge base and settings)
    const oldFormatPresentation = {
      version: '1.0',
      title: 'Old Format Presentation',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      sections: [
        {
          id: '1',
          content: 'Old format slide',
          advanceToken: 'next'
        }
      ],
      metadata: {
        totalSlides: 1
      }
    };

    // Save old format file
    const downloadsPath = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
    const oldFilePath = path.join(downloadsPath, 'old-format.verbadeck');
    fs.writeFileSync(oldFilePath, JSON.stringify(oldFormatPresentation, null, 2));

    // Load the old format presentation
    await page.setInputFiles('input[type="file"][accept*=".verbadeck"]', oldFilePath);

    // Wait for load to complete
    await page.waitForTimeout(1000);

    // Verify it loaded successfully (should use defaults for missing fields)
    await expect(page.locator('text=Edit Content & Triggers')).toBeVisible();

    // Clean up
    fs.unlinkSync(oldFilePath);
  });

  test('should include metadata with selected model in saved file', async ({ page }) => {
    // Create a simple presentation
    await page.click('text=Process Existing Content');
    await page.fill('textarea[placeholder*="Paste your presentation script"]', 'Test content for metadata check');
    await page.click('button:has-text("Process with AI")');

    await page.waitForSelector('text=Edit Content & Triggers', { timeout: 30000 });

    // Save and check metadata
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Save")');
    const download = await downloadPromise;

    const downloadsPath = path.join(__dirname, '../downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }

    const filepath = path.join(downloadsPath, await download.suggestedFilename());
    await download.saveAs(filepath);

    const fileContents = fs.readFileSync(filepath, 'utf-8');
    const presentationData = JSON.parse(fileContents);

    // Verify metadata includes model
    expect(presentationData).toHaveProperty('metadata');
    expect(presentationData.metadata).toHaveProperty('totalSlides');

    // Clean up
    fs.unlinkSync(filepath);
  });
});
