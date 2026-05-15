/** Normalized API origin (no trailing slash). */
export const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
