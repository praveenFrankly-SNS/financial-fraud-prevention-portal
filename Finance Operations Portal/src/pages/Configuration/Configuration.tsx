import { useState } from 'react';
import { Sliders, Shield, Save } from 'lucide-react';

export function Configuration() {
  const [threshold, setThreshold] = useState(0.75);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Fraud System Configuration</h1>
            <p className="subtitle">Tune Databricks Model Serving risk thresholds, MLflow champion aliases & rule weights.</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} /> {saved ? '✓ Saved' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Model Thresholds */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} /> Model Decision Thresholds
          </h3>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>High Risk BLOCK Threshold</span>
              <strong>{threshold.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Transactions with raw fraud probability ≥ {threshold.toFixed(2)} will be automatically BLOCKED.
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: 14, borderRadius: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Medium Risk CHALLENGE Threshold:</span>
              <strong>0.40</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Low Risk ALLOW Threshold:</span>
              <strong>&lt; 0.40</strong>
            </div>
          </div>
        </div>

        {/* Serving Endpoint Meta */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} /> Model Serving Endpoint Metadata
          </h3>
          {[
            ['Catalog Target', 'fraud_prevention_dev.gold.rtff_fraud_detection_model'],
            ['Endpoint Name', 'rtff-fraud-serving-dev'],
            ['Champion Model Alias', 'Champion (Version 1)'],
            ['SQL Warehouse ID', '9a32ea9be4341223 (Serverless Starter)'],
            ['PR-AUC Performance', '0.947'],
            ['Target Audit Table', 'fraud_prevention_dev.monitoring.realtime_decisions_audit']
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
              <strong style={{ textAlign: 'right' }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
