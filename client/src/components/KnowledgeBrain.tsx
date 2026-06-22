import { useState } from 'react';
import { Database, Plus, Search, Trash2, Sparkles, FileText } from 'lucide-react';
import { useKnowledgeBrain } from '../hooks/useKnowledgeBrain';

/**
 * Knowledge Brain — paste a large, growing body of text and get fast, live recall.
 * Add documents (chunked + embedded server-side), see what's stored, and test a question
 * against the semantic index (the same path the live presenter Q&A uses).
 */
export function KnowledgeBrain() {
  const { documents, stats, error, isAdding, isAsking, answer, sources, add, ask, remove } = useKnowledgeBrain();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');

  const handleAdd = async () => {
    if (!text.trim()) return;
    const ok = await add(text, title.trim() || undefined);
    if (ok) { setText(''); setTitle(''); }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/12 to-accent/12 ring-1 ring-inset ring-border">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Knowledge Brain</h1>
            <p className="text-sm text-muted-foreground">Dump a large body of text, then recall it instantly during live Q&A.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-3 py-1">{stats.documents} documents</span>
          <span className="rounded-full bg-secondary px-3 py-1">{stats.chunks} chunks indexed</span>
          {stats.provider && <span className="rounded-full bg-secondary px-3 py-1">embed: {stats.provider}</span>}
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-elevation-low">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground"><Plus className="h-4 w-4 text-accent" /> Add to the brain</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title (e.g. Q3 metrics, product FAQ)"
            className="mt-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste anything — company docs, transcripts, research, FAQs. It gets chunked and indexed for instant semantic recall."
            rows={9}
            className="mt-3 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">{text.length.toLocaleString()} chars</span>
            <button
              onClick={handleAdd}
              disabled={isAdding || !text.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elevation-low transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" /> {isAdding ? 'Indexing…' : 'Add to brain'}
            </button>
          </div>
        </section>

        {/* Ask */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-elevation-low">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground"><Search className="h-4 w-4 text-accent" /> Test a question</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && question.trim() && ask(question)}
              placeholder="Ask anything the brain should know…"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={() => question.trim() && ask(question)}
              disabled={isAsking || !question.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isAsking ? '…' : 'Ask'}
            </button>
          </div>

          {answer && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="font-heading text-sm font-semibold text-foreground">{answer.heading}</div>
              <p className="mt-1 text-sm text-foreground/90">{answer.brief}</p>
              {answer.bullets?.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {answer.bullets.map((b, i) => <li key={i} className="flex gap-2"><span className="text-accent">•</span>{b}</li>)}
                </ul>
              )}
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Sources</div>
              <div className="mt-2 space-y-2">
                {sources.slice(0, 4).map((s, i) => (
                  <div key={i} className="rounded-lg border border-border-soft bg-background px-3 py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{s.title}</span>
                      <span className="font-mono text-muted-foreground">score {s.score}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground line-clamp-2">{s.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Documents */}
      <section className="mt-8">
        <h2 className="font-heading text-base font-semibold text-foreground">Indexed documents</h2>
        {documents.length === 0 ? (
          <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
            <FileText className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nothing indexed yet. Paste some text above to build your brain.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((d) => (
              <div key={d.docId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{d.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span>{d.chunks} chunks</span>
                    {d.tags?.map((t) => <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-accent">{t}</span>)}
                  </div>
                </div>
                <button
                  onClick={() => remove(d.docId)}
                  className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-destructive/10"
                  title="Remove from brain"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
