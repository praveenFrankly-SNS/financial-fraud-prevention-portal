import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, ArrowUpRight, RefreshCw, RotateCcw,
  CheckCircle, AlertTriangle, XCircle, ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';
import { runSimulation } from '../services/api';
import { MERCHANTS } from '../data/merchants';
import { PAYMENT_METHODS, CUSTOMER_PROFILES, formatINR } from '../data/accounts';
import type { SimulationRequest, SimulationResponse } from '../types';

const SCENARIOS = [
  { id: 'normal',           icon: '✅', label: 'Normal Purchase (Swiggy ₹2,000)',       description: 'Known device, normal location -> LOW RISK (ALLOW)' },
  { id: 'high_value',       icon: '💰', label: 'Legitimate High Value (Samsung ₹1,00,000)', description: 'Known device & merchant -> Contextual Evaluation' },
  { id: 'contextual_anomaly', icon: '⚠️', label: 'Contextual Anomaly (₹2,000 + Impossible Travel)', description: 'New device + Rapid velocity + Location anomaly -> HIGH RISK (CHALLENGE)' },
  { id: 'known_fraud',      icon: '🚫', label: 'Known Fraud Pattern',      description: 'Matches past fraud characteristics' },
];

const SCENARIO_DEFAULTS: Record<string, Partial<SimulationRequest>> = {
  normal:              { amount: 2000,    merchant: 'Swiggy', velocity_5m: 1,  velocity_10m: 2,  is_new_device: false, is_new_location: false, impossible_travel: false, multiple_rapid_txns: false },
  high_value:          { amount: 100000,  merchant: 'Samsung', velocity_5m: 1,  velocity_10m: 2,  is_new_device: false, is_new_location: false },
  contextual_anomaly:  { amount: 2000,    merchant: 'Swiggy', velocity_5m: 8,  velocity_10m: 15, is_new_device: true, is_new_location: true, impossible_travel: true, multiple_rapid_txns: true },
  known_fraud:         { amount: 99000,   merchant: 'Apple', is_new_device: true, is_new_location: true, past_fraud_history: true, high_risk_category: true },
};

const DEFAULT_FORM: SimulationRequest = {
  scenario:            'normal',
  amount:              2450,
  merchant:            'Amazon',
  payment_method:      'upi',
  customer_id:         'CUST-1001',
  location:            'Mumbai, India',
  device:              'Chrome on Windows',
  ip_address:          '203.0.113.45',
  velocity_5m:         1,
  velocity_10m:        2,
  is_new_device:       false,
  is_new_location:     false,
  is_new_merchant:     false,
  impossible_travel:   false,
  multiple_rapid_txns: false,
  high_risk_category:  false,
  new_payee:           false,
  past_fraud_history:  false,
};

const TOGGLE_FIELDS: { key: keyof SimulationRequest; label: string }[] = [
  { key: 'multiple_rapid_txns', label: 'Multiple rapid transactions' },
  { key: 'is_new_device',       label: 'Unusual device' },
  { key: 'high_risk_category',  label: 'High risk merchant category' },
  { key: 'is_new_location',     label: 'Unusual location' },
  { key: 'is_new_merchant',     label: 'New payee / merchant' },
  { key: 'past_fraud_history',  label: 'Past fraud history on account' },
  { key: 'impossible_travel',   label: 'Impossible travel speed' },
  { key: 'new_payee',           label: 'Unrecognised payee' },
];

const LOCATIONS = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India',
  'Dubai, UAE', 'Singapore', 'London, UK', 'New York, USA',
  'Lagos, Nigeria', 'Nairobi, Kenya',
];

const DEVICES = [
  'Chrome on Windows', 'Safari on iPhone', 'Chrome on Android',
  'Firefox on Windows', 'Safari on Mac', 'Unknown Device',
];

function riskColor(level: string) {
  if (level === 'High')   return 'high';
  if (level === 'Medium') return 'medium';
  return 'low';
}

function decisionClass(d: string) {
  if (d === 'ALLOW')     return 'allow';
  if (d === 'CHALLENGE') return 'challenge';
  return 'block';
}

export default function SimulationMode() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState<SimulationRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<SimulationResponse | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  function selectScenario(scenarioId: string) {
    const defaults = SCENARIO_DEFAULTS[scenarioId] ?? {};
    setForm(f => ({ ...DEFAULT_FORM, ...f, ...defaults, scenario: scenarioId }));
    setResult(null);
    setError(null);
  }

  function toggleBool(key: keyof SimulationRequest) {
    setForm(f => ({ ...f, [key]: !f[key] }));
  }

  function setField(key: keyof SimulationRequest, value: string | number | boolean) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleRun() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await runSimulation(form);
      setResult(res);
    } catch (e) {
      setError((e as Error).message || 'Simulation failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
  }

  const riskScore = result?.fraudProbability ?? 0;

  return (
    <Layout>
      {/* Header matching Bank Portal layout */}
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              background: '#ede9fe', color: '#7c3aed',
              padding: '2px 8px', borderRadius: 'var(--radius-full)',
              fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4
            }}>
              <FlaskConical size={12} /> Simulation Mode
            </span>
          </div>
          <h1 className="page-title">Fraud Simulation / Test Mode</h1>
          <p className="page-subtitle">Simulate transactions to see how our system detects anomalies and responds in real time.</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
        >
          Exit Simulation Mode <ArrowRight size={14} />
        </button>
      </div>

      {/* Info banner matching light theme */}
      <div style={{
        padding: '10px var(--space-4)',
        background: '#f5f3ff',
        border: '1px solid #ede9fe',
        borderRadius: 'var(--radius-lg)',
        fontSize: 12.5, color: '#6d28d9', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 'var(--space-5)',
      }}>
        ℹ️ This is a simulation environment. No real transactions are processed.
      </div>

      <div className="sim-grid">
        {/* ── Left Column: Controls ─────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Scenario Templates */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              Create Simulation Scenario
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              Scenario Template
            </div>
            <div className="sim-scenario-grid">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  className={`sim-scenario-btn${form.scenario === s.id ? ' active' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: 'var(--space-3)' }}
                  onClick={() => selectScenario(s.id)}
                >
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{s.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Parameters */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              Transaction Parameters
            </div>
            <div className="form-grid-2">

              {/* Amount */}
              <div className="form-field">
                <label className="form-label">
                  Transaction Amount <span className="required">*</span>
                </label>
                <div className="form-input-prefix">
                  <span className="form-input-prefix-symbol">₹</span>
                  <input
                    className="form-input"
                    type="number" min="1" step="0.01"
                    value={form.amount}
                    onChange={e => setField('amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Merchant */}
              <div className="form-field">
                <label className="form-label">Merchant / Payee</label>
                <select
                  className="form-select"
                  value={form.merchant}
                  onChange={e => setField('merchant', e.target.value)}
                >
                  {MERCHANTS.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Customer Profile */}
              <div className="form-field">
                <label className="form-label">Customer Profile</label>
                <select
                  className="form-select"
                  value={form.customer_id}
                  onChange={e => setField('customer_id', e.target.value)}
                >
                  {CUSTOMER_PROFILES.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — {p.risk} Risk
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="form-field">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={form.payment_method}
                  onChange={e => setField('payment_method', e.target.value)}
                >
                  {PAYMENT_METHODS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="form-field">
                <label className="form-label">Location</label>
                <select
                  className="form-select"
                  value={form.location}
                  onChange={e => setField('location', e.target.value)}
                >
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Device */}
              <div className="form-field">
                <label className="form-label">Device Type</label>
                <select
                  className="form-select"
                  value={form.device}
                  onChange={e => setField('device', e.target.value)}
                >
                  {DEVICES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* IP */}
              <div className="form-field">
                <label className="form-label">IP Address</label>
                <input
                  className="form-input"
                  value={form.ip_address}
                  onChange={e => setField('ip_address', e.target.value)}
                  placeholder="203.0.113.45"
                />
              </div>

              {/* Velocity */}
              <div className="form-field">
                <label className="form-label">Transactions in 5 min</label>
                <input
                  className="form-input"
                  type="number" min="1" max="20"
                  value={form.velocity_5m}
                  onChange={e => setField('velocity_5m', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Behavioural Signals */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              Additional Behaviour Signals
            </div>
            <div className="sim-toggle-grid">
              {TOGGLE_FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className="sim-toggle-item"
                  onClick={() => toggleBool(key)}
                >
                  <span className="sim-toggle-label">{label}</span>
                  <div className={`sim-toggle${form[key] ? ' on' : ''}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              className="btn btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1, background: '#7c3aed' }}
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'white', borderTopColor: 'transparent', margin: 0 }} />
                  Running Simulation...
                </>
              ) : (
                <>▶ Run Simulation</>
              )}
            </button>
          </div>
        </div>

        {/* ── Right Column: Results Panel ─────────────────── */}
        <div>
          <div className="sim-result-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-4))' }}>
            <div className="sim-result-header">
              <span className="card-title">Simulation Result</span>
              {result && (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Processed in {result.processingTimeMs}ms
                </span>
              )}
            </div>

            {!result && !error && !loading && (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <div className="empty-state-icon">🧪</div>
                <div className="empty-state-title">No simulation results yet</div>
                <div className="empty-state-sub">Configure a scenario on the left and click "Run Simulation".</div>
              </div>
            )}

            {loading && (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <div className="spinner-ring" style={{ margin: '0 auto var(--space-3)' }} />
                <div className="empty-state-title">Calling fraud detection engine...</div>
              </div>
            )}

            {error && (
              <div style={{ background: 'var(--color-red-light)', border: '1px solid var(--color-red-muted)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', color: 'var(--color-red)', fontSize: 12.5 }}>
                ⚠️ {error}
              </div>
            )}

            {result && (
              <div className="animate-fade-in">
                {/* Status & Score */}
                <div className="flex items-center justify-between mb-4" style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Risk Score</div>
                    <div className={`sim-score-number ${riskColor(result.riskLevel)}`} style={{ fontSize: 32 }}>
                      {(riskScore * 100).toFixed(0)}
                      <span style={{ fontSize: 14, opacity: 0.6 }}>/100</span>
                    </div>
                  </div>
                  <span className={`sim-result-status-badge ${decisionClass(result.status)}`}>
                    {result.status === 'ALLOW'     && <CheckCircle size={14} />}
                    {result.status === 'CHALLENGE' && <AlertTriangle size={14} />}
                    {result.status === 'BLOCK'     && <XCircle size={14} />}
                    {result.status}
                  </span>
                </div>

                {/* Risk Breakdown */}
                <div className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                    Risk Breakdown
                  </div>
                  {Object.entries(result.riskBreakdown).map(([name, score]) => {
                    const level = score >= 0.75 ? 'high' : score >= 0.45 ? 'medium' : 'low';
                    return (
                      <div className="risk-bar-container" key={name}>
                        <div className="risk-bar-header">
                          <span>{name}</span>
                          <span style={{ fontWeight: 600 }}>{(score * 100).toFixed(0)}</span>
                        </div>
                        <div className="risk-bar-track">
                          <div className={`risk-bar-fill ${level}`} style={{ width: `${score * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Triggered Signals */}
                {result.triggeredSignals.length > 0 && (
                  <div className="mb-4" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                      Triggered Signals ({result.rulesTriggered})
                    </div>
                    <div>
                      {result.triggeredSignals.map((s, i) => (
                        <span className="signal-pill" key={i}>⚡ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="mb-4">
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                    Transaction Summary
                  </div>
                  {[
                    ['Amount',   formatINR(result.amount)],
                    ['Merchant', result.merchant],
                    ['Location', result.location],
                    ['Device',   result.device],
                  ].map(([k, v]) => (
                    <div key={k} className="detail-row">
                      <span className="detail-key">{k}</span>
                      <span className="detail-value">{v}</span>
                    </div>
                  ))}
                </div>

                {/* External link */}
                <div className="flex flex-col gap-2">
                  <a
                    href={result.financePortalUrl ?? 'http://localhost:5173'}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-secondary btn-full btn-sm"
                  >
                    View in Finance Operations Portal <ArrowUpRight size={14} />
                  </a>
                  <button
                    className="btn btn-ghost btn-full btn-sm"
                    onClick={handleRun}
                  >
                    <RefreshCw size={13} /> Re-run Simulation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
