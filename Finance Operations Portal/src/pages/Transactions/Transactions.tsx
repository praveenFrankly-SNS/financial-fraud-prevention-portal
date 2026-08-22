import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, TrendingDown, ChevronRight, RefreshCw } from 'lucide-react';
import { fetchTransactionsData } from '../../services';
import type { Transaction } from '../../types';
import { LoadingState } from '../../components/LoadingState';

function DecisionBadge({ d }: { d: string }) {
  const map: Record<string, string> = {
    ALLOW: 'badge-allow', Approved: 'badge-allow', BLOCK: 'badge-block', Blocked: 'badge-block',
    CHALLENGE: 'badge-challenge', HITL: 'badge-hitl', Pending: 'badge-hitl', INVESTIGATE: 'badge-investigate',
  };
  return <span className={`badge ${map[d] ?? 'badge-blue'}`}>{d}</span>;
}

function RuleCountBadge({ count }: { count: number }) {
  if (count === 0) return <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>—</span>;
  return (
    <span className="badge badge-blue" style={{ fontWeight: 700 }}>
      {count}
    </span>
  );
}

function TransactionDrawer({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            <h3>{tx.id}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span className={`badge badge-${tx.riskLevel.toLowerCase()}`}>{tx.riskLevel} Risk</span>
              <DecisionBadge d={tx.decision} />
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Transaction Details */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Transaction Details</div>
            <div className="detail-grid">
              {[
                ['Transaction ID', tx.id], ['Time', tx.timestamp],
                ['Customer ID', tx.customerId], ['Customer', tx.customerName],
                ['Merchant', tx.merchant], ['Category', tx.merchantCategory],
                ['Amount', `₹${tx.amount.toLocaleString()}`], ['Channel', tx.channel],
                ['Country', tx.country], ['Device ID', tx.deviceId],
                ['IP Address', tx.ipAddress], ['Session ID', tx.sessionId],
              ].map(([l, v]) => (
                <div className="detail-row" key={l}>
                  <span className="detail-label">{l}</span>
                  <span className="detail-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Risk Assessment</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: tx.riskScore >= 0.75 ? 'var(--color-red)' : tx.riskScore >= 0.5 ? 'var(--color-amber)' : 'var(--color-green)' }}>
                {tx.riskScore.toFixed(2)}
              </span>
              <span className={`badge badge-${tx.riskLevel.toLowerCase()}`} style={{ fontSize: 12 }}>{(tx.riskScore * 100).toFixed(0)}%</span>
            </div>
            <div className="risk-gauge-bar" style={{ margin: '8px 0' }}>
              <div className="risk-gauge-thumb" style={{ left: `${tx.riskScore * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/investigation/${tx.id}`)}>
            Open Investigation <ChevronRight size={14} />
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

export function Transactions() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const loadData = async (query?: string) => {
    setLoading(true);
    try {
      const res = await fetchTransactionsData(query);
      setData(res);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  const k = data?.kpis || { transactions24h: 177362, allowed: 162400, challenged: 11420, blocked: 3542, fraudValuePrevented: 425600, avgDecisionLatencyMs: 48, allowedTrend: 14.2, blockedTrend: 7.3, fraudValueTrend: 18.7, latencyTrend: -22.4 };
  const transactionsList: Transaction[] = data?.transactions || [];

  const filtered = transactionsList.filter(tx => {
    const matchDecision = decisionFilter === 'All' || tx.decision === decisionFilter;
    const matchRisk = riskFilter === 'All' || tx.riskLevel === riskFilter;
    return matchDecision && matchRisk;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Transaction Operations</h1>
            <p className="subtitle">Real-time view of incoming transactions & fraud decisions.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadData(search)}><RefreshCw size={12} /> Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { title: 'Transactions (24h)', value: k.transactions24h.toLocaleString(), trend: k.allowedTrend, up: true },
          { title: 'Allowed', value: k.allowed.toLocaleString(), sub: '91.5%', color: 'var(--color-green)' },
          { title: 'Challenged', value: k.challenged.toLocaleString(), sub: '6.4%', color: 'var(--color-amber)' },
          { title: 'Blocked', value: k.blocked.toLocaleString(), sub: '2.0%', color: 'var(--color-red)' },
          { title: 'Fraud Value Prevented', value: `₹${(k.fraudValuePrevented / 1000).toFixed(1)}K`, trend: k.fraudValueTrend, up: true },
          { title: 'Avg. Decision Latency', value: `${k.avgDecisionLatencyMs} ms`, trend: Math.abs(k.latencyTrend), up: false },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-header">
              <span className="kpi-card-title">{kpi.title}</span>
            </div>
            <div className="kpi-card-value" style={kpi.color ? { color: kpi.color } : {}}>{kpi.value}</div>
            {kpi.sub
              ? <div style={{ fontSize: 11 }}><div style={{ background: '#f3f4f6', height: 4, borderRadius: 2, marginBottom: 4 }}><div style={{ height: 4, borderRadius: 2, background: kpi.color, width: kpi.sub }} /></div><span style={{ color: kpi.color, fontWeight: 600 }}>{kpi.sub}</span></div>
              : kpi.trend !== undefined && (
                <div className={`kpi-card-trend ${kpi.up ? 'up' : 'down'}`}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}% vs previous day
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="search-input-wrap">
            <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              placeholder="Search transaction ID, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <X size={12} style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => { setSearch(''); loadData(''); }} />}
          </div>
          <select className="filter-select" value={decisionFilter} onChange={e => setDecisionFilter(e.target.value)}>
            <option value="All">Decision: All</option>
            <option value="ALLOW">Allow</option>
            <option value="BLOCK">Block</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="HITL">HITL</option>
          </select>
          <select className="filter-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option value="All">Risk Level: All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Filter</button>
        </form>

        {/* Table Header */}
        <div className="card-header">
          <span className="card-title">Transaction Requests ({filtered.length})</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
            <div>Fetching transactions...</div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                  <th>Risk Score</th>
                  <th>Decision</th>
                  <th>Rules</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} onClick={() => setSelectedTx(tx)}>
                    <td>
                      <div><span className="table-link">{tx.id}</span></div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{tx.channel}</div>
                    </td>
                    <td>
                      <div>{tx.customerId}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{tx.customerName}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{tx.amount.toLocaleString()}</td>
                    <td>
                      <div>{tx.merchant}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{tx.country}</div>
                    </td>
                    <td>
                      <span className={`risk-score ${tx.riskScore >= 0.75 ? 'risk-high' : tx.riskScore >= 0.5 ? 'risk-medium' : 'risk-low'}`}>
                        {tx.riskScore.toFixed(2)}
                      </span>
                    </td>
                    <td><DecisionBadge d={tx.decision} /></td>
                    <td><RuleCountBadge count={tx.ruleViolations} /></td>
                    <td className="text-muted">{tx.timestamp ? tx.timestamp.split('T')[0] : 'Today'}</td>
                    <td><ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedTx && <TransactionDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
