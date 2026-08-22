/**
 * API Client — Phase 1 uses mock data.
 * Phase 2: configure baseURL to Databricks REST API / FastAPI backend.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const resp = await fetch(`${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) throw new Error(`API error ${resp.status}: ${path}`);
    return resp.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const resp = await fetch(`${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) throw new Error(`API error ${resp.status}: ${path}`);
    return resp.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
