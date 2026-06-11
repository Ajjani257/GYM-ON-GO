'use client';
import { useState, useEffect, use, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, Check, CheckCircle, QrCode, Heart, Map, Wallet } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function GymDetail({ params }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [gym, setGym] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const topUpRef = useRef(null);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // Inline Review Form State
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/gyms/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    fetch(`/api/reviews?gymId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
  }, [id]);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch favorites
      fetch(`/api/user/favorites?userId=${session.user.id}`, { cache: 'no-store' })
        .then(r => {
          if (!r.ok) throw new Error(`API error: ${r.status}`);
          return r.json();
        })
        .then(data => {
          if (Array.isArray(data)) setIsFavorite(data.some(g => g._id === id || g === id));
        })
        .catch(err => {
          console.error('Failed to load favorite status:', err);
          setIsFavorite(false);
        });
      // Fetch wallet balance
      fetch(`/api/user/wallet?userId=${session.user.id}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (data.walletBalance !== undefined) setWalletBalance(data.walletBalance);
        });
    }
  }, [session, id]);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getDateDetails(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = d.toLocaleDateString('en-US', { day: '2-digit' });
    return { dayName, dateNum };
  }

  async function handleBook() {
    setErrorMsg('');
    if (!session) { router.push('/auth'); return; }
    if (!selectedDate || !selectedSlot) { setErrorMsg('Please select a date and time slot.'); return; }
    if (walletBalance < gym.pricePerHour) {
      setShowTopUp(true);
      // Pre-fill the exact shortfall
      setTopUpAmount(String(gym.pricePerHour - walletBalance));
      setTimeout(() => topUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }
    await confirmBook();
  }

  async function confirmBook() {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id, gymId: id, date: selectedDate,
        timeSlot: selectedSlot, price: gym.pricePerHour,
        gymName: gym.name, gymAddress: gym.address,
      }),
    });
    if (res.ok) {
      const b = await res.json();
      setBooking(b);
      setWalletBalance(prev => prev - gym.pricePerHour);
      setShowModal(true);
      setShowTopUp(false);
      addToast('Booking confirmed! Show your QR at the gym.', 'success');
    } else {
      const err = await res.json();
      setErrorMsg(err.error || 'Booking failed');
    }
  }

  async function handleTopUp() {
    const amt = Number(topUpAmount);
    if (!amt || amt < 1) { addToast('Enter a valid amount', 'error'); return; }
    if (amt > 10000) { addToast('Maximum top-up is ₹10,000', 'error'); return; }
    setTopUpLoading(true);
    const res = await fetch('/api/user/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    });
    setTopUpLoading(false);
    if (res.ok) {
      const data = await res.json();
      setWalletBalance(data.walletBalance);
      addToast(`₹${amt} added to wallet!`, 'success');
      setShowTopUp(false);
      setTopUpAmount('');
      // Auto-proceed to book if balance is now sufficient
      if (data.walletBalance >= gym.pricePerHour && selectedDate && selectedSlot) {
        await confirmBook();
      }
    } else {
      const err = await res.json();
      addToast(err.error || 'Top-up failed', 'error');
    }
  }

  async function handleCancel() {
    setCancelling(true);
    await fetch(`/api/bookings?id=${booking._id}`, { method: 'DELETE' });
    setCancelling(false);
    setShowModal(false);
    setSelectedSlot('');
    setWalletBalance(prev => prev + gym.pricePerHour); // optimistic refund
    addToast('Booking cancelled. ₹' + gym.pricePerHour + ' refunded to wallet.', 'info');
  }

  async function toggleFavorite() {
    if (!session) { addToast('Please sign in to save favorites', 'error'); return; }
    
    const prev = isFavorite;
    setIsFavorite(!prev);
    
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: id })
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.isFavorite) {
        addToast('Added to favorites', 'success');
      } else {
        addToast('Removed from favorites', 'info');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setIsFavorite(prev);
      addToast('Failed to save favorite. Please try again.', 'error');
    }
  }

  async function handleReviewSubmit() {
    if (!session) { addToast('Please sign in to leave a review', 'error'); return; }
    if (!newReviewComment.trim()) { addToast('Please write a comment', 'error'); return; }
    setIsSubmittingReview(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, gymId: id, rating: newReviewRating, comment: newReviewComment })
    });
    setIsSubmittingReview(false);
    if (res.ok) {
      addToast('Review submitted successfully!', 'success');
      setNewReviewComment('');
      setNewReviewRating(5);
      // Refresh reviews
      fetch(`/api/reviews?gymId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
    } else {
      addToast('Failed to submit review', 'error');
    }
  }

  if (!gym) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.name + ', ' + gym.address + ', ' + gym.city)}`;

  return (
    <div className="container" style={{ marginTop: '108px' }}>
      <div className="detail-hero" style={{position:'relative'}}>
        <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80'} alt={gym.name} />
        <div className="detail-hero-overlay"></div>
        <button className="btn-back" onClick={() => router.back()}><ArrowLeft size={16} /> Back</button>
        
        <button 
          onClick={toggleFavorite}
          style={{
            position:'absolute', top:24, right:24, zIndex:10,
            background: isFavorite ? 'var(--red)' : 'rgba(255,255,255,0.2)',
            color: '#fff', border:'none', borderRadius:'50%',
            width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(4px)'
          }}
        >
          <Heart size={24} fill={isFavorite ? '#fff' : 'none'} />
        </button>
      </div>

      <div className="detail-layout">
          <div>
            <div className="detail-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
                <h1 className="detail-name" style={{margin:0}}>{gym.name}</h1>
                <a href={mapsUrl} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface-alt)',padding:'8px 16px',borderRadius:12,color:'var(--blue)',fontWeight:600,textDecoration:'none'}}>
                  <Map size={16} /> Get Directions
                </a>
              </div>
              <div className="detail-meta" style={{marginTop:16}}>
                <span className="gym-rating" style={{fontSize:'1rem'}}><Star size={14} /> {gym.rating} ({gym.reviewCount})</span>
              </div>
              <div className="detail-info">
                <span><MapPin size={14} /> {gym.address}, {gym.city}</span>
                <span><Clock size={14} /> {gym.hours}</span>
                {gym.phone && <span><Phone size={14} /> {gym.phone}</span>}
                {gym.email && <span><Mail size={14} /> {gym.email}</span>}
              </div>
              {gym.description && <p className="detail-desc">{gym.description}</p>}
            </div>

            <div className="detail-card detail-section">
              <h3>Amenities</h3>
              <div className="amenity-grid">
                {gym.amenities.map((a, i) => (
                  <div className="amenity-chip" key={i}><Check size={14} style={{color:'#22c55e'}} /> {a}</div>
                ))}
              </div>
            </div>

            {gym.equipment?.length > 0 && (
              <div className="detail-card detail-section">
                <h3>Equipment</h3>
                <div className="equip-tags">
                  {gym.equipment.map((e, i) => <span className="equip-tag" key={i}>{e}</span>)}
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="detail-card detail-section">
              <h3>User Reviews ({reviews.length})</h3>
              
              {/* Inline Write Review Form */}
              <div style={{ background: 'var(--surface-alt)', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid var(--line)' }}>
                <h4 style={{ marginBottom: 12 }}>Write a Review</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setNewReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Star size={24} fill={newReviewRating >= star ? 'var(--amber)' : 'none'} color="var(--amber)" />
                    </button>
                  ))}
                </div>
                <textarea 
                  className="auth-input" 
                  rows="3" 
                  placeholder="Share your experience at this gym..." 
                  value={newReviewComment} 
                  onChange={e => setNewReviewComment(e.target.value)} 
                  style={{ width: '100%', marginBottom: 12 }}
                />
                <button className="btn-primary" onClick={handleReviewSubmit} disabled={isSubmittingReview} style={{ width: '100%' }}>
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>

              {reviews.length === 0 ? (
                <p style={{color:'var(--muted)'}}>No reviews yet. Be the first to review after your session!</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:16}}>
                  {reviews.map(r => (
                    <div key={r._id} style={{background:'var(--surface-alt)',padding:16,borderRadius:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <strong>{r.userId?.name || 'User'}</strong>
                        <div style={{color:'var(--gold)',display:'flex',alignItems:'center',gap:4}}>
                          <Star size={14} fill="currentColor" /> {r.rating}
                        </div>
                      </div>
                      <p style={{color:'var(--muted)',fontSize:'0.95rem',lineHeight:1.5}}>{r.comment}</p>
                      <div style={{fontSize:'0.8rem',color:'var(--line)',marginTop:8}}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="booking-price">
                <span className="symbol">₹</span><span className="big">{gym.pricePerHour}</span><span className="per">/hour</span>
              </div>

              <div className="booking-field">
                <label style={{ marginBottom: '8px', display: 'block' }}>Select date</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 12px 0', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className="date-cards-wrap">
                  {dates.map(d => {
                    const { dayName, dateNum } = getDateDetails(d);
                    const isActive = selectedDate === d;
                    return (
                      <button
                        key={d}
                        onClick={() => { setSelectedDate(d); setSelectedSlot(''); }}
                        style={{
                          flex: '0 0 72px',
                          padding: '12px 8px',
                          borderRadius: '16px',
                          border: isActive ? '2px solid var(--red)' : '1px solid var(--card-border)',
                          background: isActive ? 'rgba(255, 76, 76, 0.1)' : 'var(--surface-alt)',
                          color: isActive ? 'var(--red)' : 'var(--text)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: isActive ? 1 : 0.6, textTransform: 'uppercase' }}>{dayName}</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{dateNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="booking-field">
                <label>Select time slot</label>
                {!selectedDate ? (
                  <div className="slots-empty">Select a date to see slots</div>
                ) : gym.slots?.length > 0 ? (
                  <div className="slots-wrap">
                    {gym.slots.map((s, i) => (
                      <button key={i} className={`slot-btn ${selectedSlot === s.time ? 'active' : ''}`} onClick={() => { setSelectedSlot(s.time); setErrorMsg(''); }}>{s.time}</button>
                    ))}
                  </div>
                ) : (
                  <div className="slots-empty">No slots available</div>
                )}
              </div>

              {errorMsg && <div className="auth-error" style={{marginBottom:16}}>{errorMsg}</div>}

              {session ? (
                <>
                  {/* Wallet balance row — same visual treatment as slot-btn row */}
                  <div className="booking-field" style={{ marginBottom: 0 }}>
                    <label>Wallet</label>
                    <div className="wallet-row">
                      <div className="wallet-balance-info">
                        <Wallet size={15} />
                        <span className={walletBalance >= gym.pricePerHour ? 'wallet-ok' : 'wallet-low'}>
                          ₹{walletBalance}
                        </span>
                        {walletBalance < gym.pricePerHour && (
                          <span className="wallet-shortfall">₹{gym.pricePerHour - walletBalance} short</span>
                        )}
                      </div>
                      <button
                        className="wallet-topup-toggle"
                        onClick={() => { setShowTopUp(v => !v); setTopUpAmount(''); setErrorMsg(''); }}
                      >
                        {showTopUp ? 'Cancel' : '+ Add money'}
                      </button>
                    </div>
                  </div>

                  {/* Top-up panel — styled like the slots section */}
                  {showTopUp && (
                    <div ref={topUpRef} className="booking-field topup-panel">
                      <label>Add to wallet</label>
                      <div className="slots-wrap" style={{ marginBottom: 12 }}>
                        {[
                          walletBalance < gym.pricePerHour && { label: `₹${gym.pricePerHour - walletBalance} (exact shortfall)`, val: gym.pricePerHour - walletBalance },
                          { label: '+ ₹100', val: 100 },
                          { label: '+ ₹200', val: 200 },
                          { label: '+ ₹500', val: 500 },
                        ].filter(Boolean).map(chip => (
                          <button
                            key={chip.val}
                            className={`slot-btn ${topUpAmount === String(chip.val) ? 'active' : ''}`}
                            onClick={() => setTopUpAmount(String(chip.val))}
                          >{chip.label}</button>
                        ))}
                      </div>
                      <div className="topup-input-row">
                        <input
                          type="number"
                          className="date-input"
                          placeholder="Or enter custom amount"
                          value={topUpAmount}
                          onChange={e => setTopUpAmount(e.target.value)}
                          min="1"
                          style={{ flex: 1, cursor: 'text' }}
                        />
                        <button
                          className="btn-book topup-confirm-btn"
                          onClick={handleTopUp}
                          disabled={topUpLoading}
                        >
                          {topUpLoading ? 'Adding…' : 'Add'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-book"
                    onClick={handleBook}
                    style={{ background: 'linear-gradient(135deg, var(--red) 0%, var(--amber) 100%)', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)', marginTop: 16 }}
                  >
                    {walletBalance >= gym.pricePerHour
                      ? `Pay ₹${gym.pricePerHour} from Wallet`
                      : 'Add Money & Book'}
                  </button>
                </>
              ) : (
                <button className="btn-book" onClick={() => router.push('/auth')} style={{ background: 'linear-gradient(135deg, var(--red) 0%, var(--amber) 100%)', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)' }}>Sign in to book</button>
              )}
            </div>
          </div>
        </div>

      {/* Booking Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><CheckCircle size={48} /></div>
            <h2>Booking confirmed!</h2>
            <p className="sub">Your session has been booked successfully.</p>
            <div className="modal-details">
              <p><span>Gym</span><span>{gym.name}</span></p>
              <p><span>Date</span><span>{formatDate(selectedDate)}</span></p>
              <p><span>Time</span><span>{selectedSlot}</span></p>
              <p><span>Paid</span><span>₹{gym.pricePerHour} (Wallet)</span></p>
            </div>
            <div className="qr-wrap">
              <div className="qr-box">
                <QrCode size={64} strokeWidth={1} />
                <span>{booking?._id?.slice(-8).toUpperCase() || 'XXXXXXXX'}</span>
              </div>
              <p className="qr-label">Show this at the gym for entry</p>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => router.push('/dashboard')}>Dashboard</button>
              <button className="btn-outline" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel booking'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
