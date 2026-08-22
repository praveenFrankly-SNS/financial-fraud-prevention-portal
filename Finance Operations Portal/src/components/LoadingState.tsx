import React from 'react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  showSkeleton?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading transaction data...',
  submessage = 'Connecting to real-time operations engine...',
  showSkeleton = true,
}) => {
  return (
    <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Central Spinner & Pulse */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 20 }}>
          {/* Outer glowing pulse */}
          <div style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))',
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }} />
          
          {/* Gradient spinner ring */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRightColor: '#7c3aed',
            animation: 'spin 0.9s linear infinite',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)',
          }} />
          
          {/* Inner core dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)',
          }} />
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary, #1e293b)', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
          {message}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted, #64748b)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
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
                borderRadius: 12,
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
          <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
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
