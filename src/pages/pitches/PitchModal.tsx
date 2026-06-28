import { useState } from 'react';
import type { PitchRecommendation } from '../../types';
import { usePitchStore } from '../../store/pitchStore';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const SECTORS = ['Technology', 'Financials', 'Healthcare', 'Consumer Disc.', 'Energy', 'Industrials', 'Utilities', 'Real Estate'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PitchModal({ open, onClose }: Props) {
  const { profile } = useAuthStore();
  const { createPitch } = usePitchStore();
  const [form, setForm] = useState({
    ticker: '',
    company_name: '',
    sector: SECTORS[0],
    thesis: '',
    valuation_summary: '',
    target_price: '',
    current_price: '',
    recommendation: 'Buy' as PitchRecommendation,
    key_risks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!profile) return;
    if (!form.ticker || !form.company_name || !form.thesis || !form.target_price) {
      setError('Ticker, company, thesis, and target price are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createPitch({
        ticker: form.ticker.toUpperCase(),
        company_name: form.company_name,
        sector: form.sector,
        thesis: form.thesis,
        valuation_summary: form.valuation_summary,
        target_price: Number(form.target_price),
        current_price: Number(form.current_price) || 0,
        recommendation: form.recommendation,
        key_risks: form.key_risks.split('\n').map((r) => r.trim()).filter(Boolean),
        submitted_by: profile.id,
      });
      onClose();
      setForm({ ticker: '', company_name: '', sector: SECTORS[0], thesis: '', valuation_summary: '', target_price: '', current_price: '', recommendation: 'Buy', key_risks: '' });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Investment Pitch" size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ticker" value={form.ticker} onChange={field('ticker')} placeholder="NVDA" />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Recommendation</label>
            <select value={form.recommendation} onChange={field('recommendation')}
              className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none">
              {(['Buy', 'Sell', 'Hold'] as PitchRecommendation[]).map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Company Name" value={form.company_name} onChange={field('company_name')} placeholder="NVIDIA Corporation" />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Sector</label>
            <select value={form.sector} onChange={field('sector')}
              className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none">
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Target Price" type="number" value={form.target_price} onChange={field('target_price')} placeholder="500.00" />
          <Input label="Current Price" type="number" value={form.current_price} onChange={field('current_price')} placeholder="135.00" hint="Optional — for implied upside calc" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Investment Thesis</label>
          <textarea
            value={form.thesis}
            onChange={field('thesis')}
            rows={5}
            placeholder="Why is this an attractive investment? What is the key insight the market is missing?"
            className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Valuation Summary</label>
          <textarea
            value={form.valuation_summary}
            onChange={field('valuation_summary')}
            rows={2}
            placeholder="Brief description of your valuation approach and conclusion"
            className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Key Risks (one per line)</label>
          <textarea
            value={form.key_risks}
            onChange={field('key_risks')}
            rows={3}
            placeholder="Regulatory risk&#10;Competitive pressure from XYZ&#10;Macro sensitivity"
            className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none"
          />
        </div>
        {error && <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-green-900 pb-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Pitch'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
