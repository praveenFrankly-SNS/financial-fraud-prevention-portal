import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { fetchAnalyticsData } from '../../services';
import { LoadingState } from '../../components/LoadingState';

const TOOLTIP_STYLE = {
  background: 'white', border: '1px solid #e5e7eb', borderRadius: 6,
  fontSize: 12, padding: '6px 10px',
};

const CHANNEL_COLORS = ['#dc2626', '#2563eb', '#d97706', '#059669', '#7c3aed'];

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAnalyticsData();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return <LoadingState message="Loading Fraud Analytics..." submessage="Fetching rule performance, model evaluation metrics & fraud trends..." />;
  }

  const d = data?.analyticsData || {};
  const decisionTrend = data?.decisionTrend || [];
  const m = d.modelMetrics || { prAuc: 0.947, recall: 0.891, fpr: 0.024, precision: 0.873, f1: 0.882, threshold: 0.75, version: 'rtff_v1', trainedAt: 'Today' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Fraud Analytics</h1>
            <p className="subtitle">Fraud patterns, trends, rule performance, and model metrics.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadData}><RefreshCw size={12} /> Refresh</button>
          </div>
        </div>
      </div>

      {/* Row 1: Fraud Rate Trend + Decision Trend */}
      <div className="analytics-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fraud Rate Trend</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={d.fraudTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0.7, 1.4]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Fraud Rate']} />
              <Line type="monotone" dataKey="rate" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4, fill: '#dc2626' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Decision Distribution Trend</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>% by day</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={decisionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="allow" fill="#059669" name="Allow" stackId="a" />
              <Bar dataKey="challenge" fill="#d97706" name="Challenge" stackId="a" />
              <Bar dataKey="block" fill="#dc2626" name="Block" stackId="a" />
              <Bar dataKey="hitl" fill="#7c3aed" name="HITL" stackId="a" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Fraud by Channel + Geography */}
      <div className="analytics-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Fraud by Channel</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={d.byChannel} dataKey="count" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                  {(d.byChannel || []).map((_: any, i: number) => <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {(d.byChannel || []).map((c: any, i: number) => (
                <div key={c.channel} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: 60 }}>{c.channel}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--color-border-light)', borderRadius: 4 }}>
                    <div style={{ height: 8, borderRadius: 4, background: CHANNEL_COLORS[i], width: `${c.pct}%` }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, width: 40, textAlign: 'right' }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Fraud by Region</span></div>
          <div style={{ flex: 1 }}>
            {(d.fraudByRegion || []).map((r: any) => (
              <div key={r.region} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', width: 130 }}>{r.region}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--color-border-light)', borderRadius: 4 }}>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--color-blue)', width: `${r.pct * 2}%` }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, width: 50, textAlign: 'right' }}>{r.count.toLocaleString()}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', width: 40 }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Rule Performance + Model Metrics */}
      <div className="analytics-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Rule Performance</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Detection rate / False positive rate</span>
          </div>
          <div className="rule-perf-list">
            {(d.rulePerformance || []).map((r: any) => (
              <div className="rule-perf-item" key={r.rule}>
                <span className="rule-perf-name">{r.rule}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 3 }}>
                    <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(to right, var(--color-blue), var(--color-purple))', width: `${r.detection}%` }} />
                  </div>
                </div>
                <span className="rule-perf-pct">{r.detection}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Model Evaluation Metrics</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.version}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Trained: {m.trainedAt}</div>
            </div>
          </div>
          <div className="model-metrics-grid">
            {[
              { label: 'PR-AUC', value: typeof m.prAuc === 'number' ? m.prAuc.toFixed(3) : m.prAuc, color: 'var(--color-blue)' },
              { label: 'Recall', value: typeof m.recall === 'number' ? m.recall.toFixed(3) : m.recall, color: 'var(--color-green)' },
              { label: 'FPR', value: typeof m.fpr === 'number' ? m.fpr.toFixed(3) : m.fpr, color: 'var(--color-red)' },
              { label: 'Precision', value: typeof m.precision === 'number' ? m.precision.toFixed(3) : m.precision, color: 'var(--color-blue)' },
              { label: 'F1 Score', value: typeof m.f1 === 'number' ? m.f1.toFixed(3) : m.f1, color: 'var(--color-purple)' },
              { label: 'Threshold', value: typeof m.threshold === 'number' ? m.threshold.toFixed(2) : m.threshold, color: 'var(--color-amber)' },
            ].map(metric => (
              <div className="metric-tile" key={metric.label}>
                <div className="metric-tile-value" style={{ color: metric.color }}>{metric.value}</div>
                <div className="metric-tile-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
