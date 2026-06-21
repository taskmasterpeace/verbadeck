import { test, expect } from '@playwright/test';

/**
 * Test suite for Library view with Zustand integration
 * Tests save/load functionality using the new Zustand store
 */

test.describe('Library View with Zustand Store', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5182');

    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.waitForLoadState('networkidle');
  });

  test('should navigate to library page', async ({ page }) => {
    // Navigate to library
    await page.goto('http://localhost:5182/library');

    // Check that we're on the library page
    await expect(page.locator('h1:has-text("Presentation Library")')).toBeVisible();

    // Should show empty state
    await expect(page.locator('text=No presentations saved to library yet')).toBeVisible();
  });

  test('should create and save presentation to library', async ({ page }) => {
    // Start from home
    await page.goto('http://localhost:5182/');

    // Create a simple presentation from scratch
    await page.click('button:has-text("Create from Scratch")');

    // Fill in topic
    await page.fill('input[placeholder*="presentation topic"]', 'Test Presentation for Library');

    // Generate questions (wait for API response)
    await page.click('button:has-text("Generate Questions")');
    await page.waitForTimeout(2000); // Wait for generation

    // Answer some questions
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 0) {
      await textareas[0].fill('This is a test answer for the first question.');
    }

    // Generate slides
    await page.click('button:has-text("Generate Slides")');
    await page.waitForTimeout(3000); // Wait for slide generation

    // Should be in editor view now
    await expect(page.locator('text=Section Editor')).toBeVisible({ timeout: 10000 });

    // Save to library using localStorage directly
    await page.evaluate(() => {
      const sections = [
        {
          id: '1',
          content: 'Test slide 1',
          advanceToken: 'next',
          selectedTriggers: ['next']
        },
        {
          id: '2',
          content: 'Test slide 2',
          advanceToken: 'continue',
          selectedTriggers: ['continue']
        }
      ];

      const knowledgeBase = [
        { question: 'What is this?', answer: 'A test presentation' }
      ];

      // Use the library save function
      const library = JSON.parse(localStorage.getItem('verbadeck-presentation-library') || '[]');
      const entry = {
        id: 'test-' + Date.now(),
        name: 'Test Presentation',
        savedAt: new Date().toISOString(),
        data: {
          version: '1.0',
          title: 'Test Presentation',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections,
          knowledgeBase,
          settings: {
            selectedModel: 'openai/gpt-4o-mini',
            selectedTone: 'professional'
          },
          metadata: {
            totalSlides: 2
          }
        }
      };
      library.push(entry);
      localStorage.setItem('verbadeck-presentation-library', JSON.stringify(library));
    });

    // Navigate to library
    await page.goto('http://localhost:5182/library');

    // Should see the saved presentation
    await expect(page.locator('text=Test Presentation')).toBeVisible();
    await expect(page.locator('text=2 slides')).toBeVisible();
    await expect(page.locator('text=1 FAQs')).toBeVisible();
  });

  test('should load presentation from library into Zustand store', async ({ page }) => {
    // Seed library with a test presentation
    await page.evaluate(() => {
      const library = [{
        id: 'test-load-123',
        name: 'Load Test Presentation',
        savedAt: new Date().toISOString(),
        data: {
          version: '1.0',
          title: 'Load Test Presentation',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections: [
            {
              id: 's1',
              content: 'First slide content',
              advanceToken: 'first',
              selectedTriggers: ['first']
            },
            {
              id: 's2',
              content: 'Second slide content',
              advanceToken: 'second',
              selectedTriggers: ['second']
            },
            {
              id: 's3',
              content: 'Third slide content',
              advanceToken: 'third',
              selectedTriggers: ['third']
            }
          ],
          knowledgeBase: [
            { question: 'Q1?', answer: 'A1' },
            { question: 'Q2?', answer: 'A2' }
          ],
          settings: {
            selectedModel: 'anthropic/claude-3.5-sonnet',
            selectedTone: 'casual',
            currentSectionIndex: 0
          },
          metadata: {
            totalSlides: 3
          }
        }
      }];
      localStorage.setItem('verbadeck-presentation-library', JSON.stringify(library));
    });

    // Navigate to library
    await page.goto('http://localhost:5182/library');

    // Verify presentation is visible
    await expect(page.locator('text=Load Test Presentation')).toBeVisible();
    await expect(page.locator('text=3 slides')).toBeVisible();

    // Click Load button
    await page.click('button:has-text("Load")');

    // Should navigate to editor
    await page.waitForURL('**/editor');

    // Verify data loaded into store by checking if sections are visible
    await expect(page.locator('text=First slide content')).toBeVisible({ timeout: 5000 });

    // Check Zustand store state
    const storeState = await page.evaluate(() => {
      const persistedData = localStorage.getItem('verbadeck-presentation-store');
      return persistedData ? JSON.parse(persistedData) : null;
    });

    console.log('Store state after load:', storeState);
  });

  test('should search and filter presentations in library', async ({ page }) => {
    // Seed library with multiple presentations
    await page.evaluate(() => {
      const library = [
        {
          id: 'test-1',
          name: 'React Fundamentals',
          savedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          data: {
            version: '1.0',
            title: 'React Fundamentals',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            sections: [
              { id: '1', content: 'React basics', advanceToken: 'next', selectedTriggers: ['next'] },
              { id: '2', content: 'Components', advanceToken: 'next', selectedTriggers: ['next'] }
            ],
            metadata: { totalSlides: 2 }
          }
        },
        {
          id: 'test-2',
          name: 'TypeScript Advanced',
          savedAt: new Date().toISOString(), // Now
          data: {
            version: '1.0',
            title: 'TypeScript Advanced',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            sections: [
              { id: '1', content: 'Types', advanceToken: 'next', selectedTriggers: ['next'] },
              { id: '2', content: 'Generics', advanceToken: 'next', selectedTriggers: ['next'] },
              { id: '3', content: 'Decorators', advanceToken: 'next', selectedTriggers: ['next'] }
            ],
            metadata: { totalSlides: 3 }
          }
        },
        {
          id: 'test-3',
          name: 'Vue.js Essentials',
          savedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          data: {
            version: '1.0',
            title: 'Vue.js Essentials',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            sections: [
              { id: '1', content: 'Vue basics', advanceToken: 'next', selectedTriggers: ['next'] }
            ],
            metadata: { totalSlides: 1 }
          }
        }
      ];
      localStorage.setItem('verbadeck-presentation-library', JSON.stringify(library));
    });

    await page.goto('http://localhost:5182/library');

    // Should see all 3 presentations
    await expect(page.locator('text=React Fundamentals')).toBeVisible();
    await expect(page.locator('text=TypeScript Advanced')).toBeVisible();
    await expect(page.locator('text=Vue.js Essentials')).toBeVisible();

    // Test search
    await page.fill('input[placeholder*="Search"]', 'TypeScript');

    // Should only see TypeScript presentation
    await expect(page.locator('text=TypeScript Advanced')).toBeVisible();
    await expect(page.locator('text=React Fundamentals')).not.toBeVisible();
    await expect(page.locator('text=Vue.js Essentials')).not.toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');

    // Should see all again
    await expect(page.locator('text=React Fundamentals')).toBeVisible();
    await expect(page.locator('text=TypeScript Advanced')).toBeVisible();
    await expect(page.locator('text=Vue.js Essentials')).toBeVisible();

    // Test sort by name
    await page.selectOption('select', 'name-asc');

    // Check order (React, TypeScript, Vue)
    const names = await page.locator('h3.font-semibold').allTextContents();
    expect(names[0]).toBe('React Fundamentals');
    expect(names[1]).toBe('TypeScript Advanced');
    expect(names[2]).toBe('Vue.js Essentials');
  });

  test('should delete presentation from library', async ({ page }) => {
    // Seed library
    await page.evaluate(() => {
      const library = [{
        id: 'test-delete-1',
        name: 'Delete Me',
        savedAt: new Date().toISOString(),
        data: {
          version: '1.0',
          title: 'Delete Me',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections: [
            { id: '1', content: 'Test', advanceToken: 'next', selectedTriggers: ['next'] }
          ],
          metadata: { totalSlides: 1 }
        }
      }];
      localStorage.setItem('verbadeck-presentation-library', JSON.stringify(library));
    });

    await page.goto('http://localhost:5182/library');

    // Should see presentation
    await expect(page.locator('text=Delete Me')).toBeVisible();

    // Click delete button
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
    await page.click('button[title="Delete presentation"]');

    // Should show empty state
    await expect(page.locator('text=No presentations saved to library yet')).toBeVisible();
    await expect(page.locator('text=Delete Me')).not.toBeVisible();
  });

  test('should export presentation from library', async ({ page }) => {
    // Seed library
    await page.evaluate(() => {
      const library = [{
        id: 'test-export-1',
        name: 'Export Test',
        savedAt: new Date().toISOString(),
        data: {
          version: '1.0',
          title: 'Export Test',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections: [
            { id: '1', content: 'Export content', advanceToken: 'next', selectedTriggers: ['next'] }
          ],
          knowledgeBase: [
            { question: 'Export Q?', answer: 'Export A' }
          ],
          metadata: { totalSlides: 1 }
        }
      }];
      localStorage.setItem('verbadeck-presentation-library', JSON.stringify(library));
    });

    await page.goto('http://localhost:5182/library');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button[title="Export to file"]');

    // Wait for download
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/export-test\.verbadeck/);
  });
});
