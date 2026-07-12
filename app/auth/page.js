'use client';
import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, CheckCircle, XCircle, Loader2, Gift } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { Suspense } from 'react';

function AuthContent() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [refStatus, setRefStatus] = useState(null); // null | 'checking' | { valid, referrerName } | { valid: false }
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const debounceRef = useRef(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else if (session.user.role === 'partner') {
        router.push('/partner');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status]);

  // Auto-fill referral code from ?ref= query param
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setTab('signup');
    }
  }, [searchParams]);

  // Real-time referral code verification with debounce
  useEffect(() => {
    if (!referralCode || referralCode.length < 5) {
      setRefStatus(null);
      return;
    }

    setRefStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/verify-referral?code=${encodeURIComponent(referralCode.trim().toUpperCase())}`);
        const data = await res.json();
        setRefStatus(data);
      } catch {
        setRefStatus({ valid: false });
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [referralCode]);

  async function handleSignIn(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      addToast('Signed in successfully!', 'success');
      // Fetch fresh session to get the user's role and redirect immediately
      const sessionRes = await fetch('/api/auth/session');
      const freshSession = await sessionRes.json();
      setLoading(false);
      
      if (freshSession?.user?.role === 'admin') {
        router.push('/admin');
      } else if (freshSession?.user?.role === 'partner') {
        router.push('/partner');
      } else {
        router.push('/dashboard');
      }
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, referralCode: referralCode.trim() || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    const signin = await signIn('credentials', { email, password, redirect: false });
    if (signin?.error) {
      setError(signin.error);
      setLoading(false);
    } else {
      if (data.welcomeCredit) {
        addToast(`🎉 Account created! ₹${data.welcomeCredit} welcome credit added to your wallet.`, 'success');
      } else {
        addToast('Account created successfully!', 'success');
      }
      
      // Fetch fresh session and redirect
      const sessionRes = await fetch('/api/auth/session');
      const freshSession = await sessionRes.json();
      setLoading(false);
      
      if (freshSession?.user?.role === 'admin') {
        router.push('/admin');
      } else if (freshSession?.user?.role === 'partner') {
        router.push('/partner');
      } else {
        router.push('/dashboard');
      }
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <img src="https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&q=80&fit=crop&crop=top" alt="Fitness" />
        <div className="auth-left-overlay"></div>
        <div className="auth-left-text">
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 900 }}>Your fitness<br/><span style={{ color: 'var(--red)' }}>journey</span><br/>starts here</h2>
          <p>Get instant, flexible access to premium local venues with a single scan. No monthly subscriptions, no contracts.</p>
        </div>
      </div>
      <div className="auth-right">
        {tab === 'signin' ? (
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>Welcome back</h2>
            <p className="auth-sub">Sign in to continue your fitness journey</p>
            <button type="button" className="btn-google" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="20"/> Continue with Google</button>
            <div className="auth-divider"><span>OR</span></div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap"><Mail size={16} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="i@example.com" required /></div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap"><Lock size={16} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required /></div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-auth" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <p className="auth-switch">Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('signup'); setError(''); }}>Sign up</a></p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <h2>Create account</h2>
            <p className="auth-sub">Start your pay-per-use fitness experience</p>
            <button type="button" className="btn-google" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="20"/> Continue with Google</button>
            <div className="auth-divider"><span>OR</span></div>
            <div className="form-group">
              <label>Full name</label>
              <div className="input-wrap"><User size={16} /><input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required /></div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap"><Mail size={16} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap"><Lock size={16} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
              <p style={{color:'var(--muted)', fontSize:'0.8rem', marginTop:'4px'}}>At least 6 characters</p>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gift size={14} style={{ color: 'var(--amber)' }} />
                Referral Code <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Optional — get ₹50 free)</span>
              </label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <User size={16} />
                <input
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="GYMGO-XXXXX"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                {/* Verification status icon */}
                {refStatus === 'checking' && (
                  <Loader2 size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', animation: 'spin 1s linear infinite' }} />
                )}
                {refStatus && refStatus !== 'checking' && refStatus.valid && (
                  <CheckCircle size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--green)' }} />
                )}
                {refStatus && refStatus !== 'checking' && !refStatus.valid && referralCode.length >= 5 && (
                  <XCircle size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--red)' }} />
                )}
              </div>
              {/* Referral feedback text */}
              {refStatus && refStatus !== 'checking' && refStatus.valid && (
                <p style={{ color: 'var(--green)', fontSize: '0.82rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Valid code! You&apos;ll get <strong>₹50 free credits</strong> from {refStatus.referrerName}&apos;s invite.
                </p>
              )}
              {refStatus && refStatus !== 'checking' && !refStatus.valid && referralCode.length >= 5 && (
                <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={12} /> Invalid referral code.
                </p>
              )}
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-auth" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
            <p className="auth-switch">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('signin'); setError(''); }}>Sign in</a></p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
