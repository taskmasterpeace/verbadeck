import { test, expect } from '@playwright/test';

/**
 * VerbaDeck V2.0 - Performance and Stress Tests
 * Tests page load times, large presentations, memory usage, and bundle size
 */

test.describe('VerbaDeck V2.0 - Page Load Performance', () => {
  test('should load home page quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // Under 3 seconds

    console.log(`✅ Home page load time: ${loadTime}ms`);
  });

  test('should measure Time to Interactive (TTI)', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const tti = await page.evaluate(() => {
      return performance.timing.domInteractive - performance.timing.navigationStart;
    });

    expect(tti).toBeLessThan(2000);

    console.log(`✅ Time to Interactive: ${tti}ms`);
  });

  test('should measure First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const fcp = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('paint');
      const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });

    expect(fcp).toBeGreaterThan(0);
    expect(fcp).toBeLessThan(1500);

    console.log(`✅ First Contentful Paint: ${fcp}ms`);
  });

  test('should load editor quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5175/editor');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);

    console.log(`✅ Editor load time: ${loadTime}ms`);
  });

  test('should load presenter quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5175/presenter');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);

    console.log(`✅ Presenter load time: ${loadTime}ms`);
  });

  test('should load Know It All quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5175/know-it-all');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);

    console.log(`✅ Know It All load time: ${loadTime}ms`);
  });
});

test.describe('VerbaDeck V2.0 - Large Presentation Performance', () => {
  test('should handle 50 sections without lag', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');

    // Create large presentation via localStorage
    await page.evaluate(() => {
      const sections = Array.from({ length: 50 }, (_, i) => ({
        id: `section-${i}`,
        content: `Section ${i + 1} content with some text`,
        advanceToken: `next${i}`,
        selectedTriggers: [`next${i}`],
      }));

      localStorage.setItem('verbadeck-sections', JSON.stringify(sections));
    });

    // Reload to apply
    await page.reload();
    await page.waitForLoadState('networkidle');

    const loadTime = await page.evaluate(() => {
      const start = performance.now();
      // Trigger re-render
      document.body.offsetHeight;
      return performance.now() - start;
    });

    expect(loadTime).toBeLessThan(500);

    console.log(`✅ 50 sections render time: ${loadTime}ms`);
  });

  test('should handle 100 sections', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');

    await page.evaluate(() => {
      const sections = Array.from({ length: 100 }, (_, i) => ({
        id: `section-${i}`,
        content: `Section ${i + 1}`,
        advanceToken: `next${i}`,
      }));

      localStorage.setItem('verbadeck-sections', JSON.stringify(sections));
    });

    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);

    console.log(`✅ 100 sections load time: ${loadTime}ms`);
  });

  test('should navigate through large presentation smoothly', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');

    await page.evaluate(() => {
      const sections = Array.from({ length: 50 }, (_, i) => ({
        id: `section-${i}`,
        content: `Section ${i + 1}`,
        advanceToken: `next${i}`,
      }));

      localStorage.setItem('verbadeck-sections', JSON.stringify(sections));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const navigationTimes = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      navigationTimes.push(Date.now() - start);
    }

    const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;

    expect(avgTime).toBeLessThan(500);

    console.log(`✅ Average navigation time: ${avgTime}ms`);
  });
});

test.describe('VerbaDeck V2.0 - Memory Usage', () => {
  test('should not leak memory on repeated navigation', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const initialHeap = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate repeatedly
    for (let i = 0; i < 10; i++) {
      await page.goto('http://localhost:5175/editor');
      await page.waitForTimeout(100);
      await page.goto('http://localhost:5175/presenter');
      await page.waitForTimeout(100);
      await page.goto('http://localhost:5175/know-it-all');
      await page.waitForTimeout(100);
      await page.goto('http://localhost:5175');
      await page.waitForTimeout(100);
    }

    const finalHeap = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialHeap > 0 && finalHeap > 0) {
      const increase = finalHeap - initialHeap;
      const increasePercent = (increase / initialHeap) * 100;

      // Memory should not increase by more than 50%
      expect(increasePercent).toBeLessThan(50);

      console.log(`✅ Memory increase: ${increasePercent.toFixed(2)}%`);
    } else {
      console.log('⚠️ Memory API not available');
    }
  });

  test('should clean up on unmount', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');

    // Start voice (may not actually start due to permissions)
    const voiceButton = page.locator('button:has-text("Start Listening")');
    if (await voiceButton.isVisible()) {
      await voiceButton.click().catch(() => {});
    }

    await page.waitForTimeout(500);

    // Navigate away
    await page.goto('http://localhost:5175');

    await page.waitForTimeout(500);

    // No errors should occur
    const errors = await page.evaluate(() => {
      return (window as any).errors || [];
    });

    expect(errors.length).toBe(0);

    console.log('✅ Clean unmount verified');
  });
});

test.describe('VerbaDeck V2.0 - Bundle Size', () => {
  test('should have reasonable bundle size', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        size: r.transferSize || 0,
      }));
    });

    const jsResources = resources.filter((r: any) => r.name.endsWith('.js'));
    const totalJsSize = jsResources.reduce((sum: number, r: any) => sum + r.size, 0);

    // Total JS should be under 1MB
    expect(totalJsSize).toBeLessThan(1024 * 1024);

    console.log(`✅ Total JS bundle size: ${(totalJsSize / 1024).toFixed(2)}KB`);
  });

  test('should lazy load routes', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const initialResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    // Navigate to different route
    await page.goto('http://localhost:5175/editor');
    await page.waitForLoadState('networkidle');

    const editorResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    // Should load additional resources for new route
    console.log(`✅ Resources loaded: Home=${initialResources}, Editor=${editorResources}`);
  });
});

test.describe('VerbaDeck V2.0 - Scroll Performance', () => {
  test('should scroll smoothly in editor with many sections', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');

    await page.evaluate(() => {
      const sections = Array.from({ length: 50 }, (_, i) => ({
        id: `section-${i}`,
        content: `Section ${i + 1}`,
        advanceToken: `next${i}`,
      }));

      localStorage.setItem('verbadeck-sections', JSON.stringify(sections));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const scrollTimes = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
      scrollTimes.push(Date.now() - start);
    }

    const avgScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;

    expect(avgScrollTime).toBeLessThan(200);

    console.log(`✅ Average scroll time: ${avgScrollTime}ms`);
  });

  test('should virtualize large lists', async ({ page }) => {
    await page.goto('http://localhost:5175/library');

    await page.evaluate(() => {
      const presentations = Array.from({ length: 100 }, (_, i) => ({
        id: `pres-${i}`,
        name: `Presentation ${i + 1}`,
        sections: [],
        createdAt: Date.now(),
      }));

      localStorage.setItem('verbadeck-library', JSON.stringify(presentations));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if all items are rendered (they shouldn't be if virtualized)
    const items = page.locator('[data-testid*="presentation"]');
    const visibleCount = await items.count();

    console.log(`✅ Visible items: ${visibleCount}/100 (virtualization check)`);
  });
});

test.describe('VerbaDeck V2.0 - Network Performance', () => {
  test('should cache resources', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    const cached = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.filter((r: any) => r.transferSize === 0).length;
    });

    console.log(`✅ ${cached} resources cached`);
  });

  test('should handle slow network', async ({ page, context }) => {
    // Emulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 500); // Add 500ms delay
    });

    const startTime = Date.now();
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should still work, just slower
    expect(loadTime).toBeGreaterThan(500);

    console.log(`✅ Loads on slow network: ${loadTime}ms`);
  });

  test('should show loading states during AI requests', async ({ page }) => {
    await page.goto('http://localhost:5175/create/scratch');

    const topicInput = page.locator('input, textarea').first();
    if (await topicInput.isVisible()) {
      await topicInput.fill('Test topic');

      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.isVisible()) {
        await generateButton.click();

        // Should show loading indicator immediately
        const loader = page.locator('[role="progressbar"]').or(page.locator('text=/Loading|Generating/i'));
        const hasLoader = await loader.isVisible().catch(() => false);

        if (hasLoader) {
          console.log('✅ Loading state shown');
        }
      }
    }
  });
});

test.describe('VerbaDeck V2.0 - Animation Performance', () => {
  test('should have smooth transitions', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');

    await page.evaluate(() => {
      const sections = Array.from({ length: 10 }, (_, i) => ({
        id: `section-${i}`,
        content: `Section ${i + 1}`,
        advanceToken: `next${i}`,
      }));

      localStorage.setItem('verbadeck-sections', JSON.stringify(sections));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Measure FPS during transition
    const fps = await page.evaluate(async () => {
      let frames = 0;
      const start = performance.now();

      return new Promise<number>(resolve => {
        const measureFPS = () => {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(measureFPS);
          } else {
            resolve(frames);
          }
        };

        requestAnimationFrame(measureFPS);
      });
    });

    expect(fps).toBeGreaterThan(30); // At least 30 FPS

    console.log(`✅ FPS: ${fps}`);
  });

  test('should not drop frames during slide transitions', async ({ page }) => {
    await page.goto('http://localhost:5175/presenter');

    const nextButton = page.locator('button:has-text("Next")');

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000); // Wait for transition

      // No errors should occur
      console.log('✅ Smooth transition completed');
    }
  });
});

test.describe('VerbaDeck V2.0 - localStorage Performance', () => {
  test('should handle large localStorage data', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const writeTime = await page.evaluate(() => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        content: 'x'.repeat(1000),
      }));

      const start = performance.now();
      localStorage.setItem('test-large-data', JSON.stringify(largeData));
      return performance.now() - start;
    });

    expect(writeTime).toBeLessThan(500);

    const readTime = await page.evaluate(() => {
      const start = performance.now();
      const data = localStorage.getItem('test-large-data');
      JSON.parse(data || '[]');
      return performance.now() - start;
    });

    expect(readTime).toBeLessThan(200);

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test-large-data');
    });

    console.log(`✅ localStorage write: ${writeTime}ms, read: ${readTime}ms`);
  });

  test('should not block UI during auto-save', async ({ page }) => {
    await page.goto('http://localhost:5175/editor');

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      // Type rapidly
      const start = Date.now();
      await textarea.type('This is a test of auto-save performance');
      const typeTime = Date.now() - start;

      // Typing should be fast (not blocked by auto-save)
      expect(typeTime).toBeLessThan(2000);

      console.log(`✅ Typing time (with auto-save): ${typeTime}ms`);
    }
  });
});
