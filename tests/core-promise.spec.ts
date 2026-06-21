import { test, expect, Page } from '@playwright/test';

/**
 * Core promise, end-to-end through the real app:
 *  - hands-free FORWARD / BACK slide navigation driven by spoken trigger words
 *  - debounce that prevents accidental double-advance
 *  - Q&A question detection
 *
 * Voice is driven through window.__verbadeck (testMode bridge) — the same
 * handleTranscript pipeline live audio uses, just without a microphone.
 */

type Bridge = {
  loadDemo: () => void;
  say: (t: string, isFinal?: boolean) => void;
  back: () => void;
  goto: (i: number) => void;
  enableQA: (on?: boolean) => void;
  getState: () => {
    currentSectionIndex: number;
    sectionCount: number;
    isListeningForQuestions: boolean;
    currentQuestion: string | null;
    isLoadingQA: boolean;
  };
};

declare global {
  interface Window { __verbadeck?: Bridge }
}

async function bootWithDemo(page: Page) {
  await page.goto('/?testMode=true', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__verbadeck, null, { timeout: 20000 });
  await page.evaluate(() => window.__verbadeck!.loadDemo());
  await page.waitForFunction(() => window.__verbadeck!.getState().sectionCount === 4, null, { timeout: 10000 });
}

const state = (page: Page) => page.evaluate(() => window.__verbadeck!.getState());

test.describe('Core promise: hands-free voice navigation', () => {
  test('loads the sample pitch into the presenter', async ({ page }) => {
    await bootWithDemo(page);
    expect((await state(page)).sectionCount).toBe(4);
    expect((await state(page)).currentSectionIndex).toBe(0);
    await expect(page).toHaveURL(/\/presenter/);
  });

  test('a non-trigger word does NOT advance the slide', async ({ page }) => {
    await bootWithDemo(page);
    await page.evaluate(() => window.__verbadeck!.say('let me tell you a quick story', true));
    await page.waitForTimeout(400);
    expect((await state(page)).currentSectionIndex).toBe(0);
  });

  test('speaking a trigger word advances the slide', async ({ page }) => {
    await bootWithDemo(page);
    await page.evaluate(() => window.__verbadeck!.say('here is the real problem we face', true));
    await page.waitForFunction(() => window.__verbadeck!.getState().currentSectionIndex === 1, null, { timeout: 5000 });
    expect((await state(page)).currentSectionIndex).toBe(1);
  });

  test('the BACK command returns to the previous slide', async ({ page }) => {
    await bootWithDemo(page);
    await page.evaluate(() => window.__verbadeck!.say('here is the real problem', true));
    await page.waitForFunction(() => window.__verbadeck!.getState().currentSectionIndex === 1, null, { timeout: 5000 });
    // wait out the 2s nav debounce, then go back by voice
    await page.waitForTimeout(2100);
    await page.evaluate(() => window.__verbadeck!.say('wait, go back', true));
    await page.waitForFunction(() => window.__verbadeck!.getState().currentSectionIndex === 0, null, { timeout: 5000 });
    expect((await state(page)).currentSectionIndex).toBe(0);
  });

  test('debounce blocks a second advance fired too soon', async ({ page }) => {
    await bootWithDemo(page);
    await page.evaluate(() => {
      window.__verbadeck!.say('the problem', true);   // advance 0 -> 1
      window.__verbadeck!.say('the solution', true);  // immediate: blocked by debounce
    });
    await page.waitForTimeout(600);
    expect((await state(page)).currentSectionIndex).toBe(1);
  });
});

test.describe('Core promise: live Q&A detection', () => {
  test('a spoken question is detected when Q&A is enabled', async ({ page }) => {
    await bootWithDemo(page);
    await page.evaluate(() => window.__verbadeck!.enableQA(true));
    await page.waitForFunction(() => window.__verbadeck!.getState().isListeningForQuestions === true, null, { timeout: 5000 });
    await page.evaluate(() => window.__verbadeck!.say('what is your traction so far?', true));
    // Detection sets currentQuestion synchronously, before any network answer.
    await page.waitForFunction(
      () => window.__verbadeck!.getState().currentQuestion?.includes('traction') ?? false,
      null,
      { timeout: 5000 },
    );
    expect((await state(page)).currentQuestion).toContain('traction');
  });
});
