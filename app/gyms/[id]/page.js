'use client';
import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Star, MapPin, Clock, Phone, Mail, Check, CheckCircle, QrCode, Heart, Map } from 'lucide-react';
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
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetch(`/api/gyms/${id}`, { cache: 'no-store' }).then(r => r.json()).then(setGym);
    fetch(`/api/reviews?gymId=${id}`, { cache: 'no-store' }).then(r => r.json()).then(setReviews);
  }, [id]);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch favorites
      fetch(`/api/user/favorites?userId=${session.user.id}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setIsFavorite(data.some(g => g._id === id || g === id));
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
    return d.toISOString().split('T')[0];
  });

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function handleBook() {
    setErrorMsg('');
    if (!session) { router.push('/auth'); return; }
    if (!selectedDate || !selectedSlot) { setErrorMsg('Please select a date and time slot.'); return; }
    if (walletBalance < gym.pricePerHour) { setErrorMsg('Insufficient wallet balance. Please add funds in your Dashboard.'); return; }

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
      addToast('Booking confirmed! Show your QR at the gym.', 'success');
    } else {
      const err = await res.json();
      setErrorMsg(err.error || 'Booking failed');
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
    const res = await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, gymId: id })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.isFavorite) addToast('Added to favorites', 'success');
      else addToast('Removed from favorites', 'info');
    } else {
      setIsFavorite(prev);
    }
  }

  if (!gym) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.name + ', ' + gym.address + ', ' + gym.city)}`;

  return (
    <>
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

      <div className="container">
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
                <label>Select date</label>
                <select className="date-input" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }} style={{width:'100%',appearance:'auto'}}>
                  <option value="">Choose a date</option>
                  {dates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
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
                  <button className="btn-book" onClick={handleBook}>Pay ₹{gym.pricePerHour} from Wallet</button>
                  <div className="secure-note" style={{marginTop:12}}>Wallet Balance: <strong>₹{walletBalance}</strong></div>
                </>
              ) : (
                <button className="btn-book" onClick={() => router.push('/auth')}>Sign in to book</button>
              )}
            </div>
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
    </>
  );
}
