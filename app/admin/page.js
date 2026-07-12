'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, CheckCircle, XCircle, Mail, Key, ShieldAlert,
  Search, Eye, Clock, Terminal, ChevronDown, CheckSquare, Plus, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [emails, setEmails] = useState([]);
  const [liveGyms, setLiveGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // Onboarding Modal state
  const [onboardApp, setOnboardApp] = useState(null); // application data when modal is open
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState(120);
  const [priority, setPriority] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80');
  const [hours, setHours] = useState('06:00 - 22:00');
  
  // Prefilled Amenities / Equipment
  const [amenities, setAmenities] = useState(['Air Conditioning (AC)', 'Free Parking', 'Locker Rooms & Lockers', 'Showers & Changing Rooms']);
  const [equipment, setEquipment] = useState(['Treadmills (Cardio)', 'Free Weights (Dumbbells & Barbells)', 'Squat Racks & Power Cages', 'Bench Press (Flat, Incline & Decline)']);

  // Onboard Credentials Result state
  const [onboardResult, setOnboardResult] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load Admin Data
  async function loadAdminData() {
    try {
      const appRes = await fetch('/api/admin/partners', { cache: 'no-store' });
      const appData = await appRes.json();
      if (appRes.ok) setApplications(appData);

      const emailRes = await fetch('/api/admin/emails', { cache: 'no-store' });
      const emailData = await emailRes.json();
      if (emailRes.ok) setEmails(emailData);

      const gymRes = await fetch('/api/venues', { cache: 'no-store' });
      const gymData = await gymRes.json();
      if (gymRes.ok) setLiveGyms(gymData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status]);

  useEffect(() => {
    if (session && session.user?.role === 'admin') {
      loadAdminData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading administrator dashboard...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="detail-card" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--red)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ color: 'var(--red)', marginBottom: '16px', fontWeight: 800 }}>Access Denied</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>This area is strictly restricted to platform administrators only.</p>
          <Link href="/"><button className="btn-primary">Return Home</button></Link>
        </div>
      </div>
    );
  }

  // Handle Application Actions
  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      addToast('Please write a rejection reason.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectingApp._id, action: 'reject', reason: rejectionReason })
      });
      if (res.ok) {
        addToast('Application rejected successfully.', 'success');
        setRejectingApp(null);
        setRejectionReason('');
        loadAdminData();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to reject application', 'error');
      }
    } catch (err) {
      addToast('Network error while rejecting application', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboardSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: onboardApp._id,
          action: 'onboard',
          address,
          description,
          pricePerHour,
          image,
          amenities,
          equipment,
          hours,
          priority
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOnboardResult(data.credentials);
        addToast('Venue onboarding completed successfully!', 'success');
        setOnboardApp(null);
        loadAdminData();
      } else {
        addToast(data.error || 'Failed to onboard gym', 'error');
      }
    } catch (err) {
      addToast('Network error while onboarding partner', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');

  // Toggle checklist arrays
  const handleCheckboxChange = (val, state, setter) => {
    if (state.includes(val)) {
      setter(state.filter(item => item !== val));
    } else {
      setter([...state, val]);
    }
  };

  const unsplashGymImages = [
    { label: 'Gold Heavy Barbells', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
    { label: 'Modern Dumbbell Racks', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80' },
    { label: 'Dumbbells & Cardio Hall', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80' },
    { label: 'Serene Yoga Studio Floor', url: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80' },
    { label: 'Heavy Olympic Platform', url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80' },
    { label: 'Treadmills Row Venue', url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80' }
  ];

  return (
    <div className="container" style={{ padding: '120px 24px 80px 24px', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '24px', marginBottom: '32px' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', color: 'var(--red)', fontWeight: 800, textTransform: 'uppercase' }}>Administrator Console</span>
        <h1 className="dash-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>Platform Overview</h1>
      </div>

      {/* METRIC CHIPS */}
      <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="dash-stat">
          <div className="dash-stat-icon blue"><Clock size={20} /></div>
          <div className="dash-stat-val">{pendingApps.length}</div>
          <div className="dash-stat-lbl">Pending Applications</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon green"><CheckCircle size={20} /></div>
          <div className="dash-stat-val">{approvedApps.length}</div>
          <div className="dash-stat-lbl">Active Partner Venues</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-icon orange"><Users size={20} /></div>
          <div className="dash-stat-val">{applications.length}</div>
          <div className="dash-stat-lbl">Total Registrations</div>
        </div>
      </div>

      {/* MAIN ADMIN GRID: APPLICATIONS LEFT, EMAIL LOGS RIGHT */}
      <div className="admin-layout">
        
        {/* LEFT COLUMN: APPLICATIONS LIST & LIVE GYMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* APPLICATIONS CARD */}
          <div className="detail-card" style={{ padding: '28px', minHeight: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Venue Registration Applications</h2>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--surface-alt)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.8rem', 
                    fontWeight: filter === f ? 700 : 500,
                    background: filter === f ? 'var(--card)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: filter === f ? 'var(--text)' : 'var(--muted)',
                    cursor: 'pointer',
                    boxShadow: filter === f ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px var(--muted)', color: 'var(--muted)' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              No applications match this filter status.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredApps.map((app) => {
                const badgeColor = app.status === 'approved' ? 'status-completed' : (app.status === 'rejected' ? 'status-cancelled' : 'status-upcoming');
                
                // 1. Check if email/phone is already registered with another approved gym
                const isSecondRequest = applications.some(other => 
                  other._id !== app._id && 
                  other.status === 'approved' && 
                  (other.email === app.email || other.phone === app.phone)
                );

                // 2. Check if there was a previous rejected application for this email/phone
                const previousRejectedApp = applications.find(other => 
                  other._id !== app._id && 
                  other.status === 'rejected' && 
                  (other.email === app.email || other.phone === app.phone)
                );

                return (
                  <div key={app._id} className="booking-item" style={{ margin: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`status-badge ${badgeColor}`} style={{ width: 'fit-content', textTransform: 'capitalize', marginBottom: '4px' }}>{app.status}</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{app.venueName}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          Owner: <strong>{app.ownerName}</strong> • {app.email}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          Contact: <strong>{app.phone}</strong> • City: <strong>{app.city}</strong>
                        </p>

                        {/* Duplicate / Second Request Alert */}
                        {isSecondRequest && (
                          <div style={{ marginTop: '4px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <AlertCircle size={13} /> Second Request: Email/Phone already registered with an active gym.
                          </div>
                        )}

                        {/* Re-registration / Previous Rejection Alert */}
                        {app.status === 'pending' && previousRejectedApp && (
                          <div style={{ marginTop: '4px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--red)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                              <AlertCircle size={13} /> Re-registration Request (Previously Rejected)
                            </div>
                            {previousRejectedApp.rejectionReason && (
                              <div style={{ opacity: 0.85, fontSize: '0.75rem', marginLeft: '21px' }}>
                                Previous Rejection Reason: <strong>{previousRejectedApp.rejectionReason}</strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Display rejection reason for this specific rejected application */}
                        {app.status === 'rejected' && app.rejectionReason && (
                          <div style={{ marginTop: '4px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px 12px', color: 'var(--red)', fontSize: '0.8rem' }}>
                            Rejection Reason: <strong>{app.rejectionReason}</strong>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                          className="btn-outline"
                          onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                          style={{ padding: '8px 12px', fontSize: '0.8rem', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {expandedApp === app._id ? 'Hide Details' : 'View Details'} <ChevronDown size={14} style={{ transform: expandedApp === app._id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button 
                              className="btn-primary" 
                              onClick={() => {
                                setOnboardApp(app);
                                setAddress(app.address || `${app.city}, India`);
                                setHours(app.operatingHours || '06:00 - 22:00');
                                setPriority(0);
                                setAmenities(app.amenities && app.amenities.length > 0 ? app.amenities : ['Air Conditioning (AC)', 'Free Parking', 'Locker Rooms & Lockers', 'Showers & Changing Rooms']);
                                setEquipment(app.equipment && app.equipment.length > 0 ? app.equipment : ['Treadmills (Cardio)', 'Free Weights (Dumbbells & Barbells)', 'Squat Racks & Power Cages', 'Bench Press (Flat, Incline & Decline)']);
                                setDescription(`Premium verified gym in ${app.city} featuring a clean workout floor, verified amenities, and modern equipment.`);
                              }}
                              style={{ padding: '8px 16px', fontSize: '0.85rem', height: '36px', borderRadius: '8px' }}
                            >
                              Verify & Onboard
                            </button>
                            <button 
                              className="btn-outline" 
                              onClick={() => {
                                setRejectingApp(app);
                                setRejectionReason('');
                              }}
                              style={{ padding: '8px 16px', fontSize: '0.85rem', height: '36px', borderRadius: '8px', color: 'var(--red)', borderColor: 'rgba(255, 62, 0, 0.2)' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} color="var(--green)" /> Active Network Member
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={14} color="var(--red)" /> Rejected
                            </span>
                            <button 
                              className="btn-primary" 
                              onClick={() => {
                                setOnboardApp(app);
                                setAddress(app.address || `${app.city}, India`);
                                setHours(app.operatingHours || '06:00 - 22:00');
                                setPriority(0);
                                setAmenities(app.amenities && app.amenities.length > 0 ? app.amenities : ['Air Conditioning (AC)', 'Free Parking', 'Locker Rooms & Lockers', 'Showers & Changing Rooms']);
                                setEquipment(app.equipment && app.equipment.length > 0 ? app.equipment : ['Treadmills (Cardio)', 'Free Weights (Dumbbells & Barbells)', 'Squat Racks & Power Cages', 'Bench Press (Flat, Incline & Decline)']);
                                setDescription(`Premium verified gym in ${app.city} featuring a clean workout floor, verified amenities, and modern equipment.`);
                              }}
                              style={{ padding: '8px 16px', fontSize: '0.85rem', height: '36px', borderRadius: '8px' }}
                            >
                              Re-verify & Onboard
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Details Drawer */}
                    <AnimatePresence>
                      {expandedApp === app._id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden', borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '4px' }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', color: 'var(--text)' }}>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Full Street Address</span>
                              <strong>{app.address || 'Not Provided'} - {app.pincode || ''}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Operating Hours</span>
                              <strong>{app.operatingHours || 'Not Provided'}</strong>
                            </div>
                            {app.mapsLink && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Google Maps Location</span>
                                <a href={app.mapsLink} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline', wordBreak: 'break-all' }}>{app.mapsLink}</a>
                              </div>
                            )}
                            {app.website && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>Website / Social Media URL</span>
                                <a href={app.website} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>{app.website}</a>
                              </div>
                            )}
                            {app.amenities && app.amenities.length > 0 && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Amenities Claimed</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {app.amenities.map(a => (
                                    <span key={a} style={{ fontSize: '0.7rem', background: 'rgba(255, 62, 0, 0.05)', color: 'var(--red)', border: '1px solid rgba(255, 62, 0, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>{a}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {app.equipment && app.equipment.length > 0 && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Equipment Claimed</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {app.equipment.map(eq => (
                                    <span key={eq} style={{ fontSize: '0.7rem', background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: '4px' }}>{eq}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Venue Directory Card */}
        <div className="detail-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Live Venue Directory</h2>
          {liveGyms.length === 0 ? (
            <span style={{ color: 'var(--muted)', display: 'block', padding: '20px', textAlign: 'center' }}>No live venues found.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {liveGyms.map(gym => (
                <div key={gym._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: '12px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&q=80'} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <strong style={{ fontSize: '1.05rem', display: 'block' }}>{gym.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>{gym.address}, {gym.city}</span>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Base Price: <strong>₹{gym.pricePerHour}/hr</strong></span>
                        <span style={{ color: 'var(--line)' }}>|</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Priority: <strong>{gym.priority || 0}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      className="btn-outline"
                      onClick={async () => {
                        const newPriority = window.prompt(`Set listing position for ${gym.name} (1 = 1st position, 2 = 2nd position, etc.):`, gym.priority || 0);
                        if (newPriority === null) return;
                        const priorityNum = Number(newPriority);
                        if (isNaN(priorityNum)) {
                          alert('Priority must be a valid number.');
                          return;
                        }
                        try {
                          const res = await fetch(`/api/admin/venues/${gym._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ priority: priorityNum })
                          });
                          if (res.ok) {
                            addToast('Priority updated successfully!', 'success');
                            loadAdminData();
                          } else {
                            const err = await res.json();
                            addToast(err.error || 'Failed to update priority', 'error');
                          }
                        } catch (e) {
                          addToast('Failed to update priority', 'error');
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', height: '32px', borderRadius: '6px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--text)' }}
                    >
                      Set Priority
                    </button>
                    
                    <button 
                      onClick={async () => {
                        if (!window.confirm(`Are you sure you want to remove ${gym.name} from the Clickongo network? This action is permanent and will remove it from the customer explore page.`)) return;
                        try {
                          const res = await fetch(`/api/venues/${gym._id}`, { method: 'DELETE' });
                          if (res.ok) {
                            addToast('Venue removed successfully!', 'success');
                            loadAdminData();
                          } else {
                            const err = await res.json();
                            addToast(err.error || 'Failed to remove gym', 'error');
                          }
                        } catch (e) {
                          addToast('Failed to remove gym', 'error');
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', height: '32px', borderRadius: '6px', border: 'none', background: 'rgba(255, 62, 0, 0.1)', color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div> {/* End Left Column wrapper */}

      {/* RIGHT COLUMN: SMTP SIMULATOR CONSOLE */}
        <div className="detail-card" style={{ padding: '24px', background: '#0a0a0f', border: '1px solid #1a1a24', color: '#30d158' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} /> SMTP simulated mailer logs
          </h3>
          <p style={{ color: '#8e8e93', fontSize: '0.78rem', marginBottom: '20px', lineHeight: 1.4 }}>
            System logs of all outgoing email notifications sent to gym owners and admins during partner onboarding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {emails.length === 0 ? (
              <span style={{ color: '#8e8e93', textAlign: 'center', padding: '20px', display: 'block' }}>No outgoing emails logged yet.</span>
            ) : (
              emails.map((email) => (
                <div key={email._id} style={{ background: '#12121e', border: '1px solid #242436', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: '#ffd60a', display: 'flex', justifyContent: 'space-between' }}>
                    <span>To: {email.to}</span>
                    <span style={{ color: '#8e8e93', fontSize: '0.65rem' }}>{new Date(email.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: '#00f0ff', fontWeight: 700 }}>Subject: {email.subject}</div>
                  <div style={{ color: '#e5e5ea', whiteSpace: 'pre-line', borderTop: '1px dashed #242436', paddingTop: '6px', fontSize: '0.7rem' }}>
                    {email.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── VERIFY & ONBOARD MODAL ── */}
      <AnimatePresence>
        {onboardApp && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="detail-card" 
              style={{ maxWidth: '580px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Verify & Onboard Venue</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Fill in verified details for <strong style={{ color: 'var(--text)' }}>{onboardApp.venueName}</strong> to publish them to explore section.
                </p>
              </div>

              <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div className="form-group">
                  <label>Verified Address</label>
                  <input 
                    type="text" 
                    className="auth-input" 
                    required 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="123 Venue Road, Satellite Area"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Verified Operating Hours</label>
                  <input 
                    type="text" 
                    className="auth-input" 
                    required 
                    value={hours} 
                    onChange={e => setHours(e.target.value)} 
                    placeholder="06:00 - 22:00"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Base Price per Hour (₹)</label>
                    <input 
                      type="number" 
                      className="auth-input" 
                      required 
                      value={pricePerHour} 
                      onChange={e => setPricePerHour(e.target.value)} 
                      min="50"
                      max="1000"
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Listing Position (1 = 1st, 2 = 2nd, etc.)</label>
                    <input 
                      type="number" 
                      className="auth-input" 
                      required 
                      value={priority} 
                      onChange={e => setPriority(Number(e.target.value))} 
                      min="0"
                      max="1000"
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Venue Hero Photo</label>
                  <select 
                    className="auth-input" 
                    value={image} 
                    onChange={e => setImage(e.target.value)}
                    style={{ marginTop: '6px' }}
                  >
                    {unsplashGymImages.map((img, i) => (
                      <option key={i} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ambience & Description</label>
                  <textarea 
                    className="auth-input" 
                    required 
                    rows="3"
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a verification summary about gym facilities, atmosphere, and amenities."
                    style={{ marginTop: '6px', height: '80px', padding: '12px', resize: 'none' }}
                  />
                </div>

                {/* AMENITIES CHECKBOXES */}
                <div className="form-group">
                  <label>Verified Amenities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
                    {[
                      'Air Conditioning (AC)',
                      'Free Parking',
                      'Locker Rooms & Lockers',
                      'Showers & Changing Rooms',
                      'Drinking Water Station (RO)',
                      'Towel Service',
                      'Steam & Sauna Bath',
                      'Juice & Protein Shake Bar',
                      'Free High-Speed WiFi',
                      'CCTV Surveillance & Security',
                      'First Aid & AED Support',
                      'Music & Sound System',
                      'Personal Trainer Services',
                      'In-house Physiotherapist',
                      'Dedicated Restrooms'
                    ].map(a => (
                      <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={amenities.includes(a)}
                          onChange={() => handleCheckboxChange(a, amenities, setAmenities)}
                        />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* EQUIPMENT CHECKBOXES */}
                <div className="form-group">
                  <label>Verified Equipment</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '8px' }}>
                    {[
                      'Treadmills (Cardio)',
                      'Elliptical Trainers',
                      'Stationary Spin Bikes',
                      'Rowing Machines',
                      'Free Weights (Dumbbells & Barbells)',
                      'Squat Racks & Power Cages',
                      'Bench Press (Flat, Incline & Decline)',
                      'Cable Crossover Machine',
                      'Leg Press Machine',
                      'Leg Extension & Curl Machine',
                      'Smith Machine',
                      'Pull-up & Dip Station',
                      'Lat Pulldown & Low Row Machine',
                      'Chest & Shoulder Press Machine',
                      'Pec Deck / Rear Delt Fly Machine',
                      'Kettlebells & Resistance Bands',
                      'Yoga Mats & Foam Rollers',
                      'Punching Bag & Boxing Area',
                      'Battle Ropes & Plyo Boxes',
                      'Preacher Curl Bench'
                    ].map(e => (
                      <label key={e} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text)', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={equipment.includes(e)}
                          onChange={() => handleCheckboxChange(e, equipment, setEquipment)}
                        />
                        <span>{e}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={submitting}
                    style={{ flexGrow: 1, height: '48px', borderRadius: '10px' }}
                  >
                    {submitting ? 'Onboarding Partner...' : 'Confirm Verification & Onboard'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={() => setOnboardApp(null)}
                    style={{ height: '48px', borderRadius: '10px', padding: '0 20px' }}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REJECT REASON MODAL ── */}
      <AnimatePresence>
        {rejectingApp && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="detail-card" 
              style={{ maxWidth: '480px', width: '100%', padding: '32px' }}
            >
              <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--red)' }}>Reject Venue Application</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Please provide a reason for rejecting <strong style={{ color: 'var(--text)' }}>{rejectingApp.venueName}</strong>. This will be sent to the owner.
                </p>
              </div>
              <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label>Reason for Rejection</label>
                  <textarea 
                    className="auth-input" 
                    required 
                    rows="4" 
                    value={rejectionReason} 
                    onChange={e => setRejectionReason(e.target.value)} 
                    placeholder="Enter details on why the application does not meet criteria..." 
                    style={{ marginTop: '6px', width: '100%', minHeight: '100px', padding: '12px', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }}
                    disabled={loading}
                  >
                    Confirm Rejection
                  </button>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    style={{ flex: 1 }} 
                    onClick={() => setRejectingApp(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ONBOARD CREDENTIALS MODAL ── */}
      <AnimatePresence>
        {onboardResult && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '24px' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="detail-card" 
              style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}
            >
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Partner Onboarded!</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
                A welcome email with login credentials has been simulated and saved to the outbox.
              </p>

              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block' }}>Dashboard Login Email:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Mail size={14} color="var(--muted)" />
                    <strong>{onboardResult.email}</strong>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem', display: 'block' }}>Temporary Password:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Key size={14} color="var(--muted)" />
                    <strong style={{ color: 'var(--red)', letterSpacing: '0.05em' }}>{onboardResult.password}</strong>
                  </div>
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={() => setOnboardResult(null)}
                style={{ width: '100%', height: '48px', borderRadius: '10px' }}
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
