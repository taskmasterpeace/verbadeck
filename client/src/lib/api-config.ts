/**
 * API Configuration
 * Automatically detects the correct API URL based on the current hostname
 * This allows the app to work on localhost, local network, and production
 */

// Same-origin by design. In dev, Vite proxies /api and /ws to the server (:3002); when the
// built client is served by Express or sits behind the Cloudflare tunnel, it's already one
// origin. Keeping requests same-origin means the auth session cookie is always sent.
export const getApiBaseUrl = (): string => '';

// WebSocket URL for the AssemblyAI voice proxy — same origin (Vite proxies /ws in dev; the
// tunnel forwards wss). Secure scheme when the page is served over HTTPS.
export const getWebSocketUrl = (): string => {
  const { protocol, host } = window.location;
  return `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}/ws`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_URL = getWebSocketUrl();
