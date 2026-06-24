#!/usr/bin/env node
/**
 * Export leg test — the SAME SlideLayout JSON (out/deck.json) → a real, editable .pptx via PptxGenJS.
 * Proves "one JSON → HTML render AND PowerPoint" with real, editable text. Run after generate-deck.mjs.
 *   node slide-lab/to-pptx.mjs
 */
import pptxgen from 'pptxgenjs';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'out');
const slides = JSON.parse(readFileSync(resolve(OUT, 'deck.json'), 'utf8'));

const INK = '0A0F14', TEAL = '2DD4BF', LIGHT = '15A6D6', PAPER = 'EAF2F8', MUT = '9FB3C4';
const pptx = new pptxgen();
pptx.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
pptx.layout = 'W';

for (const s of slides) {
  const sl = pptx.addSlide();
  sl.background = { color: INK };
  sl.addText('VerbaDeck', { x: 10.3, y: 0.32, w: 2.7, h: 0.4, align: 'right', color: PAPER, bold: true, fontSize: 14 });
  const eb = (y) => s.eyebrow && sl.addText(s.eyebrow.toUpperCase(), { x: 0.9, y, w: 11, h: 0.4, color: TEAL, fontFace: 'Consolas', fontSize: 13, charSpacing: 3 });

  if (s.layout === 'stat') {
    eb(2.4);
    sl.addText(s.stat || '', { x: 0.85, y: 2.7, w: 9, h: 2.2, color: LIGHT, bold: true, fontSize: 120 });
    sl.addText(s.statLabel || '', { x: 0.9, y: 5.0, w: 10, h: 0.7, color: PAPER, fontSize: 24 });
  } else if (s.layout === 'quote') {
    sl.addText(`“${s.quote || ''}”`, { x: 0.9, y: 2.1, w: 11.5, h: 2.6, color: PAPER, bold: true, fontSize: 34 });
    sl.addText(`— ${s.attribution || ''}`, { x: 0.9, y: 4.8, w: 11, h: 0.6, color: MUT, fontSize: 18 });
  } else {
    eb(1.6);
    sl.addText((s.heading || '').replace(/\*/g, ''), { x: 0.85, y: 2.0, w: 11.6, h: 1.5, color: PAPER, bold: true, fontSize: 44 });
    if (s.subhead) sl.addText(s.subhead, { x: 0.9, y: 3.5, w: 10, h: 0.8, color: MUT, fontSize: 24 });
    if (s.bullets?.length) sl.addText(
      s.bullets.map((b) => ({ text: b, options: { bullet: { code: '2022' }, color: PAPER, fontSize: 22, paraSpaceAfter: 16 } })),
      { x: 1.0, y: 3.7, w: 11.3, h: 3 });
  }
}

const file = resolve(OUT, 'deck.pptx');
await pptx.writeFile({ fileName: file });
console.log(`✅ Editable PowerPoint written → slide-lab/out/deck.pptx (${slides.length} slides, real text boxes)`);
