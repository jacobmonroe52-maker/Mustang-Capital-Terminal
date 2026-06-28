import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { NavPoint } from '../../types';
import { fmtCompactUSD, fmtPct } from '../../lib/format';

type Period = '1M' | '3M' | '6M' | '1Y' | 'All';

const PERIODS: Period[] = ['1M', '3M', '6M', '1Y', 'All'];

const PERIOD_DAYS: Record<Period, number> = {
  '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'All': Infinity,
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  startNav: number;
  startBench: number;
}

function CustomTooltip({ active, payload, label, startNav, startBench }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const fundVal = payload.find((p) => p.name === 'Fund')?.value ?? 0;
  const benchVal = payload.find((p) => p.name === 'Benchmark')?.value ?? 0;
  const fundReturn = startNav > 0 ? (fundVal - startNav) / startNav : 0;
  const benchReturn = startBench > 0 ? (benchVal - startBench) / startBench : 0;

  return (
    <div className="bg-green-900 border border-green-700 rounded p-3 text-xs font-mono space-y-1.5 shadow-lg">
      <p className="text-cream-200 font-medium">{label}</p>
      <div className="flex gap-4">
        <div>
          <p className="text-cream-400">Fund</p>
          <p className="text-cream-100">{fmtCompactUSD(fundVal)}</p>
          <p className={fundReturn >= 0 ? 'text-gain' : 'text-loss'}>
            {fundReturn >= 0 ? '+' : ''}{fmtPct(fundReturn)}
          </p>
        </div>
        <div>
          <p className="text-cream-400">Benchmark</p>
          <p className="text-cream-100">{fmtCompactUSD(benchVal)}</p>
          <p className={benchReturn >= 0 ? 'text-gain' : 'text-loss'}>
            {benchReturn >= 0 ? '+' : ''}{fmtPct(benchReturn)}
          </p>
        </div>
        <div>
          <p className="text-cream-400">Alpha</p>
          <p className={(fundReturn - benchReturn) >= 0 ? 'text-gain' : 'text-loss'}>
            {(fundReturn - benchReturn) >= 0 ? '+' : ''}{fmtPct(fundReturn - benchReturn)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NavHistoryChart({ navHistory }: { navHistory: NavPoint[] }) {
  const [period, setPeriod] = useState<Period>('6M');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period]);

  const filtered = navHistory.filter((p) =>
    period === 'All' || new Date(p.date) >= cutoff
  );

  const startNav = filtered[0]?.nav ?? 0;
  const startBench = filtered[0]?.benchmark_value ?? 0;

  const data = filtered.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Fund': p.nav,
    'Benchmark': p.benchmark_value,
  }));

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={[
              'px-2.5 py-1 text-xs font-mono rounded transition-colors',
              period === p
                ? 'bg-brass-500/20 text-brass-500 border border-brass-500/40'
                : 'text-cream-400 hover:text-cream-100 hover:bg-green-700',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#C9BD96', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fill: '#C9BD96', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => fmtCompactUSD(v)}
            domain={['auto', 'auto']}
            width={70}
          />
          <Tooltip content={<CustomTooltip startNav={startNav} startBench={startBench} />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#C9BD96', fontFamily: 'IBM Plex Mono', fontSize: 11 }}>{value}</span>
            )}
          />
          <Line type="monotone" dataKey="Fund" stroke="#F3EEDF" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Benchmark" stroke="#C9BD96" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
