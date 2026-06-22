'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('prelegal_session')) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError('Please enter your name to continue.');
      return;
    }
    localStorage.setItem('prelegal_session', JSON.stringify({ name }));
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #032147 0%, #209dd7 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#032147' }}>
            Prelegal
          </h1>
          <p style={{ color: '#888888' }} className="text-sm">
            Professional legal documents in minutes
          </p>
          <div className="mt-3 h-1 w-16 mx-auto rounded-full" style={{ background: '#ecad0a' }} />
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: '#032147' }}>
          Welcome! Enter your name to begin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Jane Smith"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#209dd7' } as React.CSSProperties}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: '#753991' }}
          >
            Enter Platform
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: '#888888' }}>
          No account required &mdash; legal document drafting made simple
        </p>
      </div>
    </div>
  );
}
