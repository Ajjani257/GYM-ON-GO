'use client';
import { useState, useEffect } from 'react';
import { Users, TrendingUp, Wallet, Star, CheckCircle, MapPin, Clock, Search, Dumbbell, QrCode, Gift, Zap, GitCompare, ChevronRight, ArrowRight, Heart, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';

const iconMap = {
  users: Users,
  'trending-up': TrendingUp,
  wallet: Wallet,
  star: Star,
};

// Each "screen" in the walkthrough carousel
const DEMO_SCREENS = [
  {
    id: 'home',
    label: '🏠 Landing Page',
    desc: 'Users discover GYM-ON-GO — no subscription, no commitment.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #1a0a00 60%, #0d0d0f 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 12 }}>
        {/* Fake navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '-0.02em' }}>GYM-<span style={{ color: '#ff3e00' }}>ON-GO</span></span>
          <div style={{ background: '#ff3e00', borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem', fontWeight: 700, color: '#fff' }}>Start Free</div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(255,62,0,0.12)', border: '1px solid rgba(255,62,0,0.3)', borderRadius: 999, padding: '4px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#ff3e00', width: 'fit-content' }}>⚡ Instant Access · Zero Contracts</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1, color: '#fff' }}>Train on<br /><span style={{ color: '#ff3e00' }}>Your Terms</span></div>
          <div style={{ fontSize: '0.62rem', color: '#a0aab8', lineHeight: 1.5 }}>Book gym sessions by the hour. No membership. No lock-in.</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ background: '#ff3e00', borderRadius: 999, padding: '6px 12px', fontSize: '0.6rem', fontWeight: 800, color: '#fff' }}>Find Gyms →</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>See how it works</div>
          </div>
        </div>
        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['₹80 /hr', 'No Fees', 'QR Scan'].map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px', fontSize: '0.58rem', fontWeight: 700, color: '#a0aab8' }}>{t}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'explore',
    label: '🔍 Explore Gyms',
    desc: 'Filter by city, price, equipment. Compare up to 3 gyms side-by-side.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #0a0a1a 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '0.75rem' }}>Find Gyms</div>
        {/* Search */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={11} color="#a0aab8" />
          <span style={{ fontSize: '0.6rem', color: '#a0aab8' }}>Search gyms near you...</span>
        </div>
        {/* Compare hint */}
        <div style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, padding: '6px 8px', fontSize: '0.55rem', color: '#00f0ff', fontWeight: 600 }}>
          <GitCompare size={10} style={{ display: 'inline', marginRight: 4 }} />Compare gyms side by side →
        </div>
        {/* Gym cards */}
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
    label: '⚖️ Compare Gyms',
    desc: 'Side-by-side comparison of price, amenities, rating & equipment.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #001a1a 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <GitCompare size={13} color="#00f0ff" /> Gym Comparison
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
    label: '🏋️ Gym Detail',
    desc: 'View amenities, ratings, and pick your preferred hour slot.',
    bg: 'linear-gradient(160deg, #0d0d0f 0%, #1a0500 100%)',
    render: () => (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Gym hero img */}
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
            <div style={{ fontSize: '0.5rem', color: '#a0aab8', fontFamily: 'monospace' }}>A3F7B2C1</div>
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
            <div style={{ fontSize: '0.55rem', color: '#a0aab8' }}>30 to next ₹50</div>
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

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addToast } = useToast();

  // Auto-advance screens
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveScreen(prev => (prev + 1) % DEMO_SCREENS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymName, ownerName, email, phone, city }),
      });
      if (res.ok) {
        setSubmitted(true);
        addToast('Application submitted successfully!', 'success');
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

  const currentScreen = DEMO_SCREENS[activeScreen];

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
          <h1 className="hero-title">Grow your gym with Gym-on-Go</h1>
          <p className="hero-sub" style={{ margin: '16px auto', maxWidth: 500 }}>
            List your gym and reach thousands of active fitness seekers in your city.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="partner-showcase">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Why Partner With Us?</h2>
              <div className="benefits-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                {benefits.map((b, i) => {
                  const Icon = iconMap[b.icon];
                  return (
                    <motion.div
                      className="benefit-card"
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      style={{ padding: '20px' }}
                    >
                      <div className="benefit-icon" style={{ marginBottom: '12px' }}><Icon size={24} /></div>
                      <h4 style={{ fontSize: '1.1rem' }}>{b.title}</h4>
                      <p style={{ fontSize: '0.9rem' }}>{b.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── INTERACTIVE APP WALKTHROUGH ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
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
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>{currentScreen.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', maxWidth: 280 }}>{currentScreen.desc}</div>
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
        </div>
      </section>

      <section className="partner-form-section">
        <h2>Register Your Gym</h2>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>
          Fill in details and our team will reach out within 24 hours.
        </p>
        {!submitted ? (
          <form className="partner-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Gym Name</label>
                <input placeholder="Elite Fitness Club" required value={gymName} onChange={(e) => setGymName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <input placeholder="Rajesh Sharma" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="gym@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input placeholder="+91 98765 43210" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
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
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        ) : (
          <div className="partner-success">
            <CheckCircle size={48} color="#22c55e" />
            <h3 style={{ marginTop: 16 }}>Application Received!</h3>
            <p style={{ color: 'var(--muted)' }}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        )}
      </section>
    </>
  );
}
