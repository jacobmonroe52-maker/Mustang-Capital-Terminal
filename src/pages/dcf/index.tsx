import { useMemo, useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DcfInputs, DcfScenario } from '../../types';
import { runDcf } from './dcfMath';
import { SensitivityTable } from './SensitivityTable';
import { Slider } from '../../components/ui/Slider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { db } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { fmtUSD, fmtPct, gainLossClass, fmtCompactUSD } from '../../lib/format';

const DEFAULT_INPUTS: DcfInputs = {
  base_fcf: 100,
  fcf_growth_rate: 0.10,
  years: 5,
  wacc: 0.10,
  terminal_growth: 0.03,
  total_debt: 50,
  cash: 20,
  diluted_shares: 100,
  current_price: 25,
};

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  display?: (v: number) => string;
  suffix?: string;
}

function NumField({ label, value, onChange, min, max, step = 0.01, display, suffix }: NumFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">{label}</label>
        <span className="text-xs font-mono text-brass-500">{display ? display(value) : `${value}${suffix ?? ''}`}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-green-900 border border-green-700 rounded px-2 py-1 text-cream-100 text-xs font-mono focus:border-brass-500 focus:outline-none text-right"
      />
    </div>
  );
}

export function DCF() {
  const [inputs, setInputs] = useState<DcfInputs>(DEFAULT_INPUTS);
  const [ticker, setTicker] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarios, setScenarios] = useState<DcfScenario[]>([]);
  const { profile } = useAuthStore();

  const result = useMemo(() => runDcf(inputs), [inputs]);

  const set = (key: keyof DcfInputs) => (v: number) =>
    setInputs((i) => ({ ...i, [key]: v }));

  useEffect(() => {
    if (!profile) return;
    db.getScenarios(profile.id).then(setScenarios);
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !scenarioName.trim()) return;
    await db.saveScenario({
      name: scenarioName.trim(),
      ticker: ticker.toUpperCase() || 'N/A',
      user_id: profile.id,
      inputs,
      result,
    });
    setScenarios(await db.getScenarios(profile.id));
    setSaveOpen(false);
    setScenarioName('');
  };

  const loadScenario = (s: DcfScenario) => {
    setInputs(s.inputs);
    setTicker(s.ticker === 'N/A' ? '' : s.ticker);
  };

  const deleteScenario = async (id: string) => {
    await db.deleteScenario(id);
    setScenarios((ss) => ss.filter((s) => s.id !== id));
  };

  const chartData = result.projected_fcfs.map((fcf, i) => ({
    year: `Y${i + 1}`,
    fcf: parseFloat(fcf.toFixed(1)),
  }));

  const tvPctHigh = result.tv_pct_of_ev > 0.80;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="font-cormorant text-3xl text-cream-200">DCF Valuation</h1>
        <div className="w-28">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="TICKER"
            className="bg-green-900 border border-green-700 rounded px-3 py-1.5 text-brass-500 text-sm font-mono uppercase w-full focus:border-brass-500 focus:outline-none"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSaveOpen(true)}>
          <Save size={14} /> Save Scenario
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input panel */}
        <Card className="xl:col-span-1">
          <h2 className="font-cormorant text-lg text-cream-200 mb-4">Inputs</h2>
          <div className="space-y-5">
            <NumField label="Base FCF ($M)" value={inputs.base_fcf} onChange={set('base_fcf')} min={-500} max={50000} step={10} display={(v) => `$${v}M`} />
            <NumField label="FCF Growth Rate" value={inputs.fcf_growth_rate} onChange={set('fcf_growth_rate')} min={-0.5} max={1.0} step={0.01} display={(v) => fmtPct(v)} />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">Projection Years</label>
                <span className="text-xs font-mono text-brass-500">{inputs.years}yr</span>
              </div>
              <Slider min={1} max={10} step={1} value={inputs.years} onChange={(e) => set('years')(Number(e.target.value))} />
              <input type="number" value={inputs.years} min={1} max={10} step={1} onChange={(e) => set('years')(Number(e.target.value))}
                className="bg-green-900 border border-green-700 rounded px-2 py-1 text-cream-100 text-xs font-mono focus:border-brass-500 focus:outline-none text-right" />
            </div>
            <NumField label="WACC" value={inputs.wacc} onChange={set('wacc')} min={0.01} max={0.30} step={0.005} display={(v) => fmtPct(v)} />
            <NumField label="Terminal Growth" value={inputs.terminal_growth} onChange={set('terminal_growth')} min={-0.05} max={0.10} step={0.005} display={(v) => fmtPct(v)} />
            <div className="h-px bg-green-700" />
            <NumField label="Total Debt ($M)" value={inputs.total_debt} onChange={set('total_debt')} min={0} max={100000} step={10} display={(v) => `$${v}M`} />
            <NumField label="Cash & Equivalents ($M)" value={inputs.cash} onChange={set('cash')} min={0} max={100000} step={10} display={(v) => `$${v}M`} />
            <NumField label="Diluted Shares (M)" value={inputs.diluted_shares} onChange={set('diluted_shares')} min={0.1} max={100000} step={10} display={(v) => `${v}M`} />
            <NumField label="Current Share Price" value={inputs.current_price} onChange={set('current_price')} min={0} max={10000} step={0.5} display={(v) => fmtUSD(v)} />
          </div>
        </Card>

        {/* Output panel + charts */}
        <div className="xl:col-span-2 space-y-4">
          {/* Error or results */}
          {result.error ? (
            <Card>
              <div className="flex items-start gap-3 text-loss">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Invalid Inputs</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="font-cormorant text-lg text-cream-200 mb-4">Intrinsic Value</h2>
              <div className="text-center mb-4">
                <p
                  className="font-cormorant text-5xl font-bold text-brass-500 leading-none mb-1"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {fmtUSD(result.dcf_value_per_share)}
                </p>
                <p className={['text-xl font-mono font-medium', gainLossClass(result.upside_pct)].join(' ')}>
                  {result.upside_pct >= 0 ? '+' : ''}{fmtPct(result.upside_pct)} vs. current {fmtUSD(inputs.current_price)}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-green-700">
                {[
                  { label: 'Enterprise Value', value: fmtCompactUSD(result.enterprise_value) + 'M' },
                  { label: 'Equity Value', value: fmtCompactUSD(result.equity_value) + 'M' },
                  { label: 'Terminal Value', value: fmtCompactUSD(result.terminal_value) + 'M' },
                  { label: 'TV % of EV', value: fmtPct(result.tv_pct_of_ev), alert: tvPctHigh },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-xs text-cream-400 mb-1">{m.label}</p>
                    <p className={['font-mono text-sm', m.alert ? 'text-loss' : 'text-cream-100'].join(' ')}>
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
              {tvPctHigh && (
                <p className="mt-3 text-xs text-loss/80 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Terminal value represents {fmtPct(result.tv_pct_of_ev)} of EV — model is highly sensitive to terminal assumptions.
                </p>
              )}
            </Card>
          )}

          {/* FCF bar chart */}
          {!result.error && chartData.length > 0 && (
            <Card>
              <h2 className="font-cormorant text-lg text-cream-200 mb-3">Projected FCF ($M)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" tick={{ fill: '#C9BD96', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#C9BD96', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14352A', border: '1px solid #235541', borderRadius: 6, fontFamily: 'IBM Plex Mono', fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toFixed(1)}M`, 'FCF']}
                    labelStyle={{ color: '#E7DEC4' }}
                  />
                  <Bar dataKey="fcf" fill="#2F6B52" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Sensitivity table */}
          {!result.error && (
            <Card>
              <SensitivityTable inputs={inputs} baseValue={result.dcf_value_per_share} />
            </Card>
          )}
        </div>
      </div>

      {/* Saved scenarios */}
      {scenarios.length > 0 && (
        <Card>
          <h2 className="font-cormorant text-lg text-cream-200 mb-3">Saved Scenarios</h2>
          <div className="space-y-2">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2.5 bg-green-900 border border-green-700 rounded hover:border-green-600 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-brass-500 shrink-0">{s.ticker}</span>
                  <span className="text-sm text-cream-100 truncate">{s.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-cream-400">{fmtUSD(s.result.dcf_value_per_share)}</span>
                  <span className={['font-mono text-xs', gainLossClass(s.result.upside_pct)].join(' ')}>
                    {s.result.upside_pct >= 0 ? '+' : ''}{fmtPct(s.result.upside_pct)}
                  </span>
                  <button onClick={() => loadScenario(s)} className="text-xs text-cream-400 hover:text-cream-100 transition-colors">Load</button>
                  <button onClick={() => deleteScenario(s.id)} className="text-cream-400 hover:text-loss transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Save Modal */}
      <Modal open={saveOpen} onClose={() => { setSaveOpen(false); setScenarioName(''); }} title="Save Scenario" size="sm">
        <div className="space-y-4">
          <Input
            label="Scenario Name"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder={`${ticker || 'AAPL'} Base Case`}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setSaveOpen(false); setScenarioName(''); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!scenarioName.trim()}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
