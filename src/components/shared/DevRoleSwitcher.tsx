import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/db';

export function DevRoleSwitcher() {
  const { profile, isMockMode } = useAuthStore();
  if (!isMockMode || !import.meta.env.DEV || !profile) return null;

  const isOfficer = profile.role === 'officer';

  const switchTo = async (email: string) => {
    await db.signOut();
    await db.signIn(email, 'demo');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-green-800 border border-brass-500/40 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-brass-500 font-mono font-medium mb-2">DEMO MODE</p>
      <p className="text-cream-400 mb-2">
        Signed in as: <span className="text-cream-100">{profile.full_name}</span>{' '}
        <span className="text-brass-500 capitalize">({profile.role})</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => switchTo(isOfficer ? 'analyst@mustang.test' : 'officer@mustang.test')}
          className="px-2 py-1 bg-brass-500/20 text-brass-500 rounded hover:bg-brass-500/30 transition-colors"
        >
          Switch to {isOfficer ? 'Analyst' : 'Officer'}
        </button>
        <button
          onClick={() => {
            const keys = Object.keys(localStorage).filter((k) => k.startsWith('mt_'));
            keys.forEach((k) => localStorage.removeItem(k));
            window.location.reload();
          }}
          className="px-2 py-1 bg-loss/20 text-loss rounded hover:bg-loss/30 transition-colors"
        >
          Reset data
        </button>
      </div>
    </div>
  );
}
