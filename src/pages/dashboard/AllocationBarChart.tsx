import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { EnrichedHolding } from '../../types';

interface Props {
  holdings: EnrichedHolding[];
}

export function AllocationBarChart({ holdings }: Props) {
  const data = holdings.map((h) => ({
    ticker: h.ticker,
    actual: parseFloat((h.weight * 100).toFixed(1)),
    target: parseFloat((h.target_weight * 100).toFixed(1)),
    delta: parseFloat(((h.weight - h.target_weight) * 100).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="ticker"
          tick={{ fill: '#C9BD96', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#C9BD96', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#14352A',
            border: '1px solid #235541',
            borderRadius: 6,
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
          }}
          formatter={(value: unknown, name: unknown) => [typeof value === 'number' ? `${value.toFixed(1)}%` : '0%', name === 'actual' ? 'Actual' : 'Target']}
          labelStyle={{ color: '#E7DEC4' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#C9BD96', fontFamily: 'IBM Plex Mono', fontSize: 11 }}>
              {value === 'actual' ? 'Actual' : 'Target'}
            </span>
          )}
        />
        <ReferenceLine y={0} stroke="#235541" />
        <Bar dataKey="actual" fill="#2F6B52" radius={[2, 2, 0, 0]} />
        <Bar dataKey="target" fill="#B89B5E" radius={[2, 2, 0, 0]} opacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
