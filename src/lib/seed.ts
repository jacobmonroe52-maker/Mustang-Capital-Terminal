import type { Holding, NavPoint, Pitch, PitchVote, ResearchNote, Flashcard, FundSettings, Profile } from '../types';

export const OFFICER_ID = '00000000-0000-0000-0000-000000000001';
export const ANALYST_ID = '00000000-0000-0000-0000-000000000002';

export const SEED_PROFILES: Profile[] = [
  { id: OFFICER_ID, email: 'officer@mustang.test', full_name: 'Alex Chen', role: 'officer', created_at: '2026-01-15T00:00:00Z' },
  { id: ANALYST_ID, email: 'analyst@mustang.test', full_name: 'Jordan Lee', role: 'analyst', created_at: '2026-01-15T00:00:00Z' },
];

export const SEED_HOLDINGS: Holding[] = [
  { id: 'h1', ticker: 'AAPL', company_name: 'Apple Inc.', sector: 'Technology', shares: 120, cost_basis: 162.00, target_weight: 0.18, book_value: 19440, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h2', ticker: 'MSFT', company_name: 'Microsoft Corp.', sector: 'Technology', shares: 80, cost_basis: 285.00, target_weight: 0.16, book_value: 22800, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h3', ticker: 'JPM', company_name: 'JPMorgan Chase & Co.', sector: 'Financials', shares: 150, cost_basis: 138.00, target_weight: 0.14, book_value: 20700, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h4', ticker: 'UNH', company_name: 'UnitedHealth Group', sector: 'Healthcare', shares: 45, cost_basis: 420.00, target_weight: 0.15, book_value: 18900, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h5', ticker: 'XOM', company_name: 'Exxon Mobil Corp.', sector: 'Energy', shares: 200, cost_basis: 88.00, target_weight: 0.12, book_value: 17600, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h6', ticker: 'AMZN', company_name: 'Amazon.com Inc.', sector: 'Consumer Disc.', shares: 60, cost_basis: 118.00, target_weight: 0.15, book_value: 7080, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'h7', ticker: 'V', company_name: 'Visa Inc.', sector: 'Financials', shares: 110, cost_basis: 195.00, target_weight: 0.10, book_value: 21450, created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
];

export const SEED_PRICES: Record<string, number> = {
  AAPL: 213.49,
  MSFT: 430.16,
  JPM: 268.75,
  UNH: 312.40,
  XOM: 112.85,
  AMZN: 214.29,
  V: 368.12,
};

export const SEED_FUND_SETTINGS: FundSettings = {
  id: 'fs1',
  fund_name: 'Mustang Capital Group',
  aum_inception: 1000000,
  inception_date: '2026-01-15',
  benchmark_ticker: 'SPY',
  cash_balance: 87500,
  concentration_limit: 0.25,
};

function generateNavHistory(): NavPoint[] {
  const points: NavPoint[] = [];
  const days = 180;
  const startNav = 1000000;
  let nav = startNav;
  let benchmark = startNav;
  const now = new Date('2026-06-28');

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const dailyReturn = (Math.random() - 0.46) * 0.018;
    const benchReturn = (Math.random() - 0.46) * 0.014;
    nav = nav * (1 + dailyReturn);
    benchmark = benchmark * (1 + benchReturn);
    points.push({
      id: `nav-${i}`,
      date: d.toISOString().split('T')[0],
      nav: Math.round(nav),
      benchmark_value: Math.round(benchmark),
    });
  }
  return points;
}

export const SEED_NAV_HISTORY: NavPoint[] = generateNavHistory();

export const SEED_PITCHES: Pitch[] = [
  {
    id: 'p1',
    ticker: 'NVDA',
    company_name: 'NVIDIA Corporation',
    sector: 'Technology',
    thesis: `NVIDIA holds a dominant position in AI accelerator chips through its CUDA ecosystem and H100/B100 GPU lines. Data center revenue grew 427% YoY in FY2024. The company benefits from a durable competitive moat: switching costs from the CUDA ecosystem are extraordinarily high, and NVIDIA's developer mindshare is years ahead of AMD or Intel. We believe AI training infrastructure spend is still in innings 2-3, and NVIDIA will capture the majority of incremental capex from hyperscalers through 2027.`,
    valuation_summary: 'Trading at 35x forward earnings vs. 5-year median of 25x, but growth re-rates the multiple. Our DCF yields $680 intrinsic value.',
    target_price: 680,
    current_price: 135.58,
    recommendation: 'Buy',
    key_risks: ['AMD MI300X gaining traction', 'Export restrictions to China', 'Hyperscaler capex cuts in a recession'],
    submitted_by: ANALYST_ID,
    status: 'pending',
    decision_rationale: null,
    decided_by: null,
    decided_at: null,
    created_at: '2026-06-10T14:30:00Z',
  },
  {
    id: 'p2',
    ticker: 'MSFT',
    company_name: 'Microsoft Corp.',
    sector: 'Technology',
    thesis: `Microsoft's Azure cloud platform is gaining share vs. AWS, growing 29% in the most recent quarter. Copilot AI integration across Office 365 and GitHub drives incremental ARPU with minimal marginal cost. The company's $69B Activision acquisition diversifies into gaming at scale.`,
    valuation_summary: 'DCF at 10% WACC yields $480/share. Currently trading at $430 — modest upside with high conviction.',
    target_price: 480,
    current_price: 430.16,
    recommendation: 'Buy',
    key_risks: ['Regulatory scrutiny on AI', 'Azure growth deceleration', 'Gaming integration risk'],
    submitted_by: OFFICER_ID,
    status: 'approved',
    decision_rationale: 'Strong thesis, valuation reasonable. Adding 40 more shares at current prices to reach target weight.',
    decided_by: OFFICER_ID,
    decided_at: '2026-06-15T10:00:00Z',
    created_at: '2026-06-05T09:00:00Z',
  },
];

export const SEED_VOTES: PitchVote[] = [
  { id: 'v1', pitch_id: 'p1', user_id: OFFICER_ID, vote: 'buy', created_at: '2026-06-10T16:00:00Z' },
  { id: 'v2', pitch_id: 'p2', user_id: ANALYST_ID, vote: 'buy', created_at: '2026-06-06T10:00:00Z' },
  { id: 'v3', pitch_id: 'p2', user_id: OFFICER_ID, vote: 'buy', created_at: '2026-06-06T11:00:00Z' },
];

export const SEED_NOTES: ResearchNote[] = [
  {
    id: 'n1',
    title: 'AI Semiconductor Landscape — Q2 2026',
    ticker: 'NVDA',
    content: `## Overview\n\nThe AI chip market is consolidating around a two-player dynamic: NVIDIA and AMD. Intel's Gaudi 3 has failed to gain meaningful traction.\n\n## NVIDIA's Moat\n\nThe CUDA ecosystem has ~4 million registered developers. Switching to AMD ROCm would require rewriting training pipelines — a 6-12 month engineering effort that most companies won't take on while delivery timelines matter.\n\n## Key Data Points\n\n- H100 lead times: 8-12 weeks as of Q1 2026 (down from 52 weeks in 2023)\n- B200 pricing: ~$30k-40k per GPU vs H100 at ~$25k\n- Microsoft, Google, Amazon, and Meta collectively represent ~45% of NVDA's data center revenue\n\n## Risks to Monitor\n\n1. Export controls tightening could cut off China (currently ~15% of revenue)\n2. AMD MI300X closed some benchmark gaps in inference workloads\n3. Custom silicon (TPU, Trainium) could displace 10-15% of GPU spend in 2027`,
    tags: ['semiconductors', 'ai', 'nvda', 'competitive-analysis'],
    author_id: ANALYST_ID,
    created_at: '2026-06-12T08:00:00Z',
    updated_at: '2026-06-20T14:00:00Z',
  },
  {
    id: 'n2',
    title: 'Portfolio Risk Review — June 2026',
    ticker: null,
    content: `## Concentration Analysis\n\nTechnology sector now represents 34% of portfolio vs. 30% target. Consider trimming AAPL or MSFT if NVDA pitch is approved.\n\n## Beta Profile\n\nWeighted portfolio beta ≈ 1.18. Slightly elevated vs. our 1.0-1.2 target range.\n\n## Upcoming Catalysts\n\n| Ticker | Event | Date |\n|--------|-------|------|\n| AAPL | WWDC 2026 | Jun 29 |\n| MSFT | Q4 Earnings | Jul 23 |\n| AMZN | Prime Day | Jul 8-9 |\n\n## Recommended Actions\n\n- Review UNH position after Q2 earnings (currently down 15% from cost basis)\n- Monitor XOM vs. crude oil correlation — Brent at $74 is below our $82 underwrite`,
    tags: ['risk', 'portfolio', 'quarterly-review'],
    author_id: OFFICER_ID,
    created_at: '2026-06-22T09:00:00Z',
    updated_at: '2026-06-22T09:00:00Z',
  },
];

export const SEED_FLASHCARDS: Omit<Flashcard, 'id' | 'created_at'>[] = [
  { category: 'Valuation', question: 'What does a DCF value a company on?', answer: 'Its own projected free cash flows discounted to present value, independent of market price.', created_by: OFFICER_ID },
  { category: 'Valuation', question: 'What is WACC?', answer: "The blended required return on a firm's debt and equity; the DCF discount rate.", created_by: OFFICER_ID },
  { category: 'Valuation', question: 'Why prefer EV/EBITDA over P/E?', answer: 'EV multiples are capital-structure-neutral, so they compare firms with different debt levels fairly.', created_by: OFFICER_ID },
  { category: 'Valuation', question: 'What is free cash flow?', answer: 'Cash left after operating costs and capital expenditures — the cash actually available to investors.', created_by: OFFICER_ID },
  { category: 'Valuation', question: 'What is terminal value?', answer: 'The value of all cash flows beyond the explicit forecast, via perpetuity growth or an exit multiple.', created_by: OFFICER_ID },
  { category: 'Valuation', question: 'What is an economic moat?', answer: 'A durable competitive advantage (network effects, switching costs, cost or scale advantage, intangibles) that protects returns.', created_by: OFFICER_ID },
  { category: 'Accounting', question: 'DuPont: the three drivers of ROE?', answer: 'Net profit margin, asset turnover, and financial leverage.', created_by: OFFICER_ID },
  { category: 'Accounting', question: 'How do you get from net income to FCF?', answer: 'Add back D&A, subtract capex, adjust for working capital changes: FCF = Net Income + D&A − CapEx ± ΔNWC.', created_by: OFFICER_ID },
  { category: 'Accounting', question: 'What does a negative change in accounts receivable mean for cash flow?', answer: "AR increased — cash wasn't collected yet. Subtract from operating cash flow (cash outflow).", created_by: OFFICER_ID },
  { category: 'Accounting', question: 'When is goodwill impaired?', answer: "When the carrying value of a reporting unit exceeds its fair value. Impairment is a non-cash charge that flows through the income statement.", created_by: OFFICER_ID },
  { category: 'Accounting', question: 'What is ASC 606?', answer: 'The revenue recognition standard: recognize revenue when (or as) performance obligations are satisfied, at the transaction price allocated to each.', created_by: OFFICER_ID },
  { category: 'Portfolio', question: 'What is beta?', answer: "A stock's sensitivity to overall market moves; its systematic, non-diversifiable risk.", created_by: OFFICER_ID },
  { category: 'Portfolio', question: 'What is alpha?', answer: "Return above what the stock's risk (beta) would predict — the value a manager adds.", created_by: OFFICER_ID },
  { category: 'Portfolio', question: 'Systematic vs. idiosyncratic risk?', answer: 'Systematic is market-wide and undiversifiable; idiosyncratic is company-specific and diversifiable.', created_by: OFFICER_ID },
  { category: 'Portfolio', question: 'Why does diversification reduce risk?', answer: "Imperfectly correlated assets don't all move together, so combined volatility is below the weighted average.", created_by: OFFICER_ID },
  { category: 'Risk', question: 'What is the Sharpe ratio?', answer: 'Excess return per unit of total risk: (return − risk-free) ÷ standard deviation.', created_by: OFFICER_ID },
  { category: 'Risk', question: 'What is Value at Risk (VaR)?', answer: 'The maximum expected loss over a period at a given confidence level — but it hides how bad losses beyond that point get.', created_by: OFFICER_ID },
  { category: 'Risk', question: 'What is maximum drawdown?', answer: 'The largest peak-to-trough decline in portfolio value; a measure of worst-case pain.', created_by: OFFICER_ID },
  { category: 'Risk', question: 'Why is leverage the most common cause of fund blowups?', answer: 'It magnifies losses and can force selling at the worst time, turning a drawdown into insolvency.', created_by: OFFICER_ID },
  { category: 'Process', question: 'What is an Investment Policy Statement?', answer: "The document defining a fund's objectives, constraints, risk limits, and process — its governing mandate.", created_by: OFFICER_ID },
];
