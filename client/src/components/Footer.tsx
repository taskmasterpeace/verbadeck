export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 py-3 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-heading font-semibold text-gradient-brand">VerbaDeck</span>
          <span className="text-border">•</span>
          <span>Voice-driven presentations</span>
          <span className="text-border">•</span>
          <span>Built by</span>
          <a
            href="https://machinekinglabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Machine King Labs
          </a>
          <span className="text-border">•</span>
          <span className="font-mono text-[11px]">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
