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

  // Review Eligibility and Management State
  const [reviewEligibility, setReviewEligibility] = useState({ eligible: false, userReview: null });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewComment, setEditReviewComment] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const fetchReviewStatus = () => {
    if (session?.user?.id) {
      fetch(`/api/reviews/status?venueId=${id}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(setReviewEligibility)
        .catch(err => console.error('Failed to fetch review status:', err));
    } else {
      setReviewEligibility({ eligible: false, userReview: null });
    }
  };

  useEffect(() => {
    fetch(`/api/venues/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    fetch(`/api/reviews?venueId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
  }, [id]);

  useEffect(() => {
    fetchReviewStatus();
  }, [session, id]);

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
        userId: session.user.id, venueId: id, date: selectedDate,
        timeSlot: selectedSlot, price: gym.pricePerHour,
        venueName: gym.name, venueAddress: gym.address,
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
      // Removed auto-booking as per user request
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
        body: JSON.stringify({ venueId: id })
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
      body: JSON.stringify({ userId: session.user.id, venueId: id, rating: newReviewRating, comment: newReviewComment })
    });
    setIsSubmittingReview(false);
    if (res.ok) {
      addToast('Review submitted successfully!', 'success');
      setNewReviewComment('');
      setNewReviewRating(5);
      // Refresh reviews & status & gym rating
      fetch(`/api/reviews?venueId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
      fetchReviewStatus();
      fetch(`/api/venues/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    } else {
      const data = await res.json();
      addToast(data.error || 'Failed to submit review', 'error');
    }
  }

  async function handleReviewEditSubmit() {
    if (!session || !reviewEligibility.userReview) return;
    if (!editReviewComment.trim()) { addToast('Please write a comment', 'error'); return; }
    setIsUpdatingReview(true);
    const res = await fetch('/api/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: reviewEligibility.userReview._id, rating: editReviewRating, comment: editReviewComment })
    });
    setIsUpdatingReview(false);
    if (res.ok) {
      addToast('Review updated successfully!', 'success');
      setIsEditingReview(false);
      // Refresh reviews & status & gym rating
      fetch(`/api/reviews?venueId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
      fetchReviewStatus();
      fetch(`/api/venues/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    } else {
      const data = await res.json();
      addToast(data.error || 'Failed to update review', 'error');
    }
  }

  async function handleReviewDelete() {
    if (!session || !reviewEligibility.userReview) return;
    if (!confirm('Are you sure you want to delete your review?')) return;
    setIsDeletingReview(true);
    const res = await fetch(`/api/reviews?id=${reviewEligibility.userReview._id}`, {
      method: 'DELETE'
    });
    setIsDeletingReview(false);
    if (res.ok) {
      addToast('Review deleted successfully!', 'success');
      // Refresh reviews & status & gym rating
      fetch(`/api/reviews?venueId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
      fetchReviewStatus();
      fetch(`/api/venues/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    } else {
      const data = await res.json();
      addToast(data.error || 'Failed to delete review', 'error');
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
              
              {/* Conditional reviews header & form/status */}
              {!session ? (
                <div style={{ background: 'var(--surface-alt)', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid var(--line)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Please sign in to write a review. Anyone can read other members' reviews below!</p>
                  <button className="btn-primary" onClick={() => router.push('/auth')} style={{ display: 'inline-block', width: 'auto', padding: '10px 24px' }}>
                    Sign In
                  </button>
                </div>
              ) : !reviewEligibility.eligible ? (
                <div style={{ background: 'rgba(255, 76, 76, 0.05)', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid rgba(255, 76, 76, 0.2)' }}>
                  <p style={{ color: 'var(--red)', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={16} style={{ color: 'var(--red)', transform: 'rotate(180deg)' }} /> 
                    You can write a review after completing a workout at this gym. See what other members say below!
                  </p>
                </div>
              ) : reviewEligibility.userReview ? (
                // User has already written a review: show "Your Review" card
                <div style={{ background: 'var(--surface-alt)', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16} style={{ color: '#22c55e' }} /> Your Review
                    </h4>
                    {!isEditingReview && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                          onClick={() => {
                            setEditReviewRating(reviewEligibility.userReview.rating);
                            setEditReviewComment(reviewEligibility.userReview.comment);
                            setIsEditingReview(true);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={handleReviewDelete}
                          disabled={isDeletingReview}
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                          {isDeletingReview ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingReview ? (
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setEditReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Star size={24} fill={editReviewRating >= star ? 'var(--amber)' : 'none'} color="var(--amber)" />
                          </button>
                        ))}
                      </div>
                      <textarea 
                        className="auth-input" 
                        rows="3" 
                        placeholder="Edit your experience..." 
                        value={editReviewComment} 
                        onChange={e => setEditReviewComment(e.target.value)} 
                        style={{ width: '100%', marginBottom: 12 }}
                      />
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-primary" onClick={handleReviewEditSubmit} disabled={isUpdatingReview} style={{ flex: 1 }}>
                          {isUpdatingReview ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn-outline" onClick={() => setIsEditingReview(false)} style={{ flex: 1 }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, color: 'var(--amber)' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={16} fill={reviewEligibility.userReview.rating >= star ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        {reviewEligibility.userReview.comment}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--line)', marginTop: 8 }}>
                        {new Date(reviewEligibility.userReview.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // User is eligible but has not written a review
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
              )}

              {/* Other reviews list */}
              {(() => {
                const loggedInUserId = session?.user?.id;
                const otherReviews = reviews.filter(r => {
                  const rUserId = r.userId?._id || r.userId;
                  return rUserId !== loggedInUserId;
                });

                if (otherReviews.length === 0) {
                  return (
                    <p style={{ color: 'var(--muted)' }}>
                      {reviews.length > 0 ? 'No other reviews yet.' : 'No reviews yet. Be the first to review after your session!'}
                    </p>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    {otherReviews.map(r => (
                      <div key={r._id} style={{ background: 'var(--surface-alt)', padding: 16, borderRadius: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <strong>{r.userId?.name || 'User'}</strong>
                          <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={14} fill="currentColor" /> {r.rating}
                          </div>
                        </div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{r.comment}</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--line)', marginTop: 8 }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
                ) : (() => {
                  const dateObj = new Date(selectedDate + 'T00:00:00');
                  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday, etc.
                  const visibleSlots = (gym.slots || []).filter(s => {
                    const slotDays = s.days || [0, 1, 2, 3, 4, 5, 6];
                    return slotDays.includes(dayOfWeek);
                  });

                  if (visibleSlots.length === 0) {
                    return <div className="slots-empty">No slots available for this day</div>;
                  }

                  return (
                    <div className="slots-wrap">
                      {visibleSlots.map((s, i) => (
                        <button key={i} className={`slot-btn ${selectedSlot === s.time ? 'active' : ''}`} onClick={() => { setSelectedSlot(s.time); setErrorMsg(''); }}>{s.time}</button>
                      ))}
                    </div>
                  );
                })()}
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
                      ? `Secure My Spot 💪`
                      : 'Add Money to Wallet'}
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
              <p><span>Venue</span><span>{gym.name}</span></p>
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
