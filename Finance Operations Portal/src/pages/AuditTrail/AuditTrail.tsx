import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Download } from 'lucide-react';
import { fetchTransactionsData } from '../../services';
import { LoadingState } from '../../components/LoadingState';

export function AuditTrail() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const res = await fetchTransactionsData('', 25, 0);
        setData(res.transactions || []);
      } catch (err) {
        console.error('Failed to load audit trail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  if (loading && data.length === 0) {
    return <LoadingState message="Querying Databricks Decisions Audit Table..." submessage="Fetching realtime_decisions_audit entries from Unity Catalog..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Real-Time Decisions Audit Trail</h1>
            <p className="subtitle">Immutable audit record from `fraud_prevention_dev.monitoring.realtime_decisions_audit`.</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Audit Log ID</th>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Model Risk Score</th>
              <th>Decision</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t, idx) => (
              <tr key={t.id + idx}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.auditId || `AUD-${t.id}`}</td>
                <td style={{ fontWeight: 600 }}>{t.id}</td>
                <td>{t.customerName || t.customerId}</td>
                <td style={{ fontWeight: 600 }}>₹{t.amount?.toLocaleString()}</td>
                <td>
                  <span style={{ fontWeight: 700, color: t.riskScore >= 0.75 ? 'var(--color-red)' : t.riskScore >= 0.40 ? 'var(--color-amber)' : 'var(--color-green)' }}>
                    {t.riskScore?.toFixed(2)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${t.decision === 'BLOCK' ? 'high' : t.decision === 'CHALLENGE' ? 'medium' : 'low'}`}>
                    {t.decision}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
