import { create } from 'zustand';
import type { Holding, NavPoint, FundSettings, EnrichedHolding } from '../types';
import { db } from '../lib/db';
import { getBatchPrices } from '../lib/marketData';

interface PortfolioState {
  holdings: Holding[];
  navHistory: NavPoint[];
  prices: Record<string, number>;
  priceStatus: 'idle' | 'loading' | 'error';
  fundSettings: FundSettings | null;
  aum: number | null;
  isLoading: boolean;
  error: string | null;

  loadAll: () => Promise<void>;
  loadPrices: () => Promise<void>;
  upsertHolding: (h: Omit<Holding, 'id' | 'book_value' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<void>;
  deleteHolding: (id: string) => Promise<void>;
  setAum: (aum: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  navHistory: [],
  prices: {},
  priceStatus: 'idle',
  fundSettings: null,
  aum: null,
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [holdings, navHistory, fundSettings] = await Promise.all([
        db.getHoldings(),
        db.getNavHistory(),
        db.getFundSettings(),
      ]);
      set({ holdings, navHistory, fundSettings, isLoading: false });
      get().loadPrices();
    } catch (err) {
      set({ isLoading: false, error: String(err) });
    }
  },

  loadPrices: async () => {
    const { holdings, fundSettings } = get();
    if (holdings.length === 0) return;
    set({ priceStatus: 'loading' });
    try {
      const tickers = holdings.map((h) => h.ticker);
      const prices = await getBatchPrices(tickers);
      const totalMV = holdings.reduce(
        (sum, h) => sum + (prices[h.ticker] ?? h.cost_basis) * h.shares,
        0
      );
      const cashBalance = fundSettings?.cash_balance ?? 0;
      set({ prices, priceStatus: 'idle', aum: totalMV + cashBalance });
    } catch {
      set({ priceStatus: 'error' });
    }
  },

  upsertHolding: async (h) => {
    const updated = await db.upsertHolding(h);
    set((s) => {
      const holdings = h.id
        ? s.holdings.map((x) => (x.id === h.id ? updated : x))
        : [...s.holdings, updated];
      return { holdings };
    });
    get().loadPrices();
  },

  deleteHolding: async (id) => {
    await db.deleteHolding(id);
    set((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) }));
    get().loadPrices();
  },

  setAum: (aum) => set({ aum }),
}));

export function selectEnrichedHoldings(state: PortfolioState): EnrichedHolding[] {
  const totalMV = state.holdings.reduce(
    (sum, h) => sum + (state.prices[h.ticker] ?? h.cost_basis) * h.shares,
    0
  );
  return state.holdings.map((h) => {
    const current_price = state.prices[h.ticker] ?? h.cost_basis;
    const market_value = current_price * h.shares;
    const weight = totalMV > 0 ? market_value / totalMV : 0;
    const gain_loss = market_value - h.book_value;
    const gain_loss_pct = h.book_value > 0 ? gain_loss / h.book_value : 0;
    return { ...h, current_price, market_value, weight, gain_loss, gain_loss_pct };
  });
}
