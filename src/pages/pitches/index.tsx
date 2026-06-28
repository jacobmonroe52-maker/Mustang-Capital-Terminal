import { useEffect, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import type { PitchStatus } from '../../types';
import { usePitchStore } from '../../store/pitchStore';
import { PitchCard } from './PitchCard';
import { PitchModal } from './PitchModal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { SEED_PROFILES } from '../../lib/seed';

type Filter = 'all' | PitchStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function getAuthorName(authorId: string): string {
  return SEED_PROFILES.find((p) => p.id === authorId)?.full_name ?? authorId.slice(0, 8);
}

export function Pitches() {
  const { pitches, votes, isLoading, loadAll } = usePitchStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const filtered = pitches.filter((p) => filter === 'all' || p.status === filter);
  const decided = pitches.filter((p) => p.status !== 'pending' && p.decision_rationale);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl text-cream-200">Pitch & Voting</h1>
        <Button variant="primary" size="sm" onClick={() => setSubmitOpen(true)}>
          <Plus size={14} /> Submit Pitch
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 border-b border-green-700 pb-0">
        {FILTERS.map((f) => {
          const ct = f.key === 'all' ? pitches.length : pitches.filter((p) => p.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                filter === f.key
                  ? 'text-brass-500 border-brass-500'
                  : 'text-cream-400 border-transparent hover:text-cream-100',
              ].join(' ')}
            >
              {f.label}
              <span className="ml-1.5 text-xs font-mono opacity-70">({ct})</span>
            </button>
          );
        })}
      </div>

      {/* Pitch list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-green-800 border border-green-700 rounded-lg h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={40} />}
          heading={filter === 'all' ? 'No pitches yet' : `No ${filter} pitches`}
          body={filter === 'all' ? 'Be the first to submit an investment idea.' : `No pitches have been ${filter} yet.`}
          action={filter === 'all' ? <Button variant="primary" size="sm" onClick={() => setSubmitOpen(true)}>Submit First Pitch</Button> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              votes={votes.filter((v) => v.pitch_id === pitch.id)}
              authorName={getAuthorName(pitch.submitted_by)}
            />
          ))}
        </div>
      )}

      {/* Decision log */}
      {decided.length > 0 && filter === 'all' && (
        <div>
          <h2 className="font-cormorant text-xl text-cream-200 mb-3">Decision Log</h2>
          <div className="space-y-2">
            {decided.map((p) => (
              <div key={p.id} className={['flex items-center gap-3 px-4 py-2.5 rounded border text-sm', p.status === 'approved' ? 'bg-gain/5 border-gain/20' : 'bg-loss/5 border-loss/20'].join(' ')}>
                <span className="font-mono text-xs text-brass-500 w-12 shrink-0">{p.ticker}</span>
                <span className={['text-xs font-mono font-medium capitalize', p.status === 'approved' ? 'text-gain' : 'text-loss'].join(' ')}>{p.status}</span>
                <span className="text-cream-400 flex-1 truncate">{p.decision_rationale}</span>
                <span className="text-cream-400 text-xs shrink-0">{p.decided_at ? new Date(p.decided_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PitchModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}
