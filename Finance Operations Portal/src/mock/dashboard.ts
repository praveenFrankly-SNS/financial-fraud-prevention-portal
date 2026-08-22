import type { TrendPoint, DecisionDistribution, TopRuleViolation, DashboardSummary, SystemHealthItem, Alert, ActivityStep } from '../types';

export const dashboardSummary: DashboardSummary = {
  totalTransactions: 1248532,
  blockedTransactions: 12842,
  fraudRate: 1.03,
  hitlPending: 24,
  activeAlerts: 7,
  systemHealth: '98.6%',
  totalTransactionsTrend: 15.6,
  blockedTrend: 18.7,
  fraudRateTrend: 0.12,
  hitlTrend: -20.0,
  alertsTrend: -12.5,
};

export const transactionTrend: TrendPoint[] = [
  { time: '00:00', total: 8200, blocked: 84, fraudRate: 1.02 },
  { time: '02:00', total: 5400, blocked: 52, fraudRate: 0.96 },
  { time: '04:00', total: 4100, blocked: 40, fraudRate: 0.98 },
  { time: '06:00', total: 7800, blocked: 82, fraudRate: 1.05 },
  { time: '08:00', total: 14200, blocked: 148, fraudRate: 1.04 },
  { time: '10:00', total: 18600, blocked: 196, fraudRate: 1.05 },
  { time: '12:00', total: 21200, blocked: 222, fraudRate: 1.05 },
  { time: '14:00', total: 19800, blocked: 206, fraudRate: 1.04 },
  { time: '16:00', total: 17400, blocked: 180, fraudRate: 1.03 },
  { time: '18:00', total: 15200, blocked: 154, fraudRate: 1.01 },
  { time: '20:00', total: 12800, blocked: 130, fraudRate: 1.02 },
  { time: '22:00', total: 9600, blocked: 98, fraudRate: 1.02 },
];

export const decisionDistribution: DecisionDistribution[] = [
  { name: 'Approve', value: 1143208, color: '#059669' },
  { name: 'Block', value: 12842, color: '#dc2626' },
  { name: 'Investigate', value: 24482, color: '#7c3aed' },
  { name: 'HITL', value: 67000, color: '#d97706' },
];

export const topRuleViolations: TopRuleViolation[] = [
  { name: 'High Velocity', count: 2842, max: 2842 },
  { name: 'High Risk Country', count: 2105, max: 2842 },
  { name: 'Device Fingerprint Mismatch', count: 1764, max: 2842 },
  { name: 'Amount Deviation', count: 1250, max: 2842 },
  { name: 'Multiple Auth Failures', count: 1102, max: 2842 },
];

export const systemHealth: SystemHealthItem[] = [
  { name: 'Streaming Pipeline', status: 'healthy' },
  { name: 'Kafka Connection', status: 'healthy' },
  { name: 'Model Serving', status: 'healthy' },
  { name: 'Delta Tables', status: 'healthy' },
  { name: 'Checkpoint State', status: 'healthy' },
];

export const alerts: Alert[] = [
  { severity: 'CRITICAL', message: 'Spike in velocity rule violations', time: '2m ago' },
  { severity: 'HIGH', message: 'High risk country transaction detected', time: '7m ago' },
  { severity: 'HIGH', message: 'Multiple failed authentications', time: '15m ago' },
  { severity: 'MEDIUM', message: 'New device from known customer', time: '32m ago' },
  { severity: 'MEDIUM', message: 'Kafka consumer lag increased', time: '45m ago' },
  { severity: 'LOW', message: 'Model serving latency within bounds', time: '1h ago' },
  { severity: 'LOW', message: 'Audit table checkpoint complete', time: '2h ago' },
];

export const recentActivity: ActivityStep[] = [
  { icon: '▶', title: 'Transaction Stream', subtitle: 'Running', time: '10:42:30 AM', iconBg: '#d1fae5', iconColor: '#059669' },
  { icon: '🤖', title: 'Model Inference', subtitle: 'Completed', time: '10:42:29 AM', iconBg: '#dbeafe', iconColor: '#2563eb' },
  { icon: '🛡', title: 'Rule Evaluation', subtitle: 'Completed', time: '10:42:29 AM', iconBg: '#ede9fe', iconColor: '#7c3aed' },
  { icon: '✕', title: 'Decision Engine', subtitle: 'Block', time: '10:42:29 AM', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { icon: '✓', title: 'Audit Write', subtitle: 'Success', time: '10:42:29 AM', iconBg: '#d1fae5', iconColor: '#059669' },
  { icon: '👤', title: 'HITL Queue', subtitle: 'Pending', time: '10:42:29 AM', iconBg: '#fef3c7', iconColor: '#d97706' },
];
