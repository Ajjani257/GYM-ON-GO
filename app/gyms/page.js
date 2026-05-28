'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GymsPage() {
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [crowd, setCrowd] = useState('');
  const [maxPrice, setMaxPrice] = useState(400);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGyms(); }, []);

  async function fetchGyms() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (crowd) params.set('crowd', crowd);
    if (maxPrice < 400) params.set('maxPrice', maxPrice);
    const res = await fetch(`/api/gyms?${params}`);
    const data = await res.json();
    setGyms(data);
    setLoading(false);
  }

  useEffect(() => { const t = setTimeout(fetchGyms, 300); return () => clearTimeout(t); }, [search, city, crowd, maxPrice]);

  return (
    <>
      <div className="page-header"><div className="container">
        <h1 className="page-title">Find Gyms Near You</h1>
        <p className="page-sub">Browse verified partner gyms and book hourly sessions</p>
      </div></div>

      <div className="container">
        <div className="filters-bar">
          <div className="filter-group search-input">
            <label>SEARCH</label>
            <div style={{position:'relative'}}>
              <i className="fa-solid fa-magnifying-glass" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}></i>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Gym name or area..." style={{paddingLeft:36}} />
            </div>
          </div>
          <div className="filter-group">
            <label>CITY</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              <option>Ahmedabad</option><option>Bengaluru</option><option>Mumbai</option>
            </select>
          </div>
          <div className="filter-group">
            <label>CROWD</label>
            <select value={crowd} onChange={e => setCrowd(e.target.value)}>
              <option value="">Any</option>
              <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option>
            </select>
          </div>
          <div className="filter-group">
            <label>MAX PRICE: ₹{maxPrice}/hr</label>
            <input type="range" min="50" max="400" step="10" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p style={{textAlign:'center',padding:60,color:'var(--muted)'}}>Loading gyms...</p>
        ) : gyms.length === 0 ? (
          <div className="empty-state" style={{margin:'40px 0'}}>
            <i className="fa-solid fa-dumbbell"></i>
            <h3>No gyms found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="gyms-grid">
            {gyms.map(gym => (
              <Link href={`/gyms/${gym._id}`} key={gym._id}>
                <div className="gym-card">
                  <div className="gym-card-img">
                    <img src={gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'} alt={gym.name} />
                    <span className={`crowd-badge crowd-${gym.crowdLevel}`}>
                      <i className="fa-solid fa-users"></i> {gym.crowdLevel.toUpperCase()}
                    </span>
                    <div className="price-tag">
                      <span className="symbol">₹</span><span className="amount">{gym.pricePerHour}</span><span className="per">/hr</span>
                    </div>
                  </div>
                  <div className="gym-card-body">
                    <div className="gym-card-name">{gym.name.toUpperCase()}</div>
                    <div className="gym-card-address"><i className="fa-solid fa-location-dot"></i> {gym.address}</div>
                    <div className="gym-card-meta">
                      <span className="gym-rating"><i className="fa-solid fa-star"></i> {gym.rating} ({gym.reviewCount})</span>
                      <span className="gym-hours"><i className="fa-regular fa-clock"></i> {gym.hours}</span>
                    </div>
                    <div className="amenity-tags">
                      {gym.amenities.slice(0, 3).map((a, i) => <span className="amenity-tag" key={i}>{a}</span>)}
                      {gym.amenities.length > 3 && <span className="amenity-tag">+{gym.amenities.length - 3}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
