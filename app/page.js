import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=1400&q=80&fit=crop&crop=top" alt="Fitness" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">INDIA&apos;S FIRST PAY-PER-USE FITNESS PLATFORM</div>
          <h1 className="hero-title">YOUR FITNESS<br/><span>JOURNEY</span><br/>STARTS HERE</h1>
          <p className="hero-sub">Book gym sessions by the hour. No memberships. No lock-ins. Just fitness, on your terms.</p>
          <div className="hero-ctas">
            <Link href="/gyms"><button className="btn-primary">FIND GYMS NEAR YOU &nbsp;›</button></Link>
            <Link href="/partners"><button className="btn-outline">PARTNER WITH US</button></Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div><div className="stat-num">500+</div><div className="stat-label">Partner Gyms</div></div>
            <div><div className="stat-num">50K+</div><div className="stat-label">Active Users</div></div>
            <div><div className="stat-num">10+</div><div className="stat-label">Cities</div></div>
            <div><div className="stat-num">4.8</div><div className="stat-label">App Rating</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="container">
          <div className="section-badge">HOW IT WORKS</div>
          <h2 className="section-title">Fitness on Your Terms</h2>
          <div className="steps-grid">
            {[
              { icon: 'fa-magnifying-glass-location', num: '01', title: 'Discover Gyms', desc: 'Find gyms near you with real-time crowd levels, amenities, and ratings.' },
              { icon: 'fa-calendar-check', num: '02', title: 'Book Instantly', desc: 'Pick hourly slots that fit your schedule. No membership locks.' },
              { icon: 'fa-indian-rupee-sign', num: '03', title: 'Pay Per Use', desc: 'UPI, cards, or wallet — pay only for what you use.' },
              { icon: 'fa-qrcode', num: '04', title: 'QR Check-in', desc: 'Walk in, scan your QR code, and start your session.' },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-icon"><i className={`fa-solid ${s.icon}`}></i></div>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>READY TO START?</h2>
            <p>Join thousands of fitness enthusiasts who&apos;ve ditched expensive memberships for flexible, pay-per-use workouts.</p>
            <Link href="/auth"><button className="btn-primary">GET STARTED FREE &nbsp;›</button></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="11" width="6" height="6" rx="1.5" fill="#ef4444"/>
              <rect x="20" y="11" width="6" height="6" rx="1.5" fill="#ef4444"/>
              <rect x="7" y="13" width="14" height="2" rx="1" fill="#ef4444"/>
              <rect x="4" y="8" width="2" height="12" rx="1" fill="#ef4444"/>
              <rect x="22" y="8" width="2" height="12" rx="1" fill="#ef4444"/>
            </svg>
            <span>GYM-ON-GO</span>
          </div>
          <div className="footer-copy">© 2024 GYM-ON-GO. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
