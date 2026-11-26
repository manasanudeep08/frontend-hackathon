// Set VITE_API_BASE to the backend origin for deployed builds. Keep /api paths
// relative during local development so Vite's proxy continues to work.
const API_ORIGIN = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export const API_BASE = `${API_ORIGIN}/api`;
