import React from 'react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  showSkeleton?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Finance Operations Dashboard...',
  submessage = 'Connecting to real-time Databricks SQL engine...',
  showSkeleton = true,
}) => {
  return (
    <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Central Modern Security Scan Animation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Outer glowing pulsing aura */}
          <div style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(124, 58, 237, 0.05) 70%, transparent 100%)',
            animation: 'ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
          }} />

          {/* Counter-rotating dashed outer ring */}
          <div style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px dashed rgba(37, 99, 235, 0.3)',
            animation: 'spin 12s linear infinite reverse',
          }} />

          {/* Main gradient spinner ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3.5px solid transparent',
            borderTopColor: '#2563eb',
            borderRightColor: '#7c3aed',
            borderBottomColor: '#06b6d4',
            animation: 'spin 1.1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
            boxShadow: '0 0 24px rgba(37, 99, 235, 0.3)',
          }} />

          {/* Central Shield Icon with subtle pulse */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
            zIndex: 2,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#38bdf8' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          {message}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-muted, #64748b)', fontWeight: 500 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            boxShadow: '0 0 10px #10b981',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span>{submessage}</span>
        </div>
      </div>

      {/* Skeleton Cards Layout */}
      {showSkeleton && (
        <div>
          {/* KPI Skeleton Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: 14,
                padding: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <div style={{ width: '60%', height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 12, opacity: 0.7 }} />
                <div style={{ width: '80%', height: 24, background: '#cbd5e1', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: '40%', height: 10, background: '#f1f5f9', borderRadius: 4 }} />
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ width: '30%', height: 18, background: '#cbd5e1', borderRadius: 6 }} />
              <div style={{ width: '15%', height: 18, background: '#e2e8f0', borderRadius: 6 }} />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: i === 4 ? 'none' : '1px solid #f8fafc' }}>
                <div style={{ width: 80, height: 14, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ width: 120, height: 14, background: '#f1f5f9', borderRadius: 4 }} />
                <div style={{ width: 60, height: 14, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ flex: 1, height: 14, background: '#f8fafc', borderRadius: 4 }} />
                <div style={{ width: 70, height: 22, background: '#dbeafe', borderRadius: 11 }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
