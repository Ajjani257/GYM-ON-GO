'use client';
import Link from 'next/link';
import { MapPin, CalendarCheck, QrCode, ArrowRight, ShieldCheck, Zap, LockOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
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
  const steps = [
    { icon: <MapPin size={24} />, num: '01', title: 'Start with your area', desc: 'Search by neighborhood and compare gyms by crowd level, price, and amenities.' },
    { icon: <CalendarCheck size={24} />, num: '02', title: 'Reserve a time that fits', desc: 'Choose an hourly slot for a quick session, a weekend lift, or a late-night workout.' },
    { icon: <QrCode size={24} />, num: '03', title: 'Walk in with your QR', desc: 'Your booking is ready at the desk, so you can skip the sales pitch and start training.' },
  ];

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1600&q=82&fit=crop&crop=center" alt="People training in a bright gym" />
        </div>
        <div className="hero-content">
          <motion.div 
            className="hero-copy"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge">
              <Zap /> Gym access, only when you need it
            </div>
            <h1 className="hero-title">Find a good gym for the hour you actually have.</h1>
            <p className="hero-sub">Book verified gyms nearby, check how busy they are, and pay for just the session you use.</p>
            <div className="hero-ctas">
              <Link href="/gyms"><button className="btn-primary">Browse gyms <ArrowRight size={18} /></button></Link>
              <Link href="/partners"><button className="btn-outline">For gym owners</button></Link>
            </div>
          </motion.div>

          <motion.div 
            className="booking-preview" aria-label="Sample gym booking"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <div className="preview-top">
              <span>Suggested slot</span>
              <strong>Today · 7:00 PM</strong>
            </div>
            <div className="preview-gym">
              <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=320&q=80&fit=crop&crop=center" alt="Strength training zone" />
              <div>
                <h2>Forge Fitness</h2>
                <p><MapPin /> Navrangpura · 12 min away</p>
              </div>
            </div>
            <div className="preview-chip-row">
              <span><ShieldCheck /> Moderate crowd</span>
              <span><LockOpen /> Free lockers</span>
            </div>
            <div className="preview-row">
              <span>Session price</span>
              <strong>₹180/hr</strong>
            </div>
            <div className="preview-row">
              <span>Check-in</span>
              <strong>QR ready</strong>
            </div>
            <Link href="/gyms"><button className="preview-action">See available slots</button></Link>
          </motion.div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}><div className="stat-num">₹80</div><div className="stat-label">starting sessions</div></motion.div>
            <motion.div variants={fadeInUp}><div className="stat-num">Live</div><div className="stat-label">crowd updates</div></motion.div>
            <motion.div variants={fadeInUp}><div className="stat-num">QR</div><div className="stat-label">check-in included</div></motion.div>
            <motion.div variants={fadeInUp}><div className="stat-num">Zero</div><div className="stat-label">lock-in required</div></motion.div>
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
            <h2 className="section-title">Built for normal, slightly messy days.</h2>
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

      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-box"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div>
              <h2>Keep your workout flexible.</h2>
              <p>Pick a nearby gym when your schedule opens up, then check in with your phone.</p>
            </div>
            <Link href="/auth"><button className="btn-primary">Create account</button></Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
