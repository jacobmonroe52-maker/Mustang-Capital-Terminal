import { SEED_PRICES } from './seed';

// TODO: For production, proxy this call through a Supabase Edge Function so
// the API key is not exposed in the client bundle. The key is currently
// readable by anyone who opens DevTools → Network.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  price: number;
  fetchedAt: number;
}

const cache: Record<string, CacheEntry> = {};

async function fetchFromFMP(tickers: string[]): Promise<Record<string, number>> {
  const apiKey = import.meta.env.VITE_MARKET_API_KEY;
  if (!apiKey) return {};

  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${tickers.join(',')}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, number> = {};
    if (Array.isArray(data)) {
      for (const q of data) {
        if (q.symbol && typeof q.price === 'number') {
          result[q.symbol] = q.price;
          cache[q.symbol] = { price: q.price, fetchedAt: Date.now() };
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function getBatchPrices(tickers: string[]): Promise<Record<string, number>> {
  const stale = tickers.filter(
    (t) => !cache[t] || Date.now() - cache[t].fetchedAt > CACHE_TTL_MS
  );

  if (stale.length > 0) {
    await fetchFromFMP(stale);
  }

  const result: Record<string, number> = {};
  for (const ticker of tickers) {
    result[ticker] = cache[ticker]?.price ?? SEED_PRICES[ticker] ?? 0;
  }
  return result;
}

export function getCachedPrice(ticker: string): number {
  return cache[ticker]?.price ?? SEED_PRICES[ticker] ?? 0;
}

export function isPriceStale(ticker: string): boolean {
  if (!cache[ticker]) return true;
  return Date.now() - cache[ticker].fetchedAt > CACHE_TTL_MS;
}
