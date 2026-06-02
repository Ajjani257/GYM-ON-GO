'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ borderBottom: scrolled ? '' : '1px solid transparent' }}
      >
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="menu-left-btn" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              aria-label="Toggle menu"
              style={{ background: 'transparent', color: 'var(--text)', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="logo" onClick={() => setMobileOpen(false)}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
                <rect x="20" y="11" width="6" height="6" rx="1.5" fill="currentColor"/>
                <rect x="7" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                <rect x="4" y="8" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="22" y="8" width="2" height="12" rx="1" fill="currentColor"/>
              </svg>
              <span>GYM-ON-GO</span>
            </Link>
          </div>

          {/* Desktop nav */}
          {!session ? (
            <>
              <div className="nav-links">
                <Link href="/gyms" className="nav-link">Gyms</Link>
                <Link href="/partners" className="nav-link">Partners</Link>
              </div>
              <div className="nav-actions">
                <button className="theme-toggle" onClick={toggleTheme} title={themeLabel} aria-label={themeLabel}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link href="/auth"><button className="btn-nav btn-signin">Sign in</button></Link>
                <Link href="/auth"><button className="btn-nav btn-get-started">Start</button></Link>
              </div>
            </>
          ) : (
            <>
              <div className="nav-links">
                <Link href="/gyms" className="nav-link">Gyms</Link>
              </div>
              <div className="nav-actions">
                <button className="theme-toggle" onClick={toggleTheme} title={themeLabel} aria-label={themeLabel}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link href="/dashboard"><button className="btn-nav btn-signin">Dashboard</button></Link>
                <button className="btn-nav btn-signin" onClick={() => signOut({ callbackUrl: '/' })} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.nav>

      {/* Side Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 150 }}
            />
            <motion.div
              className="drawer-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ 
                position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', 
                background: 'var(--surface)', borderRight: '1px solid var(--line)', 
                zIndex: 160, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem' }}>Menu</span>
                <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', color: 'var(--text)' }}>
                  <X size={24} />
                </button>
              </div>
              
              <Link href="/" className="drawer-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/gyms" className="drawer-link" onClick={() => setMobileOpen(false)}>Find Gyms</Link>
              <Link href="/partners" className="drawer-link" onClick={() => setMobileOpen(false)}>Partner with Us</Link>
              
              <div style={{ height: '1px', background: 'var(--line)', margin: '16px 0' }} />
              
              {session ? (
                <>
                  <Link href="/dashboard" className="drawer-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <button className="drawer-link" onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }} style={{ textAlign: 'left' }}>Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="drawer-link" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link href="/auth" className="drawer-link" onClick={() => setMobileOpen(false)}>Create account</Link>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
