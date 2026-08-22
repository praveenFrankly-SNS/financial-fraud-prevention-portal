import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CreditCard, ShieldX, Percent, Users, Bell, Activity, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { fetchDashboardData, fetchTransactionsData } from '../../services';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../../components/LoadingState';

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

function DecisionBadge({ d }: { d: string }) {
  const map: Record<string, string> = {
    ALLOW: 'badge-allow', Approved: 'badge-allow', BLOCK: 'badge-block', Blocked: 'badge-block',
    CHALLENGE: 'badge-challenge', HITL: 'badge-hitl', Pending: 'badge-hitl', INVESTIGATE: 'badge-investigate',
  };
  return <span className={`badge ${map[d] ?? 'badge-blue'}`}>{d}</span>;
}

function StatusBadge({ s }: { s: string }) {
  if (s === 'Completed' || s === 'Approved') return <span className="badge badge-completed">Completed</span>;
  if (s === 'HITL Pending' || s === 'Pending') return <span className="badge badge-hitl">HITL Pending</span>;
  return <span className="badge badge-pending">{s}</span>;
}

const CUSTOM_TOOLTIP_STYLE = {
  background: 'white', border: '1px solid #e5e7eb', borderRadius: 6,
  fontSize: 12, padding: '6px 10px',
};

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchDashboardData();
      const txRes = await fetchTransactionsData(undefined, 5, 0);
      setData(res);
      if (txRes && txRes.transactions) {
        setRecentTx(txRes.transactions.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Poll every 15s for live updates
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <LoadingState message="Loading Finance Operations Dashboard..." submessage="Fetching real-time transaction summary & analytics..." />;
  }

  const s = data?.summary || {};
  const transactionTrend = data?.transactionTrend || [];
  const decisionDistribution = data?.decisionDistribution || [];
  const topRuleViolations = data?.topRuleViolations || [];
  const systemHealth = [
    {"name": "Streaming Pipeline", "status": "healthy"},
    {"name": "Kafka Connection", "status": "healthy"},
    {"name": "Model Serving Engine", "status": "healthy"},
    {"name": "Transactional Storage", "status": "healthy"},
    {"name": "Checkpoint State", "status": "healthy"},
  ];
  const alerts = data?.alerts || [];
  const recentActivity = data?.recentActivity || [];

  const kpis = [
    { title: 'Total Transactions', value: fmt(s.totalTransactions || 0), trend: s.totalTransactionsTrend, icon: <CreditCard size={16} />, iconBg: '#dbeafe', iconColor: '#2563eb' },
    { title: 'Blocked Transactions', value: fmt(s.blockedTransactions || 0), trend: s.blockedTrend, icon: <ShieldX size={16} />, iconBg: '#fee2e2', iconColor: '#dc2626' },
    { title: 'Fraud Rate', value: (s.fraudRate || 0) + '%', trend: s.fraudRateTrend, icon: <Percent size={16} />, iconBg: '#ffedd5', iconColor: '#ea580c', trendLabel: 'pp' },
    { title: 'HITL Pending', value: (s.hitlPending || 0).toString(), trend: s.hitlTrend, trendDown: true, icon: <Users size={16} />, iconBg: '#fef3c7', iconColor: '#d97706' },
    { title: 'Active Alerts', value: (s.activeAlerts || 0).toString(), trend: s.alertsTrend, trendDown: true, icon: <Bell size={16} />, iconBg: '#fce7f3', iconColor: '#db2777' },
    { title: 'System Health', value: s.systemHealth || '99.8%', sub: 'Healthy', icon: <Activity size={16} />, iconBg: '#d1fae5', iconColor: '#059669' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Finance Operations Dashboard</h1>
            <p className="subtitle">Real-time fraud prevention overview and system health.</p>
          </div>
          <div className="page-header-actions">
            <select className="filter-select" style={{ fontSize: 12, minWidth: 140 }}>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <button className="btn btn-secondary" onClick={loadData} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Databricks Unity Catalog Connection Status Banner */}
      <div style={{
        padding: '12px 16px',
        background: data?.databricksStatus?.connected ? '#f0fdf4' : '#fff1f2',
        border: `1px solid ${data?.databricksStatus?.connected ? '#bbf7d0' : '#fecdd3'}`,
        borderRadius: 8,
        fontSize: 12.5,
        color: data?.databricksStatus?.connected ? '#166534' : '#9f1239',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>
            {data?.databricksStatus?.connected ? '🟢' : '🟡'}
          </span>
          <div>
            <strong>Databricks Source:</strong> {data?.databricksStatus?.table || 'fraud_prevention_dev.silver.transactions'} &nbsp;|&nbsp;
            <span>{data?.databricksStatus?.message || 'Connecting to Databricks SQL Warehouse...'}</span>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: 'white', border: '1px solid currentColor' }}>
          {data?.databricksStatus?.count || 0} Records Processed
        </span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-header">
              <span className="kpi-card-title">{k.title}</span>
              <div className="kpi-card-icon" style={{ background: k.iconBg, color: k.iconColor }}>{k.icon}</div>
            </div>
            <div className="kpi-card-value">{k.value}</div>
            {k.sub
              ? <span style={{ fontSize: 12, color: 'var(--color-green)', fontWeight: 600 }}>{k.sub}</span>
              : k.trend !== undefined && (
                <div className={`kpi-card-trend ${(k.trendDown ? k.trend < 0 : k.trend > 0) ? 'up' : 'down'}`}>
                  {k.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(k.trend)}{k.trendLabel ?? '%'} vs yesterday
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Row 1: Chart + Donut + Rule Violations */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        {/* Transaction Volume Chart */}
        <div className="card col-span-1" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <span className="card-title">Transaction Volume Over Time</span>
            <select className="filter-select" style={{ fontSize: 11, minWidth: 80 }}>
              <option>1 Hour</option><option>6 Hours</option><option>24 Hours</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={transactionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="blocked" stroke="#dc2626" strokeWidth={1.5} dot={false} name="Blocked" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Decision Distribution */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <span className="card-title">Fraud Decisions Distribution</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={decisionDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={2}>
                  {decisionDistribution.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <text x={70} y={66} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 13, fontWeight: 700 }}>
                  {fmt(decisionDistribution.reduce((a: number, b: any) => a + (b.value || 0), 0))}
                </text>
                <text x={70} y={80} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 9, fill: '#9ca3af' }}>Total</text>
              </PieChart>
            </ResponsiveContainer>
            <div className="decision-legend" style={{ flex: 1 }}>
              {decisionDistribution.map((d: any) => (
                <div className="legend-item" key={d.name}>
                  <span className="legend-dot" style={{ background: d.color }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {(d.value || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Rule Violations */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Rule Violations</span>
            <span className="card-link" onClick={() => navigate('/rule-violations')}>View all rule violations →</span>
          </div>
          <div className="rule-violation-list">
            {topRuleViolations.map((r: any) => (
              <div className="rule-violation-item" key={r.name}>
                <span className="rule-violation-name">{r.name}</span>
                <div className="rule-violation-bar-wrap">
                  <div className="rule-violation-bar" style={{ width: `${((r.count || 0) / (r.max || 1)) * 100}%` }} />
                </div>
                <span className="rule-violation-count">{(r.count || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Transactions + System Health + Alerts */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: 20 }}>
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent High Risk Transactions</span>
            <span className="card-link" onClick={() => navigate('/transactions')}>View all</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th><th>Customer</th>
                <th>Amount</th><th>Risk</th><th>Decision</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map(tx => (
                <tr key={tx.id} onClick={() => navigate(`/investigation/${tx.id}`)}>
                  <td><span className="table-link">{tx.id}</span></td>
                  <td>{tx.customerName}</td>
                  <td style={{ fontWeight: 600 }}>₹{tx.amount.toLocaleString()}</td>
                  <td>
                    <span className={`risk-score ${tx.riskScore >= 0.75 ? 'risk-high' : tx.riskScore >= 0.5 ? 'risk-medium' : 'risk-low'}`}>
                      {tx.riskScore.toFixed(2)}
                    </span>
                  </td>
                  <td><DecisionBadge d={tx.decision} /></td>
                  <td><StatusBadge s={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">System Health Overview</span>
          </div>
          <div className="health-list">
            {systemHealth.map((h: any) => (
              <div className="health-item" key={h.name}>
                <span className="health-item-name">
                  <span className={`health-dot ${h.status}`} />
                  {h.name}
                </span>
                <span className={`health-status ${h.status}`}>
                  {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alerts Summary</span>
          </div>
          <div className="alert-list">
            {[
              { label: 'Critical', count: 2, color: 'var(--color-red)' },
              { label: 'High', count: 3, color: 'var(--color-orange)' },
              { label: 'Medium', count: 2, color: 'var(--color-amber)' },
              { label: 'Low', count: 0, color: 'var(--color-green)' },
            ].map(a => (
              <div className="alert-item" key={a.label}>
                <span className="alert-item-label">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, display: 'inline-block' }} />
                  {a.label}
                </span>
                <span className="alert-item-count" style={{ color: a.count > 0 ? a.color : 'var(--color-text-muted)' }}>
                  {a.count}
                </span>
              </div>
            ))}
          </div>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {alerts.slice(0, 4).map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                <span className={`badge badge-${a.severity.toLowerCase()}`} style={{ flexShrink: 0 }}>{a.severity}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 11 }}>{a.message}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Strip */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent System Activity</span>
        </div>
        <div className="activity-strip">
          {recentActivity.map((step: any, i: number) => (
            <div className="activity-step" key={i}>
              <div className="activity-node">
                <div className="activity-icon" style={{ background: step.iconBg, color: step.iconColor }}>
                  {step.icon}
                </div>
                <div className="activity-node-text">
                  <h5>{step.title}</h5>
                  <span>{step.subtitle}</span>
                  <span>{step.time}</span>
                </div>
              </div>
              {i < recentActivity.length - 1 && (
                <div className="activity-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
