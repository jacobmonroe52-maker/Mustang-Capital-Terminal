import { create } from 'zustand';
import type { ResearchNote } from '../types';
import { db } from '../lib/db';

interface ResearchState {
  notes: ResearchNote[];
  isLoading: boolean;
  query: string;
  loadNotes: (q?: string) => Promise<void>;
  upsertNote: (n: Omit<ResearchNote, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<ResearchNote>;
  deleteNote: (id: string) => Promise<void>;
  setQuery: (q: string) => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  notes: [],
  isLoading: false,
  query: '',

  loadNotes: async (q) => {
    set({ isLoading: true });
    const notes = await db.getNotes(q);
    set({ notes, isLoading: false });
  },

  upsertNote: async (n) => {
    const saved = await db.upsertNote(n);
    set((s) => {
      const idx = s.notes.findIndex((x) => x.id === saved.id);
      const notes = idx >= 0 ? s.notes.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...s.notes];
      return { notes };
    });
    return saved;
  },

  deleteNote: async (id) => {
    await db.deleteNote(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  setQuery: (query) => set({ query }),
}));
