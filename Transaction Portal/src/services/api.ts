import type { TransactionRequest, TransactionResponse, SimulationRequest, SimulationResponse } from '../types';

const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

/** Submit a real customer transaction — returns only customer-safe response */
export async function submitTransaction(req: TransactionRequest): Promise<TransactionResponse> {
  return post<TransactionResponse>('/transaction', req);
}

/** Run a simulation scenario — returns full fraud decision details */
export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  return post<SimulationResponse>('/simulation', req);
}

/** Health check */
export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/health`);
  return res.json() as Promise<{ status: string }>;
}
