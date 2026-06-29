import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EnrichedHolding } from '../../types';
import { fmtPct } from '../../lib/format';

const COLORS = ['#2F6B52', '#B89B5E', '#4FB286', '#E7DEC4', '#C9BD96', '#235541', '#1B4536'];

interface Props {
  holdings: EnrichedHolding[];
  cashBalance: number;
  totalAum: number;
}

export function AllocationDonut({ holdings, cashBalance, totalAum }: Props) {
  const data = [
    ...holdings.map((h, i) => ({
      name: h.ticker,
      value: h.market_value,
      color: COLORS[i % COLORS.length],
      weight: h.weight,
    })),
    ...(cashBalance > 0
      ? [{ name: 'Cash', value: cashBalance, color: '#C9BD96', weight: totalAum > 0 ? cashBalance / totalAum : 0 }]
      : []),
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#14352A',
              border: '1px solid #235541',
              borderRadius: 6,
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 12,
            }}
            formatter={(_value: unknown, _name: unknown, entry: { payload?: { weight: number } }) => [
              fmtPct(entry.payload?.weight ?? 0),
              undefined,
            ]}
            labelStyle={{ color: '#E7DEC4' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#C9BD96', fontFamily: 'IBM Plex Mono', fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
