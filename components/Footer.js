'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="20" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="7" y="13" width="14" height="2" rx="1" fill="currentColor"/>
            <rect x="4" y="8" width="2" height="12" rx="1" fill="currentColor"/>
            <rect x="22" y="8" width="2" height="12" rx="1" fill="currentColor"/>
          </svg>
          <span>GYM-ON-GO</span>
        </div>
        <div className="footer-copy">&copy; {new Date().getFullYear()} GYM-ON-GO. All rights reserved.</div>
      </div>
    </footer>
  );
}
