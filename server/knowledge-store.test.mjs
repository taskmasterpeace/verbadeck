/**
 * Unit tests for the Knowledge Brain core (embeddings + store).
 * Offline + deterministic — uses the local embedder, no network.
 * Run: node --test server/knowledge-store.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { chunkText, KnowledgeStore, deriveTitle } from './knowledge-store.js';
import { localEmbed, createEmbedder } from './embeddings.js';

const embedder = createEmbedder({ mode: 'local' });
const norm = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));

// ---------- chunkText ----------
test('chunkText: empty input → no chunks', () => {
  assert.deepEqual(chunkText(''), []);
  assert.deepEqual(chunkText('   \n  '), []);
});

test('chunkText: short text → single chunk', () => {
  const c = chunkText('A short knowledge note.');
  assert.equal(c.length, 1);
  assert.match(c[0], /short knowledge note/);
});

test('chunkText: long text → multiple bounded chunks', () => {
  const para = 'Sentence about revenue and growth. '.repeat(40); // ~1400 chars
  const text = Array(6).fill(para).join('\n\n'); // ~8500 chars
  const chunks = chunkText(text, 2000, 250);
  assert.ok(chunks.length >= 4, `expected several chunks, got ${chunks.length}`);
  for (const ch of chunks) assert.ok(ch.length <= 2000 + 250 + 50, `chunk too big: ${ch.length}`);
});

test('chunkText: consecutive chunks share an overlap tail', () => {
  const units = Array.from({ length: 20 }, (_, i) => `Para ${i} about topic ${i} with enough words to matter here today.`);
  const text = units.join('\n\n');
  const chunks = chunkText(text, 400, 120);
  assert.ok(chunks.length >= 2);
  // the tail of chunk[0] should reappear at the head of chunk[1]
  const tail = chunks[0].slice(-40);
  assert.ok(chunks[1].includes(tail.trim().split('\n').pop().slice(0, 15)), 'expected overlap carryover');
});

test('chunkText: a single oversized token is hard-cut', () => {
  const giant = 'x'.repeat(5000);
  const chunks = chunkText(giant, 2000, 250);
  assert.ok(chunks.length >= 3);
  // each unit is hard-cut to <= target; packing may carry a <= overlap tail, so target+overlap is the ceiling
  for (const ch of chunks) assert.ok(ch.length <= 2000 + 250 + 50, `chunk too big: ${ch.length}`);
});

// ---------- localEmbed / embedder ----------
test('localEmbed: deterministic for identical input', () => {
  assert.deepEqual(localEmbed('hello world'), localEmbed('hello world'));
});

test('localEmbed: L2-normalized, fixed 256-dim', () => {
  const v = localEmbed('revenue growth and retention metrics');
  assert.equal(v.length, 256);
  assert.ok(Math.abs(norm(v) - 1) < 1e-9, `norm should be 1, got ${norm(v)}`);
});

test('localEmbed: different text → different vector', () => {
  assert.notDeepEqual(localEmbed('monthly recurring revenue'), localEmbed('engineering team hiring plan'));
});

test('localEmbed: lexical overlap raises similarity', () => {
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const q = localEmbed('what is our monthly recurring revenue');
  const close = localEmbed('our monthly recurring revenue is forty thousand dollars');
  const far = localEmbed('the office dog is named biscuit');
  assert.ok(dot(q, close) > dot(q, far), 'related text should score higher');
});

test('createEmbedder: local mode embeds a batch, reports provider', async () => {
  const e = createEmbedder({ mode: 'local' });
  const vecs = await e.embed(['alpha', 'beta gamma']);
  assert.equal(vecs.length, 2);
  assert.equal(vecs[0].length, 256);
  assert.match(e.provider, /local/);
});

test('createEmbedder: empty input → empty output', async () => {
  assert.deepEqual(await createEmbedder({ mode: 'local' }).embed([]), []);
});

// ---------- KnowledgeStore ----------
async function seededStore() {
  const s = new KnowledgeStore({ embedder });
  await s.addDocument('Our monthly recurring revenue is forty thousand dollars and growing.', { title: 'Revenue' });
  await s.addDocument('The founding team previously built developer tools at a Series B startup.', { title: 'Team' });
  await s.addDocument('Customer churn last quarter was three percent, our lowest ever.', { title: 'Churn' });
  return s;
}

test('store: addDocument returns docId + chunk count; stats track totals', async () => {
  const s = new KnowledgeStore({ embedder });
  const r = await s.addDocument('A fact about pricing tiers and plans.');
  assert.match(r.docId, /^doc-/);
  assert.equal(r.chunks, 1);
  assert.equal(s.stats().documents, 1);
  assert.equal(s.stats().chunks, 1);
});

test('store: empty text throws', async () => {
  const s = new KnowledgeStore({ embedder });
  await assert.rejects(() => s.addDocument('   '), /No text/);
});

test('store: search ranks the relevant chunk first', async () => {
  const s = await seededStore();
  const top = (await s.search('what is our monthly recurring revenue?', 3))[0];
  assert.equal(top.title, 'Revenue');
  const team = (await s.search('who is on the founding team?', 3))[0];
  assert.equal(team.title, 'Team');
});

test('store: topK bounds the result count', async () => {
  const s = await seededStore();
  assert.equal((await s.search('revenue', 2)).length, 2);
  assert.equal((await s.search('revenue', 1)).length, 1);
});

test('store: empty store returns no results', async () => {
  const s = new KnowledgeStore({ embedder });
  assert.deepEqual(await s.search('anything'), []);
});

test('store: listDocuments returns titles + chunk counts', async () => {
  const s = await seededStore();
  const docs = s.listDocuments();
  assert.equal(docs.length, 3);
  assert.ok(docs.every((d) => d.title && d.chunks >= 1 && d.addedAt));
});

test('store: deleteDocument removes records and drops it from search', async () => {
  const s = await seededStore();
  const revDoc = s.listDocuments().find((d) => d.title === 'Revenue');
  assert.equal(await s.deleteDocument(revDoc.docId), true);
  assert.equal(s.stats().documents, 2);
  const top = (await s.search('what is our monthly recurring revenue?', 3))[0];
  assert.notEqual(top.title, 'Revenue'); // revenue chunk is gone
  assert.equal(await s.deleteDocument('nonexistent'), false);
});

test('store: setDocMeta updates title + tags on doc and chunks', async () => {
  const s = new KnowledgeStore({ embedder });
  const { docId } = await s.addDocument('Some pasted content here.', { title: 'Old' });
  assert.equal(await s.setDocMeta(docId, { title: 'New Title', tags: ['finance', 'kpi'] }), true);
  assert.equal(s.docs.get(docId).title, 'New Title');
  assert.deepEqual(s.docs.get(docId).tags, ['finance', 'kpi']);
  const top = (await s.search('pasted content', 1))[0];
  assert.equal(top.title, 'New Title');
  assert.deepEqual(top.tags, ['finance', 'kpi']);
});

// ---------- persistence round-trip ----------
test('store: persists to disk and reloads identically', async () => {
  const file = join(tmpdir(), `verbadeck-kb-test-${Date.now()}.json`);
  try {
    const a = new KnowledgeStore({ embedder, dataFile: file });
    await a.addDocument('Persistent fact: the launch date is in October.', { title: 'Launch' });
    await a.addDocument('Another note about partnerships and channels.', { title: 'Partners' });

    const b = new KnowledgeStore({ embedder, dataFile: file });
    await b.load();
    assert.equal(b.stats().documents, 2);
    assert.equal(b.stats().chunks, 2);
    const top = (await b.search('when is the launch date?', 2))[0];
    assert.equal(top.title, 'Launch');
  } finally {
    await rm(file, { force: true });
  }
});

test('store: load() on missing file starts empty (no throw)', async () => {
  const file = join(tmpdir(), `verbadeck-kb-missing-${Date.now()}.json`);
  const s = new KnowledgeStore({ embedder, dataFile: file });
  await s.load();
  assert.equal(s.stats().chunks, 0);
});

// ---------- deriveTitle ----------
test('deriveTitle: first non-empty line, truncated', () => {
  assert.equal(deriveTitle('\n\n  My Deck Notes  \nmore'), 'My Deck Notes');
  assert.equal(deriveTitle(''), 'Untitled');
  assert.ok(deriveTitle('x'.repeat(100)).length <= 60);
});
