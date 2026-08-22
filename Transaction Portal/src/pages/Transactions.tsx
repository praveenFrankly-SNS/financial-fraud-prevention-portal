import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { getStoredTransactions, formatRelativeDate, formatDateTime } from '../data/transactions';
import { formatINR } from '../data/accounts';
import type { Transaction } from '../types';

const STATUS_FILTERS = ['All', 'Completed', 'Declined', 'Pending'];

function statusToClass(status: string): string {
  if (status === 'Completed') return 'completed';
  if (status === 'Declined')  return 'declined';
  if (status === 'Pending')   return 'pending';
  return 'pending';
}

export default function Transactions() {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [selected,   setSelected]   = useState<Transaction | null>(null);

  const allTxns = getStoredTransactions();

  const filtered = useMemo(() => {
    return allTxns.filter(t => {
      const matchSearch = !search ||
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        String(t.amount).includes(search);
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, allTxns.length]);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">View and manage your recent transactions.</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="search-bar" style={{ maxWidth: 360 }}>
          <Search size={15} className="search-bar-icon" />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by merchant, amount or transaction ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab${statusFilter === f ? ' active' : ''}`}
              onClick={() => setStatus(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
          <Download size={13} /> Export
        </button>
      </div>

      <div className="txn-history-grid">
        {/* ── Transaction list ──────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="txn-table-header" style={{ padding: '12px 20px' }}>
            <div>Merchant</div>
            <div>Date & Time</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Method</div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No transactions found</div>
              <div className="empty-state-sub">Try adjusting your search or filter.</div>
            </div>
          ) : (
            <>
              {filtered.map(txn => (
                <div
                  key={txn.id}
                  className="txn-row"
                  style={{
                    gridTemplateColumns: '2.5fr 1.2fr 1fr 1fr 1.2fr',
                    borderRadius: 0,
                    padding: '14px 20px',
                    background: selected?.id === txn.id ? 'var(--color-blue-light)' : undefined,
                  }}
                  onClick={() => setSelected(s => s?.id === txn.id ? null : txn)}
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

                  <div>
                    <div className="txn-date">
                      {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {new Date(txn.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className={`txn-amount${txn.status === 'Declined' ? ' declined' : ''}`}>
                    {txn.status === 'Declined' ? '' : '−'}{formatINR(txn.amount)}
                  </div>

                  <div>
                    <span className={`status-pill ${statusToClass(txn.status)}`}>
                      <span className="status-dot" />
                      {txn.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {txn.paymentMethod}
                  </div>
                </div>
              ))}

              <div style={{
                padding: '14px 20px',
                fontSize: 12,
                color: 'var(--color-text-muted)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>Showing {filtered.length} of {allTxns.length} transactions</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3].map(p => (
                    <button key={p} style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: p === 1 ? 'var(--color-blue)' : 'var(--color-surface-alt)',
                      color: p === 1 ? 'white' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Detail panel ─────────────────────────────── */}
        {selected ? (
          <div className="detail-panel animate-slide-up" style={{ position: 'sticky', top: 76 }}>
            <div className="detail-panel-merchant">
              <div className="flex items-center gap-3">
                <div
                  className="txn-merchant-icon"
                  style={{
                    background: selected.merchantColor + '18',
                    width: 52, height: 52, fontSize: 26,
                  }}
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 20 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={`detail-panel-amount${selected.status === 'Declined' ? ' declined' : ''}`}>
              {selected.status === 'Declined' ? '' : '−'}{formatINR(selected.amount)}
            </div>
            <span className={`status-pill ${statusToClass(selected.status)}`} style={{ marginBottom: 16, display: 'inline-flex' }}>
              <span className="status-dot" />{selected.status}
            </span>

            <div className="divider" />

            {[
              ['Transaction ID',  selected.id],
              ['Date & Time',     formatDateTime(selected.date)],
              ['Payment Method',  selected.paymentMethod],
              ['Category',        selected.merchantCategory],
              ['Location',        selected.location ?? '—'],
              ['Device',          selected.device ?? '—'],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}>
                <span className="detail-key">{k}</span>
                <span className="detail-value">{v}</span>
              </div>
            ))}

            {selected.note && (
              <>
                <div className="divider" />
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Note</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{selected.note}</div>
              </>
            )}

            <div className="detail-security-note" style={{ marginTop: 'var(--space-4)' }}>
              <ShieldCheck size={14} color="var(--color-blue)" />
              This transaction was reviewed for security.
            </div>

            {selected.status === 'Declined' && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <button className="btn btn-secondary btn-full btn-sm">
                  Contact Support <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Select a transaction
            </div>
            <div style={{ fontSize: 12 }}>Click any row to view full details.</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
