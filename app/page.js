'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, CalendarCheck, QrCode, ArrowRight, Zap, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    { 
      icon: <MapPin size={24} />, 
      num: '01', 
      title: 'Locate Your Gym', 
      desc: 'Explore premium local workout spaces. Compare by price, equipment lists, and member reviews.' 
    },
    { 
      icon: <CalendarCheck size={24} />, 
      num: '02', 
      title: 'Reserve Your Hour', 
      desc: 'Pick any available hour slot that fits your schedule. Pay directly from your dynamic wallet.' 
    },
    { 
      icon: <QrCode size={24} />, 
      num: '03', 
      title: 'Scan & Sweat', 
      desc: 'Show your digital QR code at the desk for instant entry. Walk in, lift, and get back to your day.' 
    },
  ];

  const faqs = [
    {
      q: "How does hourly billing work? Do I need a subscription?",
      a: "Absolutely no subscription, membership, or joining fees are required. You only pay for the specific hour slots you book. Your virtual wallet balance is debited when booking, and any unused slots can be cancelled for an instant refund."
    },
    {
      q: "Can I cancel my slot if my plans change?",
      a: "Yes! We understand that schedules can be dynamic and messy. You can cancel any upcoming gym booking directly from your user dashboard up to the start time of the slot for an instant, full refund to your wallet."
    },
    {
      q: "How do I check in when I arrive at the gym?",
      a: "Once your booking is confirmed, a secure QR code will appear on your dashboard. Simply show this QR code at the gym's front desk. They will scan it, verify your slot, and you're good to train immediately."
    },
    {
      q: "What equipment and amenities will I have access to?",
      a: "You get full access to the gym's standard workout floor, including cardio decks, weight areas, and locker/shower facilities. Every gym detail page lists verified equipment (e.g. squat racks, dumbbells) so you know what is available before you book."
    }
  ];

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop" alt="Premium gym heavy barbell weight plates under deep gym lighting" />
          <div className="hero-bg-overlay"></div>
        </div>
        <div className="hero-content" style={{ gridTemplateColumns: '1fr', textAlign: 'center', maxWidth: '900px', padding: '120px 24px' }}>
          <motion.div 
            className="hero-copy"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ margin: '0 auto', maxWidth: '100%' }}
          >
            <div className="hero-badge">
              <Zap /> Instant Access. Zero Contracts.
            </div>
            <h1 className="hero-title">
              TRAIN ON YOUR <span style={{ color: 'var(--red)' }}>TERMS.</span>
            </h1>
            <p className="hero-sub">
              Zero memberships. Billed by the hour. Clean premium gyms nearby, unlocked with a single QR code.
            </p>
            <div className="hero-ctas" style={{ justifyContent: 'center' }}>
              <Link href="/gyms">
                <button className="btn-primary" style={{ padding: '0 40px' }}>
                  Unlock Nearby Gyms <ArrowRight size={20} />
                </button>
              </Link>
            </div>

            {/* ADVERTISEMENT / STATS CHIPS IN HERO */}
            <motion.div 
              style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '64px' }}
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red)' }}>₹80</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'left', lineHeight: 1.2 }}>Starting<br/>Sessions</span>
              </motion.div>
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)' }}>No</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'left', lineHeight: 1.2 }}>Admission<br/>Fees</span>
              </motion.div>
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>QR</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'left', lineHeight: 1.2 }}>Instant<br/>Check-in</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-kicker">How it works</div>
            <h2 className="section-title">Three steps to your next session.</h2>
          </motion.div>
          
          <motion.div 
            className="steps-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((s, i) => (
              <motion.div className="step-card" key={i} variants={fadeInUp}>
                <div className="step-icon">{s.icon}</div>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATEFUL FAQ SECTION */}
      <section className="faq-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="faq-container"
          >
            <div className="faq-header">
              <div className="section-kicker"><HelpCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Got Questions?</div>
              <h2 className="section-title" style={{ margin: '0 auto 40px auto', textAlign: 'center' }}>Frequently Asked Questions</h2>
            </div>
            
            <div className="faq-grid">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button 
                      className="faq-question" 
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={20} className="faq-icon" />
                    </button>
                    <div className="faq-answer-wrapper">
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '40px 0 100px 0' }}>
        <div className="container">
          <motion.div 
            className="cta-box"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{ 
              background: 'linear-gradient(135deg, var(--red) 0%, var(--amber) 100%)', 
              color: '#fff', border: 'none' 
            }}
          >
            <div>
              <h2 style={{ color: '#fff' }}>Keep your workout flexible.</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)' }}>Pick a nearby gym when your schedule opens up, then check in with your phone.</p>
            </div>
            <Link href="/auth"><button className="btn-primary" style={{ background: '#fff', color: 'var(--red)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>Create free account <ArrowRight size={18} /></button></Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
