'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, User, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n\n').map((block, idx) => {
    // Render H3 headers
    if (block.startsWith('### ')) {
      return (
        <h3 key={idx} style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '36px', marginBottom: '16px', color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
          {block.replace('### ', '')}
        </h3>
      );
    }
    // Render H4 headers
    if (block.startsWith('#### ')) {
      return (
        <h4 key={idx} style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '24px', marginBottom: '12px', color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
          {block.replace('#### ', '')}
        </h4>
      );
    }
    // Render Lists
    if (block.startsWith('* ') || block.startsWith('- ') || block.includes('\n* ') || block.includes('\n- ')) {
      return (
        <ul key={idx} style={{ paddingLeft: '24px', marginBottom: '20px', color: 'var(--soft)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {block.split('\n').map((li, i) => {
            const cleanLi = li.replace(/^[\*\-]\s+/, '').trim();
            if (!cleanLi) return null;
            return <li key={i} style={{ lineHeight: 1.6, fontSize: '1.05rem' }}>{cleanLi}</li>;
          }).filter(Boolean)}
        </ul>
      );
    }
    // Render standard paragraphs
    return (
      <p key={idx} style={{ lineHeight: 1.75, fontSize: '1.08rem', color: 'var(--soft)', marginBottom: '20px' }}>
        {block}
      </p>
    );
  });
}

export default function BlogDetailPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await fetch(`/api/blogs?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading article content...</div>;
  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ color: 'var(--red)' }}>Article not found</h2>
        <Link href="/blogs"><button className="btn-primary">Return to Blogs</button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="detail-hero" style={{ height: '360px', position: 'relative' }}>
        <img src={blog.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80'} alt={blog.title} />
        <div className="detail-hero-overlay"></div>
        <button className="btn-back" onClick={() => router.push('/blogs')} style={{ top: '100px' }}><ArrowLeft size={16} /> Blogs</button>
      </div>

      <div className="container" style={{ padding: '0 24px 80px 24px', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* ARTICLE BODY CARD */}
          <div className="detail-card" style={{ padding: '48px', backdropFilter: 'blur(30px)' }}>
            
            {/* Tag / Category Badge */}
            {blog.tags && blog.tags.length > 0 && (
              <span className="section-badge" style={{ color: 'var(--red)', border: '1px solid var(--card-border)', marginBottom: '16px' }}>
                {blog.tags[0]}
              </span>
            )}

            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2, fontFamily: 'var(--font-head)' }}>
              {blog.title}
            </h1>

            {/* Author / Date Metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '24px', marginBottom: '32px', flexWrap: 'wrap', color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> By {blog.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {blog.readTime} read</span>
            </div>

            {/* Rendered content */}
            <div style={{ color: 'var(--soft)' }}>
              {renderMarkdown(blog.content)}
            </div>

            {/* Social / Tag Footer */}
            {blog.tags && blog.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)', alignSelf: 'center', fontSize: '0.9rem', fontWeight: 700, marginRight: '8px' }}>TAGS:</span>
                {blog.tags.map(t => (
                  <span key={t} style={{ background: 'var(--chip-bg)', color: 'var(--text)', border: '1px solid var(--line)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
