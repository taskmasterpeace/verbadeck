import { useState } from 'react';
import { Mic, ChevronRight, Brain, Check, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LandingGateProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onJoinWaitlist: (email: string, name?: string, note?: string) => Promise<void>;
}

const WHAT_IT_DOES = [
  'Say a trigger word and the slide advances — no clicker, no keyboard.',
  'AI answers the room’s questions live, from your own deck and Knowledge Brain.',
  'A cinematic audience view on the projector; a presenter cockpit for you.',
  'Build with AI, import a PowerPoint, or rehearse the tough questions.',
];

const STEPS = [
  { icon: Mic, label: 'Say a trigger word' },
  { icon: ChevronRight, label: 'The slide advances' },
  { icon: Brain, label: 'AI fields the questions' },
];

// Tiny "what's new" — kept intentionally small.
const WHATS_NEW = {
  version: 'v1.1.0',
  items: [
    'Knowledge Brain — recall a whole body of text, live during Q&A',
    'Live presenter Q&A now answers from your Knowledge Brain',
    'New landing page + single-owner access',
  ],
};

export function LandingGate({ onLogin, onJoinWaitlist }: LandingGateProps) {
  const [tab, setTab] = useState<'signin' | 'request'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submitSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await onLogin(email.trim(), password); } // success → AuthGate swaps to the app
    catch (err) { setError((err as Error).message || 'Sign-in failed'); }
    finally { setBusy(false); }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await onJoinWaitlist(email.trim(), name.trim(), note.trim()); setDone(true); }
    catch (err) { setError((err as Error).message || 'Could not join the waitlist'); }
    finally { setBusy(false); }
  };

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 50% at 50% -5%, hsl(199 100% 18% / 0.4), transparent 60%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(120,200,230,.04) 1px,transparent 1px)', backgroundSize: '24px 24px', maskImage: 'linear-gradient(to bottom,#000,transparent 75%)' }} />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT — the pitch */}
        <div className="animate-rise">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="" className="h-11 w-11 object-contain" style={{ filter: 'drop-shadow(0 4px 16px rgba(21,166,214,.5))' }} />
            <span className="font-heading text-2xl font-bold bg-gradient-to-r from-brand-light to-brand-teal bg-clip-text text-transparent">VerbaDeck</span>
          </div>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Lock className="h-3 w-3 text-accent" /> Private internal tool · access by invitation
          </span>

          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Present <span className="bg-gradient-to-r from-brand-light to-brand-teal bg-clip-text text-transparent">hands-free.</span><br />Your voice runs the deck.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            VerbaDeck is a voice-driven presentation studio. Speak naturally and your slides advance
            the moment you say the right word — then AI fields the hard questions, live, from your own deck.
          </p>

          <ul className="mt-6 grid max-w-xl gap-2.5">
            {WHAT_IT_DOES.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" strokeWidth={2.5} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
                    <Icon className="h-3.5 w-3.5 text-accent" />{s.label}
                  </span>
                  {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40" />}
                </div>
              );
            })}
          </div>

          {/* tiny changelog */}
          <div className="mt-8 max-w-md rounded-xl border border-border-soft bg-card/50 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">What's new · {WHATS_NEW.version}</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {WHATS_NEW.items.map((it) => <li key={it} className="flex gap-2"><span className="text-accent/70">›</span>{it}</li>)}
            </ul>
          </div>
        </div>

        {/* RIGHT — auth card */}
        <div className="w-full animate-rise rounded-2xl border border-border bg-card p-6 shadow-elevation-high sm:p-7" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
            <button onClick={() => { setTab('signin'); setError(null); setDone(false); }} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${tab === 'signin' ? 'bg-card text-foreground shadow-elevation-low' : 'text-muted-foreground'}`}>Sign in</button>
            <button onClick={() => { setTab('request'); setError(null); }} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${tab === 'request' ? 'bg-card text-foreground shadow-elevation-low' : 'text-muted-foreground'}`}>Request access</button>
          </div>

          {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          {tab === 'signin' ? (
            <form onSubmit={submitSignin} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-deep to-brand-teal px-4 py-2.5 font-heading text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
              </button>
              <p className="pt-1 text-center text-xs text-muted-foreground">Owner access only. No account? <button type="button" onClick={() => setTab('request')} className="text-accent hover:underline">Request access →</button></p>
            </form>
          ) : done ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15"><Check className="h-6 w-6 text-accent" /></div>
              <h3 className="font-heading text-lg font-semibold">You're on the list</h3>
              <p className="mt-1 text-sm text-muted-foreground">Thanks — we'll reach out when access opens up.</p>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name <span className="text-muted-foreground/50">(optional)</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">What would you use it for? <span className="text-muted-foreground/50">(optional)</span></label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="A sentence is plenty." className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-deep to-brand-teal px-4 py-2.5 font-heading text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Join the waitlist
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
