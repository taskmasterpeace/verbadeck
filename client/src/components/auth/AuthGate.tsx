import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LandingGate } from './LandingGate';

/**
 * Gates the whole app behind the single owner account. Guests see the public LandingGate
 * (what it does + a waitlist); the owner sees the app.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, login, joinWaitlist } = useAuth();

  if (status === 'loading') {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (status === 'owner') return <>{children}</>;

  return <LandingGate onLogin={login} onJoinWaitlist={joinWaitlist} />;
}
