# Knowledge Brain — design spec

**Date:** 2026-06-21 · **Status:** approved (approaches #1 + #2; #3 deferred) · **Version target:** 1.1.0

## Problem

The Know It All Wall / live Q&A stuffs the entire `sharedKnowledgeBase` plain-text blob into
the LLM prompt for every question. That breaks at scale: context limits, latency, and cost.
The user wants to dump a large, **growing** body of **plain text** and get **live (~2s)**
answers recalled from it — on stage, while presenting.

## Decisions (from brainstorming)

- **Scenario:** live, on-stage Q&A. Budget ~2s end-to-end.
- **Data:** plain text, pasted (no PDF/file extraction). Grows over time, reused across sessions.
- **Storage:** server-side, persisted to disk.
- **Retrieval engine:** embeddings / semantic search via API
  (`openai/text-embedding-3-small` through the existing OpenRouter key — verified working).
- **Agents:** at **ingestion** time (organize/tag/title — approach #2), not live. A slow,
  exhaustive multi-agent "Deep mode" (#3) is deferred to a later toggle for rehearsal.
- **Agent-native:** the brain is exposed as an API + a `window.__verbadeck` method so an
  external agent queries the exact same store a presenter does.

## Architecture

```
paste text ──► POST /api/knowledge/add ──► chunk ──► embed (batch) ──► store {id,text,vec,tags,docId}
                                            └─(ingestion agent, async): title + topic tags
ask (live) ──► POST /api/knowledge/ask ──► embed(question) ──► cosine top-k ──► answer model ──► {answer, sources[]}
```

### Components (each isolated, testable)

1. **`server/embeddings.js`** — provider abstraction.
   - `embed(texts: string[]) -> number[][]`. Primary: OpenAI-compatible endpoint
     (OpenRouter `/embeddings`, model `openai/text-embedding-3-small`, 1536-dim) using
     `OPENROUTER_API_KEY`. Configurable via `EMBEDDINGS_URL` / `EMBEDDINGS_MODEL` (also works
     with a raw OpenAI key or the LAN Ollama box).
   - **Local deterministic fallback** (hashed bag-of-words → fixed-dim L2-normalized vector)
     when no key/endpoint is reachable. Guarantees the pipeline always runs and makes unit
     tests offline + deterministic. Same interface either way.

2. **`server/knowledge-store.js`** — the store (pure module, no Express).
   - `chunk(text)` — split on paragraph/sentence boundaries to ~500-token windows w/ small overlap.
   - `addDocument(text, {title})` — chunk → embed → append records; persist.
   - `search(question, topK)` — embed question → cosine vs all chunk vectors → top-k records.
   - `listDocuments()` / `deleteDocument(id)` / `stats()`.
   - **Persistence:** JSON file on disk (`server/data/knowledge.json`), loaded into memory at
     boot, written on mutation. Brute-force cosine over in-memory vectors (fast to ~tens of
     thousands of chunks → well under the 2s budget). SQLite/ANN noted as a future upgrade.
   - **Cosine** computed on L2-normalized vectors (store normalized once).

3. **`server/server.js`** endpoints (thin; delegate to the store):
   - `POST /api/knowledge/add` `{text,title?}` → `{docId, chunks}`.
   - `POST /api/knowledge/ask` `{question, topK?}` → `{answer, sources:[{title,snippet,score}]}`
     (retrieve → answer model). The agent-native live path.
   - `POST /api/knowledge/search` `{question, topK?}` → raw `{results:[...]}` (no LLM; inspection/agent use).
   - `GET /api/knowledge/list` → `{documents:[...], stats}`.
   - `DELETE /api/knowledge/:docId` → `{ok}`.

4. **Ingestion agent (approach #2)** — on `add`, an async best-effort LLM pass produces a
   document **title** (if absent) and a few **topic tags**, stored on the doc/chunks for display
   and optional topic-routing. Behind a flag; failure never blocks the add. Not on the live path.

5. **Client** — a "Knowledge Brain" surface (route `/knowledge`): paste-to-add, list of docs
   (title, chunk count, tags, delete), and a test "Ask" box showing the answer + sources.
   Live presenter Q&A can opt to consult the brain. Agent-native bridge:
   `window.__verbadeck.knowledge = { add, ask, search, list }` (testMode).

## Data flow & latency

Indexing happens at paste time (off the live path). Live `ask` = one embed call (~100–300ms) +
cosine (ms) + one answer-model call (~1–1.5s) ≈ within 2s. Same fast model as today's Q&A.

## Error handling

- Embeddings provider unreachable → automatic local fallback (logged); never 500 the add.
- Empty store / no matches → answer model told "no relevant context"; returns a graceful note.
- Corrupt/missing data file → start empty, log once.
- All endpoints validate input and return typed errors.

## Testing (extensive — the core must be correct)

- **Unit (`server/knowledge-store.test.mjs`, node:test, local embedder):** chunking boundaries
  & overlap; embed determinism; cosine correctness & ranking (relevant chunk ranks #1);
  add/list/delete/stats; persistence round-trip (save → reload → same results); empty-store;
  large-corpus ranking; topK bounds.
- **Embeddings unit:** fallback determinism + dimensionality + L2 norm.
- **API integration:** add → list → search → ask → delete against a running server (local
  embedder), asserting shapes, source attribution, and that a planted fact is retrieved.
- **E2E (`tests/knowledge-brain.spec.ts`):** via the bridge — add text, ask, assert the answer
  cites the planted fact; retrieval is grounded.

## Out of scope (now)

PDF/file ingestion; SQLite/ANN index; multi-agent Deep mode (#3); per-chunk re-embedding on edit;
cross-device sync. All noted as future.
