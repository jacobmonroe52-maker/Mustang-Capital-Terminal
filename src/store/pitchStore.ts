import { create } from 'zustand';
import type { Pitch, PitchVote } from '../types';
import { db } from '../lib/db';

interface PitchState {
  pitches: Pitch[];
  votes: PitchVote[];
  isLoading: boolean;
  loadAll: () => Promise<void>;
  createPitch: (p: Omit<Pitch, 'id' | 'created_at' | 'status' | 'decision_rationale' | 'decided_by' | 'decided_at'>) => Promise<Pitch>;
  decidePitch: (id: string, status: 'approved' | 'rejected', rationale: string, decidedBy: string) => Promise<void>;
  upsertVote: (pitchId: string, userId: string, vote: 'buy' | 'pass') => Promise<void>;
  deleteVote: (pitchId: string, userId: string) => Promise<void>;
}

export const usePitchStore = create<PitchState>((set, get) => ({
  pitches: [],
  votes: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    const [pitches, votes] = await Promise.all([db.getPitches(), db.getAllVotes()]);
    set({ pitches, votes, isLoading: false });
  },

  createPitch: async (p) => {
    const pitch = await db.createPitch(p);
    set((s) => ({ pitches: [pitch, ...s.pitches] }));
    return pitch;
  },

  decidePitch: async (id, status, rationale, decidedBy) => {
    const updated = await db.decidePitch(id, status, rationale, decidedBy);
    set((s) => ({ pitches: s.pitches.map((p) => (p.id === id ? updated : p)) }));
  },

  upsertVote: async (pitchId, userId, vote) => {
    const upserted = await db.upsertVote(pitchId, userId, vote);
    set((s) => {
      const votes = s.votes.filter((v) => !(v.pitch_id === pitchId && v.user_id === userId));
      return { votes: [...votes, upserted] };
    });
  },

  deleteVote: async (pitchId, userId) => {
    await db.deleteVote(pitchId, userId);
    set((s) => ({ votes: s.votes.filter((v) => !(v.pitch_id === pitchId && v.user_id === userId)) }));
  },
}));
