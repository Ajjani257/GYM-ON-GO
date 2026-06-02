'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Search, Users, Star, MapPin, Clock, Dumbbell, SearchX, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GymsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [crowd, setCrowd] = useState('');
  const [maxPrice, setMaxPrice] = useState(400);
  const [equipment, setEquipment] = useState([]);
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { fetchGyms(); }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/favorites?userId=${session.user.id}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setFavorites(data.map(g => g._id || g));
        });
    }
  }, [session]);

  async function fetchGyms() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (crowd) params.set('crowd', crowd);
    if (maxPrice < 400) params.set('maxPrice', maxPrice);
    if (equipment.length > 0) params.set('equipment', equipment.join(','));
    
    const res = await fetch(`/api/gyms?${params}`);
    const data = await res.json();
    setGyms(data);
    setLoading(false);
  }

  useEffect(() => { const t = setTimeout(fetchGyms, 300); return () => clearTimeout(t); }, [search, city, crowd, maxPrice, equipment]);

  const sortedGyms = useMemo(() => {
    const sorted = [...gyms];
    switch (sort) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }
    return sorted;
  }, [gyms, sort]);

  async function toggleFavorite(e, gymId) {
    e.preventDefault();
    if (!session) {
      addToast('Please sign in to save favorites', 'error');
      return;
    }
    
    const isFav = favorites.includes(gymId);
    if (isFav) setFavorites(prev => prev.filter(id => id !== gymId));
    else setFavorites(prev => [...prev, gymId]);

    const res = await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, gymId })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.isFavorite) addToast('Added to favorites', 'success');
      else addToast('Removed from favorites', 'info');
    }
  }

  return (
    <>
      <div className="page-header"><div className="container">
        <h1 className="page-title">Find Gyms Near You</h1>
        <p className="page-sub">Browse verified partner gyms and book hourly sessions</p>
      </div></div>

      <div className="container">
        <div className="filters-bar" style={{flexWrap:'wrap', gap:'16px'}}>
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
          <div className="filter-group">
            <label>Crowd</label>
            <select value={crowd} onChange={e => setCrowd(e.target.value)}>
              <option value="">Any</option>
              <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option>
            </select>
          </div>
          <div className="filter-group" style={{minWidth:'200px'}}>
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
              <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
                {equipment.map(eq => (
                  <span key={eq} style={{fontSize:'0.75rem',background:'var(--surface-alt)',padding:'4px 8px',borderRadius:12,display:'flex',alignItems:'center',gap:4}}>
                    {eq} <button style={{background:'none',color:'var(--muted)',cursor:'pointer',border:'none'}} onClick={() => setEquipment(equipment.filter(e => e !== eq))}>&times;</button>
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
          <div className="empty-state" style={{margin:'40px 0'}}>
            <SearchX size={56} strokeWidth={1.5} />
            <h3>No gyms found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <motion.div
            className="gyms-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            {sortedGyms.map(gym => {
              const isFav = favorites.includes(gym._id);
              return (
                <motion.div
                  key={gym._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                >
                  <Link href={`/gyms/${gym._id}`}>
                    <div className="gym-card">
                      <div className="gym-card-img">
                        <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={gym.name} />
                        
                        <button 
                          onClick={(e) => toggleFavorite(e, gym._id)}
                          style={{
                            position:'absolute', top:12, right:12, zIndex:10,
                            background: isFav ? 'var(--red)' : 'rgba(0,0,0,0.5)',
                            color: '#fff', border:'none', borderRadius:'50%',
                            width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer', transition:'all 0.2s', backdropFilter:'blur(4px)'
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
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
