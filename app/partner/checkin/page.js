'use client';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { QrCode, Search, CheckCircle2, XCircle, ArrowRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PartnerCheckIn() {
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  // Simulated Camera Scanner state
  const [scannerActive, setScannerActive] = useState(false);

  async function handleCheckIn(id) {
    if (!id || id.trim().length === 0) {
      addToast('Please enter a valid Booking ID', 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/partner/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          status: 'success',
          message: data.message,
          booking: data.booking
        });
        addToast('Check-in confirmed successfully!', 'success');
        setBookingId('');
      } else {
        setResult({
          status: 'error',
          message: data.error || 'Check-in failed'
        });
        addToast(data.error || 'Check-in verification failed', 'error');
      }
    } catch (err) {
      addToast('Network error during check-in verification', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Simulated auto-scanning helper for demo/testing
  async function triggerSimulatedScan() {
    setLoading(true);
    setScannerActive(true);
    
    // Search for any upcoming booking in database to simulate scanner capturing a real code
    try {
      const bookingsRes = await fetch('/api/bookings?status=upcoming');
      const bookings = await bookingsRes.json();
      
      setTimeout(async () => {
        if (bookings && bookings.length > 0) {
          // Grab the first upcoming booking
          const targetId = bookings[0]._id;
          await handleCheckIn(targetId);
        } else {
          addToast('No upcoming bookings found in database to simulate check-in.', 'info');
          setResult({
            status: 'error',
            message: 'No upcoming reservations found to check-in.'
          });
        }
        setScannerActive(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setScannerActive(false);
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: MANUAL CHECK-IN & CAMERA VISOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* MANUAL FORM */}
        <div className="detail-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} color="var(--red)" /> Front-Desk Attendance Verifier
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Input the 8-character code displayed below the member\'s QR code or type their MongoDB Booking ID to complete check-in.
          </p>

          <form onSubmit={e => { e.preventDefault(); handleCheckIn(bookingId); }} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div className="input-wrap" style={{ flexGrow: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input 
                type="text" 
                className="auth-input" 
                placeholder="Booking ID (e.g. 64d9fa2... or XXXXXXXX)" 
                value={bookingId} 
                onChange={e => setBookingId(e.target.value)} 
                style={{ width: '100%', paddingLeft: '48px', height: '48px' }} 
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ height: '48px', padding: '0 24px', borderRadius: '12px' }}>
              Verify
            </button>
          </form>
        </div>

        {/* SCANNER VISOR SCREEN */}
        <div className="detail-card" style={{ padding: '28px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Camera size={18} color="var(--blue)" /> Live Camera Feed Visor
          </h3>
          
          <div style={{ position: 'relative', width: '100%', height: '240px', background: '#000', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            {scannerActive ? (
              <>
                {/* Pulsing Visor Box */}
                <div style={{ width: '160px', height: '160px', border: '3px solid var(--red)', borderRadius: '12px', zIndex: 10, position: 'relative', overflow: 'hidden' }}>
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    style={{ width: '100%', height: '2px', background: 'var(--red)', boxShadow: '0 0 10px var(--red)', position: 'absolute', top: 0, left: 0 }} 
                  />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 62, 0, 0.1)', zIndex: 5, animation: 'skeletonPulse 1.5s infinite' }} />
                <span style={{ position: 'absolute', bottom: '16px', zIndex: 10, fontSize: '0.8rem', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>
                  Scanning camera visor...
                </span>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--muted)' }}>
                <QrCode size={48} strokeWidth={1} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: '0.9rem' }}>Camera scanner is currently inactive.</span>
              </div>
            )}
          </div>

          <button 
            className="btn-outline" 
            onClick={triggerSimulatedScan} 
            disabled={loading || scannerActive} 
            style={{ width: '100%', height: '44px', borderRadius: '10px' }}
          >
            {scannerActive ? 'Scanning...' : 'Simulate Webcam Check-In'}
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: REAL-TIME VERIFICATION FEEDBACK */}
      <div>
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key={result.status + Date.now()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="detail-card" 
              style={{ padding: '32px', border: result.status === 'success' ? '1px solid var(--green)' : '1px solid var(--red)' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {result.status === 'success' ? (
                  <>
                    <CheckCircle2 size={56} color="var(--green)" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>Verified Successfully</h3>
                  </>
                ) : (
                  <>
                    <XCircle size={56} color="var(--red)" style={{ margin: '0 auto 16px auto' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--red)' }}>Verification Failed</h3>
                  </>
                )}
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>{result.message}</p>
              </div>

              {result.status === 'success' && result.booking && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ height: '1px', background: 'var(--line)' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block' }}>Booking Code</span>
                      <strong style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{result.booking._id.slice(-8).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block' }}>Target Hour Slot</span>
                      <strong>{result.booking.timeSlot}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block' }}>Reservation Date</span>
                      <strong>{new Date(result.booking.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block' }}>Owner Settlement (85%)</span>
                      <strong style={{ color: 'var(--green)' }}>+₹{Math.round(result.booking.price * 0.85)}</strong>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'var(--line)' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
                    Attendant Check-in completed. Ledger has been automatically updated.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
