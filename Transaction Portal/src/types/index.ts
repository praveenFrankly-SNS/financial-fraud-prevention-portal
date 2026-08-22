export type TransactionStatus = 'Completed' | 'Declined' | 'Pending' | 'Verification Required';
export type DecisionStatus = 'ALLOW' | 'CHALLENGE' | 'BLOCK' | 'UNAVAILABLE' | 'ERROR';
export type PaymentMethod = 'UPI' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Wallet';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  logo: string; // emoji or initials
  color: string;
}

export interface Account {
  id: string;
  type: string;
  number: string; // masked, e.g. '•••• 4821'
  balance: number; // in INR paise → display as ₹
  currency: 'INR';
  ifscCode: string;
  bankName: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  merchantCategory: string;
  merchantLogo: string;
  merchantColor: string;
  amount: number; // in INR
  status: TransactionStatus;
  paymentMethod: string;
  date: string;   // ISO 8601
  note?: string;
  location?: string;
  device?: string;
}

export interface TransactionRequest {
  amount: number;
  merchant: string;
  payment_method: string;
  category: string;
  note?: string;
  customer_id?: string;
}

export interface TransactionResponse {
  transactionId: string;
  status: DecisionStatus;
  customerMessage: string;
  processingTimeMs: number;
  merchant: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
}

export interface SimulationRequest {
  scenario: string;
  amount: number;
  merchant: string;
  payment_method: string;
  customer_id?: string;
  location: string;
  device: string;
  ip_address: string;
  velocity_5m: number;
  velocity_10m: number;
  is_new_device: boolean;
  is_new_location: boolean;
  is_new_merchant: boolean;
  impossible_travel: boolean;
  multiple_rapid_txns: boolean;
  high_risk_category: boolean;
  new_payee: boolean;
  past_fraud_history: boolean;
}

export interface SimulationResponse {
  transactionId: string;
  scenario: string;
  status: DecisionStatus;
  fraudProbability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  customerMessage: string;
  processingTimeMs: number;
  triggeredSignals: string[];
  rulesTriggered: number;
  riskBreakdown: Record<string, number>;
  merchant: string;
  amount: number;
  location: string;
  device: string;
  ipAddress: string;
  financePortalUrl: string;
  timestamp: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
