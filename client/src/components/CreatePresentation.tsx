import { Wand2, FileText, Brain, Mic, ArrowRight, ChevronRight, Play } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CreatePresentationProps {
  onSelectFromScratch: () => void;
  onSelectProcessContent: () => void;
  onSelectKnowItAll: () => void;
}

interface ModeCard {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  onClick: (p: CreatePresentationProps) => void;
}

const MODES: ModeCard[] = [
  {
    icon: Wand2,
    eyebrow: 'Generate',
    title: 'Create from Scratch',
    description: 'Answer a few questions and let AI build your deck. Pick from multiple slide options and refine each one.',
    features: ['AI interviews you on your topic', 'Multiple slide options to choose from', 'Best for brand-new talks'],
    cta: 'Start from Scratch',
    onClick: (p) => p.onSelectFromScratch(),
  },
  {
    icon: FileText,
    eyebrow: 'Import',
    title: 'Process Existing Content',
    description: 'Paste a script or drop in a PowerPoint. AI splits it into voice-driven slides with smart trigger words.',
    features: ['Paste text or upload .pptx', 'Auto-segmented into sections', 'Keeps exact wording when you need it'],
    cta: 'Process Content',
    onClick: (p) => p.onSelectProcessContent(),
  },
  {
    icon: Brain,
    eyebrow: 'Rehearse',
    title: 'Know It All Wall',
    description: 'Practice answering tough questions with voice-activated keyword confirmation. Built for high-stakes Q&A.',
    features: ['Load a resume or knowledge base', 'Confirm answers with your voice', 'Perfect for interviews & pitches'],
    cta: 'Start Q&A Practice',
    onClick: (p) => p.onSelectKnowItAll(),
  },
];

const STEPS = [
  { label: 'Say a trigger word', icon: Mic },
  { label: 'The slide advances', icon: ChevronRight },
  { label: 'AI fields the questions', icon: Brain },
];

export function CreatePresentation(props: CreatePresentationProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-14">
      {/* Hero */}
      <header className="relative mb-12 text-center">
        {/* ambient brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-3rem] h-64 w-[42rem] max-w-[90vw] -translate-x-1/2 rounded-full opacity-[0.10] blur-3xl"
          style={{ background: 'radial-gradient(closest-side, hsl(183 86% 40%), hsl(199 100% 38%), transparent)' }}
        />
        <div className="relative animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-elevation-low">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 animate-live-pulse" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Voice-controlled presentation studio
          </span>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Present <span className="text-gradient-brand">hands-free.</span>
            <br className="hidden sm:block" />
            <span className="text-foreground/90"> Your voice runs the deck.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Speak naturally and your slides advance the moment you say the right word — no clicker,
            no keyboard. Build with AI, import an existing deck, or rehearse for the hard questions.
          </p>

          {/* how it works */}
          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
                    <Icon className="h-3.5 w-3.5 text-accent" />
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/50" />}
                </div>
              );
            })}
          </div>

          {/* Try a live sample — instant first-run payoff */}
          <div className="mt-7">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('verbadeck-load-demo'))}
              className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-5 py-2.5 font-heading text-sm font-semibold text-accent shadow-elevation-low transition-all hover:bg-accent/10 hover:shadow-glow-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Play className="h-4 w-4 fill-current" />
              Try a live sample pitch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="mt-2 text-xs text-muted-foreground">Loads a 4-slide investor pitch you can present right now — no setup.</p>
          </div>
        </div>
      </header>

      {/* Mode cards */}
      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {MODES.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.title}
              onClick={() => mode.onClick(props)}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-elevation-low transition-all duration-200 animate-rise hover:-translate-y-1 hover:border-accent/40 hover:shadow-elevation-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7"
              style={{ animationDelay: `${0.08 * (i + 1)}s` }}
            >
              {/* index + icon */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-inset ring-border transition-colors group-hover:from-primary/15 group-hover:to-accent/15">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                  {String(i + 1).padStart(2, '0')} · {mode.eyebrow}
                </span>
              </div>

              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {mode.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>

              <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                {mode.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-foreground/80">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex-1" />
              <div className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
                {mode.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Every mode runs on real-time voice control and AI-generated talking points.
      </p>
    </div>
  );
}
