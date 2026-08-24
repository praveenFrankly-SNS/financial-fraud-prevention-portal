import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Cpu } from 'lucide-react';
import { fetchInvestigationData, submitHitlDecision, scoreFraudTransaction } from '../../services';
import { LoadingState } from '../../components/LoadingState';

const tabs = ['Case Overview', 'Evidence', 'Customer Profile', 'Transaction History', 'Notes & Comments', 'Audit Log'];

const ruleDetails: Record<string, { severity: string; desc: string }> = {
  'High Velocity': { severity: 'HIGH', desc: 'Too many transactions in a short time window.' },
  'Device Fingerprint Mismatch': { severity: 'MEDIUM', desc: 'New device used for this customer.' },
  'Amount Deviation': { severity: 'MEDIUM', desc: 'Transaction amount significantly higher than usual.' },
  'New Device': { severity: 'MEDIUM', desc: 'Transaction initiated from a brand new device.' },
  'Location Anomaly': { severity: 'MEDIUM', desc: 'Location differs significantly from typical behavior.' },
};

const topFeatures = [
  { feature: 'txn_velocity_1m', impact: 0.42, color: 'var(--color-red)' },
  { feature: 'is_new_device', impact: 0.28, color: 'var(--color-orange)' },
  { feature: 'amount_deviation', impact: 0.12, color: 'var(--color-amber)' },
  { feature: 'location_distance_km', impact: 0.08, color: 'var(--color-amber)' },
  { feature: 'device_risk_score', impact: 0.02, color: 'var(--color-green)' },
];

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return <span className={`badge ${map[s] ?? 'badge-blue'}`}>{s}</span>;
}

export function Investigation() {
  const { txId } = useParams<{ txId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Case Overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [decision, setDecision] = useState<'APPROVE' | 'BLOCK' | 'ESCALATE' | null>(null);
  const [notes, setNotes] = useState('High fraud score with multiple risk factors matched.');
  const [submitted, setSubmitted] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);

  // Model Serving scoring state
  const [scoring, setScoring] = useState(false);
  const [liveModelScore, setLiveModelScore] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchInvestigationData(txId || 'TX-5843');
        setData(res);
      } catch (err) {
        console.error('Error fetching investigation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [txId]);

  const handleTestInference = async () => {
    if (!tx) return;
    setScoring(true);
    try {
      const res = await scoreFraudTransaction({
        amount: tx.amount,
        payment_method: tx.channel?.toLowerCase() === 'online' ? 'online' : 'card present',
        customer_id: tx.customerId,
        merchant_id: tx.merchant,
        device_id: tx.deviceId
      });
      setLiveModelScore(res);
    } catch (err) {
      console.error('Inference call failed:', err);
    } finally {
      setScoring(false);
    }
  };

  const handleSubmit = async () => {
    if (!decision || !tx) return;
    try {
      const res = await submitHitlDecision(
        caseId,
        decision,
        notes,
        "analyst@financeops.com"
      );
      setAuditId(res.audit_id || `AUD-${tx.id}`);
      setSubmitted(true);
      
      // Update displayed transaction state
      const newDec = decision === 'APPROVE' ? 'ALLOW' : decision === 'BLOCK' ? 'BLOCK' : 'CHALLENGE';
      const newStatus = decision === 'APPROVE' ? 'Approved' : decision === 'BLOCK' ? 'Declined' : 'Pending';
      const newScore = decision === 'APPROVE' ? 0.05 : decision === 'BLOCK' ? 0.99 : tx.riskScore;
      const newLevel = decision === 'APPROVE' ? 'Low' : decision === 'BLOCK' ? 'High' : tx.riskLevel;

      setData((prev: any) => ({
        ...prev,
        transaction: {
          ...prev.transaction,
          decision: newDec,
          status: newStatus,
          riskScore: newScore,
          riskLevel: newLevel
        }
      }));
    } catch (err) {
      console.error('Error submitting decision:', err);
    }
  };

  if (loading && !data) {
    return <LoadingState message="Loading Case Investigation Details..." submessage="Fetching transaction context, customer profile & device risk drivers..." />;
  }

  const tx = data?.transaction || {};
  const caseId = `CASE-2026-${tx.id?.replace('TX-', '') || '5843'}`;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="card-link" onClick={() => navigate('/hitl-queue')}>HITL Review Queue</span>
        <span>›</span>
        <span className="card-link">Case Review</span>
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Case ID: {caseId}</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1>Case Review: {caseId}</h1>
            <span className={`badge badge-${tx.riskLevel?.toLowerCase() || 'high'}`} style={{ fontSize: 13, padding: '4px 10px' }}>
              ⚠ {tx.riskLevel} Risk
            </span>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/hitl-queue')}>
              <ArrowLeft size={14} /> Back to Queue
            </button>
            <button className="btn btn-secondary" onClick={handleTestInference} disabled={scoring}>
              <Cpu size={14} className={scoring ? 'animate-spin' : ''} /> {scoring ? 'Scoring Model...' : 'Re-Score Model'}
            </button>
          </div>
        </div>
        <p className="subtitle">Review transaction context, evidence, and risk model predictions.</p>
      </div>

      {/* Model Serving Live Scoring Toast */}
      {liveModelScore && (
        <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', color: '#1e40af', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            🤖 Model Score Update:
          </div>
          <div>Fraud Probability Score: <strong>{(liveModelScore.fraudProbability * 100).toFixed(1)}%</strong> ({liveModelScore.decision})</div>
        </div>
      )}

      {/* Case Summary Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            ['Case ID', caseId], ['Transaction ID', tx.id],
            ['Customer', tx.customerName], ['Amount', `₹${tx.amount?.toLocaleString()}`],
            ['Risk Score', null], ['Timestamp', tx.timestamp],
            ['Assigned To', 'Fraud Analyst'], ['SLA', null],
          ].map(([label, value]) => (
            <div key={label as string} style={{ minWidth: 100 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
              {label === 'Risk Score' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-red)' }}>{(tx.riskScore || 0).toFixed(2)}</span>
                  <span className="badge badge-high">{tx.riskLevel}</span>
                </div>
              ) : label === 'SLA' ? (
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-amber)' }}>2h 15m remaining</span>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Case Overview' && (
        <div>
          {/* 3+1 Grid */}
          <div className="investigation-layout" style={{ marginBottom: 20 }}>
            {/* Transaction Context */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                📋 Case Details
              </div>
              <div className="detail-grid">
                {[
                  ['Transaction ID', tx.id], ['Time', tx.timestamp],
                  ['Customer ID', tx.customerId], ['Customer Name', tx.customerName],
                  ['Merchant', tx.merchant], ['Category', tx.merchantCategory],
                  ['Amount', `₹${tx.amount?.toLocaleString()}`],
                  ['Channel', tx.channel], ['Country', tx.country],
                  ['IP Address', tx.ipAddress], ['Device ID', tx.deviceId],
                  ['Session ID', tx.sessionId],
                ].map(([l, v]) => (
                  <div className="detail-row" key={l as string}>
                    <span className="detail-label">{l}</span>
                    <span className="detail-value" style={{ fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                🛡 Risk Assessment
              </div>
              <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>Fraud Probability (rtff-fraud-serving-dev)</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span className="risk-gauge-value">{(tx.riskScore || 0).toFixed(2)}</span>
                <span className="badge badge-high" style={{ fontSize: 13 }}>{((tx.riskScore || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="risk-gauge-bar">
                <div className="risk-gauge-thumb" style={{ left: `${(tx.riskScore || 0) * 100}%` }} />
              </div>
              <div className="detail-grid" style={{ marginTop: 12 }}>
                {[
                  ['Risk Level', tx.riskLevel], ['Model Version', tx.modelVersion],
                  ['Model Threshold', (tx.modelThreshold || 0.75).toString()],
                  ['Velocity (1 min)', `${tx.velocity1m || 3} transactions`],
                  ['Velocity (10 min)', `${tx.velocity10m || 8} transactions`],
                ].map(([l, v]) => (
                  <div className="detail-row" key={l as string}>
                    <span className="detail-label">{l}</span>
                    <span className="detail-value" style={{ fontSize: 12 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Model Top Risk Drivers */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Model Risk Drivers
                </div>
                {topFeatures.map(f => (
                  <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: 140 }}>{f.feature}</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--color-border-light)', borderRadius: 3 }}>
                      <div style={{ height: 6, borderRadius: 3, background: f.color, width: `${f.impact * 200}%` }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 32, textAlign: 'right' }}>{f.impact.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Triggered Rules */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Triggered Rules ({(tx.rulesTriggered || []).length})
              </div>
              {(tx.rulesTriggered || []).map((r: string) => {
                const detail = ruleDetails[r] ?? { severity: 'MEDIUM', desc: 'Rule triggered.' };
                return (
                  <div key={r} style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r}</span>
                      <SeverityBadge s={detail.severity} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>{detail.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Decision Panel */}
            <div>
              <div className="decision-panel" style={{ marginBottom: 16 }}>
                <h4>Analyst Decision</h4>
                {[
                  { value: 'APPROVE' as const, label: 'Approve', sub: 'Allow transaction', cls: 'selected-approve' },
                  { value: 'ESCALATE' as const, label: 'Investigate Further', sub: 'Escalate for review', cls: 'selected-escalate' },
                  { value: 'BLOCK' as const, label: 'Block', sub: 'Block this transaction', cls: 'selected-block' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-option ${decision === opt.value ? opt.cls : ''}`}
                    onClick={() => setDecision(opt.value)}
                  >
                    <input type="radio" name="decision" checked={decision === opt.value} onChange={() => setDecision(opt.value)} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{opt.sub}</div>
                    </div>
                  </div>
                ))}

                <textarea
                  className="decision-textarea"
                  style={{ marginTop: 12 }}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  maxLength={200}
                />
                <button
                  className="btn btn-primary w-full"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 12, opacity: decision ? 1 : 0.5 }}
                  onClick={handleSubmit}
                  disabled={!decision}
                >
                  {submitted ? '✓ Decision Logged' : 'Submit Decision'}
                </button>
                {auditId && (
                  <div style={{ fontSize: 10, color: '#059669', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                    Audit Log ID: {auditId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
