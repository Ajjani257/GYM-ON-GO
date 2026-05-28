'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [tab, setTab] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.push('/dashboard');
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    const signin = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signin?.error) setError(signin.error);
    else router.push('/dashboard');
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <img src="https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&q=80&fit=crop&crop=top" alt="Fitness" />
        <div className="auth-left-overlay"></div>
        <div className="auth-left-text">
          <h2>YOUR FITNESS<br/><span className="red">JOURNEY</span><br/>STARTS HERE</h2>
          <p>Join thousands of fitness enthusiasts enjoying flexible, pay-per-use gym access across India.</p>
        </div>
      </div>
      <div className="auth-right">
        {tab === 'signin' ? (
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>WELCOME BACK</h2>
            <p className="auth-sub">Sign in to continue your fitness journey</p>
            <button type="button" className="btn-google" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="20"/> CONTINUE WITH GOOGLE</button>
            <div className="auth-divider"><span>OR</span></div>
            <div className="form-group">
              <label>EMAIL</label>
              <div className="input-wrap"><i className="fa-regular fa-envelope"></i><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="i@example.com" required /></div>
            </div>
            <div className="form-group">
              <label>PASSWORD</label>
              <div className="input-wrap"><i className="fa-solid fa-lock"></i><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required /></div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-auth" disabled={loading}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</button>
            <p className="auth-switch">Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('signup'); setError(''); }}>Sign up</a></p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <h2>CREATE ACCOUNT</h2>
            <p className="auth-sub">Start your pay-per-use fitness experience</p>
            <button type="button" className="btn-google" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="20"/> CONTINUE WITH GOOGLE</button>
            <div className="auth-divider"><span>OR</span></div>
            <div className="form-group">
              <label>FULL NAME</label>
              <div className="input-wrap"><i className="fa-regular fa-user"></i><input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required /></div>
            </div>
            <div className="form-group">
              <label>EMAIL</label>
              <div className="input-wrap"><i className="fa-regular fa-envelope"></i><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
            </div>
            <div className="form-group">
              <label>PASSWORD</label>
              <div className="input-wrap"><i className="fa-solid fa-lock"></i><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-auth" disabled={loading}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</button>
            <p className="auth-switch">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('signin'); setError(''); }}>Sign in</a></p>
          </form>
        )}
      </div>
    </div>
  );
}
