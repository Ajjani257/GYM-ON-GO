'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Baby, Check, X, ChevronRight, Mail, Phone, Users, Briefcase, Star, Shield, Zap, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/Toast';

const PLAN_FEATURES = {
  corporate: {
    icon: Building2,
    badge: 'Corporate Wellness',
    title: 'Corporate Wellness Plan',
    subtitle: 'Empower your team\'s health, one hour at a time.',
    color: 'var(--blue)',
    gradient: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.03))',
    border: 'rgba(0,240,255,0.2)',
    perks: [
      { icon: Users, text: 'Bulk seat allocation across 5–500 employees' },
      { icon: BarChart3, text: 'HR dashboard with usage analytics' },
      { icon: Briefcase, text: 'Invoice / GST billing for corporates' },
      { icon: Zap, text: 'Priority access to premium gym slots' },
      { icon: Shield, text: 'Dedicated account manager' },
      { icon: Star, text: 'Employee wellness leaderboard' },
    ],
    pricing: 'Custom pricing from ₹499/employee/month',
    idealFor: 'Startups, MNCs, IT parks, co-working spaces',
    cta: 'Get Corporate Quote',
  },
  parent: {
    icon: Baby,
    badge: 'Parent & Family',
    title: 'Parent & Family Plan',
    subtitle: 'Fitness that fits around school runs and nap times.',
    color: 'var(--amber)',
    gradient: 'linear-gradient(135deg, rgba(226,255,43,0.12), rgba(226,255,43,0.02))',
    border: 'rgba(226,255,43,0.2)',
    perks: [
      { icon: Clock, text: 'Off-peak morning slots (9 AM – 3 PM) at discounted rates' },
      { icon: Users, text: 'Family bundle: up to 2 adults + children' },
      { icon: Shield, text: 'Kid-friendly gym filter & safety ratings' },
      { icon: Zap, text: '2× loyalty points on all bookings' },
      { icon: Check, text: 'Flexible cancellation (even same day)' },
      { icon: Star, text: 'Monthly family wellness report' },
    ],
    pricing: 'From ₹799/month for a family of 2',
    idealFor: 'Working parents, stay-at-home parents, young families',
    cta: 'Get Family Plan',
  },
};

const COMPARE_ROWS = [
  { label: 'Booking type', corporate: 'Bulk / per employee', parent: 'Per session or bundle', general: 'Per session' },
  { label: 'Billing', corporate: 'Monthly invoice (GST)', parent: 'Monthly auto-debit', general: 'Wallet top-up' },
  { label: 'Loyalty points', corporate: '1.5× per booking', parent: '2× per booking', general: '1× per booking' },
  { label: 'Cancellation', corporate: '12 hrs notice', parent: 'Same day allowed', general: 'Before slot time' },
  { label: 'Dedicated support', corporate: true, parent: false, general: false },
  { label: 'Usage analytics', corporate: true, parent: false, general: false },
  { label: 'Family bundle', corporate: false, parent: true, general: false },
  { label: 'Off-peak discount', corporate: false, parent: true, general: false },
];

export default function PlansPage() {
  const { addToast } = useToast();
  const [activeModal, setActiveModal] = useState(null); // 'corporate' | 'parent' | null
  const [form, setForm] = useState({ name: '', email: '', phone: '', orgSize: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/plans/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, planType: activeModal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      addToast('🎉 Enquiry received! Our team will reach out within 24 hours.', 'success');
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => { setActiveModal(null); setSubmitted(false); setForm({ name: '', email: '', phone: '', orgSize: '', message: '' }); };

  return (
    <>
      {/* Hero */}
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', paddingTop: '100px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(0,240,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(226,255,43,0.06) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-badge" style={{ marginBottom: 20 }}>Customised Plans</div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              Fitness built around<br /><span style={{ color: 'var(--red)' }}>your life</span>, not the other way.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.15rem', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Whether you're managing a team of 200 or juggling school runs — we have a plan that works for <em>your</em> schedule and budget.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginBottom: 80 }}>
          {['corporate', 'parent'].map((type, idx) => {
            const plan = PLAN_FEATURES[type];
            const Icon = plan.icon;
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                style={{ background: plan.gradient, border: `1px solid ${plan.border}`, borderRadius: 28, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}
              >
                {/* Glow blob */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: plan.color, opacity: 0.06, filter: 'blur(40px)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `rgba(${type === 'corporate' ? '0,240,255' : '226,255,43'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${plan.border}` }}>
                    <Icon size={24} color={plan.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: plan.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.badge}</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{plan.title}</h2>
                  </div>
                </div>

                <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>{plan.subtitle}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                  {plan.perks.map(({ icon: PIcon, text }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `rgba(${type === 'corporate' ? '0,240,255' : '226,255,43'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PIcon size={13} color={plan.color} />
                      </div>
                      <span style={{ fontSize: '0.92rem', color: 'var(--soft)' }}>{text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>PRICING</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: plan.color }}>{plan.pricing}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>Ideal for: {plan.idealFor}</div>
                </div>

                <button
                  onClick={() => setActiveModal(type)}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: plan.color, color: '#000', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${plan.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {plan.cta} <ChevronRight size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-badge" style={{ marginBottom: 14 }}>Compare Plans</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>What's included in each plan</h2>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--surface-alt)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--muted)', fontWeight: 700, fontSize: '0.85rem', width: '30%' }}>Feature</th>
                  {[
                    { label: 'Corporate', color: 'var(--blue)' },
                    { label: 'Parent & Family', color: 'var(--amber)' },
                    { label: 'General User', color: 'var(--muted)' },
                  ].map(h => (
                    <th key={h.label} style={{ padding: '20px 24px', textAlign: 'center', color: h.color, fontWeight: 800, fontSize: '0.9rem' }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, fontSize: '0.9rem' }}>{row.label}</td>
                    {['corporate', 'parent', 'general'].map(key => (
                      <td key={key} style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.88rem' }}>
                        {typeof row[key] === 'boolean' ? (
                          row[key]
                            ? <Check size={18} color="var(--green)" strokeWidth={2.5} style={{ margin: 'auto' }} />
                            : <X size={16} color="var(--muted)" style={{ margin: 'auto', opacity: 0.4 }} />
                        ) : (
                          <span style={{ color: 'var(--soft)' }}>{row[key]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: 80, padding: '60px 40px', background: 'linear-gradient(135deg, rgba(255,62,0,0.1), rgba(226,255,43,0.06))', borderRadius: 28, border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 14 }}>Not sure which plan fits?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: '1.05rem' }}>Talk to us — we'll build something that works for your specific situation.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveModal('corporate')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}>Corporate Enquiry</button>
            <button onClick={() => setActiveModal('parent')} className="btn-outline" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}>Family Enquiry</button>
          </div>
        </motion.div>
      </div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, padding: '40px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(48,209,88,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Check size={36} color="var(--green)" />
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>Enquiry Sent!</h2>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
                    Our team will review your request and get back to you within <strong>24 hours</strong> with a customised quote.
                  </p>
                  <button className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12 }} onClick={closeModal}>Close</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ fontSize: '1.4rem' }}>{activeModal === 'corporate' ? '🏢' : '👨‍👩‍👧'}</div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{PLAN_FEATURES[activeModal].title}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Fill in your details and we'll get back to you</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Full Name *</label>
                      <div className="input-wrap">
                        <Users size={15} />
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" required />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Work Email *</label>
                      <div className="input-wrap">
                        <Mail size={15} />
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" required />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                      <div className="input-wrap">
                        <Phone size={15} />
                        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
                        {activeModal === 'corporate' ? 'Company / Team Size' : 'Family Size'}
                      </label>
                      <div className="input-wrap">
                        <Briefcase size={15} />
                        <input
                          value={form.orgSize}
                          onChange={e => setForm(p => ({ ...p, orgSize: e.target.value }))}
                          placeholder={activeModal === 'corporate' ? 'e.g. 50 employees' : 'e.g. 2 adults, 1 child'}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ marginBottom: 6, display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Message (optional)</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Tell us more about your requirements..."
                        rows={3}
                        className="auth-input"
                        style={{ resize: 'vertical', minHeight: 80, padding: '12px 16px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1, padding: '13px', borderRadius: 12, fontSize: '0.95rem' }} disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Enquiry'}
                      </button>
                      <button type="button" className="btn-outline" style={{ padding: '13px 20px', borderRadius: 12 }} onClick={closeModal}>Cancel</button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
