'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Search, Star, MapPin, Clock, SearchX, Heart, GitCompare, X, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GymsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const router = useRouter();

  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(400);
  const [equipment, setEquipment] = useState([]);
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]); // up to 3 gym IDs

  useEffect(() => { fetchGyms(); }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/favorites?userId=${session.user.id}`, { cache: 'no-store' })
        .then(r => {
          if (!r.ok) throw new Error(`API error: ${r.status}`);
          return r.json();
        })
        .then(data => {
          if (Array.isArray(data)) setFavorites(data.map(g => g._id || g));
        })
        .catch(err => {
          console.error('Failed to load favorites:', err);
          setFavorites([]);
        });
    }
  }, [session]);

  async function fetchGyms() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (maxPrice < 400) params.set('maxPrice', maxPrice);
    if (equipment.length > 0) params.set('equipment', equipment.join(','));

    const res = await fetch(`/api/gyms?${params}`);
    const data = await res.json();
    setGyms(data);
    setLoading(false);
  }

  useEffect(() => { const t = setTimeout(fetchGyms, 300); return () => clearTimeout(t); }, [search, city, maxPrice, equipment]);

  const sortedGyms = useMemo(() => {
    const sorted = [...gyms];
    switch (sort) {
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': sorted.sort((a, b) => a.pricePerHour - b.pricePerHour); break;
      case 'price-desc': sorted.sort((a, b) => b.pricePerHour - a.pricePerHour); break;
      case 'reviews': sorted.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: break;
    }
    return sorted;
  }, [gyms, sort]);

  async function toggleFavorite(e, gymId) {
    e.preventDefault();
    if (!session) { addToast('Please sign in to save favorites', 'error'); return; }
    
    const isFav = favorites.includes(gymId);
    const previousFavorites = favorites;
    
    // Optimistic update
    if (isFav) setFavorites(prev => prev.filter(id => id !== gymId));
    else setFavorites(prev => [...prev, gymId]);
    
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId })
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
      // Revert optimistic update on error
      setFavorites(previousFavorites);
      addToast('Failed to save favorite. Please try again.', 'error');
    }
  }

  function toggleCompare(e, gym) {
    e.preventDefault();
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.find(g => g._id === gym._id)) return prev.filter(g => g._id !== gym._id);
      if (prev.length >= 3) { addToast('You can compare up to 3 gyms at once', 'error'); return prev; }
      return [...prev, { _id: gym._id, name: gym.name, image: gym.image }];
    });
  }

  function goCompare() {
    const ids = compareList.map(g => g._id).join(',');
    router.push(`/compare?ids=${ids}`);
  }

  return (
    <>
      <div className="page-header"><div className="container">
        <h1 className="page-title">Find Gyms Near You</h1>
        <p className="page-sub">Browse verified partner gyms and book hourly sessions</p>
      </div></div>

      <div className="container">
        {/* Compare Feature Hint Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,240,255,0.03) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            borderRadius: 16,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,240,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GitCompare size={18} color="var(--blue)" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', marginBottom: 2 }}>Compare Gyms Side by Side</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Click <strong style={{ color: 'var(--blue)' }}>"+ Compare"</strong> on any gym card to select up to 3 gyms, then tap <strong style={{ color: 'var(--blue)' }}>"Compare Gyms"</strong> to see a full breakdown of price, amenities &amp; equipment.</div>
          </div>
          {compareList.length > 0 && (
            <button
              onClick={goCompare}
              disabled={compareList.length < 2}
              style={{
                background: 'var(--blue)', color: '#000', border: 'none', borderRadius: 100,
                padding: '8px 18px', fontWeight: 800, fontSize: '0.85rem',
                cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6, opacity: compareList.length >= 2 ? 1 : 0.5,
              }}
            >
              Compare {compareList.length} <ArrowRight size={13} />
            </button>
          )}
        </motion.div>
        <div className="filters-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="filter-group search-input">
            <label>Search</label>
            <div>
              <Search size={16} className="search-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Gym name or area..." />
            </div>
          </div>
          <div className="filter-group">
            <label>City</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              <option>Ahmedabad</option><option>Bengaluru</option><option>Mumbai</option>
            </select>
          </div>
          <div className="filter-group" style={{ minWidth: '200px' }}>
            <label>Equipment Required</label>
            <select value="" onChange={e => {
              const v = e.target.value;
              if (v && !equipment.includes(v)) setEquipment([...equipment, v]);
            }}>
              <option value="">+ Add equipment</option>
              <option value="Treadmill">Treadmill</option>
              <option value="Squat Rack">Squat Rack</option>
              <option value="Dumbbells">Dumbbells</option>
              <option value="Bench Press">Bench Press</option>
              <option value="Rowing Machine">Rowing Machine</option>
            </select>
            {equipment.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {equipment.map(eq => (
                  <span key={eq} style={{ fontSize: '0.75rem', background: 'var(--surface-alt)', padding: '4px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {eq} <button style={{ background: 'none', color: 'var(--muted)', cursor: 'pointer', border: 'none' }} onClick={() => setEquipment(equipment.filter(e => e !== eq))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <label>Max price: ₹{maxPrice}/hr</label>
            <input type="range" min="50" max="400" step="10" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="gyms-grid">
            {[...Array(6)].map((_, i) => (
              <div className="gym-card skeleton-card" key={i}>
                <div className="skeleton-img" />
                <div className="gym-card-body">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-text" />
                  <div className="skeleton-line skeleton-text short" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedGyms.length === 0 ? (
          <div className="empty-state" style={{ margin: '40px 0' }}>
            <SearchX size={56} strokeWidth={1.5} />
            <h3>No gyms found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <motion.div
            className="gyms-grid"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {sortedGyms.map(gym => {
              const isFav = favorites.includes(gym._id);
              const isComparing = compareList.some(g => g._id === gym._id);
              return (
                <motion.div
                  key={gym._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                >
                  <Link href={`/gyms/${gym._id}`}>
                    <div
                      className="gym-card"
                      style={{
                        outline: isComparing ? '2px solid var(--blue)' : 'none',
                        outlineOffset: 3,
                        boxShadow: isComparing ? '0 0 0 4px rgba(0,240,255,0.12), 0 8px 32px rgba(0,240,255,0.15)' : '',
                        transition: 'box-shadow 0.3s ease, outline 0.2s ease',
                      }}
                    >
                      <div className="gym-card-img">
                        <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={gym.name} />

                        {/* Selected badge on image */}
                        {isComparing && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            background: 'linear-gradient(to bottom, rgba(0,240,255,0.35), transparent)',
                            height: 60, zIndex: 5, display: 'flex', alignItems: 'flex-start',
                            padding: '10px 12px',
                          }}>
                            <div style={{ background: 'var(--blue)', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              <Check size={10} strokeWidth={3} /> Selected for compare
                            </div>
                          </div>
                        )}

                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(e, gym._id)}
                          style={{
                            position: 'absolute', top: 12, right: 12, zIndex: 10,
                            background: isFav ? 'var(--red)' : 'rgba(0,0,0,0.5)',
                            color: '#fff', border: 'none', borderRadius: '50%',
                            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)'
                          }}
                        >
                          <Heart size={18} fill={isFav ? '#fff' : 'none'} />
                        </button>

                        <div className="price-tag">
                          <span className="symbol">₹</span><span className="amount">{gym.pricePerHour}</span><span className="per">/hr</span>
                        </div>
                      </div>
                      <div className="gym-card-body">
                        <div className="gym-card-name">{gym.name}</div>
                        <div className="gym-card-address"><MapPin size={14} /> {gym.address}</div>
                        <div className="gym-card-meta">
                          <span className="gym-rating"><Star size={14} /> {gym.rating} ({gym.reviewCount})</span>
                          <span className="gym-hours"><Clock size={14} /> {gym.hours}</span>
                        </div>
                        <div className="amenity-tags">
                          {gym.amenities.slice(0, 3).map((a, i) => <span className="amenity-tag" key={i}>{a}</span>)}
                          {gym.amenities.length > 3 && <span className="amenity-tag">+{gym.amenities.length - 3}</span>}
                        </div>

                        {/* Compare button — full width in card body */}
                        <button
                          onClick={(e) => toggleCompare(e, gym)}
                          style={{
                            width: '100%',
                            marginTop: 12,
                            padding: '9px 14px',
                            borderRadius: 10,
                            border: `1.5px solid ${isComparing ? 'var(--blue)' : 'rgba(0,240,255,0.3)'}`,
                            background: isComparing
                              ? 'rgba(0,240,255,0.12)'
                              : 'rgba(0,240,255,0.04)',
                            color: isComparing ? 'var(--blue)' : 'var(--muted)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            letterSpacing: '0.02em',
                          }}
                          onMouseEnter={e => {
                            if (!isComparing) {
                              e.currentTarget.style.background = 'rgba(0,240,255,0.1)';
                              e.currentTarget.style.borderColor = 'var(--blue)';
                              e.currentTarget.style.color = 'var(--blue)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isComparing) {
                              e.currentTarget.style.background = 'rgba(0,240,255,0.04)';
                              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
                              e.currentTarget.style.color = 'var(--muted)';
                            }
                          }}
                        >
                          <GitCompare size={14} />
                          {isComparing ? '✓ Added to Compare' : '+ Add to Compare'}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Sticky Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 240 }}
            style={{
              position: 'fixed',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(13,13,15,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(0,240,255,0.5)',
              borderRadius: 100,
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              zIndex: 130,
              boxShadow: '0 0 0 1px rgba(0,240,255,0.1), 0 8px 48px rgba(0,240,255,0.25), 0 2px 16px rgba(0,0,0,0.6)',
              maxWidth: 'calc(100vw - 32px)',
              animation: 'compareBarPulse 2.5s ease-in-out infinite',
            }}
          >
            {/* Icon */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,240,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,240,255,0.3)' }}>
              <GitCompare size={16} color="var(--blue)" />
            </div>

            {/* Gym thumbnails */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {compareList.map(g => (
                <div key={g._id} style={{ position: 'relative' }}>
                  <img
                    src={g.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&q=60'}
                    alt={g.name}
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--blue)', boxShadow: '0 0 8px rgba(0,240,255,0.4)' }}
                  />
                  <button
                    onClick={() => setCompareList(prev => prev.filter(x => x._id !== g._id))}
                    style={{ position: 'absolute', top: -4, right: -4, width: 17, height: 17, borderRadius: '50%', background: 'var(--red)', border: '1.5px solid var(--bg)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 1 }}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
              {/* Empty slots */}
              {Array(3 - compareList.length).fill(0).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px dashed rgba(0,240,255,0.2)', background: 'rgba(0,240,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.1rem', color: 'rgba(0,240,255,0.2)' }}>+</span>
                </div>
              ))}
            </div>

            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {compareList.length} gym{compareList.length > 1 ? 's' : ''} selected
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {compareList.length < 2 ? 'Select 1 more to compare' : 'Ready to compare!'}
              </span>
            </div>

            <button
              onClick={goCompare}
              disabled={compareList.length < 2}
              style={{
                background: compareList.length >= 2
                  ? 'linear-gradient(135deg, var(--blue), #00c8f0)'
                  : 'rgba(255,255,255,0.08)',
                color: compareList.length >= 2 ? '#000' : 'var(--muted)',
                border: 'none',
                borderRadius: 100,
                padding: '10px 22px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: compareList.length >= 2 ? '0 4px 20px rgba(0,240,255,0.35)' : 'none',
              }}
            >
              Compare Gyms <ArrowRight size={15} />
            </button>

            <button
              onClick={() => setCompareList([])}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Clear all"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
