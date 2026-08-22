import { apiGet, apiPost } from './apiClient';
import * as mockDashboard from '../mock/dashboard';
import * as mockTransactions from '../mock/transactions';
import * as mockRuleViolations from '../mock/ruleViolations';
import * as mockHitl from '../mock/hitl';
import * as mockAnalytics from '../mock/analytics';

// Health Check API
export async function fetchHealth() {
  try {
    return await apiGet<any>('/health');
  } catch (err) {
    return { api: 'offline', databricks: 'offline', sql_warehouse: 'unknown', model_serving: 'unknown' };
  }
}

// Dashboard API
export async function fetchDashboardData() {
  try {
    return await apiGet<any>('/dashboard');
  } catch (err) {
    return {
      summary: mockDashboard.dashboardSummary,
      transactionTrend: mockDashboard.transactionTrend,
      decisionDistribution: mockDashboard.decisionDistribution,
      topRuleViolations: mockDashboard.topRuleViolations,
      systemHealth: mockDashboard.systemHealth,
      alerts: mockDashboard.alerts,
      recentActivity: mockDashboard.recentActivity
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
      transactions: mockTransactions.transactions,
      kpis: mockTransactions.txKpis
    };
  }
}

export async function fetchTransactionDetail(txId: string) {
  try {
    return await apiGet<any>(`/transactions/${txId}`);
  } catch (err) {
    const tx = mockTransactions.transactions.find(t => t.id === txId) || mockTransactions.transactions[0];
    return tx;
  }
}

// Rule Violations API
export async function fetchRuleViolationsData() {
  try {
    return await apiGet<any>('/rule-violations');
  } catch (err) {
    return {
      ruleViolations: mockRuleViolations.ruleViolations,
      kpis: mockRuleViolations.ruleViolationKpis,
      violationsByCategory: mockRuleViolations.violationsByCategory
    };
  }
}

// HITL Queue API
export async function fetchHitlQueueData() {
  try {
    return await apiGet<any>('/hitl');
  } catch (err) {
    return {
      cases: mockHitl.hitlCases,
      kpis: mockHitl.hitlKpis,
      slaStatus: mockHitl.slaStatus
    };
  }
}

export async function submitHitlDecision(caseId: string, decision: 'APPROVE' | 'BLOCK' | 'ESCALATE', reason?: string, analyst?: string) {
  try {
    return await apiPost<any>(`/hitl/${caseId}/decision`, { decision, reason, analyst });
  } catch (err) {
    return { status: 'mock_success', case_id: caseId, decision };
  }
}

// Investigation API
export async function fetchInvestigationData(txId: string) {
  try {
    return await apiGet<any>(`/investigation/${txId}`);
  } catch (err) {
    const tx = mockTransactions.transactions.find(t => t.id === txId) || mockTransactions.transactions[0];
    return {
      transaction: tx,
      customerContext: { avgAmount: 120, preferredMethod: 'online', historyDays: 180, totalTxCount: 42 },
      deviceContext: { deviceId: tx.deviceId, isNewDevice: true, registeredDevices: 2, deviceRiskScore: 0.82 }
    };
  }
}

// Inference API (rtff-fraud-serving-dev)
export async function scoreFraudTransaction(txData: { amount: number; payment_method?: string; customer_id?: string; merchant_id?: string; device_id?: string }) {
  try {
    return await apiPost<any>('/fraud/score', txData);
  } catch (err) {
    const prob = Math.min(0.99, (txData.amount / 3000.0));
    return { status: 'fallback', fraudProbability: prob, decision: prob >= 0.75 ? 'BLOCK' : 'ALLOW' };
  }
}

// Analytics API
export async function fetchAnalyticsData() {
  try {
    return await apiGet<any>('/analytics');
  } catch (err) {
    return {
      analyticsData: mockAnalytics.analyticsData,
      decisionTrend: mockAnalytics.decisionTrend
    };
  }
}

// Model Info API
export async function fetchModelInfo() {
  try {
    return await apiGet<any>('/model');
  } catch (err) {
    return {
      modelName: 'RTFF Fraud Detection',
      version: '1',
      alias: 'champion',
      prAuc: 0.947,
      recall: 0.891,
      fpr: 0.024,
      precision: 0.873,
      f1: 0.882,
      threshold: 0.75,
      status: 'ACTIVE'
    };
  }
}

export * from '../mock/dashboard';
export * from '../mock/transactions';
export * from '../mock/ruleViolations';
export * from '../mock/hitl';
export * from '../mock/analytics';
