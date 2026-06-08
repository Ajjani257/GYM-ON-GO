'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, CalendarRange, CheckSquare } from 'lucide-react';

export default function PartnerLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status]);

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading...</div>;
  }

  if (!session) return null;

  if (session.user.role !== 'partner') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div className="detail-card" style={{ maxWidth: '480px', padding: '40px' }}>
          <h2 style={{ color: 'var(--red)', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>This section is restricted to registered Gym Partners only.</p>
          <Link href="/"><button className="btn-primary">Return Home</button></Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/partner', icon: <LayoutDashboard size={18} /> },
    { name: 'Pricing & Slots', path: '/partner/slots', icon: <CalendarRange size={18} /> },
    { name: 'Member Check-In', path: '/partner/checkin', icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: '120px 24px 80px 24px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '24px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', color: 'var(--red)', fontWeight: 800, textTransform: 'uppercase' }}>Partner Console</span>
          <h1 className="dash-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>Gym Management</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: 0 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link href={item.path} key={item.path}>
                <button className={`tab ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
      
      {children}
    </div>
  );
}
