import type { Transaction, Notification, SpendingCategory } from '../types';

/** Initial static transaction history — amounts in INR */
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-A8F2C1D3',
    merchant: 'Amazon',
    merchantCategory: 'Shopping',
    merchantLogo: '📦',
    merchantColor: '#FF9900',
    amount: 12450.00,
    status: 'Completed',
    paymentMethod: 'Debit Card •••• 4821',
    date: '2026-08-20T10:42:00Z',
    note: 'Online purchase - Order #A24-78291',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
  },
  {
    id: 'TXN-B3E9A7F2',
    merchant: 'Spotify',
    merchantCategory: 'Entertainment',
    merchantLogo: '🎵',
    merchantColor: '#1DB954',
    amount: 119.00,
    status: 'Completed',
    paymentMethod: 'UPI',
    date: '2026-08-20T09:15:00Z',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
  },
  {
    id: 'TXN-C4D1B8E5',
    merchant: 'Swiggy',
    merchantCategory: 'Food & Dining',
    merchantLogo: '🛵',
    merchantColor: '#FC8019',
    amount: 648.00,
    status: 'Completed',
    paymentMethod: 'UPI',
    date: '2026-08-19T19:30:00Z',
    location: 'Mumbai, India',
    device: 'Mobile App (iOS)',
  },
  {
    id: 'TXN-D5F2C3A9',
    merchant: 'IRCTC',
    merchantCategory: 'Travel',
    merchantLogo: '🚂',
    merchantColor: '#003399',
    amount: 2340.00,
    status: 'Completed',
    paymentMethod: 'Net Banking',
    date: '2026-08-19T14:22:00Z',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
  },
  {
    id: 'TXN-E6A3D4B1',
    merchant: 'Unknown Merchant',
    merchantCategory: 'Unknown',
    merchantLogo: '⚠️',
    merchantColor: '#dc2626',
    amount: 85000.00,
    status: 'Declined',
    paymentMethod: 'Debit Card •••• 4821',
    date: '2026-08-18T23:15:00Z',
    location: 'Lagos, Nigeria',
    device: 'Unknown Device',
  },
  {
    id: 'TXN-F7B4E5C2',
    merchant: 'Netflix',
    merchantCategory: 'Entertainment',
    merchantLogo: '🎬',
    merchantColor: '#E50914',
    amount: 649.00,
    status: 'Completed',
    paymentMethod: 'Credit Card •••• 9012',
    date: '2026-08-17T09:02:00Z',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
  },
  {
    id: 'TXN-G8C5F6D3',
    merchant: 'Flipkart',
    merchantCategory: 'Shopping',
    merchantLogo: '🛍️',
    merchantColor: '#2874F0',
    amount: 3299.00,
    status: 'Completed',
    paymentMethod: 'UPI',
    date: '2026-08-17T16:45:00Z',
    location: 'Mumbai, India',
    device: 'Mobile App (Android)',
  },
  {
    id: 'TXN-H9D6G7E4',
    merchant: 'MakeMyTrip',
    merchantCategory: 'Travel',
    merchantLogo: '✈️',
    merchantColor: '#E83D26',
    amount: 18540.00,
    status: 'Completed',
    paymentMethod: 'Credit Card •••• 9012',
    date: '2026-08-16T11:30:00Z',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
  },
];

const STORAGE_KEY_TXNS = 'bank_portal_transactions_v1';
const STORAGE_KEY_NOTIFS = 'bank_portal_notifications_v1';

/** Helper to get stored transactions from localStorage or default */
export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXNS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse transactions from localStorage', e);
  }
  return INITIAL_TRANSACTIONS;
}

/** Helper to save transaction to localStorage */
export function saveTransaction(txn: Transaction): Transaction[] {
  const current = getStoredTransactions();
  // Avoid duplicates
  const filtered = current.filter(t => t.id !== txn.id);
  const updated = [txn, ...filtered];
  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transaction to localStorage', e);
  }
  return updated;
}

export const RECENT_TRANSACTIONS = getStoredTransactions();

export const SPENDING_CATEGORIES: SpendingCategory[] = [
  { name: 'Shopping',       amount: 15749, color: '#2563eb' },
  { name: 'Travel',         amount: 20880, color: '#7c3aed' },
  { name: 'Food & Dining',  amount: 3820,  color: '#ea580c' },
  { name: 'Entertainment',  amount: 1416,  color: '#059669' },
  { name: 'Utilities',      amount: 599,   color: '#d97706' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Payment Successful',
    message: 'Your payment to Amazon for ₹12,450 was completed.',
    time: '10:42 AM',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Transaction Declined',
    message: 'A suspicious transaction of ₹85,000 was blocked for your security.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'Account Update',
    message: 'Your savings account statement for August is ready.',
    time: '2 days ago',
    read: true,
  },
];

export function getStoredNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotification(notif: Notification): Notification[] {
  const current = getStoredNotifications();
  const updated = [notif, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification', e);
  }
  return updated;
}

export const NOTIFICATIONS = getStoredNotifications();

/** Format relative time */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

/** Format date/time for transaction detail */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) + ' • ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
