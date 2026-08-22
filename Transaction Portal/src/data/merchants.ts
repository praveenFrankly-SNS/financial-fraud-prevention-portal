import type { Merchant } from '../types';

/** Allowed merchants — Indian brands + global allowed brands (no Walmart, Target, etc.) */
export const MERCHANTS: Merchant[] = [
  // ── Indian — Food & Dining ───────────────────────────────────────────────
  { id: 'swiggy',       name: 'Swiggy',          category: 'Food & Dining',    logo: '🛵', color: '#FC8019' },
  { id: 'zomato',       name: 'Zomato',           category: 'Food & Dining',    logo: '🍕', color: '#E23744' },
  { id: 'blinkit',      name: 'Blinkit',          category: 'Groceries',        logo: '⚡', color: '#F6C500' },
  { id: 'bigbasket',    name: 'BigBasket',         category: 'Groceries',        logo: '🛒', color: '#84C341' },
  { id: 'starbucks',    name: 'Starbucks',         category: 'Food & Dining',    logo: '☕', color: '#00704A' },

  // ── Indian — Shopping ───────────────────────────────────────────────────
  { id: 'flipkart',     name: 'Flipkart',          category: 'Shopping',         logo: '🛍️', color: '#2874F0' },
  { id: 'myntra',       name: 'Myntra',            category: 'Shopping',         logo: '👗', color: '#FF3E6C' },
  { id: 'nykaa',        name: 'Nykaa',             category: 'Shopping',         logo: '💄', color: '#FC2779' },
  { id: 'ajio',         name: 'Ajio',              category: 'Shopping',         logo: '👕', color: '#E8291A' },
  { id: 'tatacliq',     name: 'Tata CLiQ',         category: 'Shopping',         logo: '🏷️', color: '#0A3055' },
  { id: 'croma',        name: 'Croma',             category: 'Electronics',      logo: '📱', color: '#00AEEF' },
  { id: 'reliancedigital', name: 'Reliance Digital', category: 'Electronics',   logo: '🔌', color: '#00A3E0' },

  // ── Indian — Travel & Transport ─────────────────────────────────────────
  { id: 'irctc',        name: 'IRCTC',             category: 'Travel',           logo: '🚂', color: '#003399' },
  { id: 'makemytrip',   name: 'MakeMyTrip',        category: 'Travel',           logo: '✈️', color: '#E83D26' },
  { id: 'easemytrip',   name: 'EaseMyTrip',        category: 'Travel',           logo: '🛫', color: '#0066CC' },
  { id: 'ola',          name: 'Ola',               category: 'Transport',        logo: '🚖', color: '#1C2543' },
  { id: 'rapido',       name: 'Rapido',            category: 'Transport',        logo: '🛵', color: '#FFD700' },

  // ── Indian — Entertainment ─────────────────────────────────────────────
  { id: 'bookmyshow',   name: 'BookMyShow',        category: 'Entertainment',    logo: '🎟️', color: '#D22F2F' },
  { id: 'hotstar',      name: 'Disney+ Hotstar',   category: 'Entertainment',    logo: '⭐', color: '#0A2463' },
  { id: 'zepto',        name: 'Zepto',             category: 'Groceries',        logo: '🟡', color: '#AF52DE' },

  // ── Indian — Utilities & Telecom ───────────────────────────────────────
  { id: 'airtel',       name: 'Airtel',            category: 'Utilities',        logo: '📶', color: '#E40000' },
  { id: 'jio',          name: 'Jio',               category: 'Utilities',        logo: '📡', color: '#0066CC' },
  { id: 'bsnl',         name: 'BSNL',              category: 'Utilities',        logo: '📞', color: '#006400' },

  // ── Indian — Financial Services ────────────────────────────────────────
  { id: 'lici',         name: 'LIC India',         category: 'Insurance',        logo: '🛡️', color: '#1A4A8A' },
  { id: 'hdfclife',     name: 'HDFC Life',         category: 'Insurance',        logo: '💼', color: '#004C8C' },

  // ── Global (allowed) ───────────────────────────────────────────────────
  { id: 'amazon',       name: 'Amazon',            category: 'Shopping',         logo: '📦', color: '#FF9900' },
  { id: 'apple',        name: 'Apple',             category: 'Electronics',      logo: '🍎', color: '#555555' },
  { id: 'samsung',      name: 'Samsung',           category: 'Electronics',      logo: '📱', color: '#1428A0' },
  { id: 'spotify',      name: 'Spotify',           category: 'Entertainment',    logo: '🎵', color: '#1DB954' },
  { id: 'netflix',      name: 'Netflix',           category: 'Entertainment',    logo: '🎬', color: '#E50914' },
  { id: 'uber',         name: 'Uber',              category: 'Transport',        logo: '🚗', color: '#000000' },
  { id: 'google',       name: 'Google',            category: 'Technology',       logo: '🔍', color: '#4285F4' },
  { id: 'microsoft',    name: 'Microsoft',         category: 'Technology',       logo: '🪟', color: '#00A4EF' },
  { id: 'adobe',        name: 'Adobe',             category: 'Technology',       logo: '🎨', color: '#FF0000' },
];

export const CATEGORIES = [...new Set(MERCHANTS.map(m => m.category))].sort();

export const getMerchantById = (id: string) => MERCHANTS.find(m => m.id === id);
export const getMerchantByName = (name: string) => MERCHANTS.find(m => m.name === name);
