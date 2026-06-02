'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Flame, CalendarDays, Bookmark, CalendarX2, Wallet, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';

function calculateStreak(bookings) {
  const completed = bookings.filter(b => b.status === 'completed').map(b => b.date).sort().reverse();
  if (completed.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completed.includes(dateStr)) streak++;
    else if (streak > 0) break;
  }
  return streak;
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past', 'saved'
  const [bookings, setBookings] = useState([]);
  const [savedGyms, setSavedGyms] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const { addToast } = useToast();

  // Modals state
  const [walletModal, setWalletModal] = useState(false);
  const [fundAmount, setFundAmount] = useState(1000);
  
  const [reviewModal, setReviewModal] = useState(null); // stores gymId for review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const [rescheduleModal, setRescheduleModal] = useState(null); // stores booking object
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth');
  }, [status]);

  const loadData = () => {
    if (session?.user?.id) {
      fetch(`/api/bookings?userId=${session.user.id}`, { cache: 'no-store' }).then(r => r.json()).then(setBookings);
      fetch(`/api/user/favorites?userId=${session.user.id}`, { cache: 'no-store' }).then(r => r.json()).then(setSavedGyms);
      fetch(`/api/user/wallet?userId=${session.user.id}`, { cache: 'no-store' }).then(r => r.json()).then(d => setWalletBalance(d.walletBalance || 0));
    }
  };

  useEffect(() => { loadData(); }, [session]);

  if (status === 'loading') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>;
  if (!session) return null;

  const upcoming = bookings.filter(b => b.status === 'upcoming');
  const past = bookings.filter(b => b.status === 'completed');
  const streak = calculateStreak(bookings);

  // WALLET
  const handleAddFunds = async () => {
    if (fundAmount < 100) return addToast('Minimum amount is ₹100', 'error');
    // Mocking Razorpay delay
    const res = await fetch('/api/user/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, amount: fundAmount })
    });
    if (res.ok) {
      const data = await res.json();
      setWalletBalance(data.walletBalance);
      setWalletModal(false);
      addToast(`Added ₹${fundAmount} to wallet via Mock Razorpay!`, 'success');
    }
  };

  // REVIEW
  const handleSubmitReview = async () => {
    if (!reviewComment) return addToast('Please enter a comment', 'error');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, gymId: reviewModal, rating: reviewRating, comment: reviewComment })
    });
    if (res.ok) {
      addToast('Review submitted successfully!', 'success');
      setReviewModal(null);
      setReviewComment('');
    } else {
      addToast('Failed to submit review', 'error');
    }
  };

  // RESCHEDULE
  const handleReschedule = async () => {
    if (!newDate || !newTime) return addToast('Select new date and time', 'error');
    const res = await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rescheduleModal._id, newDate, newTimeSlot: newTime })
    });
    if (res.ok) {
      addToast('Booking rescheduled!', 'success');
      setRescheduleModal(null);
      loadData();
    } else {
      const d = await res.json();
      addToast(d.error || 'Failed to reschedule', 'error');
    }
  };

  return (
    <div className="dashboard container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
        <div>
          <h1 className="dash-title">Welcome, {session.user.name?.split(' ')[0] || 'User'}</h1>
          <p className="dash-sub">Track your workouts and manage your bookings</p>
        </div>
        
        {/* WALLET WIDGET */}
        <div style={{background:'var(--surface-alt)',padding:'16px 24px',borderRadius:16,display:'flex',alignItems:'center',gap:24,border:'1px solid var(--line)'}}>
          <div>
            <div style={{color:'var(--muted)',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <Wallet size={14} /> Wallet Balance
            </div>
            <div style={{fontSize:'1.5rem',fontWeight:700}}>₹{walletBalance}</div>
          </div>
          <button className="btn-primary" style={{padding:'8px 16px',fontSize:'0.9rem'}} onClick={() => setWalletModal(true)}>+ Add Funds</button>
        </div>
      </div>

      <motion.div className="dash-stats" variants={containerVariants} initial="hidden" animate="visible" style={{marginTop:32}}>
        <motion.div className="dash-stat" variants={itemVariants}>
          <div className="dash-stat-icon red"><TrendingUp size={20} /></div>
          <div className="dash-stat-val">{bookings.length}</div>
          <div className="dash-stat-lbl">Total workouts</div>
        </motion.div>
        <motion.div className="dash-stat" variants={itemVariants}>
          <div className="dash-stat-icon orange"><Flame size={20} /></div>
          <div className="dash-stat-val">{streak}</div>
          <div className="dash-stat-lbl">Day streak</div>
        </motion.div>
        <motion.div className="dash-stat" variants={itemVariants}>
          <div className="dash-stat-icon blue"><CalendarDays size={20} /></div>
          <div className="dash-stat-val">{bookings.filter(b => { const d = new Date(b.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length}</div>
          <div className="dash-stat-lbl">This month</div>
        </motion.div>
        <motion.div className="dash-stat" variants={itemVariants}>
          <div className="dash-stat-icon gold"><Bookmark size={20} /></div>
          <div className="dash-stat-val">{upcoming.length}</div>
          <div className="dash-stat-lbl">Upcoming</div>
        </motion.div>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming ({upcoming.length})</button>
          <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past ({past.length})</button>
          <button className={`tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>Saved Gyms ({savedGyms.length})</button>
        </div>
        <button className="btn-primary" onClick={() => router.push('/gyms')} style={{ padding: '10px 20px', fontSize: '0.95rem', borderRadius: '12px' }}>Explore more gyms</button>
      </div>

      {tab === 'saved' ? (
        <div className="gyms-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))'}}>
          {savedGyms.length === 0 ? (
            <div className="empty-state" style={{gridColumn:'1 / -1'}}>
              <Bookmark size={48} />
              <h3>No saved gyms</h3>
              <p>Click the heart icon on any gym to save it here</p>
            </div>
          ) : (
            savedGyms.map(gym => (
              <Link href={`/gyms/${gym._id}`} key={gym._id}>
                <div className="gym-card">
                  <div className="gym-card-img" style={{height:160}}>
                    <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={gym.name} />
                  </div>
                  <div className="gym-card-body">
                    <div className="gym-card-name">{gym.name}</div>
                    <div className="gym-card-address"><MapPin size={14} /> {gym.address}</div>
                    <div className="gym-card-meta">
                      <span className="gym-rating"><Star size={14} /> {gym.rating}</span>
                      <span className="gym-hours">₹{gym.pricePerHour}/hr</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div>
          {((tab === 'upcoming' ? upcoming : past).length === 0) ? (
            <div className="empty-state">
              <CalendarX2 size={48} />
              <h3>No {tab} bookings</h3>
              <p>Ready to start your fitness journey?</p>
              <button className="btn-primary" onClick={() => router.push('/gyms')}>Find gyms</button>
            </div>
          ) : (
            (tab === 'upcoming' ? upcoming : past).map(b => (
              <div className="booking-item" key={b._id}>
                <div className="booking-item-info">
                  <h4>{b.gymName}</h4>
                  <p>{b.gymAddress} • {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {month:'short',day:'numeric'})} • {b.timeSlot}</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',justifyContent:'flex-end'}}>
                  <span className={`status-badge status-${b.status}`}>{b.status.toUpperCase()}</span>
                  
                  {b.status === 'upcoming' && (
                    <>
                      <button className="btn-outline" style={{padding:'6px 12px'}} onClick={() => setRescheduleModal(b)}>Reschedule</button>
                      <button className="btn-cancel" style={{padding:'6px 12px'}} onClick={async () => {
                        await fetch(`/api/bookings?id=${b._id}`, { method: 'DELETE' });
                        loadData();
                        addToast('Booking cancelled & refunded to wallet', 'info');
                      }}>Cancel</button>
                    </>
                  )}
                  {b.status === 'completed' && (
                    <button className="btn-outline" style={{padding:'6px 12px'}} onClick={() => setReviewModal(b.gymId)}>Leave Review</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* WALLET MODAL */}
      {walletModal && (
        <div className="modal-overlay" onClick={() => setWalletModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>Add Funds via Mock Razorpay</h2>
            <p className="sub">Enter amount to add to your GYM-ON-GO wallet.</p>
            <input type="number" className="auth-input" value={fundAmount} onChange={e => setFundAmount(e.target.value)} min="100" />
            <div className="modal-actions" style={{marginTop:24}}>
              <button className="btn-primary" onClick={handleAddFunds}>Pay ₹{fundAmount}</button>
              <button className="btn-outline" onClick={() => setWalletModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>Leave a Review</h2>
            <p className="sub">How was your gym session?</p>
            <div style={{display:'flex',gap:8,margin:'16px 0'}}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} style={{background:'none',border:'none',cursor:'pointer'}}>
                  <Star size={32} fill={reviewRating >= star ? 'var(--gold)' : 'none'} color="var(--gold)" />
                </button>
              ))}
            </div>
            <textarea className="auth-input" rows="3" placeholder="Write your comment here..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <div className="modal-actions" style={{marginTop:24}}>
              <button className="btn-primary" onClick={handleSubmitReview}>Submit Review</button>
              <button className="btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2>Reschedule Booking</h2>
            <p className="sub">Select a new date and time for {rescheduleModal.gymName}</p>
            <input type="date" className="auth-input" min={new Date().toISOString().split('T')[0]} value={newDate} onChange={e => setNewDate(e.target.value)} style={{marginBottom:16}} />
            <select className="auth-input" value={newTime} onChange={e => setNewTime(e.target.value)}>
              <option value="">Select Time Slot</option>
              {['06:00 - 07:00','07:00 - 08:00','08:00 - 09:00','09:00 - 10:00','17:00 - 18:00','18:00 - 19:00','19:00 - 20:00','20:00 - 21:00'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="modal-actions" style={{marginTop:24}}>
              <button className="btn-primary" onClick={handleReschedule}>Confirm Reschedule</button>
              <button className="btn-outline" onClick={() => setRescheduleModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
