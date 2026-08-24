import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [developerMode, setDeveloperMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Account Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Manage security preferences, developer options & notification controls.</p>

        <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>Real-time Fraud Alerts</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>Receive instant push notifications for suspicious transaction challenges.</span>
            </div>
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} style={{ width: 18, height: 18 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
            <div>
              <strong style={{ fontSize: 14, display: 'block', color: '#0f172a' }}>Simulation / Developer Mode</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>Enable simulation playground for testing Databricks Model Serving anomalies.</span>
            </div>
            <input type="checkbox" checked={developerMode} onChange={e => setDeveloperMode(e.target.checked)} style={{ width: 18, height: 18 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
