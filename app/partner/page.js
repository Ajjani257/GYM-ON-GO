'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, Users, CalendarCheck, Star, IndianRupee, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

export default function PartnerOverview() {
  const { data: session } = useSession();
  const [gym, setGym] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const gymRes = await fetch('/api/partner/gym', { cache: 'no-store' });
        const gymData = await gymRes.json();
        setGym(gymData);

        const bookingsRes = await fetch('/api/bookings', { cache: 'no-store' });
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);

        const txRes = await fetch('/api/user/transactions', { cache: 'no-store' });
        const txData = await txRes.json();
        setTransactions(txData);
      } catch (err) {
        console.error('Failed to load partner data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (session) loadData();
  }, [session]);

  if (loading) return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading gym metrics...</div>;
  if (!gym) return <div style={{ color: 'var(--red)', textAlign: 'center', padding: '40px' }}>Failed to retrieve associated Gym Profile.</div>;

  const completed = bookings.filter(b => b.status === 'completed');
  const upcoming = bookings.filter(b => b.status === 'upcoming');
  const totalPayout = transactions.filter(t => t.type === 'credit' && t.description.includes('check-in')).reduce((sum, t) => sum + t.amount, 0);

  // Generate Occupancy metrics per slot
  const slotOccupancy = {};
  gym.slots.forEach(s => {
    slotOccupancy[s.time] = 0;
  });
  completed.forEach(b => {
    if (slotOccupancy[b.timeSlot] !== undefined) {
      slotOccupancy[b.timeSlot]++;
    }
  });
  const maxOccupancy = Math.max(...Object.values(slotOccupancy), 1);

  // Generate 7-day revenue timeline
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailyRevenue = last7Days.map(dateStr => {
    const dayBookings = completed.filter(b => b.date === dateStr);
    const revenue = dayBookings.reduce((sum, b) => sum + Math.round(b.price * 0.85), 0);
    return { date: dateStr, amount: revenue };
  });
  const maxDailyRevenue = Math.max(...dailyRevenue.map(r => r.amount), 1);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* VENUE SUMMARY BANNER */}
      <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <img 
          src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80'} 
          alt={gym.name} 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--card-border)', flexShrink: 0 }} 
        />
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{gym.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <MapPin size={16} /> {gym.address}, {gym.city}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: '8px', color: 'var(--text)', border: '1px solid var(--line)' }}>
              Base: <strong>₹{gym.pricePerHour}/hr</strong>
            </span>
            <span style={{ fontSize: '0.85rem', background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: '8px', color: 'var(--amber)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="currentColor" /> {gym.rating} ({gym.reviewCount} Reviews)
            </span>
          </div>
        </div>
      </motion.div>

      {/* METRIC CARDS */}
      <motion.div className="dash-stats" variants={containerVariants} style={{ margin: 0 }}>
        <motion.div variants={itemVariants} className="dash-stat">
          <div className="dash-stat-icon red"><IndianRupee size={20} /></div>
          <div className="dash-stat-val">₹{totalPayout}</div>
          <div className="dash-stat-lbl">Gym Net Revenue (85%)</div>
        </motion.div>
        <motion.div variants={itemVariants} className="dash-stat">
          <div className="dash-stat-icon orange"><Users size={20} /></div>
          <div className="dash-stat-val">{completed.length}</div>
          <div className="dash-stat-lbl">Total Workouts Hosted</div>
        </motion.div>
        <motion.div variants={itemVariants} className="dash-stat">
          <div className="dash-stat-icon blue"><CalendarCheck size={20} /></div>
          <div className="dash-stat-val">{upcoming.length}</div>
          <div className="dash-stat-lbl">Upcoming Reservations</div>
        </motion.div>
        <motion.div variants={itemVariants} className="dash-stat">
          <div className="dash-stat-icon gold"><Star size={20} /></div>
          <div className="dash-stat-val">{gym.slots.length}</div>
          <div className="dash-stat-lbl">Active Daily Slots</div>
        </motion.div>
      </motion.div>

      {/* VISUAL CHARTS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* REVENUE TIMELINE CHART */}
        <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>7-Day Revenue (₹)</h3>
            <TrendingUp size={20} color="var(--red)" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexGrow: 1, gap: '12px', height: '180px' }}>
            {dailyRevenue.map((r, i) => {
              const heightPercentage = (r.amount / maxDailyRevenue) * 80 + 10; // offset so zero amounts have a tiny bar
              const formattedDate = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: r.amount > 0 ? 'var(--text)' : 'var(--muted)' }}>₹{r.amount}</div>
                  <div style={{ width: '100%', height: '100%', background: 'var(--chip-bg)', borderRadius: '6px', position: 'relative', overflow: 'hidden', maxHeight: '120px' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${heightPercentage}%` }} 
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: r.amount > 0 ? 'var(--red)' : 'var(--line)', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>{formattedDate}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* OCCUPANCY HEATMAP */}
        <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '320px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Hourly Occupancy Heatmap</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {gym.slots.map((s, i) => {
              const count = slotOccupancy[s.time] || 0;
              const fillPercentage = Math.min((count / maxOccupancy) * 100, 100);
              const colorMix = count > 0 ? 'var(--red)' : 'var(--line)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
                  <span style={{ flexShrink: 0, width: '96px', color: 'var(--muted)', fontWeight: 600 }}>{s.time}</span>
                  <div style={{ flexGrow: 1, height: '16px', background: 'var(--surface-alt)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${fillPercentage}%`, height: '100%', background: colorMix, borderRadius: '8px', transition: 'width 0.5s ease-out' }} />
                  </div>
                  <span style={{ flexShrink: 0, width: '80px', textAlign: 'right', fontWeight: 700, color: count > 0 ? 'var(--text)' : 'var(--muted)' }}>
                    {count} check-ins
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* RECENT BOOKINGS LIST */}
      <motion.div variants={itemVariants} className="detail-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>Recent Booking Activity</h3>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '16px' }}>No bookings received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} className="booking-item" style={{ margin: 0, padding: '18px 24px' }}>
                <div className="booking-item-info">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.userId?.name || 'Walk-in Member'}</h4>
                  <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.85rem' }}>
                    Email: <span style={{ color: 'var(--text)' }}>{b.userId?.email || 'N/A'}</span> • Ref: <span style={{ fontFamily: 'monospace' }}>{b._id.slice(-8).toUpperCase()}</span>
                  </p>
                  <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '0.85rem' }}>
                    Slot: <strong>{new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {b.timeSlot}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.15rem' }}>+₹{Math.round(b.price * 0.85)}</span>
                  <span className={`status-badge status-${b.status}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
