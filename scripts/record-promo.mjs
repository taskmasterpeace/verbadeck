import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readdirSync, renameSync, rmSync } from 'node:fs';

const url = pathToFileURL(resolve('docs/promo/promo-player.html')).href;
const outDir = resolve('docs/promo/render');
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
// let the animatic play through (~44s) + a beat
await page.waitForFunction(() => window.__promoDone === true, null, { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(800);
const video = page.video();
await ctx.close();      // finalizes the webm
await browser.close();
// rename to a stable filename
const path = await video.path();
const dest = resolve(outDir, 'verbadeck-promo-45s.webm');
try { rmSync(dest); } catch {}
renameSync(path, dest);
console.log('VIDEO:', dest);
