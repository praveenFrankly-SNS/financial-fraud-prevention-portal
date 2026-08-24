import React from 'react';
import Sidebar from '../components/Sidebar';

export default function HelpSupport() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Help & Customer Support</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Get assistance with security, transaction verifications & account safety.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>🛡 Payment Security FAQs</h3>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Learn how real-time fraud monitoring protects your UPI and card transactions 24/7.</p>
          </div>

          <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>📞 24/7 Security Hotline</h3>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Need urgent help with a flagged transaction? Call 1800-100-FRAUD (37283).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
