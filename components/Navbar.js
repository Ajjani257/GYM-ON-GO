'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="11" width="6" height="6" rx="1.5" fill="#ef4444"/>
            <rect x="20" y="11" width="6" height="6" rx="1.5" fill="#ef4444"/>
            <rect x="7" y="13" width="14" height="2" rx="1" fill="#ef4444"/>
            <rect x="4" y="8" width="2" height="12" rx="1" fill="#ef4444"/>
            <rect x="22" y="8" width="2" height="12" rx="1" fill="#ef4444"/>
          </svg>
          <span>GYM-ON-GO</span>
        </Link>

        {!session ? (
          <>
            <div className="nav-links">
              <Link href="/gyms" className="nav-link">FIND GYMS</Link>
              <Link href="/partners" className="nav-link">FOR PARTNERS</Link>
            </div>
            <div className="nav-actions">
              <Link href="/auth"><button className="btn-nav btn-signin">SIGN IN</button></Link>
              <Link href="/auth"><button className="btn-nav btn-get-started">GET STARTED</button></Link>
            </div>
          </>
        ) : (
          <>
            <div className="nav-links">
              <Link href="/gyms" className="nav-link">FIND GYMS</Link>
            </div>
            <div className="nav-actions">
              <Link href="/dashboard"><button className="btn-nav btn-signin">DASHBOARD</button></Link>
              <button className="btn-nav btn-signin" onClick={() => signOut({ callbackUrl: '/' })} title="Logout">
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
