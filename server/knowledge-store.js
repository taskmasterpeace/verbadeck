/**
 * Knowledge Brain store — a server-side semantic index over a growing body of pasted text.
 *
 * Pure module (no Express, no env reads): an embedder is injected, so it is fully unit-testable
 * offline with the local embedder. Persists to a JSON file; holds vectors in memory and ranks
 * by cosine similarity (vectors are pre-normalized by the embedder, so cosine == dot product).
 *
 * Records: { id, docId, title, idx, text, vec, tags[] }
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const CHUNK_TARGET_CHARS = 2000;   // ~500 tokens
const CHUNK_OVERLAP_CHARS = 250;

let _counter = 0;
function genId(prefix) {
  _counter = (_counter + 1) % 1e6;
  return `${prefix}-${Date.now().toString(36)}-${_counter.toString(36)}`;
}

/**
 * Split text into ~CHUNK_TARGET_CHARS windows on natural boundaries, with small overlap so a
 * fact spanning a boundary stays retrievable. Splits on blank lines first, then sentences.
 */
export function chunkText(text, targetChars = CHUNK_TARGET_CHARS, overlap = CHUNK_OVERLAP_CHARS) {
  const clean = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];
  // Break into paragraph/sentence units that are each <= targetChars.
  const paras = clean.split(/\n{2,}/);
  const units = [];
  for (const p of paras) {
    if (p.length <= targetChars) { units.push(p.trim()); continue; }
    // paragraph too big → split on sentence enders, hard-cut anything still oversized
    const sentences = p.match(/[^.!?\n]+[.!?]*\s*|\S+/g) || [p];
    let buf = '';
    for (const s of sentences) {
      if ((buf + s).length > targetChars && buf) { units.push(buf.trim()); buf = ''; }
      if (s.length > targetChars) {
        for (let i = 0; i < s.length; i += targetChars) units.push(s.slice(i, i + targetChars).trim());
      } else {
        buf += s;
      }
    }
    if (buf.trim()) units.push(buf.trim());
  }
  // Greedily pack units into chunks up to targetChars, carrying an overlap tail forward.
  const chunks = [];
  let cur = '';
  for (const u of units) {
    if (cur && (cur.length + u.length + 2) > targetChars) {
      chunks.push(cur.trim());
      const tail = cur.slice(Math.max(0, cur.length - overlap));
      cur = tail + '\n\n' + u;
    } else {
      cur = cur ? cur + '\n\n' + u : u;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

function dot(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export class KnowledgeStore {
  /** @param {{ embedder:{embed:(t:string[])=>Promise<number[][]>}, dataFile?:string }} opts */
  constructor({ embedder, dataFile = null }) {
    if (!embedder) throw new Error('KnowledgeStore requires an embedder');
    this.embedder = embedder;
    this.dataFile = dataFile;
    this.records = [];      // {id, docId, title, idx, text, vec, tags}
    this.docs = new Map();  // docId -> {docId, title, tags, addedAt, chunks}
  }

  /** Load persisted records from disk (no-op if no file or file absent). */
  async load() {
    if (!this.dataFile) return this;
    try {
      const raw = await readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(raw);
      this.records = Array.isArray(parsed.records) ? parsed.records : [];
      this.docs = new Map((parsed.docs || []).map((d) => [d.docId, d]));
    } catch (err) {
      if (err.code !== 'ENOENT') console.warn(`⚠️ knowledge: could not read ${this.dataFile} (${err.message}); starting empty`);
    }
    return this;
  }

  async save() {
    if (!this.dataFile) return;
    await mkdir(dirname(this.dataFile), { recursive: true });
    const payload = { version: 1, records: this.records, docs: [...this.docs.values()] };
    await writeFile(this.dataFile, JSON.stringify(payload), 'utf8');
  }

  /**
   * Chunk → embed → store a document. Returns { docId, chunks }.
   */
  async addDocument(text, { title = null } = {}) {
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error('No text to add');
    const docId = genId('doc');
    const vecs = await this.embedder.embed(chunks);
    const addedAt = new Date().toISOString();
    const docTitle = title || deriveTitle(text);
    chunks.forEach((chunk, idx) => {
      this.records.push({ id: genId('ch'), docId, title: docTitle, idx, text: chunk, vec: vecs[idx], tags: [] });
    });
    this.docs.set(docId, { docId, title: docTitle, tags: [], addedAt, chunks: chunks.length });
    await this.save();
    return { docId, chunks: chunks.length };
  }

  /** Update title/tags for a doc and its chunks (used by the ingestion agent). */
  async setDocMeta(docId, { title, tags } = {}) {
    const doc = this.docs.get(docId);
    if (!doc) return false;
    if (title) doc.title = title;
    if (Array.isArray(tags)) doc.tags = tags;
    for (const r of this.records) {
      if (r.docId !== docId) continue;
      if (title) r.title = title;
      if (Array.isArray(tags)) r.tags = tags;
    }
    await this.save();
    return true;
  }

  /** Semantic search → top-k records with scores (highest first). */
  async search(question, topK = 8) {
    if (this.records.length === 0) return [];
    const [qvec] = await this.embedder.embed([String(question)]);
    const scored = this.records.map((r) => ({
      id: r.id, docId: r.docId, title: r.title, idx: r.idx, text: r.text, tags: r.tags,
      score: dot(qvec, r.vec),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(1, topK));
  }

  listDocuments() {
    return [...this.docs.values()].sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
  }

  async deleteDocument(docId) {
    const before = this.records.length;
    this.records = this.records.filter((r) => r.docId !== docId);
    const had = this.docs.delete(docId);
    if (had || this.records.length !== before) { await this.save(); return true; }
    return false;
  }

  stats() {
    return {
      documents: this.docs.size,
      chunks: this.records.length,
      provider: this.embedder.provider || 'unknown',
    };
  }
}

/** First non-empty line, trimmed to a short title. */
export function deriveTitle(text) {
  const firstLine = String(text || '').split('\n').map((l) => l.trim()).find(Boolean) || 'Untitled';
  return firstLine.length > 60 ? firstLine.slice(0, 57).trimEnd() + '…' : firstLine;
}
