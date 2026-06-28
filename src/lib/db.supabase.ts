import { supabase } from './supabase';
import type { DbClient } from './db';
import type {
  Profile, Holding, NavPoint, Pitch, PitchVote, ResearchNote,
  Flashcard, FlashcardProgress, DcfScenario, FundSettings, CardState, VoteChoice,
} from '../types';

export function createSupabaseClient(): DbClient {
  return {
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },

    async signUp(email, password, fullName) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    },

    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      return { error: error?.message ?? null };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return data as Profile | null;
    },

    onAuthChange(cb) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session) { cb(null); return; }
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        cb(data as Profile | null);
      });
      return () => subscription.unsubscribe();
    },

    async getHoldings() {
      const { data } = await supabase.from('holdings').select('*').order('ticker');
      return (data ?? []) as Holding[];
    },

    async upsertHolding(h) {
      const { data } = await supabase.from('holdings').upsert(h).select().single();
      return data as Holding;
    },

    async deleteHolding(id) {
      await supabase.from('holdings').delete().eq('id', id);
    },

    async getNavHistory() {
      const { data } = await supabase.from('nav_history').select('*').order('date', { ascending: true });
      return (data ?? []) as NavPoint[];
    },

    async addNavPoint(point) {
      const { data } = await supabase.from('nav_history').insert(point).select().single();
      return data as NavPoint;
    },

    async getPitches() {
      const { data } = await supabase.from('pitches').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Pitch[];
    },

    async createPitch(p) {
      const { data } = await supabase.from('pitches').insert(p).select().single();
      return data as Pitch;
    },

    async decidePitch(id, status, rationale, decidedBy) {
      const { data } = await supabase
        .from('pitches')
        .update({ status, decision_rationale: rationale, decided_by: decidedBy, decided_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return data as Pitch;
    },

    async getVotesForPitch(pitchId) {
      const { data } = await supabase.from('pitch_votes').select('*').eq('pitch_id', pitchId);
      return (data ?? []) as PitchVote[];
    },

    async getAllVotes() {
      const { data } = await supabase.from('pitch_votes').select('*');
      return (data ?? []) as PitchVote[];
    },

    async upsertVote(pitchId, userId, vote) {
      const { data } = await supabase
        .from('pitch_votes')
        .upsert({ pitch_id: pitchId, user_id: userId, vote }, { onConflict: 'pitch_id,user_id' })
        .select()
        .single();
      return data as PitchVote;
    },

    async deleteVote(pitchId, userId) {
      await supabase.from('pitch_votes').delete().eq('pitch_id', pitchId).eq('user_id', userId);
    },

    async getNotes(query) {
      let q = supabase.from('research_notes').select('*');
      if (query) {
        q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%,ticker.ilike.%${query}%`);
      }
      const { data } = await q.order('updated_at', { ascending: false });
      return (data ?? []) as ResearchNote[];
    },

    async getNote(id) {
      const { data } = await supabase.from('research_notes').select('*').eq('id', id).single();
      return data as ResearchNote | null;
    },

    async upsertNote(n) {
      const { data } = await supabase
        .from('research_notes')
        .upsert({ ...n, updated_at: new Date().toISOString() })
        .select()
        .single();
      return data as ResearchNote;
    },

    async deleteNote(id) {
      await supabase.from('research_notes').delete().eq('id', id);
    },

    async getFlashcards() {
      const { data } = await supabase.from('flashcards').select('*').order('category');
      return (data ?? []) as Flashcard[];
    },

    async upsertFlashcard(c) {
      const { data } = await supabase.from('flashcards').upsert(c).select().single();
      return data as Flashcard;
    },

    async deleteFlashcard(id) {
      await supabase.from('flashcards').delete().eq('id', id);
    },

    async getProgress(userId) {
      const { data } = await supabase.from('flashcard_progress').select('*').eq('user_id', userId);
      return (data ?? []) as FlashcardProgress[];
    },

    async upsertProgress(userId, cardId, state) {
      const { data } = await supabase
        .from('flashcard_progress')
        .upsert({ user_id: userId, card_id: cardId, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id,card_id' })
        .select()
        .single();
      return data as FlashcardProgress;
    },

    async getScenarios(userId) {
      const { data } = await supabase.from('dcf_scenarios').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      return (data ?? []) as DcfScenario[];
    },

    async saveScenario(s) {
      const { data } = await supabase.from('dcf_scenarios').insert(s).select().single();
      return data as DcfScenario;
    },

    async deleteScenario(id) {
      await supabase.from('dcf_scenarios').delete().eq('id', id);
    },

    async getFundSettings() {
      const { data } = await supabase.from('fund_settings').select('*').single();
      return data as FundSettings;
    },

    async updateFundSettings(partial) {
      const { data } = await supabase.from('fund_settings').update(partial).select().single();
      return data as FundSettings;
    },
  };
}
