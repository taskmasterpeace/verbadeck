import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

/**
 * Single-owner auth client. The owner signs in; everyone else joins a waitlist.
 * Session is an httpOnly cookie set by the server, so we just ask /api/auth/me.
 */
export interface AuthState {
  status: 'loading' | 'owner' | 'guest';
  email: string | null;
}

async function call(path: string, body?: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading', email: null });

  const refresh = useCallback(async () => {
    try {
      const me = await call('/api/auth/me');
      setState({ status: me.owner ? 'owner' : 'guest', email: me.email || null });
    } catch {
      setState({ status: 'guest', email: null });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await call('/api/auth/login', { email, password });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await call('/api/auth/logout', {}); } catch { /* ignore */ }
    setState({ status: 'guest', email: null });
  }, []);

  const joinWaitlist = useCallback(async (email: string, name?: string, note?: string) => {
    await call('/api/waitlist', { email, name, note });
  }, []);

  return { ...state, login, logout, joinWaitlist, refresh };
}
