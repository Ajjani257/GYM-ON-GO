'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Moon, Sun, LogOut, Menu, X, Home, MapPin, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';

function NavLinksList({ session }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const isHome = pathname === '/';
  const isExplore = pathname.startsWith('/gyms') && !pathname.startsWith('/gyms/compare');
  const isCompare = pathname.startsWith('/compare') || pathname === '/gyms/compare';
  const isBookings = pathname === '/dashboard' && tab !== 'saved';
  const isWishlist = pathname === '/dashboard' && tab === 'saved';
  const isPartners = pathname.startsWith('/partners');
  const isPartnerConsole = pathname.startsWith('/partner');
  const isAdminConsole = pathname.startsWith('/admin');
  const isBlogs = pathname.startsWith('/blogs');
  const isPlans = pathname.startsWith('/plans');

  return (
    <div className="nav-links">
      <Link href="/" className={`nav-link ${isHome ? 'active' : ''}`}>Home</Link>
      <Link href="/gyms" className={`nav-link ${isExplore ? 'active' : ''}`}>Explore</Link>
      {session && (
        <>
          {session.user.role === 'admin' ? (
            <Link href="/admin" className={`nav-link ${isAdminConsole ? 'active' : ''}`}>Admin Console</Link>
          ) : session.user.role === 'partner' ? (
            <Link href="/partner" className={`nav-link ${isPartnerConsole ? 'active' : ''}`}>Partner Console</Link>
          ) : (
            <>
              <Link href="/dashboard?tab=upcoming" className={`nav-link ${isBookings ? 'active' : ''}`}>Bookings</Link>
              <Link href="/dashboard?tab=saved" className={`nav-link ${isWishlist ? 'active' : ''}`}>Wishlist</Link>
            </>
          )}
        </>
      )}
      <Link href="/plans" className={`nav-link ${isPlans ? 'active' : ''}`}>Plans</Link>
      <Link href="/blogs" className={`nav-link ${isBlogs ? 'active' : ''}`}>Blogs</Link>
      <Link href="/partners" className={`nav-link ${isPartners ? 'active' : ''}`}>Let's Collab</Link>
    </div>
  );
}

function MobileNavLinksList({ session, setMobileOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const isHome = pathname === '/';
  const isExplore = pathname.startsWith('/gyms') && !pathname.startsWith('/gyms/compare');
  const isBookings = pathname === '/dashboard' && tab !== 'saved';
  const isWishlist = pathname === '/dashboard' && tab === 'saved';
  const isPartners = pathname.startsWith('/partners');
  const isDashboard = pathname === '/dashboard' && !tab;
  const isPartnerConsole = pathname.startsWith('/partner');
  const isAdminConsole = pathname.startsWith('/admin');
  const isBlogs = pathname.startsWith('/blogs');
  const isPlans = pathname.startsWith('/plans');

  return (
    <>
      <Link href="/" className={`drawer-link ${isHome ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Home</Link>
      <Link href="/gyms" className={`drawer-link ${isExplore ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Find Gyms</Link>
      <Link href="/plans" className={`drawer-link ${isPlans ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Plans</Link>
      <Link href="/blogs" className={`drawer-link ${isBlogs ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Blogs</Link>
      <Link href="/partners" className={`drawer-link ${isPartners ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Let's Collab</Link>
      
      <div style={{ height: '1px', background: 'var(--line)', margin: '16px 0' }} />
      
      {session ? (
        <>
          {session.user.role === 'admin' ? (
            <Link href="/admin" className={`drawer-link ${isAdminConsole ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Admin Console</Link>
          ) : session.user.role === 'partner' ? (
            <Link href="/partner" className={`drawer-link ${isPartnerConsole ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Partner Console</Link>
          ) : (
            <>
              <Link href="/dashboard" className={`drawer-link ${isDashboard ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/dashboard?tab=upcoming" className={`drawer-link ${isBookings ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>My Bookings</Link>
              <Link href="/dashboard?tab=saved" className={`drawer-link ${isWishlist ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Gym Wishlist</Link>
            </>
          )}
          <button className="drawer-link" onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }} style={{ textAlign: 'left' }}>Sign out</button>
        </>
      ) : (
        <>
          <Link href="/auth" className={`drawer-link ${pathname === '/auth' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Sign in</Link>
          <Link href="/auth" className={`drawer-link ${pathname === '/auth' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Create account</Link>
        </>
      )}
    </>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -100, x: "-50%" }}
        animate={{ y: 0, x: "-50%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ borderBottom: scrolled ? '' : '1px solid transparent' }}
      >
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="menu-left-btn hamburger" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              aria-label="Toggle menu"
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
          <Suspense fallback={
              <div className="nav-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/gyms" className="nav-link">Explore</Link>
              <Link href="/partners" className="nav-link">Let's Collab</Link>
            </div>
          }>
            <NavLinksList session={session} />
          </Suspense>

          <div className="nav-actions">
            {session ? (
              <>
                <Link href={session.user.role === 'admin' ? "/admin" : (session.user.role === 'partner' ? "/partner" : "/dashboard")}><button className="btn-nav btn-signin" title="Wallet & Profile"><UserIcon size={18} /></button></Link>
                <button className="btn-nav btn-signin" onClick={() => signOut({ callbackUrl: '/' })} title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth"><button className="btn-nav btn-signin">Sign in</button></Link>
                <Link href="/auth"><button className="btn-nav btn-get-started">Start</button></Link>
              </>
            )}
          </div>
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
              
              <Suspense fallback={
                <>
                  <Link href="/" className="drawer-link" onClick={() => setMobileOpen(false)}>Home</Link>
                  <Link href="/gyms" className="drawer-link" onClick={() => setMobileOpen(false)}>Find Gyms</Link>
                  <Link href="/partners" className="drawer-link" onClick={() => setMobileOpen(false)}>Let's Collab</Link>
                </>
              }>
                <MobileNavLinksList session={session} setMobileOpen={setMobileOpen} />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (True One-Handed Use) */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className="bottom-nav-item">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/gyms" className="bottom-nav-item">
          <MapPin size={20} />
          <span>Gyms</span>
        </Link>
        {session ? (
          <Link href={session.user.role === 'admin' ? "/admin" : (session.user.role === 'partner' ? "/partner" : "/dashboard")} className="bottom-nav-item">
            <UserIcon size={20} />
            <span>Console</span>
          </Link>
        ) : (
          <Link href="/auth" className="bottom-nav-item">
            <UserIcon size={20} />
            <span>Sign In</span>
          </Link>
        )}
      </nav>
    </>
  );
}
