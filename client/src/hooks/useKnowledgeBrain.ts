import { useState, useCallback, useEffect } from 'react';

/**
 * Client for the server-side Knowledge Brain (semantic recall over pasted text).
 * Calls /api/knowledge/* (Vite-proxied to the server in dev, same-origin in prod).
 */
export interface KnowledgeDoc {
  docId: string;
  title: string;
  chunks: number;
  tags: string[];
  addedAt: string;
}
export interface KnowledgeStats { documents: number; chunks: number; provider: string }
export interface KnowledgeSource { title: string; score: number; snippet: string }
export interface QAAnswer { heading: string; brief: string; bullets: string[]; full: string; keywords: string[] }

const base = import.meta.env.VITE_API_URL || '';
async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(`${base}/api/knowledge${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export function useKnowledgeBrain() {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({ documents: 0, chunks: 0, provider: '' });
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<QAAnswer | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);

  const refresh = useCallback(async () => {
    try {
      const r = await call('GET', '/list');
      setDocuments(r.documents || []);
      setStats(r.stats || { documents: 0, chunks: 0, provider: '' });
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (text: string, title?: string) => {
    setIsAdding(true); setError(null);
    try {
      await call('POST', '/add', { text, title });
      await refresh();
      return true;
    } catch (e) { setError((e as Error).message); return false; }
    finally { setIsAdding(false); }
  }, [refresh]);

  const ask = useCallback(async (question: string, tone?: string) => {
    setIsAsking(true); setError(null); setAnswer(null); setSources([]);
    try {
      const r = await call('POST', '/ask', { question, tone });
      setAnswer(r.answers?.answer1 || null);
      setSources(r.sources || []);
      if (!r.answers) setError(r.note || 'No answer');
    } catch (e) { setError((e as Error).message); }
    finally { setIsAsking(false); }
  }, []);

  const remove = useCallback(async (docId: string) => {
    setError(null);
    try { await call('DELETE', `/${docId}`); await refresh(); }
    catch (e) { setError((e as Error).message); }
  }, [refresh]);

  return { documents, stats, error, isAdding, isAsking, answer, sources, add, ask, remove, refresh };
}
