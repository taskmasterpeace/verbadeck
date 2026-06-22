/**
 * Integration tests for the Knowledge Brain HTTP endpoints.
 * Spawns the real server with the LOCAL embedder + a temp data file (offline, deterministic,
 * no API cost), then exercises /add, /list, /search, /ask (empty path), and /delete.
 * Run: node --test server/knowledge-api.test.mjs
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3099;
const BASE = `http://localhost:${PORT}`;
const dataFile = join(tmpdir(), `verbadeck-kb-api-${Date.now()}.json`);
let child;

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

before(async () => {
  child = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(PORT),
      KNOWLEDGE_EMBED_MODE: 'local',
      KNOWLEDGE_AUTO_TAG: 'false',
      KNOWLEDGE_DATA_FILE: dataFile,
      AUTH_DISABLED: 'true', // integration test targets the data endpoints, not auth
    },
    stdio: 'ignore',
  });
  // poll health
  const deadline = Date.now() + 15000;
  for (;;) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) break;
    } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error('server did not start');
    await new Promise((r) => setTimeout(r, 250));
  }
});

after(async () => {
  if (child) child.kill();
  await rm(dataFile, { force: true });
});

test('ask on empty store returns a graceful note (no LLM call)', async () => {
  const { status, json } = await api('POST', '/api/knowledge/ask', { question: 'anything?' });
  assert.equal(status, 200);
  assert.equal(json.answers, null);
  assert.match(json.note, /empty/i);
});

test('add validates input', async () => {
  const { status, json } = await api('POST', '/api/knowledge/add', { text: '   ' });
  assert.equal(status, 400);
  assert.match(json.error, /text/);
});

test('add → list → search → delete round-trip', async () => {
  // add three documents with distinct facts
  const a = await api('POST', '/api/knowledge/add', { text: 'Our monthly recurring revenue is forty thousand dollars and climbing fast.', title: 'Revenue' });
  assert.equal(a.status, 200);
  assert.match(a.json.docId, /^doc-/);
  assert.ok(a.json.chunks >= 1);

  await api('POST', '/api/knowledge/add', { text: 'The founding team built developer tools at a Series B startup before this.', title: 'Team' });
  await api('POST', '/api/knowledge/add', { text: 'Customer churn last quarter was three percent, the lowest in company history.', title: 'Churn' });

  // list
  const list = await api('GET', '/api/knowledge/list');
  assert.equal(list.status, 200);
  assert.equal(list.json.documents.length, 3);
  assert.ok(list.json.stats.chunks >= 3);
  assert.match(list.json.stats.provider, /local/);

  // search retrieves the planted fact, with a score + snippet
  const search = await api('POST', '/api/knowledge/search', { question: 'what is our monthly recurring revenue?', topK: 3 });
  assert.equal(search.status, 200);
  assert.equal(search.json.results[0].title, 'Revenue');
  assert.ok(typeof search.json.results[0].score === 'number');
  assert.match(search.json.results[0].text, /forty thousand/);

  // search routes a different question to the right doc (lexically-aligned for the offline embedder)
  const team = await api('POST', '/api/knowledge/search', { question: 'who is on the founding team?', topK: 3 });
  assert.equal(team.json.results[0].title, 'Team');

  // delete one doc → gone from list and search
  const revId = list.json.documents.find((d) => d.title === 'Revenue').docId;
  const del = await api('DELETE', `/api/knowledge/${revId}`);
  assert.equal(del.status, 200);
  assert.equal(del.json.stats.documents, 2);

  const after = await api('GET', '/api/knowledge/list');
  assert.equal(after.json.documents.length, 2);
  assert.ok(!after.json.documents.some((d) => d.title === 'Revenue'));

  // deleting a missing doc → 404
  const missing = await api('DELETE', '/api/knowledge/doc-nope');
  assert.equal(missing.status, 404);
});

test('search validates input', async () => {
  const { status } = await api('POST', '/api/knowledge/search', { question: '' });
  assert.equal(status, 400);
});
