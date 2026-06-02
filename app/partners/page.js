'use client';
import { useState } from 'react';
import { Users, TrendingUp, Wallet, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';

const iconMap = {
  users: Users,
  'trending-up': TrendingUp,
  wallet: Wallet,
  star: Star,
};

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymName, ownerName, email, phone, city }),
      });
      if (res.ok) {
        setSubmitted(true);
        addToast('Application submitted successfully!', 'success');
      }
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
    }
    setSubmitting(false);
  }

  const benefits = [
    { icon: 'trending-up', title: 'Fill Empty Slots', desc: 'Monetize your off-peak hours by allowing users to book unused capacity dynamically.' },
    { icon: 'users', title: 'Guaranteed Footfall', desc: 'Get discovered by serious fitness enthusiasts looking for premium gym experiences in your exact area.' },
    { icon: 'wallet', title: 'Zero Onboarding Fees', desc: 'No hidden charges or setup costs. You only pay a small commission when a user books a slot.' },
    { icon: 'star', title: 'Weekly Payouts', desc: 'Enjoy hassle-free weekly settlements directly to your bank account with complete transparency.' },
  ];

  return (
    <>
      <section className="partners-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1600&q=80&fit=crop"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
          />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="section-badge">For gym owners</div>
          <h1 className="hero-title">Grow your gym with Gym-on-Go</h1>
          <p className="hero-sub" style={{ margin: '16px auto', maxWidth: 500 }}>
            List your gym and reach thousands of active fitness seekers in your city.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="partner-showcase">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Why Partner With Us?</h2>
              <div className="benefits-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                {benefits.map((b, i) => {
                  const Icon = iconMap[b.icon];
                  return (
                    <motion.div
                      className="benefit-card"
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      style={{ padding: '20px' }}
                    >
                      <div className="benefit-icon" style={{ marginBottom: '12px' }}><Icon size={24} /></div>
                      <h4 style={{ fontSize: '1.1rem' }}>{b.title}</h4>
                      <p style={{ fontSize: '0.9rem' }}>{b.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div className="phone-frame">
                <video src="/demo.mp4" autoPlay loop muted playsInline className="phone-screen" style={{ objectFit: 'cover' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="partner-form-section">
        <h2>Register Your Gym</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>
          Fill in details and our team will reach out within 24 hours.
        </p>
        {!submitted ? (
          <form className="partner-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Gym Name</label>
                <input
                  placeholder="Elite Fitness Club"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  placeholder="Rajesh Sharma"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="gym@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  placeholder="+91 98765 43210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>City</label>
              <select required value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select city</option>
                <option>Mumbai</option>
                <option>Bengaluru</option>
                <option>Delhi</option>
                <option>Ahmedabad</option>
                <option>Chennai</option>
                <option>Hyderabad</option>
                <option>Pune</option>
              </select>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        ) : (
          <div className="partner-success">
            <CheckCircle size={48} color="#22c55e" />
            <h3 style={{ marginTop: 16 }}>Application Received!</h3>
            <p style={{ color: 'var(--muted)' }}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        )}
      </section>
    </>
  );
}
