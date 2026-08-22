import type { Account } from '../types';

/** Demo account data — all amounts in INR */
export const ACCOUNTS: Account[] = [
  {
    id: 'acc-savings-4821',
    type: 'Savings Account',
    number: '•••• 4821',
    balance: 208450.75,
    currency: 'INR',
    ifscCode: 'INDB0000142',
    bankName: 'Bank Portal',
  },
  {
    id: 'acc-current-7302',
    type: 'Current Account',
    number: '•••• 7302',
    balance: 85000.00,
    currency: 'INR',
    ifscCode: 'INDB0000142',
    bankName: 'Bank Portal',
  },
];

export const PRIMARY_ACCOUNT = ACCOUNTS[0];

/** Payment method options */
export const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI',          icon: '💳', detail: 'praveenk@okaxis' },
  { id: 'debit',      label: 'Debit Card',   icon: '💳', detail: '•••• 4821 (Visa)' },
  { id: 'credit',     label: 'Credit Card',  icon: '💳', detail: '•••• 9012 (MasterCard)' },
  { id: 'netbanking', label: 'Net Banking',   icon: '🏦', detail: 'Savings •••• 4821' },
];

/** Customer profiles for simulation mode */
export const CUSTOMER_PROFILES = [
  { id: 'CUST-1001', name: 'Praveen Kumar',    risk: 'Low',    avgAmount: 3500 },
  { id: 'CUST-1042', name: 'Ananya Sharma',    risk: 'Low',    avgAmount: 5200 },
  { id: 'CUST-2198', name: 'Vikram Nair',      risk: 'Medium', avgAmount: 18000 },
  { id: 'CUST-3311', name: 'Riya Mehta',       risk: 'High',   avgAmount: 65000 },
];

/** Format INR amount as readable string */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format INR amount in words (Indian lakh/crore system) */
export function amountInWords(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(2)}K`;
  return `₹${amount.toFixed(2)}`;
}
