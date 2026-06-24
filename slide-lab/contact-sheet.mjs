import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'out');
const pngs = readdirSync(OUT).filter(f=>/^slide-\d+\.png$/.test(f)).sort();
const tiles = pngs.map(f=>{
  const d = readFileSync(resolve(OUT,f)).toString('base64');
  return `<img src="data:image/png;base64,${d}">`;
}).join('');
const html = `<style>*{margin:0}body{background:#06090d;padding:26px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
img{width:100%;border-radius:10px;border:1px solid #1b2733;display:block}</style>${tiles}`;
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1320,height:900},deviceScaleFactor:1.4})).newPage();
await p.setContent(html,{waitUntil:'networkidle'});
await p.waitForTimeout(300);
await p.screenshot({path:resolve('docs/screenshots/showcase/ai-deck-demo.png'),fullPage:true});
await b.close();
console.log('contact sheet →', pngs.length, 'slides');
