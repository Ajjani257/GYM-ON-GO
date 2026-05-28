'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth');
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/bookings?userId=${session.user.id}`)
        .then(r => r.json()).then(setBookings);
    }
  }, [session]);

  if (status === 'loading') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>;
  if (!session) return null;

  const upcoming = bookings.filter(b => b.status === 'upcoming');
  const past = bookings.filter(b => b.status === 'completed');
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="dashboard container">
      <h1 className="dash-title">WELCOME, {session.user.name?.split(' ')[0]?.toUpperCase() || 'USER'}</h1>
      <p className="dash-sub">Track your workouts and manage your bookings</p>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-icon red"><i className="fa-solid fa-arrow-trend-up"></i></div>
          <div className="dash-stat-val">{bookings.length}</div>
          <div className="dash-stat-lbl">TOTAL WORKOUTS</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon orange"><i className="fa-solid fa-fire"></i></div>
          <div className="dash-stat-val">0</div>
          <div className="dash-stat-lbl">DAY STREAK</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon blue"><i className="fa-regular fa-calendar-days"></i></div>
          <div className="dash-stat-val">{bookings.filter(b => { const d = new Date(b.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length}</div>
          <div className="dash-stat-lbl">THIS MONTH</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon gold"><i className="fa-solid fa-bookmark"></i></div>
          <div className="dash-stat-val">{upcoming.length}</div>
          <div className="dash-stat-lbl">UPCOMING</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>UPCOMING ({upcoming.length})</button>
        <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>PAST ({past.length})</button>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state">
          <i className="fa-regular fa-calendar-xmark"></i>
          <h3>NO {tab.toUpperCase()} BOOKINGS</h3>
          <p>Ready to start your fitness journey?</p>
          <button className="btn-primary" onClick={() => router.push('/gyms')}>FIND GYMS</button>
        </div>
      ) : (
        <div>
          {displayed.map(b => (
            <div className="booking-item" key={b._id}>
              <div className="booking-item-info">
                <h4>{b.gymName}</h4>
                <p>{b.gymAddress} • {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {month:'short',day:'numeric'})} • {b.timeSlot}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <span className={`status-badge status-${b.status}`}>{b.status.toUpperCase()}</span>
                <div className="booking-item-price">₹{b.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
