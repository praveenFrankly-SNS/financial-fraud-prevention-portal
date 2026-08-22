// ── Core Domain Types ─────────────────────────────────────

export type Decision = 'ALLOW' | 'BLOCK' | 'CHALLENGE' | 'HITL' | 'INVESTIGATE';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
export type HealthStatus = 'healthy' | 'warning' | 'error';
export type AnalystDecision = 'APPROVE' | 'BLOCK' | 'ESCALATE';

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  channel: 'Online' | 'Mobile' | 'POS' | 'ATM' | 'Branch';
  country: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: Decision;
  ruleViolations: number;
  rulesTriggered: string[];
  timestamp: string;
  status: 'Completed' | 'Pending' | 'HITL Pending';
  deviceId: string;
  ipAddress: string;
  sessionId: string;
  cardBin: string;
  latitude: number;
  longitude: number;
  modelVersion: string;
  modelThreshold: number;
  velocity1m: number;
  velocity10m: number;
  auditId: string;
  kafkaOffset: number;
  processingTimeMs: number;
}

export interface RuleViolation {
  id: string;
  ruleName: string;
  severity: Severity;
  category: string;
  triggeredBy: string;
  count: number;
  firstOccurred: string;
  lastOccurred: string;
  status: 'Active' | 'Resolved';
  blockPct: number;
  hitlPct: number;
  description: string;
  condition: string;
  threshold: string;
}

export interface HitlCase {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  rulesTriggered: string[];
  ruleCount: number;
  waitTime: string;
  waitMinutes: number;
  assignedTo: string | null;
  slaRemaining: string;
  slaStatus: 'ok' | 'warning' | 'breached';
  status: 'Pending' | 'In Review' | 'Resolved';
  timestamp: string;
  submittedAt: string;
}

export interface SystemHealthItem {
  name: string;
  status: HealthStatus;
}

export interface Alert {
  severity: Severity;
  message: string;
  time: string;
}

export interface DashboardSummary {
  totalTransactions: number;
  blockedTransactions: number;
  fraudRate: number;
  hitlPending: number;
  activeAlerts: number;
  systemHealth: string;
  totalTransactionsTrend: number;
  blockedTrend: number;
  fraudRateTrend: number;
  hitlTrend: number;
  alertsTrend: number;
}

export interface TrendPoint {
  time: string;
  total: number;
  blocked: number;
  fraudRate: number;
}

export interface DecisionDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopRuleViolation {
  name: string;
  count: number;
  max: number;
}

export interface ActivityStep {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  iconBg: string;
  iconColor: string;
}

export interface AnalyticsData {
  fraudTrend: Array<{ date: string; rate: number; blocked: number }>;
  byChannel: Array<{ channel: string; count: number; pct: number }>;
  rulePerformance: Array<{ rule: string; detection: number; falsePositive: number }>;
  modelMetrics: {
    prAuc: number;
    recall: number;
    fpr: number;
    precision: number;
    f1: number;
    threshold: number;
    version: string;
    trainedAt: string;
  };
  fraudByRegion: Array<{ region: string; count: number; pct: number }>;
}
