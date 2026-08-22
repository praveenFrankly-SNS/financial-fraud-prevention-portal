import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, RefreshCw, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchHitlQueueData, submitHitlDecision } from '../../services';

function RiskBadge({ r }: { r: string }) {
  const map: Record<string, string> = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
  return <span className={`badge ${map[r] ?? 'badge-blue'}`}>{r}</span>;
}

function SlaBadge({ status, remaining }: { status: string; remaining: string }) {
  const cls = status === 'breached' ? 'sla-urgent' : status === 'warning' ? 'sla-warning' : 'sla-ok';
  return <span className={`sla-badge ${cls}`}>{remaining}</span>;
}

const PIE_COLORS = ['#dc2626', '#d97706', '#059669'];

import { LoadingState } from '../../components/LoadingState';

export function HITLQueue() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  
  // Decision Modal State
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchHitlQueueData();
      setData(res);
    } catch (err) {
      console.error('Failed to load HITL queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDecision = async (decisionType: 'APPROVE' | 'BLOCK' | 'ESCALATE') => {
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      const res = await submitHitlDecision(
        selectedCase.id,
        decisionType,
        decisionReason || `Analyst ${decisionType.toLowerCase()} decision via portal`,
        "analyst@financeops.com"
      );
      setActionSuccess(`Case ${selectedCase.id} updated to ${decisionType} (Databricks Audit ID: ${res.audit_id || 'AUD-OK'})`);
      setSelectedCase(null);
      setDecisionReason('');
      loadData();
    } catch (err) {
      console.error('Failed to submit decision:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return <LoadingState message="Loading HITL Review Queue..." submessage="Fetching high-risk cases awaiting analyst decision..." />;
  }

  const k = data?.kpis || { totalPending: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, avgWaitTime: '0m' };
  const s = data?.slaStatus || { breached: 0, atRisk: 0, onTrack: 0 };
  const cases: any[] = data?.cases || [];

  const pieData = [
    { name: 'High', value: k.highRisk || 0 },
    { name: 'Medium', value: k.mediumRisk || 0 },
    { name: 'Low', value: k.lowRisk || 0 },
  ];

  const topRules = [
    { name: 'High Velocity', count: 10 },
    { name: 'High Risk Country', count: 8 },
    { name: 'Device Fingerprint Mismatch', count: 6 },
    { name: 'Amount Deviation', count: 5 },
    { name: 'Multiple Auth Failures', count: 4 },
  ];

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchRisk = riskFilter === 'All' || c.riskLevel === riskFilter;
    const matchAssignee = assigneeFilter === 'All' ||
      (assigneeFilter === 'Unassigned' ? !c.assignedTo : !!c.assignedTo);
    return matchSearch && matchRisk && matchAssignee;
  });

  return (
    <div>
      {/* Action Notification Toast */}
      {actionSuccess && (
        <div style={{ background: '#d1fae5', border: '1px solid #059669', color: '#065f46', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <CheckCircle size={18} /> {actionSuccess}
          </div>
          <X size={14} style={{ cursor: 'pointer' }} onClick={() => setActionSuccess(null)} />
        </div>
      )}

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>HITL Review Queue <span style={{ fontSize: 16, background: 'var(--color-amber-light)', color: 'var(--color-amber)', padding: '3px 10px', borderRadius: 20, fontWeight: 700, verticalAlign: 'middle', marginLeft: 8 }}>{k.totalPending} Pending</span></h1>
            <p className="subtitle">Review high and medium risk transactions that require human decision.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadData}><RefreshCw size={12} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid kpi-grid-5" style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Pending', value: k.totalPending, trend: 9, up: true },
          { title: 'High Risk', value: k.highRisk, trend: k.highTrend || 5, up: true },
          { title: 'Medium Risk', value: k.mediumRisk, trend: k.mediumTrend || 3, up: true },
          { title: 'Low Risk', value: k.lowRisk, trend: Math.abs(k.lowTrend || 1), up: false },
          { title: 'Avg. Wait Time', value: k.avgWaitTime, trend: k.waitTimeTrend || 18, up: false },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-header"><span className="kpi-card-title">{kpi.title}</span></div>
            <div className="kpi-card-value">{kpi.value}</div>
            <div className={`kpi-card-trend ${kpi.up ? 'up' : 'down'}`}>
              <TrendingUp size={12} /> {kpi.trend} vs yesterday
            </div>
          </div>
        ))}
      </div>

      {/* Main: Table + Right Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Left: Filter + Table */}
        <div className="card">
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <select className="filter-select" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
              <option value="All">Risk Level: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="filter-select" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
              <option value="All">Assignee: All</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                placeholder="Search by Tx ID, Customer ID, Rule..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setRiskFilter('All'); setAssigneeFilter('All'); }}>Clear</button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Rules</th>
                  <th>Wait Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="table-link" onClick={() => navigate(`/investigation/${c.transactionId}`)}>{c.transactionId}</span>
                    </td>
                    <td className="text-muted">{c.timestamp ? c.timestamp.split(' ').slice(-2).join(' ') : 'Just now'}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.customerId}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{c.customerName}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>${c.amount.toLocaleString()}</td>
                    <td>
                      <span className={`risk-score ${c.riskScore >= 0.75 ? 'risk-high' : c.riskScore >= 0.5 ? 'risk-medium' : 'risk-low'}`}>
                        {c.riskScore.toFixed(2)}
                      </span>
                    </td>
                    <td><RiskBadge r={c.riskLevel} /></td>
                    <td>
                      <div style={{ fontSize: 11 }}>{(c.rulesTriggered || []).slice(0, 2).join(', ')}</div>
                    </td>
                    <td>
                      <SlaBadge status={c.slaStatus} remaining={c.waitTime} />
                    </td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-review" onClick={() => setSelectedCase(c)}>Analyst Action</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Queue Summary + Top Rules + SLA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Queue Donut */}
          <div className="card">
            <div className="card-header"><span className="card-title">Queue Summary</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={24} outerRadius={40} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <text x={45} y={42} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 14, fontWeight: 800 }}>
                    {k.totalPending}
                  </text>
                  <text x={45} y={54} textAnchor="middle" style={{ fontSize: 8, fill: '#9ca3af' }}>Total</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="decision-legend">
                {pieData.map((d, i) => (
                  <div className="legend-item" key={d.name}>
                    <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{d.name} ({d.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Triggered Rules */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">Top Triggered Rules</span></div>
            {topRules.map(r => (
              <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ height: 5, background: 'var(--color-border-light)', borderRadius: 3, width: 120, marginBottom: 3 }}>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--color-red)', width: `${r.count * 10}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{r.count}</span>
              </div>
            ))}
          </div>

          {/* SLA Status */}
          <div className="card">
            <div className="card-header"><span className="card-title">SLA Status</span></div>
            {[
              { label: 'Breached (> 4h)', count: s.breached, color: 'var(--color-red)' },
              { label: 'At Risk (2h – 4h)', count: s.atRisk, color: 'var(--color-amber)' },
              { label: 'On Track (< 2h)', count: s.onTrack, color: 'var(--color-green)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>● {item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedCase && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: 480, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>HITL Decision: {selectedCase.id}</h3>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSelectedCase(null)} />
            </div>
            
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
              <div><strong>Transaction:</strong> {selectedCase.transactionId} &nbsp;|&nbsp; <strong>Amount:</strong> ${selectedCase.amount}</div>
              <div><strong>Customer:</strong> {selectedCase.customerName} &nbsp;|&nbsp; <strong>Risk Score:</strong> {selectedCase.riskScore}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Analyst Notes / Rationale:</label>
              <textarea
                rows={3}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                placeholder="Enter justification for decision..."
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                disabled={submitting}
                style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                onClick={() => handleDecision('APPROVE')}
              >
                <CheckCircle size={14} /> Approve Transaction
              </button>
              <button
                className="btn btn-secondary"
                disabled={submitting}
                style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
                onClick={() => handleDecision('ESCALATE')}
              >
                <AlertTriangle size={14} /> Escalate
              </button>
              <button
                className="btn btn-primary"
                disabled={submitting}
                style={{ background: '#dc2626' }}
                onClick={() => handleDecision('BLOCK')}
              >
                <ShieldAlert size={14} /> Block Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
