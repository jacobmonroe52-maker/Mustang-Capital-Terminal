import { create } from 'zustand';
import type { Flashcard, FlashcardProgress, CardState } from '../types';
import { db } from '../lib/db';

interface FlashcardState {
  cards: Flashcard[];
  progress: FlashcardProgress[];
  isLoading: boolean;
  loadAll: (userId: string) => Promise<void>;
  upsertCard: (c: Omit<Flashcard, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  markCard: (userId: string, cardId: string, state: CardState) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set) => ({
  cards: [],
  progress: [],
  isLoading: false,

  loadAll: async (userId) => {
    set({ isLoading: true });
    const [cards, progress] = await Promise.all([db.getFlashcards(), db.getProgress(userId)]);
    set({ cards, progress, isLoading: false });
  },

  upsertCard: async (c) => {
    const updated = await db.upsertFlashcard(c);
    set((s) => {
      const idx = s.cards.findIndex((x) => x.id === updated.id);
      const cards = idx >= 0 ? s.cards.map((x) => (x.id === updated.id ? updated : x)) : [...s.cards, updated];
      return { cards };
    });
  },

  deleteCard: async (id) => {
    await db.deleteFlashcard(id);
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
  },

  markCard: async (userId, cardId, state) => {
    await db.upsertProgress(userId, cardId, state);
    set((s) => {
      const idx = s.progress.findIndex((p) => p.card_id === cardId && p.user_id === userId);
      const entry = { id: `${userId}-${cardId}`, user_id: userId, card_id: cardId, state, updated_at: new Date().toISOString() };
      const progress = idx >= 0
        ? s.progress.map((p) => (p.card_id === cardId && p.user_id === userId ? entry : p))
        : [...s.progress, entry];
      return { progress };
    });
  },
}));
