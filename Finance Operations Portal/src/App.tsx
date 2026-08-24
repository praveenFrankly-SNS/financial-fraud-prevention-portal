import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Transactions } from './pages/Transactions/Transactions';
import { RuleViolations } from './pages/RuleViolations/RuleViolations';
import { HITLQueue } from './pages/HITL/HITLQueue';
import { Investigation } from './pages/Investigation/Investigation';
import { Analytics } from './pages/Analytics/Analytics';
import { SystemHealth } from './pages/SystemHealth/SystemHealth';
import { Alerts } from './pages/Alerts/Alerts';
import { AuditTrail } from './pages/AuditTrail/AuditTrail';
import { Configuration } from './pages/Configuration/Configuration';
import './index.css';

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

          {/* Connected routes */}
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/config" element={<Configuration />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
