import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'audit');

// Helper to collect console errors
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[console.error] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

// Helper to get all visible button texts
async function getButtonTexts(page: Page): Promise<string[]> {
  return page.locator('button:visible').allInnerTexts();
}

// Helper to check for overflow issues
async function checkOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const issues: string[] = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 5) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className?.toString().slice(0, 60) || '';
        issues.push(`Overflow: <${tag} class="${cls}"> extends ${Math.round(rect.right - window.innerWidth)}px beyond viewport`);
      }
    });
    return issues.slice(0, 20); // Limit to 20
  });
}

// Helper to check for broken images
async function checkBrokenImages(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const broken: string[] = [];
    document.querySelectorAll('img').forEach((img) => {
      if (!img.complete || img.naturalWidth === 0) {
        broken.push(`Broken image: src="${img.src}"`);
      }
    });
    return broken;
  });
}

// Helper to check for error/debug elements
async function checkDebugElements(page: Page): Promise<string[]> {
  const issues: string[] = [];
  const debugSelectors = [
    '[data-testid="debug"]',
    '.debug-panel',
    '.debug',
    '[class*="debug"]',
  ];
  for (const sel of debugSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) {
      issues.push(`Debug element visible: ${sel} (${count} instances)`);
    }
  }
  // Check for visible error messages
  const errorTexts = await page.locator('[class*="error"]:visible, [role="alert"]:visible').allInnerTexts();
  errorTexts.forEach((t) => {
    if (t.trim()) issues.push(`Error/alert visible: "${t.trim().slice(0, 100)}"`);
  });
  return issues;
}

test.describe('Full App Visual Audit', () => {
  test.describe.configure({ mode: 'serial' });

  // =========================================================
  // 1. DASHBOARD / HOME
  // =========================================================
  test('01 - Dashboard (/) at 1920x1080', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-dashboard-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Dashboard buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Dashboard overflow:', overflow);

    const broken = await checkBrokenImages(page);
    if (broken.length) console.log('Dashboard broken images:', broken);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Dashboard debug elements:', debug);

    if (errors.length) console.log('Dashboard console errors:', errors);

    // Basic sanity
    await expect(page.locator('body')).toBeVisible();
  });

  // =========================================================
  // 2. CREATE FROM SCRATCH
  // =========================================================
  test('02 - Create from Scratch (/create/scratch)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/create/scratch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-create-scratch-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Create Scratch buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Create Scratch overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Create Scratch debug:', debug);

    if (errors.length) console.log('Create Scratch errors:', errors);
  });

  // =========================================================
  // 3. PROCESS WITH AI
  // =========================================================
  test('03 - Process with AI (/create/process)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/create/process');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-create-process-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Process AI buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Process AI overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Process AI debug:', debug);

    if (errors.length) console.log('Process AI errors:', errors);
  });

  // =========================================================
  // 4. EDITOR (3 tabs)
  // =========================================================
  test('04 - Editor (/editor) - all tabs', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Default tab
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04a-editor-default-tab.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Editor buttons:', buttons);

    // Try to find tab buttons and click through them
    const tabs = page.locator('[role="tab"], button:has-text("Knowledge Base"), button:has-text("Test Triggers"), button:has-text("Edit Content")');
    const tabCount = await tabs.count();
    console.log(`Editor tab count: ${tabCount}`);

    for (let i = 0; i < tabCount; i++) {
      const tabText = await tabs.nth(i).innerText();
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      const safeName = tabText.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `04-editor-tab-${safeName}.png`), fullPage: true });
      console.log(`Editor tab clicked: "${tabText}"`);
    }

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Editor overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Editor debug:', debug);

    if (errors.length) console.log('Editor errors:', errors);
  });

  // =========================================================
  // 5. PRESENTER VIEW
  // =========================================================
  test('05 - Presenter (/presenter)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/presenter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-presenter-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Presenter buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Presenter overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Presenter debug:', debug);

    if (errors.length) console.log('Presenter errors:', errors);
  });

  // =========================================================
  // 6. KNOW IT ALL WALL
  // =========================================================
  test('06 - Know It All (/know-it-all)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/know-it-all');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-know-it-all-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Know It All buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Know It All overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Know It All debug:', debug);

    if (errors.length) console.log('Know It All errors:', errors);
  });

  // =========================================================
  // 7. LIBRARY
  // =========================================================
  test('07 - Library (/library)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-library-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Library buttons:', buttons);

    const overflow = await checkOverflow(page);
    if (overflow.length) console.log('Library overflow:', overflow);

    const debug = await checkDebugElements(page);
    if (debug.length) console.log('Library debug:', debug);

    if (errors.length) console.log('Library errors:', errors);
  });

  // =========================================================
  // 8. AUDIENCE VIEW
  // =========================================================
  test('08 - Audience (/audience)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/audience');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-audience-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Audience buttons:', buttons);

    if (errors.length) console.log('Audience errors:', errors);
  });

  // =========================================================
  // 9. CONTROLLER
  // =========================================================
  test('09 - Controller (/controller)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/controller');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-controller-1920.png'), fullPage: true });

    const buttons = await getButtonTexts(page);
    console.log('Controller buttons:', buttons);

    if (errors.length) console.log('Controller errors:', errors);
  });

  // =========================================================
  // 10. SETTINGS SIDEBAR
  // =========================================================
  test('10 - Settings sidebar panel', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Settings is opened via CustomEvent('open-settings')
    // First try clicking the Settings button in sidebar nav
    const settingsBtn = page.locator('button:has-text("Settings"), [aria-label="Settings"], nav >> text=Settings').first();
    const settingsExists = await settingsBtn.count();

    if (settingsExists > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-settings-sidebar-open.png'), fullPage: true });
      console.log('Settings sidebar opened via button click');
    } else {
      // Dispatch the custom event directly
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-settings'));
      });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-settings-sidebar-dispatch.png'), fullPage: true });
      console.log('Settings sidebar opened via CustomEvent');
    }

    if (errors.length) console.log('Settings errors:', errors);
  });

  // =========================================================
  // 11. RESPONSIVE - 768px (Tablet)
  // =========================================================
  test('11 - Responsive 768px - key pages', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    const errors = collectConsoleErrors(page);

    const routes = [
      { path: '/', name: 'dashboard' },
      { path: '/create/scratch', name: 'create-scratch' },
      { path: '/create/process', name: 'create-process' },
      { path: '/editor', name: 'editor' },
      { path: '/presenter', name: 'presenter' },
      { path: '/know-it-all', name: 'know-it-all' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `11-tablet-768-${route.name}.png`), fullPage: true });

      const overflow = await checkOverflow(page);
      if (overflow.length) console.log(`Tablet 768 ${route.name} overflow:`, overflow);
    }

    if (errors.length) console.log('Tablet 768 errors:', errors);
    await context.close();
  });

  // =========================================================
  // 12. RESPONSIVE - 375px (Mobile)
  // =========================================================
  test('12 - Responsive 375px - key pages', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    const errors = collectConsoleErrors(page);

    const routes = [
      { path: '/', name: 'dashboard' },
      { path: '/create/scratch', name: 'create-scratch' },
      { path: '/create/process', name: 'create-process' },
      { path: '/editor', name: 'editor' },
      { path: '/presenter', name: 'presenter' },
      { path: '/know-it-all', name: 'know-it-all' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `12-mobile-375-${route.name}.png`), fullPage: true });

      const overflow = await checkOverflow(page);
      if (overflow.length) console.log(`Mobile 375 ${route.name} overflow:`, overflow);
    }

    // Try to open mobile sidebar/hamburger menu
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [class*="hamburger"], button:has(svg):first-child').first();
    if (await hamburger.count() > 0) {
      await hamburger.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-mobile-375-sidebar-open.png'), fullPage: true });
      console.log('Mobile sidebar opened');
    } else {
      console.log('No hamburger/menu button found on mobile');
    }

    if (errors.length) console.log('Mobile 375 errors:', errors);
    await context.close();
  });

  // =========================================================
  // 13. RESPONSIVE - 1440px (Desktop)
  // =========================================================
  test('13 - Responsive 1440px - key pages', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = collectConsoleErrors(page);

    const routes = [
      { path: '/', name: 'dashboard' },
      { path: '/create/scratch', name: 'create-scratch' },
      { path: '/editor', name: 'editor' },
      { path: '/presenter', name: 'presenter' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `13-desktop-1440-${route.name}.png`), fullPage: true });

      const overflow = await checkOverflow(page);
      if (overflow.length) console.log(`Desktop 1440 ${route.name} overflow:`, overflow);
    }

    if (errors.length) console.log('Desktop 1440 errors:', errors);
    await context.close();
  });

  // =========================================================
  // 14. 404 PAGE
  // =========================================================
  test('14 - 404 page (/nonexistent)', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/nonexistent-page-12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-404-page.png'), fullPage: true });

    const bodyText = await page.locator('body').innerText();
    console.log('404 page text:', bodyText.slice(0, 200));

    if (errors.length) console.log('404 errors:', errors);
  });

  // =========================================================
  // 15. BUTTON STYLE CONSISTENCY CHECK
  // =========================================================
  test('15 - Button style consistency across pages', async ({ page }) => {
    const routes = ['/', '/create/scratch', '/create/process', '/editor', '/presenter'];
    const allButtonInfo: { route: string; buttons: string[] }[] = [];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const buttons = await getButtonTexts(page);
      allButtonInfo.push({ route, buttons });
    }

    console.log('=== BUTTON AUDIT ===');
    allButtonInfo.forEach(({ route, buttons }) => {
      console.log(`${route}: [${buttons.map(b => b.trim().slice(0, 40)).join(', ')}]`);
    });
  });

  // =========================================================
  // 16. EMPTY STATE CHECK
  // =========================================================
  test('16 - Empty state appearance', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    // Editor with no content should show empty state
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-editor-empty-state.png'), fullPage: true });

    // Presenter with no content
    await page.goto('/presenter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-presenter-empty-state.png'), fullPage: true });

    // Library (may be empty)
    await page.goto('/library');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-library-empty-state.png'), fullPage: true });

    if (errors.length) console.log('Empty state errors:', errors);
  });
});
