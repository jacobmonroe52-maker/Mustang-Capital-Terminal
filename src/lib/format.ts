const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdWholeFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const pctFmt = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct1Fmt = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
});

const compactUsdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
});

export const fmtUSD = (n: number) => usdFmt.format(n);
export const fmtUSDWhole = (n: number) => usdWholeFmt.format(n);
export const fmtCompactUSD = (n: number) => compactUsdFmt.format(n);
export const fmtPct = (n: number) => pctFmt.format(n);
export const fmtPct1 = (n: number) => pct1Fmt.format(n);
export const fmtCompact = (n: number) => compactFmt.format(n);
export const fmtNum = (n: number, decimals = 2) => n.toFixed(decimals);
export const fmtShares = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

export const gainLossClass = (n: number) =>
  n >= 0 ? 'text-gain' : 'text-loss';

export const gainLossBg = (n: number) =>
  n >= 0 ? 'bg-gain/10' : 'bg-loss/10';

export const fmtRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
