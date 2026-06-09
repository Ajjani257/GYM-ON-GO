'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { TrendingUp, Flame, CalendarDays, Bookmark, CalendarX2, Wallet, Star, MapPin, Copy, Users, Gift, CheckCircle, Clock, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(bookings) {
  const completedDates = new Set(
    bookings
      .filter(b => b.status === 'completed')
      .map(b => b.date)
  );

  if (completedDates.size === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = getLocalDateString(checkDate);

    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      // If today is missed (i === 0), the streak can still be active if yesterday has a completed workout.
      // If i > 0 (yesterday or earlier) is missed, the streak is broken.
      if (i > 0) {
        break;
      }
    }
  }
  return streak;
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qTab = searchParams.get('tab');
  const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past', 'saved'

  // Sync tab with URL query parameter
  useEffect(() => {
    if (qTab && ['upcoming', 'past', 'saved'].includes(qTab)) {
      setTab(qTab);
    }
  }, [qTab]);
  const [bookings, setBookings] = useState([]);
  const [savedGyms, setSavedGyms] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralsCount, setReferralsCount] = useState(0);
  const [referredFriends, setReferredFriends] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
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
      fetch(`/api/bookings?userId=${session.user.id}`, { cache: 'no-store' }).then(r => r.json()).then(setBookings).catch(err => { console.error('Failed to load bookings:', err); setBookings([]); });
      fetch(`/api/user/favorites?userId=${session.user.id}`, { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      }).then(setSavedGyms).catch(err => { console.error('Failed to load favorites:', err); setSavedGyms([]); });
      fetch(`/api/user/wallet?userId=${session.user.id}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
        setWalletBalance(d.walletBalance || 0);
        setReferralCode(d.referralCode || '');
        setReferralsCount(d.referralsCount || 0);
        setLoyaltyPoints(d.loyaltyPoints || 0);
        setLifetimePoints(d.lifetimePoints || 0);
      }).catch(err => console.error('Failed to load wallet:', err));
      fetch(`/api/user/transactions`, { cache: 'no-store' }).then(r => r.json()).then(setTransactions).catch(err => { console.error('Failed to load transactions:', err); setTransactions([]); });
    }
  };

  const loadReferrals = () => {
    setReferralsLoading(true);
    fetch('/api/user/referrals', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setReferredFriends(Array.isArray(data) ? data : []); setReferralsLoading(false); })
      .catch(() => setReferralsLoading(false));
  };

  useEffect(() => { loadData(); }, [session]);

  useEffect(() => {
    if (tab === 'refer' && session?.user?.id) loadReferrals();
  }, [tab, session]);

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
          {/* Points badge */}
          <div style={{borderLeft:'1px solid var(--line)',paddingLeft:20}}>
            <div style={{color:'var(--muted)',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <Zap size={14} color="var(--amber)" /> Points
            </div>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'var(--amber)'}}>{loyaltyPoints} <span style={{fontSize:'0.75rem',color:'var(--muted)',fontWeight:500}}>/ 100</span></div>
          </div>
          <button className="btn-primary" style={{padding:'8px 16px',fontSize:'0.9rem'}} onClick={() => setWalletModal(true)}>+ Add Funds</button>
        </div>
      </div>

      {/* VISUAL DASHBOARD WIDGETS */}
      <motion.div className="dash-widgets" variants={containerVariants} initial="hidden" animate="visible" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* WIDGET 1: Streak Ring */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-alt)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid var(--line)' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--amber)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(streak, 30) / 30)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} color="var(--amber)" />
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{streak}</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Day Streak</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>You&apos;re on fire! Complete a workout every day to keep the ring growing.</p>
          </div>
        </motion.div>

        {/* WIDGET 2: Activity Bar Chart */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-alt)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Activity</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{bookings.filter(b => b.status === 'completed').length} Total Workouts</p>
            </div>
            <TrendingUp color="var(--blue)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', gap: '8px' }}>
            {(() => {
              const activityCounts = Array(7).fill(0);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              bookings.filter(b => b.status === 'completed').forEach(b => {
                const bDate = new Date(b.date);
                const diffTime = today - bDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < 7) {
                  const index = 6 - diffDays;
                  activityCounts[index]++;
                }
              });
              const maxActivity = Math.max(...activityCounts, 1);
              return activityCounts.map((count, i) => {
                const height = count === 0 ? 10 : (count / maxActivity) * 100; // Give at least 10% height so it's visible as an empty bar
                return (
                  <div key={i} style={{ width: '100%', height: '100%', background: 'var(--chip-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${height}%` }} 
                      transition={{ duration: 0.8, delay: 0.2 + (i * 0.1) }}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: count > 0 ? (i === 6 ? 'var(--blue)' : 'var(--red)') : 'var(--line)', borderRadius: '4px' }} 
                      title={`${count} workouts`}
                    />
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>

        {/* WIDGET 3: Transaction Ledger */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-alt)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', minHeight: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Transaction Ledger</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 'auto 0' }}>No transactions recorded yet.</p>
            ) : (
              transactions.slice(0, 3).map(tx => (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: tx.type === 'credit' ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                      {tx.type === 'credit' ? '↓' : '↑'}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }} title={tx.description}>
                      {tx.description}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: tx.type === 'credit' ? 'var(--green)' : 'var(--text)' }}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* WIDGET 4: Loyalty Points Ring */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-alt)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid var(--line)' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--blue)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(loyaltyPoints, 100) / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="var(--blue)" />
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{loyaltyPoints}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>Loyalty Points</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 10 }}>
              {loyaltyPoints >= 100
                ? '🎉 Redeeming now — ₹50 credit incoming!'
                : `${100 - loyaltyPoints} pts to next ₹50 reward`}
            </p>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(loyaltyPoints, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--blue), #00c8f0)', borderRadius: 999 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>0 pts</span>
              <span style={{ color: 'var(--blue)', fontWeight: 700 }}>100 pts = ₹50</span>
            </div>
            {lifetimePoints > 0 && (
              <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Award size={11} color="var(--amber)" /> {lifetimePoints} lifetime points earned
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Upcoming ({upcoming.length})</button>
          <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past ({past.length})</button>
          <button className={`tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>Gym Wishlist ({savedGyms.length})</button>
          <button className={`tab ${tab === 'refer' ? 'active' : ''}`} onClick={() => setTab('refer')}>Refer & Earn</button>
        </div>
        <button className="btn-primary" onClick={() => router.push('/gyms')} style={{ padding: '10px 20px', fontSize: '0.95rem', borderRadius: '12px' }}>Explore more gyms</button>
      </div>

      {tab === 'saved' ? (
        <div className="gyms-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))'}}>
          {savedGyms.length === 0 ? (
            <div className="empty-state" style={{gridColumn:'1 / -1'}}>
              <Bookmark size={48} />
              <h3>Gym Wishlist is empty</h3>
              <p>Click the heart icon on any gym to add it to your wishlist</p>
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
      ) : tab === 'refer' ? (
        <div className="detail-card" style={{ padding: '40px' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-badge" style={{ marginBottom: '16px' }}>Bring a Friend Program</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Refer Friends. Get Paid to Lift.</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '540px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Share your code — your friend gets <strong style={{color:'var(--amber)'}}>₹50 free credits</strong> instantly on sign-up, and you earn <strong style={{color:'var(--green)'}}>₹100</strong> the moment they complete their first workout check-in.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {/* Referral code card */}
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gift size={12} /> Your Referral Code
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--red)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{referralCode || '...'}</div>
              <button
                className="btn-outline"
                onClick={() => { navigator.clipboard.writeText(referralCode); addToast('Referral code copied!', 'success'); }}
                style={{ padding: '6px 14px', fontSize: '0.8rem', height: 'auto', borderRadius: '10px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Copy size={12} /> Copy Code
              </button>
            </div>

            {/* Invites count */}
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={12} /> Friends Joined
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{referredFriends.length}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 700, marginTop: '6px' }}>+₹{referralsCount * 100} earned</div>
            </div>

            {/* Pending rewards */}
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} /> Pending Rewards
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{referredFriends.filter(f => f.status === 'pending').length}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500, marginTop: '6px' }}>Friends yet to check in</div>
            </div>
          </div>

          {/* Share links */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,75,75,0.08), rgba(251,191,36,0.08))', border: '1px solid var(--line)', borderRadius: '20px', padding: '24px', marginBottom: '40px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Share your invite link</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hey! Join me on GYM-ON-GO — the smartest way to book gym sessions by the hour. Use my code ${referralCode} to get ₹50 free credits when you sign up! 🏋️ https://gym-on-go.vercel.app/auth?ref=${referralCode}`)}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent('Try GYM-ON-GO – Book gyms by the hour!')}&body=${encodeURIComponent(`Hey!\n\nI've been using GYM-ON-GO to book gym sessions by the hour — no subscriptions, just pay when you go.\n\nUse my referral code ${referralCode} when you sign up and get ₹50 free credits!\n\nSign up here: https://gym-on-go.vercel.app/auth?ref=${referralCode}\n\nSee you at the gym! 💪`)}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--line)', padding: '10px 18px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </a>
              {/* Copy link */}
              <button
                onClick={() => { navigator.clipboard.writeText(`https://gym-on-go.vercel.app/auth?ref=${referralCode}`); addToast('Referral link copied!', 'success'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--line)', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                <Copy size={14} /> Copy Link
              </button>
            </div>
          </div>

          {/* Friends table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Your Invited Friends</h3>
              {referredFriends.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{referredFriends.length} friend{referredFriends.length !== 1 ? 's' : ''} joined</span>
              )}
            </div>
            {referralsLoading ? (
              <div style={{ color: 'var(--muted)', padding: '24px 0', textAlign: 'center' }}>Loading...</div>
            ) : referredFriends.length === 0 ? (
              <div style={{ background: 'var(--surface-alt)', border: '1px dashed var(--line)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <Users size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>No friends invited yet. Share your code above to get started!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      {['Friend', 'Email', 'Joined', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--muted)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {referredFriends.map((f, i) => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--line)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{f.name}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{f.email}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{new Date(f.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {f.status === 'completed' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: '0.78rem' }}>
                              <CheckCircle size={11} /> Reward Claimed · ₹100 Earned
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.1)', color: 'var(--amber)', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: '0.78rem' }}>
                              <Clock size={11} /> Signed up · Awaiting first workout
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
            <input type="date" className="auth-input" min={getLocalDateString(new Date())} value={newDate} onChange={e => setNewDate(e.target.value)} style={{marginBottom:16}} />
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

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
