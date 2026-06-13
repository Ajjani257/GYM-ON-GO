'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Clock, Users, ArrowLeft, Check, X, Trophy, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPARE_ROWS = [
  { key: 'pricePerHour', label: 'Price per Hour', format: v => `₹${v}`, best: 'min', unit: '' },
  { key: 'rating', label: 'Rating', format: v => `${v} ★`, best: 'max', unit: '' },
  { key: 'reviewCount', label: 'Reviews', format: v => `${v} reviews`, best: 'max', unit: '' },
  { key: 'crowdLevel', label: 'Crowd Level', format: v => ({ low: '🟢 Low', moderate: '🟡 Moderate', high: '🔴 High' }[v] || v), best: 'low-wins', unit: '' },
  { key: 'hours', label: 'Operating Hours', format: v => v || '—', best: null, unit: '' },
  { key: 'city', label: 'Location', format: v => v, best: null, unit: '' },
];

function getBestIdx(gyms, key, best) {
  if (!best || best === null) return null;
  const vals = gyms.map(g => {
    const v = g[key];
    if (key === 'crowdLevel') return v === 'low' ? 0 : v === 'moderate' ? 1 : 2;
    return Number(v);
  });
  if (best === 'min' || best === 'low-wins') return vals.indexOf(Math.min(...vals));
  if (best === 'max') return vals.indexOf(Math.max(...vals));
  return null;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => fetch(`/api/gyms/${id}`).then(r => r.json())))
      .then(results => {
        setGyms(results.filter(g => g && !g.error));
        setLoading(false);
      })
      .catch(() => { setError('Failed to load gyms.'); setLoading(false); });
  }, [searchParams]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--red)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)' }}>Loading comparison...</p>
    </div>
  );

  if (ids.length === 0 || gyms.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 40 }}>
      <AlertTriangle size={56} style={{ color: 'var(--muted)' }} strokeWidth={1.5} />
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>No gyms selected</h2>
      <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Select 2–3 gyms from the Explore page to start comparing.</p>
      <Link href="/gyms" className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, display: 'inline-block' }}>Explore Gyms</Link>
    </div>
  );

  // Compute overall winner (best price + best rating composite)
  const scores = gyms.map(g => (g.rating / 5) * 0.5 + (1 - g.pricePerHour / Math.max(...gyms.map(x => x.pricePerHour))) * 0.5);
  const winnerIdx = scores.indexOf(Math.max(...scores));

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <button
            onClick={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-alt)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Gym Comparison</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Comparing {gyms.length} gym{gyms.length > 1 ? 's' : ''} side by side</p>
          </div>
        </div>

        {/* Comparison Scroll Wrapper */}
        <div style={{ overflowX: 'auto', paddingBottom: 24, margin: '0 -16px', padding: '0 16px' }}>
          <div style={{ minWidth: gyms.length > 2 ? 100 + gyms.length * 150 : 'auto' }}>
            {/* Gym header cards */}
        <div className="compare-grid" style={{ '--cols': gyms.length, gap: 16, marginBottom: 8, alignItems: 'start' }}>
          <div />
          {gyms.map((gym, i) => (
            <motion.div
              key={gym._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: i === winnerIdx ? 'linear-gradient(135deg, rgba(255,62,0,0.12), rgba(226,255,43,0.05))' : 'var(--surface-alt)',
                border: `1px solid ${i === winnerIdx ? 'rgba(255,62,0,0.4)' : 'var(--line)'}`,
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {i === winnerIdx && (
                <div style={{ background: 'var(--red)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Trophy size={11} /> Best Value Pick
                </div>
              )}
              <div style={{ height: 140, overflow: 'hidden' }}>
                <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={gym.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>{gym.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 12 }}>
                  <MapPin size={11} /> {gym.city}
                </div>
                <Link href={`/gyms/${gym._id}`}>
                  <button className="btn-primary" style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: '0.82rem' }}>Book Now</button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden', marginBottom: 40 }}>
          {COMPARE_ROWS.map((row, ri) => {
            const bestIdx = getBestIdx(gyms, row.key, row.best);
            return (
              <div
                key={row.key}
                className="compare-grid"
                style={{ '--cols': gyms.length, borderBottom: ri < COMPARE_ROWS.length - 1 ? '1px solid var(--line)' : 'none', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>{row.label}</div>
                {gyms.map((gym, gi) => {
                  const isBest = bestIdx === gi;
                  return (
                    <div
                      key={gym._id}
                      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isBest ? 'rgba(48,209,88,0.06)' : 'transparent', borderLeft: '1px solid var(--line)' }}
                    >
                      <span style={{ fontWeight: isBest ? 800 : 500, color: isBest ? 'var(--green)' : 'var(--soft)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isBest && <TrendingDown size={12} color="var(--green)" />}
                        {row.format(gym[row.key])}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Amenities comparison */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>Amenities</h3>
        {(() => {
          const allAmenities = [...new Set(gyms.flatMap(g => g.amenities || []))].sort();
          return (
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden', marginBottom: 40 }}>
              {allAmenities.map((amenity, ai) => (
                <div
                  key={amenity}
                  className="compare-grid"
                  style={{ '--cols': gyms.length, borderBottom: ai < allAmenities.length - 1 ? '1px solid var(--line)' : 'none', background: ai % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ padding: '14px 24px', color: 'var(--soft)', fontSize: '0.88rem', display: 'flex', alignItems: 'center' }}>{amenity}</div>
                  {gyms.map(gym => {
                    const has = (gym.amenities || []).includes(amenity);
                    return (
                      <div key={gym._id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--line)' }}>
                        {has
                          ? <Check size={18} color="var(--green)" strokeWidth={2.5} />
                          : <X size={16} color="var(--muted)" style={{ opacity: 0.3 }} />}
                      </div>
                    );
                  })}
                </div>
              ))}
              {allAmenities.length === 0 && (
                <div style={{ padding: '24px', color: 'var(--muted)', textAlign: 'center' }}>No amenities data available</div>
              )}
            </div>
          );
        })()}

        {/* Equipment comparison */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>Equipment</h3>
        {(() => {
          const allEquipment = [...new Set(gyms.flatMap(g => g.equipment || []))].sort();
          return (
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden', marginBottom: 60 }}>
              {allEquipment.map((eq, ei) => (
                <div
                  key={eq}
                  className="compare-grid"
                  style={{ '--cols': gyms.length, borderBottom: ei < allEquipment.length - 1 ? '1px solid var(--line)' : 'none', background: ei % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ padding: '14px 24px', color: 'var(--soft)', fontSize: '0.88rem', display: 'flex', alignItems: 'center' }}>{eq}</div>
                  {gyms.map(gym => {
                    const has = (gym.equipment || []).includes(eq);
                    return (
                      <div key={gym._id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--line)' }}>
                        {has
                          ? <Check size={18} color="var(--green)" strokeWidth={2.5} />
                          : <X size={16} color="var(--muted)" style={{ opacity: 0.3 }} />}
                      </div>
                    );
                  })}
                </div>
              ))}
              {allEquipment.length === 0 && (
                <div style={{ padding: '24px', color: 'var(--muted)', textAlign: 'center' }}>No equipment data available</div>
              )}
            </div>
          );
        })()}
        
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Ready to decide? Book your slot now.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {gyms.map(gym => (
              <Link key={gym._id} href={`/gyms/${gym._id}`}>
                <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>Book {gym.name}</button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--red)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
