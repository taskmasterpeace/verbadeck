/**
 * Embeddings provider abstraction for the Knowledge Brain.
 *
 * Primary: an OpenAI-compatible /embeddings endpoint (OpenRouter by default, model
 * openai/text-embedding-3-small). Configurable via env so it also works with a raw OpenAI
 * key or a LAN Ollama box.
 *
 * Fallback: a deterministic, dependency-free local embedder (hashed bag-of-words, L2-normalized)
 * used when no key/endpoint is available or a remote call fails. Same interface either way, so
 * the retrieval pipeline — and the test suite — runs offline and deterministically.
 *
 * All vectors are L2-normalized, so cosine similarity == dot product downstream.
 */

const DEFAULT_URL = process.env.EMBEDDINGS_URL || 'https://openrouter.ai/api/v1/embeddings';
const DEFAULT_MODEL = process.env.EMBEDDINGS_MODEL || 'openai/text-embedding-3-small';
const LOCAL_DIM = 256;

function l2normalize(vec) {
  let sum = 0;
  for (const v of vec) sum += v * v;
  const norm = Math.sqrt(sum) || 1;
  return vec.map((v) => v / norm);
}

// FNV-1a 32-bit hash → stable bucket index. Deterministic across runs/platforms.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Deterministic local embedding: hashed unigrams + bigrams into LOCAL_DIM buckets,
 * sublinear term frequency, L2-normalized. Captures lexical overlap well enough for
 * offline tests and as a graceful degraded mode.
 */
export function localEmbed(text) {
  const vec = new Array(LOCAL_DIM).fill(0);
  const toks = tokenize(text);
  const bump = (key) => {
    const idx = fnv1a(key) % LOCAL_DIM;
    vec[idx] += 1;
  };
  for (let i = 0; i < toks.length; i++) {
    bump(toks[i]);
    if (i + 1 < toks.length) bump(toks[i] + '_' + toks[i + 1]);
  }
  // sublinear scaling dampens repeated terms
  for (let i = 0; i < vec.length; i++) vec[i] = vec[i] > 0 ? 1 + Math.log(vec[i]) : 0;
  return l2normalize(vec);
}

async function remoteEmbed(texts, { url, model, apiKey, timeoutMs = 20000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: texts }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    // OpenAI-compatible: { data: [{ embedding: [...] }, ...] } — preserve input order via index.
    const ordered = [...json.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    return ordered.map((d) => l2normalize(d.embedding));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Create an embedder.
 * @param {object} opts
 * @param {'auto'|'remote'|'local'} [opts.mode='auto']
 * @param {string} [opts.apiKey]   API key for the remote provider (OpenRouter/OpenAI).
 * @param {string} [opts.url]      embeddings endpoint
 * @param {string} [opts.model]    embeddings model
 * @returns {{ embed:(texts:string[])=>Promise<number[][]>, provider:string }}
 */
export function createEmbedder(opts = {}) {
  const mode = opts.mode || 'auto';
  const apiKey = opts.apiKey;
  const url = opts.url || DEFAULT_URL;
  const model = opts.model || DEFAULT_MODEL;
  const canRemote = mode !== 'local' && !!apiKey;
  let provider = canRemote ? `remote:${model}` : 'local:hashed-bow';

  async function embed(texts) {
    const arr = Array.isArray(texts) ? texts : [texts];
    if (arr.length === 0) return [];
    if (canRemote) {
      try {
        return await remoteEmbed(arr, { url, model, apiKey });
      } catch (err) {
        if (mode === 'remote') throw err; // strict mode surfaces the error
        console.warn(`⚠️ embeddings: remote failed (${err.message}); falling back to local`);
        provider = 'local:hashed-bow (fallback)';
        return arr.map(localEmbed);
      }
    }
    return arr.map(localEmbed);
  }

  return { embed, get provider() { return provider; } };
}
