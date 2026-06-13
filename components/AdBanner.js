'use client';
import { useEffect, useRef } from 'react';

export default function AdBanner({ dataAdSlot = '1234567890', dataAdFormat = 'auto', dataFullWidthResponsive = true }) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
        if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [dataAdSlot]);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Advertisement</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE THIS WITH ACTUAL ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
