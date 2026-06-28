import { LayoutDashboard, TrendingUp, Calculator } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { MetricCard } from '../components/shared/MetricCard';
import { EmptyState } from '../components/shared/EmptyState';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', fund: 100, bench: 100 },
  { month: 'Feb', fund: 103, bench: 101 },
  { month: 'Mar', fund: 101, bench: 102 },
  { month: 'Apr', fund: 108, bench: 104 },
  { month: 'May', fund: 112, bench: 106 },
  { month: 'Jun', fund: 115, bench: 108 },
];

const tokens = [
  { name: 'green-950', hex: '#0E261C', label: 'Canvas' },
  { name: 'green-900', hex: '#14352A', label: 'Sidebar' },
  { name: 'green-800', hex: '#1B4536', label: 'Cards' },
  { name: 'green-700', hex: '#235541', label: 'Borders' },
  { name: 'green-600', hex: '#2F6B52', label: 'Accents' },
  { name: 'cream-100', hex: '#F3EEDF', label: 'Body text' },
  { name: 'cream-200', hex: '#E7DEC4', label: 'Headings' },
  { name: 'cream-400', hex: '#C9BD96', label: 'Muted' },
  { name: 'brass-500', hex: '#B89B5E', label: 'Gold accent' },
  { name: 'gain', hex: '#4FB286', label: 'Positive P&L' },
  { name: 'loss', hex: '#C25A4A', label: 'Negative P&L' },
];

export function DesignSystem() {
  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-cormorant text-cream-200">Design System</h1>
        <p className="text-cream-400 text-sm mt-1">MCG Mustang Terminal — brand tokens, typography, and component library</p>
      </div>

      {/* Color tokens */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Color Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tokens.map((t) => (
            <div key={t.name} className="flex flex-col gap-1.5">
              <div
                className="w-full h-12 rounded border border-green-700"
                style={{ backgroundColor: t.hex }}
              />
              <p className="text-xs font-mono text-cream-400">{t.name}</p>
              <p className="text-xs text-cream-400/70">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Typography</h2>
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-cream-400 mb-1 uppercase tracking-wide">Cormorant Garamond — Display</p>
              <p className="font-cormorant text-4xl text-cream-200">Mustang Capital Group</p>
              <p className="font-cormorant text-2xl text-cream-200 italic">Est. MMXXVI</p>
            </div>
            <div>
              <p className="text-xs text-cream-400 mb-1 uppercase tracking-wide">Inter — Body / UI</p>
              <p className="text-base text-cream-100">The quick brown fox jumps over the lazy dog. Investor relations. Fund management.</p>
              <p className="text-sm text-cream-400">Secondary text, captions, and metadata appear at reduced opacity.</p>
            </div>
            <div>
              <p className="text-xs text-cream-400 mb-1 uppercase tracking-wide">IBM Plex Mono — Data / Numbers</p>
              <p className="font-mono text-base text-cream-100" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                $1,234,567.89 &nbsp; +12.34% &nbsp; AAPL &nbsp; 234.56
              </p>
              <p className="font-mono text-sm text-gain" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                +$45,234.11 (+18.3%)
              </p>
              <p className="font-mono text-sm text-loss" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                −$8,120.55 (−3.2%)
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Metric Cards */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Metric Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total AUM" value="$1.24M" subvalue="+$43,200 today" subvalueClass="text-gain" icon={<TrendingUp size={20} />} />
          <MetricCard label="Unrealized P&L" value="+$127,890" subvalue="+11.4%" subvalueClass="text-gain" />
          <MetricCard label="Positions" value="7" subvalue="2 sectors overweight" subvalueClass="text-loss" />
          <MetricCard label="Loading state" value="—" loading />
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Buttons</h2>
        <Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Badges</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="buy">Buy</Badge>
            <Badge variant="sell">Sell</Badge>
            <Badge variant="hold">Hold</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="approved">Approved</Badge>
            <Badge variant="rejected">Rejected</Badge>
            <Badge variant="sector">Technology</Badge>
          </div>
        </Card>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Form Inputs</h2>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <Input label="Ticker" placeholder="AAPL" />
            <Input label="Target Price" placeholder="$0.00" hint="Enter the 12-month price target" />
            <Input label="With Error" placeholder="—" error="This field is required" />
          </div>
        </Card>
      </section>

      {/* Spinners */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Loading</h2>
        <Card>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Card>
      </section>

      {/* Sample chart */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Recharts — NAV vs Benchmark</h2>
        <Card>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#C9BD96', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#C9BD96', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#14352A', border: '1px solid #235541', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 12 }}
                labelStyle={{ color: '#E7DEC4' }}
                itemStyle={{ color: '#C9BD96' }}
              />
              <Line type="monotone" dataKey="fund" stroke="#F3EEDF" strokeWidth={2} dot={false} name="Fund NAV" />
              <Line type="monotone" dataKey="bench" stroke="#C9BD96" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Empty state */}
      <section>
        <h2 className="text-xl font-cormorant text-cream-200 mb-4">Empty State</h2>
        <Card>
          <EmptyState
            icon={<LayoutDashboard size={40} />}
            heading="No holdings yet"
            body="Add your first position to start tracking the portfolio."
            action={<Button variant="primary" size="sm">Add Holding</Button>}
          />
        </Card>
      </section>
    </div>
  );
}
