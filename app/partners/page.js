'use client';
import { useState } from 'react';
import { Users, TrendingUp, Wallet, Star, CheckCircle, MapPin, Clock, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';

const iconMap = {
  users: Users,
  'trending-up': TrendingUp,
  wallet: Wallet,
  star: Star,
};

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [venueName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [website, setWebsite] = useState('');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registrationRef, setRegistrationRef] = useState('');
  const { addToast } = useToast();

  const availableAmenities = [
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
  ];
  const availableEquipment = [
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
  ];

  const handleGymNameChange = (e) => {
    setGymName(e.target.value.slice(0, 100));
  };

  const handleOwnerNameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    setOwnerName(clean);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value.trim().toLowerCase().slice(0, 100));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    const clean = (val.startsWith('+') ? '+' + val.slice(1).replace(/[^0-9]/g, '') : val.replace(/[^0-9]/g, '')).slice(0, 15);
    setPhone(clean);
  };

  const handlePincodeChange = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(clean);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value.slice(0, 200));
  };

  const handleMapsLinkChange = (e) => {
    setMapsLink(e.target.value.trim().slice(0, 500));
  };

  const handleWebsiteChange = (e) => {
    setWebsite(e.target.value.trim().slice(0, 300));
  };

  const handleAmenityChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleEquipmentChange = (eq) => {
    if (selectedEquipment.includes(eq)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== eq));
    } else {
      setSelectedEquipment([...selectedEquipment, eq]);
    }
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!venueName.trim() || !ownerName.trim() || !email.trim() || !phone.trim()) {
        addToast('Please fill in all basic contact details.', 'error');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        addToast('Please enter a valid email address.', 'error');
        return false;
      }
      const phoneClean = phone.replace(/[^0-9+]/g, '');
      if (phoneClean.length < 10 || phoneClean.length > 15) {
        addToast('Please enter a valid phone number (10-15 digits).', 'error');
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (!city || !address.trim() || !pincode.trim() || !openTime || !closeTime) {
        addToast('Please fill in city, street address, pincode, and hours.', 'error');
        return false;
      }
      if (pincode.trim().length !== 6) {
        addToast('Pincode must be exactly 6 digits.', 'error');
        return false;
      }
      if (mapsLink.trim() && !/^https?:\/\//i.test(mapsLink.trim())) {
        addToast('Google Maps Link must be a valid URL starting with http:// or https://', 'error');
        return false;
      }
      return true;
    }
    if (s === 3) {
      if (website.trim() && !/^https?:\/\//i.test(website.trim())) {
        addToast('Website or Instagram URL must start with http:// or https://', 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          venueName, 
          ownerName, 
          email, 
          phone, 
          city,
          address,
          pincode,
          mapsLink,
          website,
          operatingHours: `${openTime} - ${closeTime}`,
          amenities: selectedAmenities,
          equipment: selectedEquipment
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrationRef(data.refCode || 'GGO-REG-XXXXXX');
        setSubmitted(true);
        addToast('Application submitted successfully!', 'success');
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to submit application', 'error');
      }
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
    }
    setSubmitting(false);
  }

  const benefits = [
    { icon: 'trending-up', title: 'Fill Empty Slots', desc: 'Monetize your off-peak hours by allowing users to book unused capacity dynamically.' },
    { icon: 'users', title: 'Guaranteed Footfall', desc: 'Get discovered by serious fitness enthusiasts looking for premium gym experiences in your exact area.' },
    { icon: 'wallet', title: 'Zero Onboarding Fees', desc: 'No hidden charges or setup costs. You only pay a small commission when a user books a slot.' },
    { icon: 'star', title: 'Weekly Payouts', desc: 'Enjoy hassle-free weekly settlements directly to your bank account with complete transparency.' },
  ];

  return (
    <>
      <section className="partners-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1600&q=80&fit=crop"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
          />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="section-badge">For gym owners</div>
          <h1 className="hero-title">Grow your gym with Clickongo</h1>
          <p className="hero-sub" style={{ margin: '16px auto', maxWidth: 500 }}>
            List your gym and reach thousands of active fitness seekers in your city.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--card-border)', background: 'var(--surface)' }}>
        <div className="container">
          <div>
            <h2 className="section-title" style={{ textAlign: 'center', margin: '0 auto 48px auto' }}>Why Partner With Us?</h2>
            <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {benefits.map((b, i) => {
                const Icon = iconMap[b.icon];
                return (
                  <motion.div
                    className="benefit-card"
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    style={{ padding: '24px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '16px' }}
                  >
                    <div className="benefit-icon" style={{ marginBottom: '16px', background: 'rgba(255,62,0,0.1)', color: 'var(--red)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 700 }}>{b.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.5 }}>{b.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="partner-form-section">
        {!submitted ? (
          <>
            <h2>Register Your Venue</h2>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 24 }}>
              Partner with Clickongo to list your gym, open slots, and grow your revenue.
            </p>

            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative', maxWidth: '500px', margin: '0 auto 32px auto' }}>
              <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: 'var(--line)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '16px', left: '10%', width: step === 1 ? '0%' : step === 2 ? '40%' : '80%', height: '2px', background: 'var(--red)', zIndex: 0, transition: 'all 0.3s' }} />

              {[
                { num: 1, label: 'Basic Info' },
                { num: 2, label: 'Location & Hours' },
                { num: 3, label: 'Facilities' }
              ].map((s) => (
                <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative', width: '30%' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: step >= s.num ? 'var(--red)' : 'var(--surface-alt)', 
                    color: step >= s.num ? '#fff' : 'var(--muted)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: step >= s.num ? 'none' : '1px solid var(--line)',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s'
                  }}>
                    {s.num}
                  </div>
                  <span style={{ fontSize: '0.72rem', marginTop: '6px', color: step >= s.num ? 'var(--text)' : 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
                </div>
              ))}
            </div>

            <form className="partner-form" onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>Step 1: Contact Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Venue Name</label>
                      <input type="text" maxLength={100} placeholder="Elite Fitness Club" required value={venueName} onChange={handleGymNameChange} />
                    </div>
                    <div className="form-group">
                      <label>Owner Name</label>
                      <input type="text" maxLength={50} placeholder="Rajesh Sharma" required value={ownerName} onChange={handleOwnerNameChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" maxLength={100} placeholder="gym@example.com" required value={email} onChange={handleEmailChange} />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input type="tel" maxLength={15} placeholder="+91 98765 43210" required value={phone} onChange={handlePhoneChange} />
                    </div>
                  </div>
                  <button type="button" className="btn-primary" onClick={nextStep} style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Continue to Location <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>Step 2: Location & Timing</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <select required value={city} onChange={(e) => setCity(e.target.value)}>
                        <option value="">Select city</option>
                        <option>Mumbai</option>
                        <option>Bengaluru</option>
                        <option>Delhi</option>
                        <option>Ahmedabad</option>
                        <option>Chennai</option>
                        <option>Hyderabad</option>
                        <option>Pune</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pincode / Zip Code</label>
                      <input type="text" maxLength={6} placeholder="400001" required value={pincode} onChange={handlePincodeChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Full Street Address</label>
                    <input type="text" maxLength={200} placeholder="Shop 5, Ground Floor, Sector 15, Near Central Mall" required value={address} onChange={handleAddressChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Opening Time</label>
                      <input type="time" required value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Closing Time</label>
                      <input type="time" required value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Google Maps Location Link (Optional)</label>
                    <input type="url" maxLength={500} placeholder="https://maps.google.com/..." value={mapsLink} onChange={handleMapsLinkChange} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" className="btn-outline" onClick={prevStep} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="button" className="btn-primary" onClick={nextStep} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      Continue to Facilities <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>Step 3: Amenities & Equipment</h3>
                  <div style={{ background: 'rgba(255, 60, 60, 0.08)', border: '1px solid rgba(255, 60, 60, 0.2)', padding: '12px 16px', borderRadius: '8px', color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
                    <span>Kindly select the below items carefully because if the details failed to match during offline verification, your gym may face rejection.</span>
                  </div>
                  <div className="form-group">
                    <label>Website or Instagram Handle (Optional)</label>
                    <input type="url" maxLength={300} placeholder="https://instagram.com/mygym" value={website} onChange={handleWebsiteChange} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '.75rem', letterSpacing: '.08em', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Amenities Available</span>
                      <button type="button" onClick={() => setSelectedAmenities(selectedAmenities.length === availableAmenities.length ? [] : [...availableAmenities])} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        {selectedAmenities.length === availableAmenities.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                      {availableAmenities.map(a => (
                        <label key={a} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          fontSize: '0.88rem', 
                          color: 'var(--text)', 
                          cursor: 'pointer', 
                          background: 'var(--surface-alt)', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: selectedAmenities.includes(a) ? '1px solid var(--red)' : '1px solid var(--line)',
                          textTransform: 'none',
                          fontWeight: '500',
                          letterSpacing: 'normal',
                          marginBottom: 0
                        }}>
                          <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => handleAmenityChange(a)} style={{ width: '18px', height: '18px', accentColor: 'var(--red)', cursor: 'pointer', flexShrink: 0, padding: 0 }} />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '.75rem', letterSpacing: '.08em', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Equipment Available</span>
                      <button type="button" onClick={() => setSelectedEquipment(selectedEquipment.length === availableEquipment.length ? [] : [...availableEquipment])} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        {selectedEquipment.length === availableEquipment.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                      {availableEquipment.map(eq => (
                        <label key={eq} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          fontSize: '0.88rem', 
                          color: 'var(--text)', 
                          cursor: 'pointer', 
                          background: 'var(--surface-alt)', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: selectedEquipment.includes(eq) ? '1px solid var(--red)' : '1px solid var(--line)',
                          textTransform: 'none',
                          fontWeight: '500',
                          letterSpacing: 'normal',
                          marginBottom: 0
                        }}>
                          <input type="checkbox" checked={selectedEquipment.includes(eq)} onChange={() => handleEquipmentChange(eq)} style={{ width: '18px', height: '18px', accentColor: 'var(--red)', cursor: 'pointer', flexShrink: 0, padding: 0 }} />
                          <span>{eq}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" className="btn-outline" onClick={prevStep} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={submitting}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={submitting}>
                      {submitting ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </>
        ) : (
          <div className="partner-success" style={{ maxWidth: '640px', margin: '0 auto', padding: '36px', background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Application Received Successfully!</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Your request is in our system. A confirmation email has been logged to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Registration Ref:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--red)', fontSize: '1rem' }}>{registrationRef}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Venue Name</span>
                  <strong>{venueName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Owner Name</span>
                  <strong>{ownerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Contact Phone</span>
                  <strong>{phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Location/City</span>
                  <strong>{address}, {city} - {pincode}</strong>
                </div>
                {mapsLink && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Google Maps Link</span>
                    <a href={mapsLink} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', fontSize: '0.85rem', textDecoration: 'underline', wordBreak: 'break-all' }}>{mapsLink}</a>
                  </div>
                )}
                {website && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Website/Social</span>
                    <a href={website} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', fontSize: '0.85rem', textDecoration: 'underline' }}>{website}</a>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Operating Hours</span>
                  <strong>{openTime} - {closeTime}</strong>
                </div>
                {selectedAmenities.length > 0 && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Amenities Offered</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {selectedAmenities.map(a => (
                        <span key={a} style={{ fontSize: '0.72rem', background: 'var(--surface-alt)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEquipment.length > 0 && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.78rem' }}>Equipment Available</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {selectedEquipment.map(eq => (
                        <span key={eq} style={{ fontSize: '0.72rem', background: 'var(--surface-alt)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>{eq}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>What happens next?</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                {[
                  { title: 'In-person Verification Visit', desc: 'A representative from our company will reach out to you within 24 hours to schedule a verification visit.' },
                  { title: 'Amenities & Ambience Check', desc: 'During the visit, we will inspect your gym facilities, verified equipment lists, overall ambience, and document credentials.' },
                  { title: 'Profile Setup & Onboarding', desc: 'Once verified, our admin will create your official gym profile in the explore section and generate your secure dashboard credentials.' },
                  { title: 'Email with Credentials', desc: 'You will receive an email containing your dashboard username and temporary password to begin setting slots and managing check-ins.' }
                ].map((step, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text)' }}>{step.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px', display: 'block', lineHeight: 1.4 }}>{step.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
