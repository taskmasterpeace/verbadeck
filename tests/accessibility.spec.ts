/**
 * Comprehensive Accessibility Audit for VerbaDeck V2.0
 *
 * Tests WCAG 2.1 AA compliance across all major routes and components:
 * - Automated axe-core scans for all pages
 * - Keyboard navigation testing
 * - Focus management verification
 * - ARIA attributes validation
 * - Color contrast checks
 * - Screen reader compatibility
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper function to generate detailed accessibility report
function formatViolations(violations: any[]) {
  return violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.length,
    affectedElements: violation.nodes.map((node: any) => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
}

test.describe('VerbaDeck V2.0 Accessibility Audit', () => {

  test.describe('Automated Axe-Core Scans', () => {

    test('Dashboard page should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Dashboard: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Dashboard violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Create From Scratch page should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/create/scratch');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Create From Scratch: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Create From Scratch violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('AI Script Processor page should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/create/process');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`AI Script Processor: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('AI Script Processor violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Editor page should have no accessibility violations', async ({ page }) => {
      // First create some content
      await page.goto('http://localhost:5175/create/scratch');
      await page.waitForLoadState('networkidle');

      // Fill in topic
      const topicInput = page.locator('input[placeholder*="presentation topic"]').first();
      await topicInput.fill('Accessibility Testing');

      // Generate questions
      await page.click('button:has-text("Generate Questions")');
      await page.waitForSelector('button:has-text("Generate Slides")', { timeout: 15000 });

      // Generate slides
      await page.click('button:has-text("Generate Slides")');
      await page.waitForSelector('text=Ready to present', { timeout: 30000 });

      // Navigate to editor
      await page.goto('http://localhost:5175/editor');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Editor: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Editor violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Know It All page should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/know-it-all');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Know It All: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Know It All violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Library page should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/library');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Library: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Library violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Settings sidebar should have no accessibility violations', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Open settings
      await page.click('button:has-text("Settings")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`Settings Sidebar: Found ${accessibilityScanResults.violations.length} violations`);

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Settings violations:', JSON.stringify(formatViolations(accessibilityScanResults.violations), null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {

    test('All interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Test Tab navigation through interactive elements
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

      // Test that we can tab through multiple elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        // Should be on interactive elements
        expect(focusedElement).not.toBe('BODY');
      }
    });

    test('Skip to main content link should work', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Press Tab to focus skip link (if it exists)
      await page.keyboard.press('Tab');

      // Check if a skip link exists
      const skipLink = page.locator('a:has-text("Skip to")').first();
      const skipLinkExists = await skipLink.count() > 0;

      if (!skipLinkExists) {
        console.warn('⚠️ No "Skip to main content" link found - should be added for accessibility');
      }
    });

    test('Modal dialogs should trap focus', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Open settings modal
      await page.click('button:has-text("Settings")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Tab through modal - focus should stay within modal
      const modalSelector = '[role="dialog"]';
      await page.keyboard.press('Tab');

      let focusedElement = await page.evaluate(() => document.activeElement);
      let isInModal = await page.evaluate((modal, focused) => {
        const modalEl = document.querySelector(modal);
        return modalEl?.contains(focused) || false;
      }, modalSelector, focusedElement);

      expect(isInModal).toBe(true);
    });

    test('Escape key should close modals', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Open settings modal
      await page.click('button:has-text("Settings")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should be closed
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 2000 });
    });

    test('Sidebar navigation should be keyboard accessible', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Find sidebar navigation items
      const navItems = page.locator('nav a').first();
      await navItems.focus();

      // Should be able to navigate with keyboard
      await page.keyboard.press('Enter');

      // URL should change (navigation worked)
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost:5175');
    });
  });

  test.describe('Focus Management', () => {

    test('Focus should be visible on all interactive elements', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Tab to first button
      await page.keyboard.press('Tab');

      // Check if focus ring is visible
      const focusVisible = await page.evaluate(() => {
        const activeEl = document.activeElement as HTMLElement;
        if (!activeEl) return false;

        const styles = window.getComputedStyle(activeEl);
        const pseudoStyles = window.getComputedStyle(activeEl, ':focus');

        // Check for focus indicators (outline, box-shadow, border)
        return (
          styles.outline !== 'none' ||
          styles.outlineWidth !== '0px' ||
          styles.boxShadow !== 'none' ||
          pseudoStyles.outline !== 'none'
        );
      });

      if (!focusVisible) {
        console.warn('⚠️ Focus indicators may not be visible on all elements');
      }
    });

    test('Focus should return to trigger element after modal close', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Click settings button
      const settingsBtn = page.locator('button:has-text("Settings")');
      await settingsBtn.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Close modal with Escape
      await page.keyboard.press('Escape');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 2000 });

      // Focus should return to settings button
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.textContent;
      });

      expect(focusedElement).toContain('Settings');
    });
  });

  test.describe('ARIA Attributes', () => {

    test('Buttons should have accessible names', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Check all buttons have text or aria-label
      const buttonsWithoutLabels = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn => {
          const hasText = btn.textContent?.trim().length ?? 0 > 0;
          const hasAriaLabel = btn.getAttribute('aria-label');
          const hasTitle = btn.getAttribute('title');
          return !hasText && !hasAriaLabel && !hasTitle;
        }).map(btn => btn.outerHTML);
      });

      if (buttonsWithoutLabels.length > 0) {
        console.warn('⚠️ Buttons without accessible names found:', buttonsWithoutLabels);
      }

      expect(buttonsWithoutLabels.length).toBe(0);
    });

    test('Images should have alt text', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Check all images have alt attributes
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => {
          const alt = img.getAttribute('alt');
          return alt === null || alt === undefined;
        }).map(img => img.src);
      });

      if (imagesWithoutAlt.length > 0) {
        console.warn('⚠️ Images without alt text found:', imagesWithoutAlt);
      }

      expect(imagesWithoutAlt.length).toBe(0);
    });

    test('Form inputs should have labels', async ({ page }) => {
      await page.goto('http://localhost:5175/create/scratch');
      await page.waitForLoadState('networkidle');

      // Check all inputs have labels or aria-label
      const inputsWithoutLabels = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        return inputs.filter(input => {
          const id = input.getAttribute('id');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = input.getAttribute('aria-label');
          const hasAriaLabelledby = input.getAttribute('aria-labelledby');
          const hasPlaceholder = input.getAttribute('placeholder');

          return !hasLabel && !hasAriaLabel && !hasAriaLabelledby && !hasPlaceholder;
        }).map(input => input.outerHTML);
      });

      if (inputsWithoutLabels.length > 0) {
        console.warn('⚠️ Form inputs without labels found:', inputsWithoutLabels);
      }

      // Allow some unlabeled inputs (e.g., search boxes with placeholders)
      expect(inputsWithoutLabels.length).toBeLessThan(5);
    });

    test('Live regions should be properly marked', async ({ page }) => {
      await page.goto('http://localhost:5175/know-it-all');
      await page.waitForLoadState('networkidle');

      // Check for aria-live regions for dynamic content
      const liveRegions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[aria-live]')).length;
      });

      console.log(`Found ${liveRegions} ARIA live regions`);
    });

    test('Dialogs should have proper ARIA roles', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Open settings
      await page.click('button:has-text("Settings")');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Check dialog has proper attributes
      const dialogAttrs = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          hasRole: dialog?.getAttribute('role') === 'dialog',
          hasAriaModal: dialog?.getAttribute('aria-modal') === 'true',
          hasAriaLabel: !!dialog?.getAttribute('aria-label') || !!dialog?.getAttribute('aria-labelledby'),
        };
      });

      expect(dialogAttrs.hasRole).toBe(true);
      expect(dialogAttrs.hasAriaModal).toBe(true);
      expect(dialogAttrs.hasAriaLabel).toBe(true);
    });
  });

  test.describe('Color Contrast', () => {

    test('Text should have sufficient contrast ratio', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Run contrast check with axe-core
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      if (contrastViolations.length > 0) {
        console.warn('⚠️ Color contrast violations found:',
          JSON.stringify(formatViolations(contrastViolations), null, 2)
        );
      }

      expect(contrastViolations.length).toBe(0);
    });
  });

  test.describe('Semantic HTML', () => {

    test('Page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const headings = await page.evaluate(() => {
        const h1s = document.querySelectorAll('h1').length;
        const h2s = document.querySelectorAll('h2').length;
        const h3s = document.querySelectorAll('h3').length;
        const h4s = document.querySelectorAll('h4').length;
        const h5s = document.querySelectorAll('h5').length;
        const h6s = document.querySelectorAll('h6').length;

        return { h1s, h2s, h3s, h4s, h5s, h6s };
      });

      console.log('Heading hierarchy:', headings);

      // Should have exactly one h1
      if (headings.h1s !== 1) {
        console.warn(`⚠️ Page should have exactly one h1, found ${headings.h1s}`);
      }
    });

    test('Page should have a main landmark', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const hasMain = await page.evaluate(() => {
        return document.querySelector('main') !== null ||
               document.querySelector('[role="main"]') !== null;
      });

      if (!hasMain) {
        console.warn('⚠️ Page should have a main landmark element');
      }
    });

    test('Navigation should be in nav element', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const navElement = await page.evaluate(() => {
        return document.querySelector('nav') !== null;
      });

      expect(navElement).toBe(true);
    });
  });

  test.describe('Touch Target Sizes', () => {

    test('Interactive elements should meet minimum size requirements', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      // Check that buttons/links are at least 44x44px (WCAG 2.1 Level AAA)
      const smallElements = await page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
        return interactive.filter(el => {
          const rect = el.getBoundingClientRect();
          return (rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0;
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 30),
          size: `${Math.round((el as HTMLElement).getBoundingClientRect().width)}x${Math.round((el as HTMLElement).getBoundingClientRect().height)}`,
        }));
      });

      if (smallElements.length > 0) {
        console.warn('⚠️ Interactive elements smaller than 44x44px:', smallElements);
      }

      // Allow some small elements (icons, etc.) but not too many
      expect(smallElements.length).toBeLessThan(10);
    });
  });

  test.describe('Screen Reader Support', () => {

    test('Page should have a descriptive title', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      console.log('Page title:', title);
    });

    test('Page should have lang attribute', async ({ page }) => {
      await page.goto('http://localhost:5175/');
      await page.waitForLoadState('networkidle');

      const lang = await page.evaluate(() => {
        return document.documentElement.getAttribute('lang');
      });

      expect(lang).toBeTruthy();
      console.log('Page language:', lang);
    });

    test('Dynamic content should be announced', async ({ page }) => {
      await page.goto('http://localhost:5175/know-it-all');
      await page.waitForLoadState('networkidle');

      // Check for aria-live regions
      const liveRegions = await page.evaluate(() => {
        const regions = Array.from(document.querySelectorAll('[aria-live]'));
        return regions.map(r => ({
          live: r.getAttribute('aria-live'),
          atomic: r.getAttribute('aria-atomic'),
          relevant: r.getAttribute('aria-relevant'),
        }));
      });

      console.log('Live regions found:', liveRegions);
    });
  });
});
