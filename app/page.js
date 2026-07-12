'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  CalendarCheck, 
  QrCode, 
  ArrowRight, 
  Zap, 
  HelpCircle, 
  ChevronDown,
  Users,
  TrendingUp,
  Wallet,
  Star,
  CheckCircle,
  Clock,
  Search,
  Dumbbell,
  Gift,
  GitCompare,
  ChevronRight,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Each "screen" in the walkthrough carousel
const DEMO_SCREENS = [
  {
    id: 'home',
    label: '🏠 Landing Page',
    desc: 'Users discover Clickongo — no subscription, no commitment.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #1a0a00 60%, #0d0d0f 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 12 }}>
        {/* Fake navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '-0.02em' }}>Click<span style={{ color: '#ff3e00' }}>ongo</span></span>
          <div style={{ background: '#ff3e00', borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem', fontWeight: 700, color: '#fff' }}>Start Free</div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(255,62,0,0.12)', border: '1px solid rgba(255,62,0,0.3)', borderRadius: 999, padding: '4px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#ff3e00', width: 'fit-content' }}>⚡ Instant Access · Zero Contracts</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1, color: '#fff' }}>Train on<br /><span style={{ color: '#ff3e00' }}>Your Terms</span></div>
          <div style={{ fontSize: '0.62rem', color: '#a0aab8', lineHeight: 1.5 }}>Book gym sessions by the hour. No membership. No lock-in.</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: '#ff3e00', borderRadius: 999, padding: '6px 12px', fontSize: '0.6rem', fontWeight: 800, color: '#fff' }}>Find Venues →</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>See how it works</div>
          </div>
        </div>
        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['₹80 /hr', 'No Fees', 'QR Scan'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 8px', fontSize: '0.58rem', fontWeight: 700, color: '#a0aab8' }}>{t}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'explore',
    label: '🔍 Explore Venues',
    desc: 'Filter by city, price, equipment. Compare up to 3 venues side-by-side.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #0a0a1a 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>Find Venues</div>
        {/* Search */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={11} color="#a0aab8" />
          <span style={{ fontSize: '0.6rem', color: '#a0aab8' }}>Search venues near you...</span>
        </div>
        {/* Compare hint */}
        <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, padding: '6px 8px', fontSize: '0.55rem', color: '#00f0ff', fontWeight: 600 }}>
          <GitCompare size={10} style={{ display: 'inline', marginRight: 4 }} />Compare venues side by side →
        </div>
        {/* Venue cards */}
        {[
          { name: 'Stark Fitness', area: 'Koramangala', price: 120, rating: 4.8, color: '#ff3e00' },
          { name: 'Iron Paradise', area: 'Indiranagar', price: 90, rating: 4.6, color: '#00f0ff' },
        ].map((gym, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${gym.color}22`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 55, background: `linear-gradient(135deg, ${gym.color}33, rgba(0,0,0,0.5))`, display: 'flex', alignItems: 'flex-end', padding: '6px 8px', justifyContent: 'space-between' }}>
              <div style={{ background: gym.color, borderRadius: 999, padding: '2px 7px', fontSize: '0.58rem', fontWeight: 800, color: i === 0 ? '#fff' : '#000' }}>₹{gym.price}/hr</div>
              <Heart size={12} color="rgba(255,255,255,0.4)" />
            </div>
            <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.65rem' }}>{gym.name}</div>
                <div style={{ fontSize: '0.55rem', color: '#a0aab8', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={8} />{gym.area}</div>
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#e2ff2b' }}>★ {gym.rating}</div>
            </div>
            <div style={{ padding: '0 8px 8px', display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, border: '1px solid rgba(0,240,255,0.25)', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: '0.55rem', color: '#00f0ff', fontWeight: 700 }}>+ Add to Compare</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'compare',
    label: '⚖️ Compare Venues',
    desc: 'Side-by-side comparison of price, amenities, rating & equipment.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #001a1a 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <GitCompare size={13} color="#00f0ff" /> Venue Comparison
        </div>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 6 }}>
          <div />
          {['Stark Fitness', 'Iron Paradise'].map((name, i) => (
            <div key={i} style={{ background: i === 0 ? 'rgba(255,62,0,0.1)' : 'rgba(0,240,255,0.08)', border: `1px solid ${i === 0 ? 'rgba(255,62,0,0.3)' : 'rgba(0,240,255,0.25)'}`, borderRadius: 10, padding: '6px 4px', textAlign: 'center', fontSize: '0.56rem', fontWeight: 800 }}>
              {i === 0 && <div style={{ background: '#ff3e00', color: '#fff', borderRadius: 999, fontSize: '0.5rem', padding: '1px 6px', marginBottom: 3 }}>🏆 Best Value</div>}
              {name}
            </div>
          ))}
        </div>
        {/* Rows */}
        {[
          { label: 'Price/hr', vals: ['₹120', '₹90'], best: 1 },
          { label: 'Rating', vals: ['4.8 ★', '4.6 ★'], best: 0 },
          { label: 'WiFi', vals: ['✓', '✓'], best: null },
          { label: 'Sauna', vals: ['✓', '✗'], best: 0 },
          { label: 'Parking', vals: ['✗', '✓'], best: 1 },
        ].map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 6, alignItems: 'center' }}>
            <div style={{ fontSize: '0.58rem', color: '#a0aab8', fontWeight: 600 }}>{row.label}</div>
            {row.vals.map((v, vi) => (
              <div key={vi} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: row.best === vi ? 800 : 500, color: row.best === vi ? '#30d158' : v === '✗' ? '#a0aab8' : '#fff', background: row.best === vi ? 'rgba(48,209,88,0.08)' : 'transparent', borderRadius: 6, padding: '3px 0' }}>{v}</div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'gymdetail',
    label: '🏋️ Venue Detail',
    desc: 'View amenities, ratings, and pick your preferred hour slot.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #1a0500 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Venue hero img */}
        <div style={{ height: 90, background: 'linear-gradient(135deg, rgba(255,62,0,0.4), rgba(0,0,0,0.8))', display: 'flex', alignItems: 'flex-end', padding: '8px 12px', position: 'relative' }}>
          <Dumbbell size={28} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', right: 12, top: 12 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#fff' }}>Stark Fitness</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={9} />Koramangala, Bengaluru</div>
          </div>
          <div style={{ marginLeft: 'auto', background: '#ff3e00', padding: '4px 8px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>₹120/hr</div>
        </div>
        <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ fontSize: '0.6rem', color: '#e2ff2b', fontWeight: 700 }}>★ 4.8 (142 reviews)</div>
            <div style={{ fontSize: '0.6rem', color: '#a0aab8' }}>06:00 – 22:00</div>
          </div>
          {/* Amenities */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['WiFi', 'AC', 'Sauna', 'Showers'].map(a => (
              <div key={a} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 6px', fontSize: '0.55rem', color: '#a0aab8' }}>{a}</div>
            ))}
          </div>
          {/* Slots */}
          <div style={{ fontSize: '0.62rem', fontWeight: 700, marginTop: 2 }}>Select Time Slot</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {['06:00', '07:00', '08:00', '09:00', '18:00', '19:00'].map((t, i) => (
              <div key={t} style={{ background: i === 2 ? '#ff3e00' : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 2 ? '#ff3e00' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '5px 4px', textAlign: 'center', fontSize: '0.58rem', fontWeight: i === 2 ? 800 : 500, color: i === 2 ? '#fff' : '#a0aab8' }}>{t}</div>
            ))}
          </div>
          {/* Book button */}
          <div style={{ background: 'linear-gradient(135deg, #ff3e00, #e2ff2b)', borderRadius: 10, padding: '9px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#000', marginTop: 'auto' }}>Pay ₹120 from Wallet</div>
        </div>
      </div>
    ),
  },
  {
    id: 'booking',
    label: '✅ Booking Confirmed',
    desc: 'Wallet deducted, QR code generated. Scan at gym entry to check in.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #001a08 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', gap: 12, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(48,209,88,0.15)', border: '2px solid #30d158', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CheckCircle size={30} color="#30d158" />
        </motion.div>
        <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#30d158' }}>Booking Confirmed!</div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px', width: '100%' }}>
          <div style={{ fontSize: '0.6rem', color: '#a0aab8', marginBottom: 4 }}>Stark Fitness · 08:00–09:00</div>
          <div style={{ width: 70, height: 70, margin: '8px auto', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
            <QrCode size={36} color="#fff" />
            <div style={{ fontSize: '0.55rem', color: '#a0aab8', fontFamily: 'monospace' }}>A3F7B2C1</div>
          </div>
          <div style={{ fontSize: '0.58rem', color: '#a0aab8', marginTop: 4 }}>Show this QR at the gym entrance</div>
        </div>
        <div style={{ background: 'rgba(226,255,43,0.08)', border: '1px solid rgba(226,255,43,0.2)', borderRadius: 10, padding: '8px 12px', width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={13} color="#e2ff2b" />
          <div style={{ fontSize: '0.58rem', color: '#e2ff2b', fontWeight: 700 }}>+10 loyalty points earned!</div>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    label: '📊 Dashboard',
    desc: 'Track streaks, workouts, wallet balance, and loyalty points — all in one place.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #0a0a20 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '14px', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>Welcome, Aditya</div>
            <div style={{ fontSize: '0.58rem', color: '#a0aab8' }}>Track your fitness journey</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '5px 8px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', color: '#a0aab8' }}>Wallet</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>₹2,450</div>
          </div>
        </div>
        {/* Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Day Streak', val: '7 🔥', color: '#e2ff2b' },
            { label: 'Total Workouts', val: '23', color: '#00f0ff' },
            { label: 'Points', val: '70/100', color: '#00f0ff' },
            { label: 'This Month', val: '8', color: '#30d158' },
          ].map(w => (
            <div key={w.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px' }}>
              <div style={{ fontSize: '0.5rem', color: '#a0aab8', marginBottom: 2 }}>{w.label}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: w.color }}>{w.val}</div>
            </div>
          ))}
        </div>
        {/* Recent booking */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px' }}>
          <div style={{ fontSize: '0.55rem', color: '#a0aab8', marginBottom: 4, fontWeight: 700 }}>UPCOMING</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.63rem', fontWeight: 700 }}>Stark Fitness</div>
              <div style={{ fontSize: '0.55rem', color: '#a0aab8' }}>Today · 08:00–09:00</div>
            </div>
            <div style={{ background: 'rgba(226,255,43,0.12)', border: '1px solid rgba(226,255,43,0.25)', borderRadius: 6, padding: '2px 7px', fontSize: '0.52rem', fontWeight: 700, color: '#e2ff2b' }}>UPCOMING</div>
          </div>
        </div>
        {/* Points bar */}
        <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: 10, padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#00f0ff', display: 'flex', alignItems: 'center', gap: 3 }}><Zap size={9} />Loyalty Points</div>
            <div style={{ fontSize: '0.55rem', color: '#a0aab8' }}>30 to next ₹100</div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #00f0ff, #00c8f0)', borderRadius: 999 }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'refer',
    label: '🎁 Refer & Earn',
    desc: 'Share your code — friend gets ₹50 free, you earn ₹100 on their first check-in.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #1a1000 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <Gift size={28} color="#e2ff2b" style={{ marginBottom: 6 }} />
          <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>Refer & Earn</div>
          <div style={{ fontSize: '0.58rem', color: '#a0aab8', lineHeight: 1.4 }}>Share your code — your friend gets ₹50 free</div>
        </div>
        {/* Referral code */}
        <div style={{ background: 'rgba(255,62,0,0.08)', border: '1px solid rgba(255,62,0,0.25)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: '#a0aab8', marginBottom: 4 }}>YOUR REFERRAL CODE</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ff3e00', letterSpacing: '0.1em', fontFamily: 'monospace' }}>GYMGO-AX7K2</div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: '0.58rem', fontWeight: 700, display: 'inline-block', marginTop: 6 }}>Copy Code</div>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: 'rgba(48,209,88,0.07)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#30d158' }}>3</div>
            <div style={{ fontSize: '0.55rem', color: '#a0aab8' }}>Friends Joined</div>
            <div style={{ fontSize: '0.55rem', color: '#30d158', fontWeight: 700 }}>+₹300 earned</div>
          </div>
          <div style={{ background: 'rgba(226,255,43,0.07)', border: '1px solid rgba(226,255,43,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#e2ff2b' }}>2</div>
            <div style={{ fontSize: '0.55rem', color: '#a0aab8' }}>Pending</div>
            <div style={{ fontSize: '0.55rem', color: '#e2ff2b', fontWeight: 700 }}>Awaiting check-in</div>
          </div>
        </div>
        {/* Share */}
        <div style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
          </div>
          <div style={{ fontSize: '0.58rem', color: '#25D366', fontWeight: 700 }}>Share on WhatsApp</div>
          <ArrowRight size={11} color="#25D366" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'plans',
    label: '💼 Custom Plans',
    desc: 'Corporate & Parent plans with tailored bundles and priority support.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #001520 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 900 }}>Customised Plans</div>
          <div style={{ fontSize: '0.58rem', color: '#a0aab8' }}>Fitness built around your life</div>
        </div>
        {/* Corporate */}
        <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(0,240,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={13} color="#00f0ff" /></div>
            <div style={{ fontWeight: 800, fontSize: '0.68rem' }}>Corporate Wellness</div>
          </div>
          {['Bulk seat allocation', 'HR usage dashboard', 'GST invoice billing'].map(f => (
            <div key={f} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
              <CheckCircle size={9} color="#30d158" />
              <span style={{ fontSize: '0.56rem', color: '#a0aab8' }}>{f}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.58rem', color: '#00f0ff', fontWeight: 700, marginTop: 5 }}>From ₹499/employee/month →</div>
        </div>
        {/* Parent */}
        <div style={{ background: 'rgba(226,255,43,0.05)', border: '1px solid rgba(226,255,43,0.2)', borderRadius: 12, padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(226,255,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>👨‍👩‍👧</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.68rem' }}>Parent & Family</div>
          </div>
          {['Off-peak morning slots', '2× loyalty points', 'Same-day cancellation'].map(f => (
            <div key={f} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
              <CheckCircle size={9} color="#30d158" />
              <span style={{ fontSize: '0.56rem', color: '#a0aab8' }}>{f}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.58rem', color: '#e2ff2b', fontWeight: 700, marginTop: 5 }}>From ₹799/month for family →</div>
        </div>
      </div>
    ),
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance screens
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveScreen(prev => (prev + 1) % DEMO_SCREENS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    { 
      icon: <MapPin size={24} />, 
      num: '01', 
      title: 'Locate Your Venue', 
      desc: 'Explore premium local workout spaces. Compare by price, equipment lists, and member reviews.' 
    },
    { 
      icon: <CalendarCheck size={24} />, 
      num: '02', 
      title: 'Reserve Your Hour', 
      desc: 'Pick any available hour slot that fits your schedule. Pay directly from your dynamic wallet.' 
    },
    { 
      icon: <QrCode size={24} />, 
      num: '03', 
      title: 'Scan & Sweat', 
      desc: 'Show your digital QR code at the desk for instant entry. Walk in, lift, and get back to your day.' 
    },
  ];

  const faqs = [
    {
      q: "How does hourly billing work? Do I need a subscription?",
      a: "Absolutely no subscription, membership, or joining fees are required. You only pay for the specific hour slots you book. Your virtual wallet balance is debited when booking, and any unused slots can be cancelled for an instant refund."
    },
    {
      q: "Can I cancel my slot if my plans change?",
      a: "Yes! We understand that schedules can be dynamic and messy. You can cancel any upcoming gym booking directly from your user dashboard up to the start time of the slot for an instant, full refund to your wallet."
    },
    {
      q: "How do I check in when I arrive at the gym?",
      a: "Once your booking is confirmed, a secure QR code will appear on your dashboard. Simply show this QR code at the gym's front desk. They will scan it, verify your slot, and you're good to train immediately."
    },
    {
      q: "What equipment and amenities will I have access to?",
      a: "You get full access to the gym's standard workout floor, including cardio decks, weight areas, and locker/shower facilities. Every gym detail page lists verified equipment (e.g. squat racks, dumbbells) so you know what is available before you book."
    }
  ];

  const currentScreen = DEMO_SCREENS[activeScreen];

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop" alt="Premium gym heavy barbell weight plates under deep gym lighting" />
          <div className="hero-bg-overlay"></div>
        </div>
        <div className="hero-content">
          <motion.div 
            className="hero-copy"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Zap /> Instant Access. Zero Contracts.
            </div>
            <h1 className="hero-title">
              TRAIN ON YOUR <span style={{ color: 'var(--red)' }}>TERMS.</span>
            </h1>
            <p className="hero-sub" style={{ margin: '0 0 40px 0', maxWidth: '540px' }}>
              Zero memberships. Billed by the hour. Clean premium venues nearby, unlocked with a single QR code.
            </p>
            <div className="hero-ctas">
              <Link href="/venues">
                <button className="btn-primary" style={{ padding: '0 40px' }}>
                  Unlock Nearby Venues <ArrowRight size={20} />
                </button>
              </Link>
            </div>

            {/* ADVERTISEMENT / STATS CHIPS IN HERO */}
            <motion.div 
              style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '48px' }}
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red)' }}>₹80</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>Starting<br/>Sessions</span>
              </motion.div>
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)' }}>No</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>Admission<br/>Fees</span>
              </motion.div>
              <motion.div variants={fadeInUp} style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', padding: '16px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue)' }}>QR</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>Instant<br/>Check-in</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── INTERACTIVE APP WALKTHROUGH ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}
          >
            {/* Screen label above phone */}
            <div style={{ textAlign: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen.id + '-label'}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4, color: '#ffffff' }}>{currentScreen.label}</div>
                  <div style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: 280, lineHeight: 1.4 }}>{currentScreen.desc}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Phone frame */}
            <div
              className="phone-frame"
              style={{
                position: 'relative',
                width: 230,
                height: 470,
                background: '#0d0d0f',
                borderRadius: 36,
                border: '3px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* Notch */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#0d0d0f', borderRadius: '0 0 16px 16px', zIndex: 10, border: '3px solid rgba(255,255,255,0.12)', borderTop: 'none' }} />

              {/* Screen content with animated transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: currentScreen.bg,
                    paddingTop: 28,
                    color: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {currentScreen.render()}
                </motion.div>
              </AnimatePresence>

              {/* Bottom home bar */}
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 999, zIndex: 10 }} />
            </div>

            {/* Step dots + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {/* Dot navigation */}
              <div style={{ display: 'flex', gap: 6 }}>
                {DEMO_SCREENS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveScreen(i); setIsAutoPlaying(false); }}
                    style={{
                      width: i === activeScreen ? 20 : 7,
                      height: 7,
                      borderRadius: 999,
                      background: i === activeScreen ? 'var(--red)' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              {/* Screen thumbnails row */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: 300, paddingBottom: 4 }}>
                {DEMO_SCREENS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveScreen(i); setIsAutoPlaying(false); }}
                    style={{
                      flexShrink: 0,
                      background: i === activeScreen ? 'rgba(255,62,0,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === activeScreen ? 'rgba(255,62,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                      padding: '4px 8px',
                      fontSize: '0.6rem',
                      color: i === activeScreen ? 'var(--red)' : 'var(--muted)',
                      cursor: 'pointer',
                      fontWeight: i === activeScreen ? 700 : 500,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.label.split(' ')[0]} {s.label.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>

              {/* Auto-play toggle */}
              <button
                onClick={() => setIsAutoPlaying(p => !p)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 999,
                  padding: '5px 14px',
                  fontSize: '0.72rem',
                  color: isAutoPlaying ? 'var(--green)' : 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isAutoPlaying ? 'var(--green)' : 'var(--muted)', display: 'inline-block', animation: isAutoPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
                {isAutoPlaying ? 'Auto-playing' : 'Manual mode'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="section-kicker">How it works</div>
            <h2 className="section-title">Three steps to your next session.</h2>
          </motion.div>
          
          <motion.div 
            className="steps-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {steps.map((s, i) => (
              <motion.div className="step-card" key={i} variants={fadeInUp}>
                <div className="step-icon">{s.icon}</div>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATEFUL FAQ SECTION */}
      <section className="faq-section">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="faq-container"
          >
            <div className="faq-header">
              <div className="section-kicker"><HelpCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Got Questions?</div>
              <h2 className="section-title" style={{ margin: '0 auto 40px auto', textAlign: 'center' }}>Frequently Asked Questions</h2>
            </div>
            
            <div className="faq-grid">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button 
                      className="faq-question" 
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={20} className="faq-icon" />
                    </button>
                    <div className="faq-answer-wrapper">
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '40px 0 100px 0' }}>
        <div className="container">
          <motion.div 
            className="cta-box"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            style={{ 
              background: 'linear-gradient(135deg, var(--red) 0%, var(--amber) 100%)', 
              color: '#fff', border: 'none' 
            }}
          >
            <div>
              <h2 style={{ color: '#fff' }}>Keep your workout flexible.</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)' }}>Pick a nearby gym when your schedule opens up, then check in with your phone.</p>
            </div>
            <Link href="/auth"><button className="btn-primary" style={{ background: '#fff', color: 'var(--red)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>Create free account <ArrowRight size={18} /></button></Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
