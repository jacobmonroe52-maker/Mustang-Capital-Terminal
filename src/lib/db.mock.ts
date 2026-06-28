import { v4 as uuid } from 'uuid';
import type { DbClient } from './db';
import type {
  Profile, Holding, NavPoint, Pitch, PitchVote, ResearchNote,
  Flashcard, FlashcardProgress, DcfScenario, FundSettings, CardState, VoteChoice,
} from '../types';
import {
  SEED_PROFILES, SEED_HOLDINGS, SEED_NAV_HISTORY, SEED_PITCHES, SEED_VOTES,
  SEED_NOTES, SEED_FLASHCARDS, SEED_FUND_SETTINGS, OFFICER_ID,
} from './seed';

const KEY = (t: string) => `mt_${t}`;

function load<T>(table: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(KEY(table));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  save(table, seed);
  return seed;
}

function save<T>(table: string, data: T[]): void {
  localStorage.setItem(KEY(table), JSON.stringify(data));
}

function now() {
  return new Date().toISOString();
}

let authChangeCallback: ((profile: Profile | null) => void) | null = null;
let currentProfile: Profile | null = null;

export function createMockClient(): DbClient {
  const flashcardsWithIds: Flashcard[] = load('flashcards', SEED_FLASHCARDS.map((c, i) => ({
    ...c,
    id: `fc${i + 1}`,
    created_at: '2026-01-15T00:00:00Z',
  })));

  return {
    async signIn(email) {
      const profiles = load<Profile>('profiles', SEED_PROFILES);
      const profile = profiles.find((p) => p.email === email);
      if (!profile) return { error: 'No account found with that email. In demo mode, use officer@mustang.test or analyst@mustang.test.' };
      currentProfile = profile;
      localStorage.setItem('mt_session', JSON.stringify(profile));
      authChangeCallback?.(profile);
      return { error: null };
    },

    async signUp(email, _password, fullName) {
      const profiles = load<Profile>('profiles', SEED_PROFILES);
      if (profiles.find((p) => p.email === email)) return { error: 'Email already registered.' };
      const profile: Profile = { id: uuid(), email, full_name: fullName, role: 'analyst', created_at: now() };
      profiles.push(profile);
      save('profiles', profiles);
      currentProfile = profile;
      localStorage.setItem('mt_session', JSON.stringify(profile));
      authChangeCallback?.(profile);
      return { error: null };
    },

    async signInWithGoogle() {
      return { error: 'Google sign-in is not available in demo mode. Use email login.' };
    },

    async signOut() {
      currentProfile = null;
      localStorage.removeItem('mt_session');
      authChangeCallback?.(null);
    },

    async getSession() {
      if (currentProfile) return currentProfile;
      try {
        const raw = localStorage.getItem('mt_session');
        if (raw) {
          currentProfile = JSON.parse(raw);
          return currentProfile;
        }
      } catch { /* ignore */ }
      return null;
    },

    onAuthChange(cb) {
      authChangeCallback = cb;
      this.getSession().then((p) => cb(p));
      return () => { authChangeCallback = null; };
    },

    async getHoldings() {
      return load<Holding>('holdings', SEED_HOLDINGS);
    },

    async upsertHolding(h) {
      const holdings = load<Holding>('holdings', SEED_HOLDINGS);
      const book_value = h.shares * h.cost_basis;
      if (h.id) {
        const idx = holdings.findIndex((x) => x.id === h.id);
        if (idx >= 0) {
          holdings[idx] = { ...h, book_value, updated_at: now(), created_at: holdings[idx].created_at };
          save('holdings', holdings);
          return holdings[idx];
        }
      }
      const newH: Holding = { ...h, id: uuid(), book_value, created_at: now(), updated_at: now() };
      holdings.push(newH);
      save('holdings', holdings);
      return newH;
    },

    async deleteHolding(id) {
      const holdings = load<Holding>('holdings', SEED_HOLDINGS).filter((h) => h.id !== id);
      save('holdings', holdings);
    },

    async getNavHistory() {
      return load<NavPoint>('nav_history', SEED_NAV_HISTORY);
    },

    async addNavPoint(point) {
      const history = load<NavPoint>('nav_history', SEED_NAV_HISTORY);
      const np: NavPoint = { ...point, id: uuid() };
      history.push(np);
      save('nav_history', history);
      return np;
    },

    async getPitches() {
      return load<Pitch>('pitches', SEED_PITCHES);
    },

    async createPitch(p) {
      const pitches = load<Pitch>('pitches', SEED_PITCHES);
      const newP: Pitch = {
        ...p, id: uuid(), status: 'pending',
        decision_rationale: null, decided_by: null, decided_at: null,
        created_at: now(),
      };
      pitches.push(newP);
      save('pitches', pitches);
      return newP;
    },

    async decidePitch(id, status, rationale, decidedBy) {
      const pitches = load<Pitch>('pitches', SEED_PITCHES);
      const idx = pitches.findIndex((p) => p.id === id);
      if (idx < 0) throw new Error('Pitch not found');
      pitches[idx] = { ...pitches[idx], status, decision_rationale: rationale, decided_by: decidedBy, decided_at: now() };
      save('pitches', pitches);
      return pitches[idx];
    },

    async getVotesForPitch(pitchId) {
      return load<PitchVote>('votes', SEED_VOTES).filter((v) => v.pitch_id === pitchId);
    },

    async getAllVotes() {
      return load<PitchVote>('votes', SEED_VOTES);
    },

    async upsertVote(pitchId, userId, vote) {
      const votes = load<PitchVote>('votes', SEED_VOTES);
      const idx = votes.findIndex((v) => v.pitch_id === pitchId && v.user_id === userId);
      if (idx >= 0) {
        votes[idx] = { ...votes[idx], vote };
        save('votes', votes);
        return votes[idx];
      }
      const newV: PitchVote = { id: uuid(), pitch_id: pitchId, user_id: userId, vote, created_at: now() };
      votes.push(newV);
      save('votes', votes);
      return newV;
    },

    async deleteVote(pitchId, userId) {
      const votes = load<PitchVote>('votes', SEED_VOTES).filter(
        (v) => !(v.pitch_id === pitchId && v.user_id === userId)
      );
      save('votes', votes);
    },

    async getNotes(query) {
      const notes = load<ResearchNote>('notes', SEED_NOTES);
      if (!query) return notes.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      const q = query.toLowerCase();
      return notes
        .filter((n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.ticker?.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        )
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    },

    async getNote(id) {
      return load<ResearchNote>('notes', SEED_NOTES).find((n) => n.id === id) ?? null;
    },

    async upsertNote(n) {
      const notes = load<ResearchNote>('notes', SEED_NOTES);
      if (n.id) {
        const idx = notes.findIndex((x) => x.id === n.id);
        if (idx >= 0) {
          notes[idx] = { ...notes[idx], ...n, updated_at: now() };
          save('notes', notes);
          return notes[idx];
        }
      }
      const newN: ResearchNote = { ...n, id: n.id ?? uuid(), created_at: now(), updated_at: now() };
      notes.push(newN);
      save('notes', notes);
      return newN;
    },

    async deleteNote(id) {
      save('notes', load<ResearchNote>('notes', SEED_NOTES).filter((n) => n.id !== id));
    },

    async getFlashcards() {
      return load<Flashcard>('flashcards', flashcardsWithIds);
    },

    async upsertFlashcard(c) {
      const cards = load<Flashcard>('flashcards', flashcardsWithIds);
      if (c.id) {
        const idx = cards.findIndex((x) => x.id === c.id);
        if (idx >= 0) {
          cards[idx] = { ...cards[idx], ...c };
          save('flashcards', cards);
          return cards[idx];
        }
      }
      const newC: Flashcard = { ...c, id: uuid(), created_at: now() };
      cards.push(newC);
      save('flashcards', cards);
      return newC;
    },

    async deleteFlashcard(id) {
      save('flashcards', load<Flashcard>('flashcards', flashcardsWithIds).filter((c) => c.id !== id));
    },

    async getProgress(userId) {
      return load<FlashcardProgress>('progress', []).filter((p) => p.user_id === userId);
    },

    async upsertProgress(userId, cardId, state) {
      const all = load<FlashcardProgress>('progress', []);
      const idx = all.findIndex((p) => p.user_id === userId && p.card_id === cardId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], state, updated_at: now() };
        save('progress', all);
        return all[idx];
      }
      const newP: FlashcardProgress = { id: uuid(), user_id: userId, card_id: cardId, state, updated_at: now() };
      all.push(newP);
      save('progress', all);
      return newP;
    },

    async getScenarios(userId) {
      return load<DcfScenario>('dcf_scenarios', []).filter((s) => s.user_id === userId);
    },

    async saveScenario(s) {
      const scenarios = load<DcfScenario>('dcf_scenarios', []);
      const existing = scenarios.findIndex((x) => x.name === s.name && x.ticker === s.ticker && x.user_id === s.user_id);
      if (existing >= 0) {
        scenarios[existing] = { ...scenarios[existing], ...s, updated_at: now() };
        save('dcf_scenarios', scenarios);
        return scenarios[existing];
      }
      const newS: DcfScenario = { ...s, id: uuid(), created_at: now(), updated_at: now() };
      scenarios.push(newS);
      save('dcf_scenarios', scenarios);
      return newS;
    },

    async deleteScenario(id) {
      save('dcf_scenarios', load<DcfScenario>('dcf_scenarios', []).filter((s) => s.id !== id));
    },

    async getFundSettings() {
      return load<FundSettings>('fund_settings', [SEED_FUND_SETTINGS])[0] ?? SEED_FUND_SETTINGS;
    },

    async updateFundSettings(partial) {
      const settings = await this.getFundSettings();
      const updated = { ...settings, ...partial };
      save('fund_settings', [updated]);
      return updated;
    },
  };
}
