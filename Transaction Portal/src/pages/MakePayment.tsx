import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ShieldCheck, ArrowRight, X } from 'lucide-react';
import Layout from '../components/Layout';
import { MERCHANTS, CATEGORIES } from '../data/merchants';
import { PRIMARY_ACCOUNT, PAYMENT_METHODS, formatINR, amountInWords } from '../data/accounts';
import type { TransactionRequest } from '../types';

const STEPS = ['Payment Details', 'Review', 'Processing'];

interface FormState {
  merchantId:    string;
  amount:        string;
  paymentMethod: string;
  category:      string;
  note:          string;
}

export default function MakePayment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    merchantId:    '',
    amount:        '',
    paymentMethod: 'upi',
    category:      '',
    note:          '',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const merchant = MERCHANTS.find(m => m.id === form.merchantId);
  const amountNum = parseFloat(form.amount) || 0;

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.merchantId) e.merchantId = 'Please select a merchant or payee.';
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) e.amount = 'Enter a valid amount.';
    if (amountNum > PRIMARY_ACCOUNT.balance) e.amount = 'Amount exceeds available balance.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (step === 0 && !validate()) return;
    if (step === 1) {
      // Submit to processing
      const req: TransactionRequest = {
        amount:         amountNum,
        merchant:       merchant?.name ?? form.merchantId,
        payment_method: form.paymentMethod,
        category:       form.category || merchant?.category || 'general',
        note:           form.note || undefined,
        customer_id:    'CUST-1001',
      };
      navigate('/processing', { state: { request: req, merchant } });
      return;
    }
    setStep(s => s + 1);
  }

  const pm = PAYMENT_METHODS.find(p => p.id === form.paymentMethod);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Make a Payment</h1>
        <p className="page-subtitle">Enter the payment details below to securely send your money.</p>
      </div>

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: 'var(--space-6)' }}>
        {STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'pending';
          return (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle ${state}`}>
                  {state === 'done' ? '✓' : i + 1}
                </div>
                <span className={`step-label ${state}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${i < step ? 'done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="payment-grid">
        {/* ── Left: Form ─────────────────────────────────── */}
        <div>
          {step === 0 && (
            <div className="card animate-fade-in">
              <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>
                Payment Information
              </div>

              <div className="form-grid-2" style={{ marginBottom: 'var(--space-4)' }}>
                {/* Payment type */}
                <div className="form-field">
                  <label className="form-label">Payment Type</label>
                  <select className="form-select">
                    <option>Pay a Merchant</option>
                    <option>Send Money</option>
                    <option>Pay a Bill</option>
                  </select>
                </div>

                {/* From account */}
                <div className="form-field">
                  <label className="form-label">From Account</label>
                  <select className="form-select">
                    <option>
                      {PRIMARY_ACCOUNT.type} {PRIMARY_ACCOUNT.number}
                    </option>
                  </select>
                  <span className="form-helper">
                    Available: {formatINR(PRIMARY_ACCOUNT.balance)}
                  </span>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: 'var(--space-4)' }}>
                {/* Merchant */}
                <div className="form-field">
                  <label className="form-label">
                    Merchant / Payee <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-select"
                      value={form.merchantId}
                      onChange={e => {
                        const m = MERCHANTS.find(x => x.id === e.target.value);
                        setForm(f => ({
                          ...f,
                          merchantId: e.target.value,
                          category: m?.category ?? f.category,
                        }));
                        setErrors(er => ({ ...er, merchantId: undefined }));
                      }}
                    >
                      <option value="">Select merchant...</option>
                      {CATEGORIES.map(cat => (
                        <optgroup key={cat} label={cat}>
                          {MERCHANTS.filter(m => m.category === cat).map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  {errors.merchantId && (
                    <span style={{ color: 'var(--color-red)', fontSize: 11.5 }}>{errors.merchantId}</span>
                  )}
                </div>

                {/* Amount */}
                <div className="form-field">
                  <label className="form-label">
                    Amount <span className="required">*</span>
                  </label>
                  <div className="form-input-prefix">
                    <span className="form-input-prefix-symbol">₹</span>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => {
                        setForm(f => ({ ...f, amount: e.target.value }));
                        setErrors(er => ({ ...er, amount: undefined }));
                      }}
                    />
                  </div>
                  {amountNum > 0 && (
                    <span className="form-helper">{amountInWords(amountNum)}</span>
                  )}
                  {errors.amount && (
                    <span style={{ color: 'var(--color-red)', fontSize: 11.5 }}>{errors.amount}</span>
                  )}
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: 'var(--space-4)' }}>
                {/* Payment method */}
                <div className="form-field">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={form.paymentMethod}
                    onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  >
                    {PAYMENT_METHODS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {p.detail}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="form-field">
                  <label className="form-label">Category (Optional)</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Auto-detect</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div className="form-field" style={{ marginBottom: 'var(--space-5)' }}>
                <label className="form-label">Payment Note (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add a note for this payment..."
                  maxLength={150}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
                <span className="form-helper">{form.note.length} / 150</span>
              </div>

              {/* Security context */}
              <div style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)', fontWeight: 600, fontSize: 13 }}>
                  <ShieldCheck size={15} color="var(--color-blue)" />
                  Security & Context
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 400 }}>
                    — These details help us keep your account secure.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                  {[
                    ['📍', 'Location',     'Mumbai, India'],
                    ['💻', 'Device',       'Chrome on Windows'],
                    ['🌐', 'IP Address',   '203.0.113.45'],
                    ['🕐', 'Time',         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
                    ['📅', 'Account Age',  '2 years, 4 months'],
                    ['📊', 'Activity',     'Normal'],
                  ].map(([icon, label, value]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span>{icon}</span>
                      <div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{label}</div>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{value}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: 'var(--color-green)' }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => window.history.back()}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleContinue}>
                  Review Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="card animate-fade-in">
              <div className="card-title" style={{ marginBottom: 'var(--space-5)' }}>
                Review Your Payment
              </div>

              <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                  {merchant && (
                    <div style={{ fontSize: 42, marginBottom: 8 }}>{merchant.logo}</div>
                  )}
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-blue)', letterSpacing: '-0.03em' }}>
                    {formatINR(amountNum)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    to {merchant?.name ?? '—'}
                  </div>
                </div>

                {[
                  ['From',           `${PRIMARY_ACCOUNT.type} ${PRIMARY_ACCOUNT.number}`],
                  ['Payment Method', pm?.label ?? '—'],
                  ['Category',       form.category || merchant?.category || '—'],
                  ['Note',           form.note || '—'],
                ].map(([k, v]) => (
                  <div className="detail-row" key={k}>
                    <span className="detail-key">{k}</span>
                    <span className="detail-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="txn-summary-secure" style={{ marginBottom: 'var(--space-5)' }}>
                <ShieldCheck size={15} />
                Your payment is protected by advanced fraud detection and encryption.
              </div>

              <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => setStep(0)}>
                  ← Edit Details
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleContinue}>
                  Confirm & Pay <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary panel ────────────────────── */}
        <div>
          <div className="txn-summary-panel">
            <div className="txn-summary-title">Payment Summary</div>

            {merchant ? (
              <div className="txn-summary-merchant">
                <div
                  className="txn-summary-merchant-icon"
                  style={{ background: merchant.color + '15' }}
                >
                  {merchant.logo}
                </div>
                <div>
                  <div className="txn-summary-merchant-name">{merchant.name}</div>
                  <div className="txn-summary-merchant-cat">{merchant.category}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12.5, marginBottom: 'var(--space-4)' }}>
                Select a merchant above
              </div>
            )}

            <div className="txn-summary-amount">
              {amountNum > 0 ? formatINR(amountNum) : '₹ 0.00'}
            </div>

            {[
              ['From Account', `${PRIMARY_ACCOUNT.number}`],
              ['Payment Method', pm?.label ?? '—'],
              ['Category', form.category || merchant?.category || '—'],
            ].map(([k, v]) => (
              <div className="txn-summary-row" key={k}>
                <span className="txn-summary-key">{k}</span>
                <span className="txn-summary-val">{v}</span>
              </div>
            ))}

            <div className="txn-summary-secure">
              <ShieldCheck size={15} />
              Payment protected by our advanced fraud detection system.
            </div>

            <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                Need Help?
              </div>
              {['Payment limits and fees', 'Secure payment tips', 'Chat with support'].map(item => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  {item} <ArrowRight size={13} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
