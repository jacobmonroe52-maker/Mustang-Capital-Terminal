import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import type { Pitch, PitchVote } from '../../types';
import { usePitchStore } from '../../store/pitchStore';
import { useAuthStore } from '../../store/authStore';
import { useRole } from '../../store/authStore';
import { VoteButton } from './VoteButton';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { fmtUSD, fmtPct, fmtDate } from '../../lib/format';

interface Props {
  pitch: Pitch;
  votes: PitchVote[];
  authorName?: string;
}

export function PitchCard({ pitch, votes, authorName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showDecide, setShowDecide] = useState(false);
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuthStore();
  const { isOfficer } = useRole();
  const { decidePitch } = usePitchStore();
  const navigate = useNavigate();

  const upside = pitch.current_price > 0
    ? (pitch.target_price - pitch.current_price) / pitch.current_price
    : null;

  const recVariant = pitch.recommendation === 'Buy' ? 'buy' : pitch.recommendation === 'Sell' ? 'sell' : 'hold';
  const statusVariant = pitch.status as 'pending' | 'approved' | 'rejected';

  const handleDecide = async (decision: 'approved' | 'rejected') => {
    if (!profile || !rationale.trim()) return;
    setLoading(true);
    try {
      await decidePitch(pitch.id, decision, rationale, profile.id);
      setShowDecide(false);
      setRationale('');
      if (decision === 'approved') {
        const doAdd = window.confirm(`Pitch approved. Add ${pitch.ticker} to the portfolio now?`);
        if (doAdd) {
          navigate('/dashboard', { state: { addHolding: { ticker: pitch.ticker, company_name: pitch.company_name, sector: pitch.sector } } });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-800 border border-green-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-medium text-brass-500 text-sm">{pitch.ticker}</span>
            <Badge variant={recVariant}>{pitch.recommendation}</Badge>
            <Badge variant={statusVariant}>{pitch.status}</Badge>
            <Badge variant="sector">{pitch.sector}</Badge>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-cream-400">Target</p>
            <p className="font-mono text-sm text-cream-100">{fmtUSD(pitch.target_price)}</p>
            {upside !== null && (
              <p className={['text-xs font-mono', upside >= 0 ? 'text-gain' : 'text-loss'].join(' ')}>
                {upside >= 0 ? '+' : ''}{fmtPct(upside)} upside
              </p>
            )}
          </div>
        </div>
        <h3 className="font-cormorant text-lg text-cream-200 mt-1.5">{pitch.company_name}</h3>
        <p className="text-sm text-cream-400 mt-1 line-clamp-2">{pitch.thesis}</p>
        {expanded && (
          <div className="mt-3 space-y-3">
            {pitch.valuation_summary && (
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide mb-1">Valuation</p>
                <p className="text-sm text-cream-100">{pitch.valuation_summary}</p>
              </div>
            )}
            {pitch.key_risks.length > 0 && (
              <div>
                <p className="text-xs text-cream-400 uppercase tracking-wide mb-1">Key Risks</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {pitch.key_risks.map((r, i) => (
                    <li key={i} className="text-sm text-cream-400">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {pitch.status !== 'pending' && pitch.decision_rationale && (
              <div className={['p-3 rounded border', pitch.status === 'approved' ? 'bg-gain/5 border-gain/20' : 'bg-loss/5 border-loss/20'].join(' ')}>
                <p className="text-xs text-cream-400 uppercase tracking-wide mb-1">Decision Rationale</p>
                <p className="text-sm text-cream-100">{pitch.decision_rationale}</p>
                {pitch.decided_at && (
                  <p className="text-xs text-cream-400 mt-1">{fmtDate(pitch.decided_at)}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-green-900/50 border-t border-green-700 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <VoteButton pitchId={pitch.id} votes={votes} />
          {pitch.status === 'pending' && isOfficer && !showDecide && (
            <Button variant="ghost" size="sm" onClick={() => setShowDecide(true)}>
              <ArrowRight size={12} /> Decide
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-cream-400">
            {authorName ?? pitch.submitted_by.slice(0, 8)} · {fmtDate(pitch.created_at)}
          </span>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-cream-400 hover:text-cream-100 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Officer decision panel */}
      {showDecide && isOfficer && (
        <div className="px-4 py-3 bg-green-950/50 border-t border-green-700">
          <p className="text-xs text-cream-400 mb-2">Decision rationale (required):</p>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={2}
            placeholder="Explain the decision..."
            className="w-full bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none mb-2"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="text-gain border-gain/30 hover:bg-gain/10" disabled={!rationale.trim() || loading}
              onClick={() => handleDecide('approved')}>
              <CheckCircle size={12} /> Approve
            </Button>
            <Button size="sm" variant="danger" disabled={!rationale.trim() || loading}
              onClick={() => handleDecide('rejected')}>
              <XCircle size={12} /> Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowDecide(false); setRationale(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
