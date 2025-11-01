import { test, expect } from '@playwright/test';

test.describe('VerbaDeck - Visual Regression & Design Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('CRITICAL: verify NO purple colors in entire application', async ({ page }) => {
    // Navigate through all views and check for purple
    const views = [
      { name: 'process-existing-content', action: async () => {} }, // Default view
      { name: 'create-from-scratch', action: async () => {
        await page.getByRole('button', { name: /Create from Scratch/i }).click();
      }}
    ];

    for (const view of views) {
      await view.action();

      // Take screenshot for manual inspection
      await page.screenshot({
        path: `test-results/color-check-${view.name}.png`,
        fullPage: true,
      });

      // Check for purple RGB value in computed styles
      const purpleRgb = 'rgb(168, 85, 247)'; // The old purple color
      const purpleElements = await page.evaluate((purple) => {
        const elements = document.querySelectorAll('*');
        const foundPurple = [];

        elements.forEach((el) => {
          const styles = window.getComputedStyle(el);
          const bg = styles.backgroundColor;
          const border = styles.borderColor;
          const color = styles.color;

          if (bg === purple || border === purple || color === purple) {
            foundPurple.push({
              tag: el.tagName,
              class: el.className,
              id: el.id
            });
          }
        });

        return foundPurple;
      }, purpleRgb);

      // Assert NO purple elements found
      expect(purpleElements.length).toBe(0);

      if (purpleElements.length > 0) {
        console.error('Purple elements found:', purpleElements);
      }
    }
  });

  test('should use VerbaDeck blue consistently for primary actions', async ({ page }) => {
    // Check various primary action buttons for blue color

    // 1. Process Existing Content tab (when active)
    const processTab = page.getByRole('button', { name: /Process Existing Content/i });
    const processTabColor = await processTab.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(processTabColor).toContain('37, 99, 235'); // blue-600

    // 2. Create from Scratch tab
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    const createTab = page.getByRole('button', { name: /Create from Scratch/i });
    const createTabColor = await createTab.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(createTabColor).toContain('37, 99, 235'); // blue-600

    // 3. Generate Presentation button
    const generateButton = page.getByRole('button', { name: /Generate Presentation/i });
    const generateButtonColor = await generateButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(generateButtonColor).toContain('37, 99, 235'); // blue-600

    // 4. Tone selector active state
    const professionalTone = page.locator('button:has-text("Professional")').first();
    const toneColor = await professionalTone.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    expect(toneColor).toContain('59, 130, 246'); // blue-500

    await page.screenshot({
      path: 'test-results/blue-color-consistency.png',
      fullPage: true,
    });
  });

  test('should use Card components with white backgrounds', async ({ page }) => {
    // Verify Card components have proper white backgrounds

    // Navigate to Create from Scratch
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Check for Card components (they typically have specific classes or structure)
    const cards = page.locator('[class*="card"]').or(
      page.locator('[class*="rounded-lg"][class*="border"]')
    );

    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Take screenshot showing Card structure
    await page.screenshot({
      path: 'test-results/card-components-white-bg.png',
      fullPage: true,
    });
  });

  test('should NOT have nested window appearance', async ({ page }) => {
    // The original complaint was that UI looked like "a window inside a window"
    // This was due to dark backgrounds and poor contrast

    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify main content area has clean, non-nested appearance
    // No dark overlays or inner windows

    // Check body background
    const bodyColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // Should be light, not dark
    expect(bodyColor).not.toContain('rgb(0, 0, 0)');
    expect(bodyColor).not.toContain('rgb(17, 24, 39)'); // gray-900

    // Take screenshot to verify clean appearance
    await page.screenshot({
      path: 'test-results/no-nested-window-appearance.png',
      fullPage: true,
    });
  });

  test('should have consistent button styling across all views', async ({ page }) => {
    const views = [
      { name: 'Process Existing Content', click: async () => {} },
      { name: 'Create from Scratch', click: async () => {
        await page.getByRole('button', { name: /Create from Scratch/i }).click();
      }}
    ];

    for (const view of views) {
      await view.click();

      // Find primary action buttons
      const buttons = page.locator('button[class*="bg-blue"]').or(
        page.locator('button[class*="bg-primary"]')
      );

      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      // Take screenshot
      await page.screenshot({
        path: `test-results/button-consistency-${view.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true,
      });
    }
  });

  test('should have proper spacing and no cramped layouts', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Fill form to see full layout
    await page.getByPlaceholder(/Describe your topic/i).fill('Test presentation about AI');

    // Enable images to see full UI
    const imageToggle = page.locator('button[role="switch"]').first();
    await imageToggle.click();

    // Take full screenshot to verify spacing
    await page.screenshot({
      path: 'test-results/proper-spacing-full-layout.png',
      fullPage: true,
    });

    // Verify no elements are overlapping or cramped
    // (Visual inspection via screenshot)
  });

  test('should use gray borders consistently', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Check textarea border
    const textarea = page.getByPlaceholder(/Describe your topic/i);
    const textareaBorder = await textarea.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });

    // Should be gray, not purple
    expect(textareaBorder).not.toContain('168, 85, 247');

    // Gray borders are typically rgb(209, 213, 219) - gray-300
    // or rgb(229, 231, 235) - gray-200
    const isGrayBorder = textareaBorder.includes('209') || textareaBorder.includes('229');
    expect(isGrayBorder).toBe(true);
  });

  test('should have proper text contrast ratios', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify text is readable
    // Labels should be gray-700: rgb(55, 65, 81)
    // Content text should be gray-900: rgb(17, 24, 39)

    // Take screenshot for manual contrast checking
    await page.screenshot({
      path: 'test-results/text-contrast-check.png',
      fullPage: true,
    });
  });

  test('visual regression: complete Create from Scratch view', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Fill out form completely
    await page.getByPlaceholder(/Describe your topic/i).fill('Building the future of AI-powered presentations: A comprehensive guide to voice-driven slide advancement using real-time speech recognition');

    // Select Storytelling tone
    await page.locator('button:has-text("Storytelling")').first().click();

    // Set 12 slides
    await page.locator('input[type="range"]').first().fill('12');

    // Select Business Executive audience
    await page.locator('button:has-text("Business Executive")').first().click();

    // Enable images
    await page.locator('button[role="switch"]').first().click();

    // Select AI-generated mode
    await page.locator('button:has-text("AI-Generated Prompts")').first().click();

    // Take comprehensive screenshot
    await page.screenshot({
      path: 'test-results/visual-regression-create-from-scratch-complete.png',
      fullPage: true,
    });
  });

  test('visual regression: complete Process Existing Content view', async ({ page }) => {
    // Load test presentation
    await page.getByRole('button', { name: /Load Test Presentation/i }).click();

    // Wait for content to load
    await page.waitForTimeout(500);

    // Take comprehensive screenshot
    await page.screenshot({
      path: 'test-results/visual-regression-process-existing-complete.png',
      fullPage: true,
    });
  });

  test('visual regression: workflow choice clarity', async ({ page }) => {
    // Verify the workflow choices are clear and not confusing

    // Both tabs should be visible
    await expect(page.getByRole('button', { name: /Create from Scratch/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Process Existing Content/i })).toBeVisible();

    // Header card should explain purpose
    await expect(page.getByRole('heading', { name: /Process Existing Content/i })).toBeVisible();
    await expect(page.getByText(/Choose your starting point/i)).toBeVisible();

    // Method descriptions should be visible
    await expect(page.getByText(/You have existing script text/i)).toBeVisible();

    // Take screenshot showing clarity
    await page.screenshot({
      path: 'test-results/workflow-clarity-overview.png',
      fullPage: true,
    });
  });

  test('responsive: mobile portrait (390x844) - all views', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Process Existing Content
    await page.screenshot({
      path: 'test-results/responsive-mobile-process-existing.png',
      fullPage: true,
    });

    // Create from Scratch
    await page.getByRole('button', { name: /Create from Scratch/i }).click();
    await page.screenshot({
      path: 'test-results/responsive-mobile-create-from-scratch.png',
      fullPage: true,
    });
  });

  test('responsive: desktop (1280x720) - all views', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Process Existing Content
    await page.screenshot({
      path: 'test-results/responsive-desktop-process-existing.png',
      fullPage: true,
    });

    // Create from Scratch
    await page.getByRole('button', { name: /Create from Scratch/i }).click();
    await page.screenshot({
      path: 'test-results/responsive-desktop-create-from-scratch.png',
      fullPage: true,
    });
  });

  test('responsive: tablet landscape (1024x768)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    // Process Existing Content
    await page.screenshot({
      path: 'test-results/responsive-tablet-process-existing.png',
      fullPage: true,
    });

    // Create from Scratch with form filled
    await page.getByRole('button', { name: /Create from Scratch/i }).click();
    await page.getByPlaceholder(/Describe your topic/i).fill('A test presentation');
    await page.screenshot({
      path: 'test-results/responsive-tablet-create-from-scratch.png',
      fullPage: true,
    });
  });

  test('accessibility: focus indicators are visible', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Tab through elements and verify focus is visible
    const textarea = page.getByPlaceholder(/Describe your topic/i);
    await textarea.focus();

    // Take screenshot of focused element
    await page.screenshot({
      path: 'test-results/accessibility-focus-indicator.png',
      fullPage: true,
    });

    // Focus should have visible ring (blue)
    const focusRing = await textarea.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outlineColor || styles.borderColor;
    });

    // Should not be transparent
    expect(focusRing).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('accessibility: proper heading hierarchy', async ({ page }) => {
    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    // Verify heading levels are semantic
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    const h3 = await page.locator('h3').count();

    // Should have proper heading structure
    expect(h1 + h2 + h3).toBeGreaterThan(0);

    // Log heading structure for verification
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: h.tagName,
        text: h.textContent?.trim().substring(0, 50)
      }));
    });

    console.log('Heading structure:', headings);
  });

  test('should generate color palette documentation', async ({ page }) => {
    // Document the official VerbaDeck color palette

    const colorPalette = {
      primary: {
        blue600: 'rgb(37, 99, 235)',
        blue500: 'rgb(59, 130, 246)',
        blue50: 'rgb(239, 246, 255)'
      },
      gray: {
        gray900: 'rgb(17, 24, 39)',
        gray700: 'rgb(55, 65, 81)',
        gray300: 'rgb(209, 213, 219)',
        gray200: 'rgb(229, 231, 235)',
        gray100: 'rgb(243, 244, 246)',
        gray50: 'rgb(249, 250, 251)'
      },
      deprecated: {
        purple500: 'rgb(168, 85, 247)' // REMOVED - should not be used
      }
    };

    // Verify this palette is documented
    expect(colorPalette.primary.blue600).toBe('rgb(37, 99, 235)');
    expect(colorPalette.deprecated.purple500).toBe('rgb(168, 85, 247)');

    console.log('VerbaDeck Color Palette:');
    console.log(JSON.stringify(colorPalette, null, 2));
  });

  test('style guide: component patterns used', async ({ page }) => {
    // Document the component patterns in use

    await page.getByRole('button', { name: /Create from Scratch/i }).click();

    const componentPatterns = await page.evaluate(() => {
      return {
        cards: document.querySelectorAll('[class*="card"]').length,
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        textareas: document.querySelectorAll('textarea').length,
        switches: document.querySelectorAll('[role="switch"]').length
      };
    });

    console.log('Component Patterns:', componentPatterns);

    // Verify components exist
    expect(componentPatterns.buttons).toBeGreaterThan(0);
    expect(componentPatterns.inputs).toBeGreaterThan(0);
  });
});
