import type { HitlCase } from '../types';

export const hitlCases: HitlCase[] = [
  {
    id: 'CASE-2025-0519-0001', transactionId: 'TX-5843',
    customerId: 'C-10234', customerName: 'John Doe',
    amount: 1240, riskScore: 0.92, riskLevel: 'High',
    rulesTriggered: ['High Velocity', 'Device Fingerprint Mismatch'], ruleCount: 2,
    waitTime: '2h 15m', waitMinutes: 135, assignedTo: null,
    slaRemaining: '18m', slaStatus: 'warning', status: 'Pending',
    timestamp: 'May 19, 2025 10:42 AM', submittedAt: 'May 19, 2025 10:42:31 AM',
  },
  {
    id: 'CASE-2025-0519-0002', transactionId: 'TX-5842',
    customerId: 'C-20911', customerName: 'Jane Smith',
    amount: 8.75, riskScore: 0.71, riskLevel: 'Medium',
    rulesTriggered: ['High Risk Country'], ruleCount: 1,
    waitTime: '1h 48m', waitMinutes: 108, assignedTo: 'Alex Johnson',
    slaRemaining: '1h 12m', slaStatus: 'ok', status: 'In Review',
    timestamp: 'May 19, 2025 10:41 AM', submittedAt: 'May 19, 2025 10:41:22 AM',
  },
  {
    id: 'CASE-2025-0519-0003', transactionId: 'TX-5841',
    customerId: 'C-88312', customerName: 'Michael Brown',
    amount: 780, riskScore: 0.87, riskLevel: 'High',
    rulesTriggered: ['High Velocity', 'Amount Deviation', 'Multiple Auth Failures'], ruleCount: 3,
    waitTime: '1h 12m', waitMinutes: 72, assignedTo: null,
    slaRemaining: '48m', slaStatus: 'warning', status: 'Pending',
    timestamp: 'May 19, 2025 10:40 AM', submittedAt: 'May 19, 2025 10:40:15 AM',
  },
  {
    id: 'CASE-2025-0519-0004', transactionId: 'TX-5839',
    customerId: 'C-55210', customerName: 'Emily Davis',
    amount: 235.60, riskScore: 0.18, riskLevel: 'Low',
    rulesTriggered: ['New Device'], ruleCount: 1,
    waitTime: '45m', waitMinutes: 45, assignedTo: 'Sarah Wilson',
    slaRemaining: '1h 15m', slaStatus: 'ok', status: 'In Review',
    timestamp: 'May 19, 2025 10:39 AM', submittedAt: 'May 19, 2025 10:39:08 AM',
  },
  {
    id: 'CASE-2025-0519-0005', transactionId: 'TX-5836',
    customerId: 'C-99322', customerName: 'David Lee',
    amount: 2199.99, riskScore: 0.89, riskLevel: 'High',
    rulesTriggered: ['High Amount', 'Card Not Present'], ruleCount: 2,
    waitTime: '2h 05m', waitMinutes: 125, assignedTo: null,
    slaRemaining: 'SLA Breached', slaStatus: 'breached', status: 'Pending',
    timestamp: 'May 19, 2025 10:38 AM', submittedAt: 'May 19, 2025 10:38:55 AM',
  },
  {
    id: 'CASE-2025-0519-0006', transactionId: 'TX-5835',
    customerId: 'C-78221', customerName: 'Sophia Clark',
    amount: 65.40, riskScore: 0.09, riskLevel: 'Low',
    rulesTriggered: ['New Device'], ruleCount: 1,
    waitTime: '20m', waitMinutes: 20, assignedTo: 'James Carter',
    slaRemaining: '1h 40m', slaStatus: 'ok', status: 'In Review',
    timestamp: 'May 19, 2025 10:37 AM', submittedAt: 'May 19, 2025 10:37:42 AM',
  },
  {
    id: 'CASE-2025-0519-0007', transactionId: 'TX-5834',
    customerId: 'C-10234', customerName: 'John Doe',
    amount: 5000, riskScore: 0.96, riskLevel: 'High',
    rulesTriggered: ['High Velocity', 'High Amount', 'Risky Country'], ruleCount: 3,
    waitTime: '2h 30m', waitMinutes: 150, assignedTo: null,
    slaRemaining: 'SLA Breached', slaStatus: 'breached', status: 'Pending',
    timestamp: 'May 19, 2025 10:36 AM', submittedAt: 'May 19, 2025 10:36:10 AM',
  },
  {
    id: 'CASE-2025-0519-0008', transactionId: 'TX-5833',
    customerId: 'C-33120', customerName: 'Olivia Taylor',
    amount: 23.15, riskScore: 0.11, riskLevel: 'Low',
    rulesTriggered: ['Behavior Anomaly'], ruleCount: 1,
    waitTime: '15m', waitMinutes: 15, assignedTo: 'Sarah Wilson',
    slaRemaining: '1h 45m', slaStatus: 'ok', status: 'In Review',
    timestamp: 'May 19, 2025 10:35 AM', submittedAt: 'May 19, 2025 10:35:01 AM',
  },
];

export const hitlKpis = {
  totalPending: 24,
  highRisk: 12,
  mediumRisk: 10,
  lowRisk: 2,
  avgWaitTime: '1h 32m',
  highTrend: 5,
  mediumTrend: 3,
  lowTrend: -1,
  waitTimeTrend: 18,
};

export const slaStatus = {
  breached: 3,
  atRisk: 7,
  onTrack: 14,
};
