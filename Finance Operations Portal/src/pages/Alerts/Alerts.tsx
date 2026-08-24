import { useState } from 'react';
import { AlertTriangle, Bell, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export function Alerts() {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  const alerts = [
    {
      id: 'ALT-1092',
      title: 'Spike in Velocity Rule Violations',
      category: 'Velocity Anomaly',
      severity: 'CRITICAL',
      time: '5m ago',
      desc: 'Multiple rapid transactions detected for customer account CUST-1001 within a 60-second window.',
      status: 'Open'
    },
    {
      id: 'ALT-1089',
      title: 'Databricks Model Serving Latency Threshold Warning',
      category: 'System Performance',
      severity: 'MEDIUM',
      time: '18m ago',
      desc: 'Model Serving endpoint rtff-fraud-serving-dev latency reached 1,180ms during cold start query evaluation.',
      status: 'Resolved'
    },
    {
      id: 'ALT-1084',
      title: 'High Risk Location Distance Anomaly',
      category: 'Geographic Risk',
      severity: 'HIGH',
      time: '42m ago',
      desc: 'Impossible travel speed detected: Transaction initiated from London, UK 10 minutes after Mumbai session.',
      status: 'Open'
    },
    {
      id: 'ALT-1078',
      title: 'New Merchant Category High-Value Trigger',
      category: 'Amount Anomaly',
      severity: 'HIGH',
      time: '1h 15m ago',
      desc: 'Transaction ₹49,999.94 initiated at Blinkit for customer with ₹2,500 baseline (19.9x average).',
      status: 'Investigating'
    }
  ];

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Alerts & Security Notifications</h1>
            <p className="subtitle">Real-time alerts triggered by Databricks rules, velocity monitors & Model Serving diagnostics.</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(f => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(a => (
          <div key={a.id} className="card" style={{ padding: 18, borderLeft: `4px solid ${a.severity === 'CRITICAL' ? 'var(--color-red)' : a.severity === 'HIGH' ? 'var(--color-orange)' : 'var(--color-amber)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${a.severity.toLowerCase()}`} style={{ fontSize: 11 }}>{a.severity}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>{a.id}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>• {a.category}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.time}</span>
            </div>
            <h4 style={{ margin: '4px 0 6px 0', fontSize: 15, fontWeight: 700 }}>{a.title}</h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
