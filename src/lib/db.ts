import type {
  Profile, Holding, NavPoint, Pitch, PitchVote, ResearchNote,
  Flashcard, FlashcardProgress, DcfScenario, FundSettings, CardState, VoteChoice,
} from '../types';

export interface DbClient {
  // Auth
  signIn(email: string, password: string): Promise<{ error: string | null }>;
  signUp(email: string, password: string, fullName: string): Promise<{ error: string | null }>;
  signInWithGoogle(): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
  getSession(): Promise<Profile | null>;
  onAuthChange(cb: (profile: Profile | null) => void): () => void;

  // Holdings
  getHoldings(): Promise<Holding[]>;
  upsertHolding(h: Omit<Holding, 'book_value' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Holding>;
  deleteHolding(id: string): Promise<void>;

  // NAV
  getNavHistory(): Promise<NavPoint[]>;
  addNavPoint(point: Omit<NavPoint, 'id'>): Promise<NavPoint>;

  // Pitches
  getPitches(): Promise<Pitch[]>;
  createPitch(p: Omit<Pitch, 'id' | 'created_at' | 'status' | 'decision_rationale' | 'decided_by' | 'decided_at'>): Promise<Pitch>;
  decidePitch(id: string, status: 'approved' | 'rejected', rationale: string, decidedBy: string): Promise<Pitch>;

  // Votes
  getVotesForPitch(pitchId: string): Promise<PitchVote[]>;
  getAllVotes(): Promise<PitchVote[]>;
  upsertVote(pitchId: string, userId: string, vote: VoteChoice): Promise<PitchVote>;
  deleteVote(pitchId: string, userId: string): Promise<void>;

  // Research
  getNotes(query?: string): Promise<ResearchNote[]>;
  getNote(id: string): Promise<ResearchNote | null>;
  upsertNote(n: Omit<ResearchNote, 'created_at' | 'updated_at'> & { id?: string }): Promise<ResearchNote>;
  deleteNote(id: string): Promise<void>;

  // Flashcards
  getFlashcards(): Promise<Flashcard[]>;
  upsertFlashcard(c: Omit<Flashcard, 'id' | 'created_at'> & { id?: string }): Promise<Flashcard>;
  deleteFlashcard(id: string): Promise<void>;
  getProgress(userId: string): Promise<FlashcardProgress[]>;
  upsertProgress(userId: string, cardId: string, state: CardState): Promise<FlashcardProgress>;

  // DCF
  getScenarios(userId: string): Promise<DcfScenario[]>;
  saveScenario(s: Omit<DcfScenario, 'id' | 'created_at' | 'updated_at'>): Promise<DcfScenario>;
  deleteScenario(id: string): Promise<void>;

  // Settings
  getFundSettings(): Promise<FundSettings>;
  updateFundSettings(s: Partial<FundSettings>): Promise<FundSettings>;
}

const isMock = !import.meta.env.VITE_SUPABASE_URL;

let _db: DbClient;

async function loadDb(): Promise<DbClient> {
  if (_db) return _db;
  if (isMock) {
    const { createMockClient } = await import('./db.mock');
    _db = createMockClient();
  } else {
    const { createSupabaseClient } = await import('./db.supabase');
    _db = createSupabaseClient();
  }
  return _db;
}

export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop) {
    return async (...args: unknown[]) => {
      const client = await loadDb();
      return (client as Record<string, unknown>)[prop as string](...args);
    };
  },
});
