export type Role = 'officer' | 'analyst';
export type PitchStatus = 'pending' | 'approved' | 'rejected';
export type PitchRecommendation = 'Buy' | 'Sell' | 'Hold';
export type VoteChoice = 'buy' | 'pass';
export type CardState = 'known' | 'review' | 'unseen';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Holding {
  id: string;
  ticker: string;
  company_name: string;
  sector: string;
  shares: number;
  cost_basis: number;
  target_weight: number;
  book_value: number;
  created_at: string;
  updated_at: string;
}

export interface EnrichedHolding extends Holding {
  current_price: number;
  market_value: number;
  weight: number;
  gain_loss: number;
  gain_loss_pct: number;
}

export interface NavPoint {
  id: string;
  date: string;
  nav: number;
  benchmark_value: number;
}

export interface Pitch {
  id: string;
  ticker: string;
  company_name: string;
  sector: string;
  thesis: string;
  valuation_summary: string;
  target_price: number;
  current_price: number;
  recommendation: PitchRecommendation;
  key_risks: string[];
  submitted_by: string;
  status: PitchStatus;
  decision_rationale: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface PitchVote {
  id: string;
  pitch_id: string;
  user_id: string;
  vote: VoteChoice;
  created_at: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  ticker: string | null;
  content: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_by: string;
  created_at: string;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  card_id: string;
  state: CardState;
  updated_at: string;
}

export interface DcfInputs {
  base_fcf: number;
  fcf_growth_rate: number;
  years: number;
  wacc: number;
  terminal_growth: number;
  total_debt: number;
  cash: number;
  diluted_shares: number;
  current_price: number;
}

export interface DcfResult {
  dcf_value_per_share: number;
  enterprise_value: number;
  equity_value: number;
  terminal_value: number;
  pv_fcfs: number;
  pv_terminal: number;
  upside_pct: number;
  tv_pct_of_ev: number;
  projected_fcfs: number[];
  error?: string;
}

export interface DcfScenario {
  id: string;
  name: string;
  ticker: string;
  user_id: string;
  inputs: DcfInputs;
  result: DcfResult;
  created_at: string;
  updated_at: string;
}

export interface FundSettings {
  id: string;
  fund_name: string;
  aum_inception: number;
  inception_date: string;
  benchmark_ticker: string;
  cash_balance: number;
  concentration_limit: number;
}
