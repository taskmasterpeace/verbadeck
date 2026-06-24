#!/usr/bin/env node
/**
 * VerbaDeck slide pipeline — vertical slice.
 *   topic → LLM determines layout + writes copy + emits an image prompt (SlideLayout JSON)
 *         → Replicate (flux-schnell) generates the slot image
 *         → deterministic HTML render (REAL text) → Playwright PNG
 *
 * Run from repo root:  node slide-lab/generate-deck.mjs "your topic here"
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'out');
mkdirSync(OUT, { recursive: true });

// --- load keys from repo .env ---
for (const line of readFileSync(resolve(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].trim();
}
const OR_KEY = process.env.OPENROUTER_API_KEY;
const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });

const TOPIC = process.argv[2] || 'Investor pitch for VerbaDeck, a voice-driven presentation tool';
const N = Number(process.argv[3] || 5);

// ---------- 1. LLM determines the deck ----------
const SYSTEM = `You are a world-class presentation designer. Given a TOPIC, produce a deck as JSON.
For EACH slide, CHOOSE the best layout for that content from exactly these:
  "title"        -> { eyebrow, heading, subhead }
  "split"        -> { eyebrow, heading, bullets:[3] }       (image left, text right)
  "bullets"      -> { eyebrow, heading, bullets:[3-4] }
  "stat"         -> { eyebrow, stat, statLabel }            (one big number)
  "quote"        -> { quote, attribution }
  "image-forward"-> { eyebrow, heading }                    (full image, text lower-third)
Also write "imagePrompt": a vivid, cinematic prompt for the slide's BACKGROUND image — atmospheric,
on-brand (deep ocean-blue + teal, dark, premium, abstract or photographic), and containing NO TEXT,
NO WORDS, NO LETTERS in the image. Vary the layouts across the deck.

HARD RULE: every slide MUST include ALL text fields its layout requires — NEVER omit heading/eyebrow/
stat/quote. A slide with only an imagePrompt is invalid.
Example (note all fields present):
  {"layout":"title","eyebrow":"Series A · 2026","heading":"Present *hands-free*","subhead":"Your voice runs the deck.","imagePrompt":"abstract teal soundwave over deep navy, cinematic, no text"}
(In a "title" heading you may wrap 1-2 words in *asterisks* to gradient-highlight them.)
Return ONLY: {"slides":[ {"layout","imagePrompt", ...fields for that layout}, ... ]}`;

// Strict JSON schema → every field is required (model fills unused ones with ""/[]), so we never
// get missing fields or stray strings. This is the production-correct fix for layout determination.
const SLIDE_PROPS = {
  layout: { type: 'string', enum: ['title','split','bullets','stat','quote','image-forward'] },
  imagePrompt: { type: 'string' }, eyebrow: { type: 'string' }, heading: { type: 'string' },
  subhead: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } },
  stat: { type: 'string' }, statLabel: { type: 'string' }, quote: { type: 'string' }, attribution: { type: 'string' },
};
const SCHEMA = { name: 'deck', strict: true, schema: { type: 'object', additionalProperties: false,
  required: ['slides'], properties: { slides: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: Object.keys(SLIDE_PROPS), properties: SLIDE_PROPS } } } } };

async function planDeck() {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OR_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      response_format: { type: 'json_schema', json_schema: SCHEMA },
      temperature: 0.6,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `TOPIC: ${TOPIC}\nMake exactly ${N} slides. Open with a "title" slide. Vary the layouts.` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  return (parsed.slides || []).filter(s => s && typeof s === 'object' && s.layout).slice(0, N);
}

// ---------- 2. Replicate generates the slot image ----------
async function genImage(prompt, idx) {
  const out = await replicate.run('black-forest-labs/flux-schnell', {
    input: { prompt, aspect_ratio: '16:9', num_outputs: 1, output_format: 'webp', go_fast: true },
  });
  const item = Array.isArray(out) ? out[0] : out;
  const url = typeof item === 'string' ? item : (typeof item.url === 'function' ? item.url() : item);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const file = resolve(OUT, `img-${idx}.webp`);
  writeFileSync(file, buf);
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

// ---------- 3. Deterministic HTML render (real text) ----------
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BASE = `<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
*{margin:0;box-sizing:border-box} html,body{width:1280px;height:720px;overflow:hidden}
.s{width:1280px;height:720px;position:relative;background:#0a0f14;color:#eaf2f8;font-family:Inter,sans-serif;overflow:hidden}
.bg{position:absolute;inset:0;background-size:cover;background-position:center}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,12,17,.93) 36%,rgba(8,12,17,.3) 70%,transparent)}
.scrimB{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,12,17,.95),transparent 55%)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(140,210,235,.06) 1px,transparent 1px);background-size:30px 30px;opacity:.6}
.pad{position:absolute;inset:0;padding:76px 84px;display:flex;flex-direction:column;justify-content:center;z-index:2}
.eb{font-family:'JetBrains Mono',monospace;font-size:17px;letter-spacing:.24em;text-transform:uppercase;color:#2dd4bf}
h1{font-family:Sora,sans-serif;font-weight:800;letter-spacing:-.02em;line-height:1.04;margin-top:16px}
.grad{background:linear-gradient(100deg,#15a6d6,#2dd4bf);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{color:#9fb3c4;font-size:30px;margin-top:22px;max-width:780px;line-height:1.35}
ul{list-style:none;margin-top:26px;display:flex;flex-direction:column;gap:20px}
li{display:flex;gap:18px;font-size:29px;line-height:1.3;color:#dceaf4}.li-n{font-family:'JetBrains Mono',monospace;color:#2dd4bf;font-size:20px;padding-top:5px}
.brand{position:absolute;top:48px;right:56px;display:flex;align-items:center;gap:11px;font-family:Sora;font-weight:700;font-size:20px;z-index:3}
.dot{width:14px;height:14px;border-radius:4px;background:linear-gradient(135deg,#15a6d6,#2dd4bf)}
.split{display:grid;grid-template-columns:44% 56%;height:100%}.split .img{position:relative}.split .body{padding:70px 72px;display:flex;flex-direction:column;justify-content:center;background:#0a0f14}
</style>`;

function render(s, dataUri) {
  const brand = `<div class="brand"><span class="dot"></span> VerbaDeck</div>`;
  const bg = `<div class="bg" style="background-image:url('${dataUri}')"></div>`;
  if (s.layout === 'split') {
    return `${BASE}<div class="s split"><div class="img">${bg}<div class="grid"></div></div>
      <div class="body"><span class="eb">${esc(s.eyebrow)}</span><h1 style="font-size:46px">${esc(s.heading)}</h1>
      <ul>${(s.bullets||[]).map((b,i)=>`<li><span class="li-n">0${i+1}</span>${esc(b)}</li>`).join('')}</ul></div></div>`;
  }
  if (s.layout === 'stat') {
    return `${BASE}<div class="s">${bg}<div class="grid"></div><div class="scrim" style="background:linear-gradient(120deg,rgba(8,12,17,.9),rgba(8,12,17,.5))"></div>
      <div class="pad" style="align-items:flex-start">${brand}<span class="eb">${esc(s.eyebrow)}</span>
      <div class="grad" style="font-family:Sora;font-weight:800;font-size:190px;line-height:.9;letter-spacing:-.03em;margin-top:8px">${esc(s.stat)}</div>
      <p class="sub">${esc(s.statLabel)}</p></div></div>`;
  }
  if (s.layout === 'quote') {
    return `${BASE}<div class="s">${bg}<div class="scrim"></div><div class="pad">
      <div style="font-family:Sora;font-weight:700;font-size:50px;line-height:1.22;max-width:880px">“${esc(s.quote)}”</div>
      <div class="sub" style="font-size:24px;margin-top:30px">— ${esc(s.attribution)}</div></div></div>`;
  }
  if (s.layout === 'image-forward') {
    return `${BASE}<div class="s">${bg}<div class="scrimB"></div>${brand}<div class="pad" style="justify-content:flex-end">
      <span class="eb">${esc(s.eyebrow)}</span><h1 style="font-size:56px;max-width:900px">${esc(s.heading)}</h1></div></div>`;
  }
  if (s.layout === 'bullets') {
    return `${BASE}<div class="s">${bg}<div class="scrim"></div>${brand}<div class="pad"><span class="eb">${esc(s.eyebrow)}</span>
      <h1 style="font-size:48px;max-width:760px">${esc(s.heading)}</h1>
      <ul>${(s.bullets||[]).map((b,i)=>`<li><span class="li-n">0${i+1}</span>${esc(b)}</li>`).join('')}</ul></div></div>`;
  }
  // title (default)
  return `${BASE}<div class="s">${bg}<div class="grid"></div><div class="scrim" style="background:linear-gradient(120deg,rgba(8,12,17,.82),rgba(8,12,17,.4))"></div>
    ${brand}<div class="pad"><span class="eb">${esc(s.eyebrow)}</span>
    <h1 style="font-size:78px;max-width:900px">${esc(s.heading).replace(/\*(.+?)\*/g,'<span class="grad">$1</span>')}</h1>
    ${s.subhead?`<p class="sub">${esc(s.subhead)}</p>`:''}</div></div>`;
}

// ---------- orchestrate ----------
console.log(`\n🎯 Topic: ${TOPIC}\n🧠 Asking the LLM to design ${N} slides…`);
const slides = await planDeck();
// repair: never let a slide render blank if the LLM omits a required field
const REQ = { title:['heading'], split:['heading','bullets'], bullets:['heading','bullets'], stat:['stat','statLabel'], quote:['quote'], 'image-forward':['heading'] };
slides.forEach((s,i)=>{
  if (!s.eyebrow && s.layout!=='quote') s.eyebrow = 'VerbaDeck';
  if ((REQ[s.layout]||[]).some(f=>!s[f] || (Array.isArray(s[f]) && !s[f].length))) {
    s.heading ??= TOPIC.replace(/—.*/,'').trim();
    s.bullets = (s.bullets&&s.bullets.length)?s.bullets:['Voice-driven','Hands-free','Live AI Q&A'];
    s.stat ??= '—'; s.statLabel ??= ''; s.quote ??= TOPIC; s.attribution ??= '';
    console.warn(`  ⚠️  slide ${i+1} (${s.layout}) missing fields → repaired`);
  }
});
console.log(`✓ Layout plan: ${slides.map(s=>s.layout).join(' · ')}\n`);

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport:{width:1280,height:720}, deviceScaleFactor:1.5 })).newPage();

for (let i=0;i<slides.length;i++){
  const s = slides[i];
  process.stdout.write(`🖼️  Slide ${i+1} [${s.layout}] — generating image… `);
  let dataUri;
  try { dataUri = await genImage(s.imagePrompt, i+1); process.stdout.write('done. '); }
  catch(e){ process.stdout.write(`image FAILED (${e.message}); using gradient. `); dataUri=''; }
  await page.setContent(render(s, dataUri), { waitUntil:'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(OUT, `slide-${String(i+1).padStart(2,'0')}.png`) });
  console.log('rendered ✓');
}
writeFileSync(resolve(OUT,'deck.json'), JSON.stringify(slides,null,2));
await browser.close();
console.log(`\n✅ Deck done → slide-lab/out/  (slide-*.png + deck.json)\n`);
