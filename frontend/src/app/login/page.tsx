'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Mode = 'signin' | 'signup' | 'guest';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, signin, signup } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated via JWT or localStorage guest session
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
      return;
    }
    if (typeof window !== 'undefined' && localStorage.getItem('prelegal_session')) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signin(email, password);
      } else {
        await signup(email, password);
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError('Please enter your name to continue.');
      return;
    }
    localStorage.setItem('prelegal_session', JSON.stringify({ name }));
    router.replace('/');
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #032147 0%, #209dd7 100%)' }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #032147 0%, #209dd7 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#032147' }}>
            Prelegal
          </h1>
          <p style={{ color: '#888888' }} className="text-sm">
            Professional legal documents in minutes
          </p>
          <div className="mt-3 h-1 w-16 mx-auto rounded-full" style={{ background: '#ecad0a' }} />
        </div>

        {/* Mode tabs */}
        <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
          {(['signin', 'signup', 'guest'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Guest'}
            </button>
          ))}
        </div>

        {/* Auth form (Sign In / Sign Up) */}
        {(mode === 'signin' || mode === 'signup') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
                style={{ color: '#032147' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
                style={{ color: '#032147' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                minLength={8}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#753991' }}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>
        )}

        {/* Guest form */}
        {mode === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium mb-1"
                style={{ color: '#032147' }}
              >
                Your Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
                placeholder="e.g. Jane Smith"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: '#753991' }}
            >
              Enter Platform
            </button>

            <p className="text-center text-xs" style={{ color: '#888888' }}>
              No account required &mdash; documents are not saved between sessions
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
