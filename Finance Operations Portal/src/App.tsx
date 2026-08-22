import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Transactions } from './pages/Transactions/Transactions';
import { RuleViolations } from './pages/RuleViolations/RuleViolations';
import { HITLQueue } from './pages/HITL/HITLQueue';
import { Investigation } from './pages/Investigation/Investigation';
import { Analytics } from './pages/Analytics/Analytics';
import './index.css';

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14 }}>This page is available in a future release.</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/rule-violations" element={<RuleViolations />} />
          <Route path="/hitl-queue" element={<HITLQueue />} />
          <Route path="/investigation/:txId" element={<Investigation />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Stub routes */}
          <Route path="/system-health" element={<Placeholder title="System Health" />} />
          <Route path="/alerts" element={<Placeholder title="Alerts & Notifications" />} />
          <Route path="/audit" element={<Placeholder title="Audit Trail" />} />
          <Route path="/config" element={<Placeholder title="Configuration" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
