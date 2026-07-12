'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const tagsList = ['All', ...new Set(blogs.flatMap(b => b.tags || []))];

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || b.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <div className="page-header" style={{ padding: '120px 0 60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-badge">Fitness Guides & Insights</span>
          <h1 className="page-title" style={{ fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Clickongo <span style={{ color: 'var(--red)' }}>BLOGS</span>
          </h1>
          <p className="page-sub" style={{ maxWidth: '600px', margin: '16px auto 0' }}>
            Expert advice on workout efficiency, dynamic stretches, nutrition, and tips to maximize your hourly gym sessions.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
        
        {/* SEARCH AND FILTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', borderBottom: '1px solid var(--line)', paddingBottom: '32px' }}>
          
          {/* Tag Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tagsList.map(tag => (
              <button 
                key={tag} 
                className={`tab ${selectedTag === tag ? 'active' : ''}`} 
                onClick={() => setSelectedTag(tag)}
                style={{ padding: '8px 18px', fontSize: '0.85rem', borderRadius: '100px' }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ width: '100%', height: '44px', paddingLeft: '48px', borderRadius: '12px', background: 'var(--surface)' }} 
            />
          </div>
        </div>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="gyms-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {[...Array(3)].map((_, i) => (
              <div className="gym-card skeleton-card" key={i}>
                <div className="skeleton-img" style={{ height: '200px' }} />
                <div className="gym-card-body">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-text" />
                  <div className="skeleton-line skeleton-text short" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <h3>No articles found</h3>
            <p>Try resetting your tags or search queries.</p>
          </div>
        ) : (
          <motion.div 
            className="gyms-grid" 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}
          >
            {filteredBlogs.map(blog => (
              <motion.div key={blog._id} variants={itemVariants}>
                <Link href={`/blogs/${blog.slug}`}>
                  <div className="gym-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="gym-card-img" style={{ height: '200px' }}>
                      <img src={blog.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80'} alt={blog.title} />
                      <div className="price-tag" style={{ background: 'var(--red)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                        {blog.tags[0]}
                      </div>
                    </div>
                    <div className="gym-card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '12px', fontWeight: 600 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {blog.readTime}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString('en-IN', {month:'short', day:'numeric'})}</span>
                        </div>
                        <h3 className="gym-card-name" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>{blog.title}</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>{blog.excerpt}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--red)', fontWeight: 700, fontSize: '0.9rem', marginTop: 'auto' }}>
                        Read Article <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </>
  );
}
