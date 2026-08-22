import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { submitTransaction } from '../services/api';
import { formatINR } from '../data/accounts';
import { saveTransaction } from '../data/transactions';
import type { TransactionRequest, TransactionResponse, Merchant } from '../types';

// The 4 neutral processing steps shown to the customer
const STEPS = [
  { label: 'Payment Received',   icon: '📥' },
  { label: 'Security Check',     icon: '🔒' },
  { label: 'Transaction Review', icon: '🔍' },
  { label: 'Completing',         icon: '⚡' },
];

// Step timing: each step appears after this many ms
const STEP_DELAYS = [400, 900, 1600, 2500];

type StepState = 'pending' | 'active' | 'done';

interface LocationState {
  request:  TransactionRequest;
  merchant: Merchant | undefined;
}

export default function Processing() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const state     = location.state as LocationState | null;

  const [stepStates, setStepStates] = useState<StepState[]>(['active', 'pending', 'pending', 'pending']);
  const [result, setResult]         = useState<TransactionResponse | null>(null);
  const [error,  setError]          = useState<string | null>(null);
  const apiCalled = useRef(false);

  // If landed without state (direct URL), redirect to payment
  useEffect(() => {
    if (!state?.request) navigate('/pay');
  }, [state, navigate]);

  // Advance steps and call API
  useEffect(() => {
    if (!state?.request || apiCalled.current) return;
    apiCalled.current = true;

    // Advance step indicators
    STEP_DELAYS.forEach((delay, i) => {
      setTimeout(() => {
        setStepStates(prev => {
          const next = [...prev];
          if (i > 0) next[i - 1] = 'done';
          next[i] = 'active';
          return next;
        });
      }, delay);
    });

    // Call backend after last step starts
    const callApi = async () => {
      try {
        const res = await submitTransaction(state.request);
        // Mark all steps done after response
        setTimeout(() => {
          setStepStates(['done', 'done', 'done', 'done']);
          setResult(res);

          // Save transaction to local history state
          const newTxn = {
            id: res.transactionId,
            merchant: res.merchant,
            merchantCategory: merchant?.category || state.request.category || 'General',
            merchantLogo: merchant?.logo || '🛍️',
            merchantColor: merchant?.color || '#2563eb',
            amount: res.amount,
            status: res.status === 'ALLOW' ? ('Completed' as const) : res.status === 'BLOCK' ? ('Declined' as const) : ('Pending' as const),
            paymentMethod: state.request.payment_method?.toUpperCase() || 'UPI',
            date: res.timestamp || new Date().toISOString(),
            note: state.request.note,
            location: 'Mumbai, India',
            device: 'Chrome on Windows',
          };
          saveTransaction(newTxn);
        }, STEP_DELAYS[3] + 600);
      } catch (e) {
        setTimeout(() => {
          setStepStates(['done', 'done', 'done', 'done']);
          setError((e as Error).message);
        }, STEP_DELAYS[3] + 600);
      }
    };

    callApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decision = result?.status;
  const merchant = state?.merchant;

  return (
    <div style={{
      marginLeft: 240,
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Minimal header for processing screen */}
      <div style={{
        height: 60, background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--space-6)',
        fontSize: 12.5, color: 'var(--color-text-muted)',
      }}>
        <span>Make a Payment</span>
        <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>/</span>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Processing</span>
        <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11 }}>
          {result?.transactionId ?? '—'}
        </span>
      </div>

      <div className="processing-layout">
        <div className="processing-card">

          {/* ── Processing state ──────────────────────── */}
          {!result && !error && (
            <>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div className="processing-title" style={{ marginBottom: 6 }}>Processing Your Payment</div>
                <div className="processing-subtitle">Please wait while we securely process your payment.</div>
              </div>

              {/* 4-step progress row */}
              <div className="progress-steps">
                {STEPS.map((step, i) => {
                  const s = stepStates[i];
                  return (
                    <div key={step.label} className={`progress-step ${s}`}>
                      <div className={`progress-step-icon ${s}`}>
                        {s === 'done' ? (
                          <CheckCircle size={18} />
                        ) : s === 'active' ? (
                          <span style={{ fontSize: 16, animation: 'pulse 1.2s ease infinite' }}>
                            {step.icon}
                          </span>
                        ) : (
                          <span style={{ fontSize: 16, opacity: 0.3 }}>{step.icon}</span>
                        )}
                      </div>
                      <div className={`progress-step-label ${s}`}>{step.label}</div>
                      {s === 'active' && (
                        <div className="progress-step-time" style={{ color: 'var(--color-blue)' }}>
                          In Progress...
                        </div>
                      )}
                      {s === 'done' && (
                        <div className="progress-step-time">
                          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Transaction summary during wait */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}>
                {[
                  ['Amount',  state?.request?.amount ? formatINR(state.request.amount) : '—'],
                  ['Merchant', merchant?.name ?? state?.request?.merchant ?? '—'],
                  ['Method',  state?.request?.payment_method?.toUpperCase() ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Neutral loading message with High-Tech Security Radar Scan */}
              <div style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6) var(--space-4)',
                textAlign: 'center',
              }}>
                <style>{`
                  @keyframes shieldSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes shieldSpinReverse {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                  }
                  @keyframes shieldPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.85; }
                  }
                  @keyframes glowPing {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    70%, 100% { transform: scale(1.5); opacity: 0; }
                  }
                `}</style>
                <div style={{ position: 'relative', width: 68, height: 68, margin: '0 auto var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                    animation: 'glowPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    border: '2px dashed rgba(37, 99, 235, 0.4)',
                    animation: 'shieldSpinReverse 10s linear infinite',
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3.5px solid transparent',
                    borderTopColor: '#2563eb',
                    borderRightColor: '#7c3aed',
                    borderBottomColor: '#06b6d4',
                    animation: 'shieldSpin 0.9s linear infinite',
                    boxShadow: '0 0 16px rgba(37, 99, 235, 0.35)',
                  }} />
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.4)',
                    zIndex: 2,
                    animation: 'shieldPulse 2s ease-in-out infinite',
                  }}>
                    <ShieldCheck size={20} color="#38bdf8" />
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-primary)' }}>Evaluating Transaction Security...</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  We are verifying real-time fraud signals via Databricks Model Serving.
                </div>
              </div>
            </>
          )}

          {/* ── Error fallback ────────────────────────── */}
          {error && (
            <div className="animate-scale-in" style={{ textAlign: 'center' }}>
              <div className="outcome-icon block">
                <XCircle size={36} />
              </div>
              <div className="outcome-title block">Unable to Process</div>
              <div className="outcome-message">
                We couldn't reach our payment service right now. Please try again in a few moments.
              </div>
              <button className="btn btn-secondary btn-full" onClick={() => navigate('/pay')}>
                Try Again
              </button>
            </div>
          )}

          {/* ── ALLOW outcome ─────────────────────────── */}
          {result && decision === 'ALLOW' && (
            <div className="animate-scale-in">
              <div className="outcome-icon allow">
                <CheckCircle size={36} />
              </div>
              <div className="outcome-title allow">Payment Successful</div>
              <div className="outcome-message">{result.customerMessage}</div>

              <div className="outcome-details">
                {[
                  ['Amount',         formatINR(result.amount)],
                  ['Merchant',       result.merchant],
                  ['Transaction ID', result.transactionId],
                  ['Date & Time',    new Date(result.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
                ].map(([k, v]) => (
                  <div className="outcome-detail-row" key={k}>
                    <span className="outcome-detail-label">{k}</span>
                    <span className="outcome-detail-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="outcome-actions">
                <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/transactions')}>
                  View Transaction Details <ArrowRight size={16} />
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* ── CHALLENGE outcome (Customer Step-Up Verification) ── */}
          {result && decision === 'CHALLENGE' && (
            <div className="animate-scale-in">
              <div className="outcome-icon challenge">
                <AlertTriangle size={36} />
              </div>
              <div className="outcome-title challenge">Security Verification Required</div>
              <div className="outcome-message" style={{ marginBottom: 'var(--space-4)' }}>
                For your security, we sent a 6-digit verification code to your registered mobile number (+91 ******4821).
              </div>

              <div style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, textAlign: 'center' }}>
                  Enter 6-Digit One-Time Password (OTP)
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                  {[4, 8, 2, 9, 1, 0].map((num, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      defaultValue={num}
                      style={{
                        width: 38,
                        height: 44,
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        border: '1px solid var(--color-blue)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-blue)', textAlign: 'center', fontWeight: 500 }}>
                  Resend OTP in 28s
                </div>
              </div>

              <div className="outcome-actions">
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => {
                    saveTransaction({
                      id: result.transactionId,
                      merchant: result.merchant,
                      merchantCategory: 'Verified',
                      merchantLogo: merchant?.logo || '🛍️',
                      merchantColor: merchant?.color || '#2563eb',
                      amount: result.amount,
                      status: 'Completed',
                      paymentMethod: state?.request?.payment_method?.toUpperCase() || 'UPI',
                      date: result.timestamp || new Date().toISOString(),
                      location: 'Mumbai, India',
                      device: 'Chrome on Windows',
                    });
                    navigate('/transactions');
                  }}
                >
                  Submit & Authorize Payment <ArrowRight size={16} />
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>
                  Cancel Payment
                </button>
              </div>
            </div>
          )}

          {/* ── BLOCK outcome ─────────────────────────── */}
          {result && decision === 'BLOCK' && (
            <div className="animate-scale-in">
              <div className="outcome-icon block">
                <XCircle size={36} />
              </div>
              <div className="outcome-title block">Payment Could Not Be Completed</div>
              <div className="outcome-message">{result.customerMessage}</div>

              <div className="outcome-details">
                {[
                  ['Amount',         formatINR(result.amount)],
                  ['Merchant',       result.merchant],
                  ['Transaction ID', result.transactionId],
                  ['Date & Time',    new Date(result.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
                ].map(([k, v]) => (
                  <div className="outcome-detail-row" key={k}>
                    <span className="outcome-detail-label">{k}</span>
                    <span className="outcome-detail-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="outcome-actions">
                <button className="btn btn-danger btn-full btn-lg" onClick={() => navigate('/pay')}>
                  Try Another Payment Method
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>
                  <Home size={15} /> Back to Home
                </button>
              </div>
            </div>
          )}

          {/* ── UNAVAILABLE / SERVICE ERROR outcome ─────────────────── */}
          {result && ((decision as string) === 'UNAVAILABLE' || (decision as string) === 'ERROR' || !decision || !['ALLOW', 'CHALLENGE', 'BLOCK'].includes(decision)) && (
            <div className="animate-scale-in" style={{ textAlign: 'center' }}>
              <div className="outcome-icon block" style={{ background: '#fef3c7', color: '#d97706', margin: '0 auto var(--space-4)' }}>
                <AlertTriangle size={36} />
              </div>
              <div className="outcome-title" style={{ color: '#d97706', marginBottom: 8, fontSize: 20, fontWeight: 700 }}>
                Security Service Temporarily Unavailable
              </div>
              <div className="outcome-message" style={{ marginBottom: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 13.5 }}>
                {result.customerMessage || "Security evaluation service is currently unreachable. The transaction could not be evaluated at this time. Please try again."}
              </div>

              <div className="outcome-details" style={{ marginBottom: 'var(--space-5)' }}>
                {[
                  ['Amount',         formatINR(result.amount)],
                  ['Merchant',       result.merchant],
                  ['Transaction ID', result.transactionId],
                  ['Status',         'MODEL_SERVING_UNAVAILABLE'],
                ].map(([k, v]) => (
                  <div className="outcome-detail-row" key={k}>
                    <span className="outcome-detail-label">{k}</span>
                    <span className="outcome-detail-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="outcome-actions">
                <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/pay')}>
                  Try Again <ArrowRight size={16} />
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => navigate('/')}>
                  <Home size={15} /> Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom trust bar */}
        {!result && !error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            marginTop: 'var(--space-5)', fontSize: 12, color: 'var(--color-text-muted)',
          }}>
            🔒 Your security is our priority. We never share your information.
          </div>
        )}
      </div>
    </div>
  );
}
