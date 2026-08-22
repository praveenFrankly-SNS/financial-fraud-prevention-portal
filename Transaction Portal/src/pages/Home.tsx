import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, CreditCard, List, UserPlus, Eye, EyeOff,
  TrendingUp, ArrowRight, CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { PRIMARY_ACCOUNT, formatINR } from '../data/accounts';
import {
  getStoredTransactions, SPENDING_CATEGORIES, NOTIFICATIONS,
  formatRelativeDate, formatDateTime
} from '../data/transactions';
import type { Transaction } from '../types';

const QUICK_ACTIONS = [
  { label: 'Send Money',        sub: 'Transfer to anyone', icon: '↗️',  color: '#eff6ff', to: '/send' },
  { label: 'Make Payment',      sub: 'Pay bills & merchants', icon: '💳', color: '#f0fdf4', to: '/pay' },
  { label: 'View Transactions', sub: 'See your activity',   icon: '📋', color: '#fdf4ff', to: '/transactions' },
  { label: 'Add Beneficiary',   sub: 'Add new recipient',   icon: '👤', color: '#fff7ed', to: '/beneficiaries' },
];

function statusToClass(status: string): string {
  if (status === 'Completed') return 'completed';
  if (status === 'Declined')  return 'declined';
  if (status === 'Pending')   return 'pending';
  return 'pending';
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle size={14} />;
  if (type === 'warning') return <AlertCircle size={14} />;
  return <Info size={14} />;
}

export default function Home() {
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const totalSpent = SPENDING_CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <Layout>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, Praveen!</h1>
        <p className="page-subtitle">Here's what's happening with your account today.</p>
      </div>

      <div className="home-grid">
        {/* ── Left column ──────────────────────────────── */}
        <div className="home-main">

          {/* Balance card */}
          <div className="balance-card">
            <div className="balance-label">
              Total Available Balance
              <button
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
                onClick={() => setBalanceVisible(v => !v)}
              >
                {balanceVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="balance-amount">
              {balanceVisible ? formatINR(PRIMARY_ACCOUNT.balance) : '₹ ••••••••'}
            </div>
            <div className="balance-account">
              {PRIMARY_ACCOUNT.type} &nbsp;{PRIMARY_ACCOUNT.number}
            </div>
            <span className="balance-change">
              <TrendingUp size={12} /> +3.45% vs last month
            </span>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
              <button className="card-link">Customise <ArrowRight size={13} /></button>
            </div>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  className="quick-action-btn"
                  onClick={() => navigate(a.to)}
                >
                  <div className="quick-action-icon" style={{ background: a.color }}>
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                  </div>
                  <div className="quick-action-label">{a.label}</div>
                  <div className="quick-action-sub">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Transactions</span>
              <button className="card-link" onClick={() => navigate('/transactions')}>
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div className="txn-table">
              <div className="txn-table-header">
                <div>Merchant</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div></div>
              </div>
              {getStoredTransactions().slice(0, 5).map(txn => (
                <div
                  key={txn.id}
                  className="txn-row"
                  onClick={() => setSelected(txn)}
                >
                  <div className="txn-merchant-cell">
                    <div
                      className="txn-merchant-icon"
                      style={{ background: txn.merchantColor + '18' }}
                    >
                      {txn.merchantLogo}
                    </div>
                    <div>
                      <div className="txn-merchant-name">{txn.merchant}</div>
                      <div className="txn-merchant-cat">{txn.merchantCategory}</div>
                    </div>
                  </div>
                  <div className="txn-date">{formatRelativeDate(txn.date)}</div>
                  <div className={`txn-amount${txn.status === 'Declined' ? ' declined' : ''}`}>
                    {txn.status === 'Declined' ? '' : '−'}{formatINR(txn.amount)}
                  </div>
                  <div>
                    <span className={`status-pill ${statusToClass(txn.status)}`}>
                      <span className="status-dot" />
                      {txn.status}
                    </span>
                  </div>
                  <ArrowRight size={15} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', paddingTop: 'var(--space-3)' }}>
              <button className="card-link" onClick={() => navigate('/transactions')}>
                View full transaction history <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Transaction detail inline drawer */}
          {selected && (
            <div className="detail-panel animate-slide-up">
              <div className="detail-panel-merchant">
                <div className="flex items-center gap-3">
                  <div
                    className="txn-merchant-icon"
                    style={{ background: selected.merchantColor + '18', width: 48, height: 48, fontSize: 24 }}
                  >
                    {selected.merchantLogo}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.merchant}</div>
                    <div className="text-muted">{selected.merchantCategory}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ color: 'var(--color-text-muted)', fontSize: 18, cursor: 'pointer', background: 'none', border: 'none' }}
                >×</button>
              </div>
              <div className={`detail-panel-amount${selected.status === 'Declined' ? ' declined' : ''}`}>
                {selected.status === 'Declined' ? '' : '−'}{formatINR(selected.amount)}
              </div>
              <div className="divider" />
              {[
                ['Status',         selected.status],
                ['Date & Time',    formatDateTime(selected.date)],
                ['Transaction ID', selected.id],
                ['Payment Method', selected.paymentMethod],
                ['Merchant',       selected.merchant],
                ['Location',       selected.location ?? '—'],
              ].map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <span className="detail-key">{k}</span>
                  <span className="detail-value">{v}</span>
                </div>
              ))}
              <div className="detail-security-note">
                <span>🔒</span> This transaction was reviewed for security.
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ─────────────────────────────── */}
        <div className="home-aside">

          {/* Spending overview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Spending Overview</span>
              <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>This month</span>
            </div>

            <div style={{ position: 'relative', height: 170, marginBottom: 'var(--space-3)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SPENDING_CATEGORIES}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={78}
                    paddingAngle={3}
                    dataKey="amount"
                    stroke="none"
                  >
                    {SPENDING_CATEGORIES.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [formatINR(v), 'Spent']}
                    contentStyle={{ fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {formatINR(totalSpent)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Total Spent</div>
              </div>
            </div>

            <div className="chart-legend">
              {SPENDING_CATEGORIES.map(c => (
                <div className="chart-legend-item" key={c.name}>
                  <div className="chart-legend-dot" style={{ background: c.color }} />
                  <span className="chart-legend-name">{c.name}</span>
                  <span className="chart-legend-amount">{formatINR(c.amount)}</span>
                  <span className="chart-legend-pct">
                    {Math.round((c.amount / totalSpent) * 100)}%
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
              <button className="card-link">View spending insights <ArrowRight size={13} /></button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Notifications</span>
              <button className="card-link">View all</button>
            </div>
            {NOTIFICATIONS.map(n => (
              <div className="notif-item" key={n.id}>
                <div className={`notif-icon ${n.type}`}>
                  <NotifIcon type={n.type} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
