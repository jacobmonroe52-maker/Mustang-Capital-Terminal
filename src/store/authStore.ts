import { create } from 'zustand';
import type { Profile, Role } from '../types';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  isMockMode: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  isMockMode: !import.meta.env.VITE_SUPABASE_URL,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useRole = (): { isOfficer: boolean; isAnalyst: boolean; role: Role | null } => {
  const profile = useAuthStore((s) => s.profile);
  return {
    isOfficer: profile?.role === 'officer',
    isAnalyst: profile?.role === 'analyst',
    role: profile?.role ?? null,
  };
};
