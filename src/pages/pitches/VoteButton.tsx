import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import type { PitchVote, VoteChoice } from '../../types';
import { usePitchStore } from '../../store/pitchStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  pitchId: string;
  votes: PitchVote[];
}

export function VoteButton({ pitchId, votes }: Props) {
  const { profile } = useAuthStore();
  const { upsertVote, deleteVote } = usePitchStore();
  const [loading, setLoading] = useState(false);

  const myVote = votes.find((v) => v.user_id === profile?.id)?.vote ?? null;
  const buyCt = votes.filter((v) => v.vote === 'buy').length;
  const passCt = votes.filter((v) => v.vote === 'pass').length;

  const handleVote = async (choice: VoteChoice) => {
    if (!profile || loading) return;
    setLoading(true);
    try {
      if (myVote === choice) {
        await deleteVote(pitchId, profile.id);
      } else {
        await upsertVote(pitchId, profile.id, choice);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('buy')}
        disabled={loading}
        className={[
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors',
          myVote === 'buy'
            ? 'bg-gain/20 text-gain border border-gain/40'
            : 'bg-green-700/50 text-cream-400 border border-green-700 hover:border-gain/40 hover:text-gain',
        ].join(' ')}
        title="Vote Buy"
      >
        <ThumbsUp size={12} />
        <span>Buy {buyCt}</span>
      </button>
      <button
        onClick={() => handleVote('pass')}
        disabled={loading}
        className={[
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors',
          myVote === 'pass'
            ? 'bg-loss/20 text-loss border border-loss/40'
            : 'bg-green-700/50 text-cream-400 border border-green-700 hover:border-loss/40 hover:text-loss',
        ].join(' ')}
        title="Vote Pass"
      >
        <ThumbsDown size={12} />
        <span>Pass {passCt}</span>
      </button>
    </div>
  );
}
