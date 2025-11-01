/**
 * API Configuration
 * Automatically detects the correct API URL based on the current hostname
 * This allows the app to work on localhost, local network, and production
 */

// Get the API base URL based on current location
export const getApiBaseUrl = (): string => {
  // If we're in development and accessing via network IP, use that IP for API
  const hostname = window.location.hostname;

  // If accessing via localhost or 127.0.0.1, use localhost for API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // Otherwise, use the same hostname as the frontend (for network access)
  return `http://${hostname}:3001`;
};

// WebSocket URL for AssemblyAI proxy
export const getWebSocketUrl = (): string => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'ws://localhost:3001/ws';
  }

  return `ws://${hostname}:3001/ws`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_URL = getWebSocketUrl();
