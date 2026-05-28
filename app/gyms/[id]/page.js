'use client';
import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GymDetail({ params }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [gym, setGym] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetch(`/api/gyms/${id}`).then(r => r.json()).then(setGym);
  }, [id]);

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
      setShowModal(true);
    } else {
      const err = await res.json();
      setErrorMsg(err.error || 'Booking failed');
    }
  }

  if (!gym) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>;

  return (
    <>
      <div className="detail-hero">
        <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80'} alt={gym.name} />
        <div className="detail-hero-overlay"></div>
        <button className="btn-back" onClick={() => router.push('/gyms')}><i className="fa-solid fa-arrow-left"></i> Back</button>
      </div>

      <div className="container">
        <div className="detail-layout">
          <div>
            <div className="detail-card">
              <h1 className="detail-name">{gym.name.toUpperCase()}</h1>
              <div className="detail-meta">
                <span className={`crowd-badge crowd-${gym.crowdLevel}`}><i className="fa-solid fa-users"></i> {gym.crowdLevel}</span>
                <span className="gym-rating" style={{fontSize:'1rem'}}><i className="fa-solid fa-star"></i> {gym.rating} ({gym.reviewCount})</span>
              </div>
              <div className="detail-info">
                <span><i className="fa-solid fa-location-dot"></i> {gym.address}, {gym.city}</span>
                <span><i className="fa-regular fa-clock"></i> {gym.hours}</span>
                {gym.phone && <span><i className="fa-solid fa-phone"></i> {gym.phone}</span>}
                {gym.email && <span><i className="fa-solid fa-envelope"></i> {gym.email}</span>}
              </div>
              {gym.description && <p className="detail-desc">{gym.description}</p>}
            </div>

            <div className="detail-card detail-section">
              <h3>AMENITIES</h3>
              <div className="amenity-grid">
                {gym.amenities.map((a, i) => (
                  <div className="amenity-chip" key={i}><i className="fa-solid fa-check" style={{color:'#22c55e'}}></i> {a}</div>
                ))}
              </div>
            </div>

            {gym.equipment?.length > 0 && (
              <div className="detail-card detail-section">
                <h3>EQUIPMENT</h3>
                <div className="equip-tags">
                  {gym.equipment.map((e, i) => <span className="equip-tag" key={i}>{e}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="booking-price">
                <span className="symbol">₹</span><span className="big">{gym.pricePerHour}</span><span className="per">/hour</span>
              </div>

              <div className="booking-field">
                <label>SELECT DATE</label>
                <select className="date-input" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }} style={{width:'100%',appearance:'auto'}}>
                  <option value="">Choose a date</option>
                  {dates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                </select>
              </div>

              <div className="booking-field">
                <label>SELECT TIME SLOT</label>
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

              {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{errorMsg}</div>}

              {session ? (
                <button className="btn-book" onClick={handleBook}>BOOK NOW — ₹{gym.pricePerHour}</button>
              ) : (
                <button className="btn-book" onClick={() => router.push('/auth')}>SIGN IN TO BOOK</button>
              )}
              <div className="secure-note">🔒 Secure payment via Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><i className="fa-solid fa-circle-check"></i></div>
            <h2>BOOKING CONFIRMED!</h2>
            <p className="sub">Your session has been booked successfully.</p>
            <div className="modal-details">
              <p><span>Gym</span><span>{gym.name}</span></p>
              <p><span>Date</span><span>{formatDate(selectedDate)}</span></p>
              <p><span>Time</span><span>{selectedSlot}</span></p>
              <p><span>Price</span><span>₹{gym.pricePerHour}</span></p>
            </div>
            <div className="qr-wrap">
              <div className="qr-box"><i className="fa-solid fa-qrcode"></i><span>Your QR Code</span></div>
              <p className="qr-label">Show this at the gym for entry</p>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => router.push('/dashboard')}>DASHBOARD</button>
              <button className="btn-outline" onClick={() => setShowModal(false)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
