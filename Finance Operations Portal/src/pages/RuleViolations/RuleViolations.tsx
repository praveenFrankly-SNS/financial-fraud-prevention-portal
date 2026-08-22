import { useState, useEffect } from 'react';
import { Search, X, TrendingUp, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchRuleViolationsData } from '../../services';
import type { RuleViolation } from '../../types';
import { LoadingState } from '../../components/LoadingState';

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low', CRITICAL: 'badge-critical' };
  return <span className={`badge ${map[s] ?? 'badge-blue'}`}>{s}</span>;
}

function StatusBadge({ s }: { s: string }) {
  return <span className={`badge ${s === 'Active' ? 'badge-active' : 'badge-resolved'}`}>{s}</span>;
}

function RuleDrawer({ rule, onClose }: { rule: RuleViolation; onClose: () => void }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            <h3>{rule.ruleName}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <SeverityBadge s={rule.severity} />
              <span className="badge badge-blue">{rule.category}</span>
            </div>
          </div>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="drawer-body">
          {/* Rule Condition */}
          <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Rule Condition</div>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{rule.description}</p>
            <code style={{ fontSize: 12, background: '#1e293b', color: '#e2e8f0', padding: '4px 8px', borderRadius: 4, display: 'block', marginTop: 8 }}>
              {rule.condition}
            </code>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
              Threshold: <strong style={{ color: 'var(--color-text-primary)' }}>{rule.threshold}</strong>
            </div>
          </div>

          {/* Stats */}
          <div className="detail-grid" style={{ marginBottom: 20 }}>
            {[
              ['Total Triggered', rule.count.toLocaleString()],
              ['Block Rate', rule.blockPct + '%'],
              ['HITL Rate', rule.hitlPct + '%'],
              ['Status', rule.status],
              ['First Occurred', rule.firstOccurred],
              ['Last Triggered', rule.lastOccurred],
            ].map(([l, v]) => (
              <div className="detail-row" key={l}>
                <span className="detail-label">{l}</span>
                <span className="detail-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Close</button>
        </div>
      </div>
    </>
  );
}

const PIE_COLORS = ['#dc2626', '#d97706', '#059669'];

export function RuleViolations() {
  const [selectedRule, setSelectedRule] = useState<RuleViolation | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    try {
      const res = await fetchRuleViolationsData();
      setData(res);
    } catch (err) {
      console.error('Failed to load rule violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return <LoadingState message="Loading Rule Violations..." submessage="Fetching triggered policy rules & severity metrics..." />;
  }

  const k = data?.kpis || { total: 10543, high: 6049, medium: 3494, low: 1000, uniqueRules: 23, totalTrend: 18.7, highTrend: 21.3, mediumTrend: 14.2, lowTrend: -8.1, uniqueRulesTrend: 9.5 };
  const rulesList: RuleViolation[] = data?.ruleViolations || [];
  const violationsByCategory = data?.violationsByCategory || [];

  const kpis = [
    { title: 'Total Violations', value: k.total.toLocaleString(), trend: k.totalTrend, up: true },
    { title: 'High Severity', value: k.high.toLocaleString(), trend: k.highTrend, up: true },
    { title: 'Medium Severity', value: k.medium.toLocaleString(), trend: k.mediumTrend, up: true },
    { title: 'Low Severity', value: k.low.toLocaleString(), trend: Math.abs(k.lowTrend), up: false },
    { title: 'Unique Rules Triggered', value: k.uniqueRules.toLocaleString(), trend: k.uniqueRulesTrend, up: true },
  ];

  const filtered = rulesList.filter(r => {
    const matchSearch = !search || r.ruleName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'All' || r.severity === severityFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const pieData = [
    { name: 'High', value: k.high },
    { name: 'Medium', value: k.medium },
    { name: 'Low', value: k.low },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Rule Violations</h1>
            <p className="subtitle">Monitor and analyze rule violations detected in transactions and system events.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadData}><RefreshCw size={12} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid kpi-grid-5" style={{ marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-header">
              <span className="kpi-card-title">{kpi.title}</span>
            </div>
            <div className="kpi-card-value">{kpi.value}</div>
            <div className={`kpi-card-trend ${kpi.up ? 'up' : 'down'}`}>
              <TrendingUp size={12} /> {kpi.trend}% vs yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Main content: Table + Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Left: Filter + Table */}
        <div className="card">
          {/* Filters */}
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <select className="filter-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
              <option value="All">Severity: All</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
            </select>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                placeholder="Search by Rule, Transaction ID, Customer ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSeverityFilter('All'); setStatusFilter('All'); }}>Clear</button>
          </div>

          {/* Table */}
          <div className="card-header">
            <span className="card-title">Rule Violations ({filtered.length.toLocaleString()})</span>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Violation ID</th>
                  <th>Rule Name</th>
                  <th>Severity</th>
                  <th>Rule Category</th>
                  <th>Triggered By</th>
                  <th>Count</th>
                  <th>First Occurred</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setSelectedRule(r)}>
                    <td><span className="table-link">{r.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.ruleName}</td>
                    <td><SeverityBadge s={r.severity} /></td>
                    <td className="text-muted">{r.category}</td>
                    <td className="text-muted">{r.triggeredBy}</td>
                    <td style={{ fontWeight: 600 }}>{r.count.toLocaleString()}</td>
                    <td className="text-muted">{r.firstOccurred}</td>
                    <td><StatusBadge s={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Severity Donut */}
          <div className="card">
            <div className="card-header"><span className="card-title">Violations by Severity</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <text x={50} y={48} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }}>
                    {k.total.toLocaleString()}
                  </text>
                  <text x={50} y={60} textAnchor="middle" style={{ fontSize: 8, fill: '#9ca3af' }}>Total</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="decision-legend">
                {pieData.map((d, i) => (
                  <div className="legend-item" key={d.name}>
                    <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{d.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Rule Categories */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">Top Rule Categories</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {violationsByCategory.map((c: any) => (
                <div key={c.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{c.category}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{c.count.toLocaleString()} ({c.pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-border-light)', borderRadius: 3 }}>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--color-blue)', width: `${c.pct * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rule detail drawer */}
      {selectedRule && <RuleDrawer rule={selectedRule} onClose={() => setSelectedRule(null)} />}
    </div>
  );
}
