import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/db';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function Login() {
  const { profile, isMockMode } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(isMockMode ? 'officer@mustang.test' : '');
  const [password, setPassword] = useState(isMockMode ? 'demo' : '');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (profile) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === 'signin'
          ? await db.signIn(email, password)
          : await db.signUp(email, password, fullName);
      if (result.error) setError(result.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await db.signInWithGoogle();
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="MCG"
              className="w-16 h-16 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="font-cormorant text-4xl font-semibold text-cream-200 mb-1">
            Mustang Capital Group
          </h1>
          <p className="text-cream-400 text-sm">Analyst Portal</p>
          {isMockMode && (
            <p className="mt-2 text-xs text-brass-500 bg-brass-500/10 border border-brass-500/20 rounded px-3 py-1.5 inline-block">
              Demo mode — no database required
            </p>
          )}
        </div>

        {/* Form */}
        <div className="bg-green-900 border border-green-700 rounded-xl p-6 space-y-4">
          <div className="flex rounded-md overflow-hidden border border-green-700">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={[
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  mode === m ? 'bg-green-700 text-cream-100' : 'text-cream-400 hover:text-cream-100',
                ].join(' ')}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Chen"
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isMockMode ? 'officer@mustang.test' : 'you@calpoly.edu'}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isMockMode ? 'any password in demo mode' : '••••••••'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {error && (
            <div className="text-sm text-loss bg-loss/10 border border-loss/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? <Spinner size="sm" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          {!isMockMode && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-green-700" />
                <span className="text-xs text-cream-400">or</span>
                <div className="flex-1 h-px bg-green-700" />
              </div>
              <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle}>
                Continue with Google
              </Button>
            </>
          )}

          {isMockMode && (
            <div className="text-xs text-cream-400 space-y-1 pt-1 border-t border-green-700">
              <p className="font-medium text-cream-200">Demo accounts:</p>
              <button
                className="block text-brass-500 hover:underline"
                onClick={() => { setEmail('officer@mustang.test'); setPassword('demo'); }}
              >
                officer@mustang.test (full admin access)
              </button>
              <button
                className="block text-cream-400 hover:underline"
                onClick={() => { setEmail('analyst@mustang.test'); setPassword('demo'); }}
              >
                analyst@mustang.test (limited access)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
