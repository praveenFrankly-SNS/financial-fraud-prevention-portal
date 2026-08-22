import { apiGet, apiPost } from './apiClient';

// Health Check API
export async function fetchHealth() {
  try {
    return await apiGet<any>('/health');
  } catch (err) {
    return { api: 'offline', databricks: 'offline', sql_warehouse: 'unknown', model_serving: 'unknown', error: (err as Error).message };
  }
}

// Dashboard API
export async function fetchDashboardData() {
  try {
    return await apiGet<any>('/dashboard');
  } catch (err) {
    return {
      error: (err as Error).message,
      databricksStatus: {
        connected: false,
        message: `Failed to connect to Databricks: ${(err as Error).message}`
      }
    };
  }
}

// Transactions API
export async function fetchTransactionsData(search?: string, limit = 20, offset = 0) {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}` : `?limit=${limit}&offset=${offset}`;
    return await apiGet<any>(`/transactions${query}`);
  } catch (err) {
    return {
      transactions: [],
      total: 0,
      kpis: {},
      error: (err as Error).message
    };
  }
}

export async function fetchTransactionDetail(txId: string) {
  try {
    return await apiGet<any>(`/transactions/${txId}`);
  } catch (err) {
    return {
      error: `Failed to connect to Databricks: ${(err as Error).message}`,
      id: txId,
      amount: 0,
      status: 'Unknown'
    };
  }
}

// Rule Violations API
export async function fetchRuleViolationsData() {
  try {
    return await apiGet<any>('/rule-violations');
  } catch (err) {
    return {
      ruleViolations: [],
      kpis: {},
      error: (err as Error).message
    };
  }
}

// HITL Queue API
export async function fetchHitlQueueData() {
  try {
    return await apiGet<any>('/hitl');
  } catch (err) {
    return {
      cases: [],
      kpis: {},
      error: (err as Error).message
    };
  }
}

export async function submitHitlDecision(caseId: string, decision: 'APPROVE' | 'BLOCK' | 'ESCALATE', reason?: string, analyst?: string) {
  return await apiPost<any>(`/hitl/${caseId}/decision`, { decision, reason, analyst });
}

// Investigation API
export async function fetchInvestigationData(txId: string) {
  try {
    return await apiGet<any>(`/investigation/${txId}`);
  } catch (err) {
    return {
      error: `Failed to connect to Databricks: ${(err as Error).message}`,
      transaction: null
    };
  }
}

// Inference API (rtff-fraud-serving-dev)
export async function scoreFraudTransaction(txData: { amount: number; payment_method?: string; customer_id?: string; merchant_id?: string; device_id?: string }) {
  return await apiPost<any>('/fraud/score', txData);
}

// Analytics API
export async function fetchAnalyticsData() {
  try {
    return await apiGet<any>('/analytics');
  } catch (err) {
    return {
      analyticsData: [],
      decisionTrend: [],
      error: (err as Error).message
    };
  }
}

// Model Info API
export async function fetchModelInfo() {
  try {
    return await apiGet<any>('/model');
  } catch (err) {
    return {
      error: (err as Error).message
    };
  }
}
