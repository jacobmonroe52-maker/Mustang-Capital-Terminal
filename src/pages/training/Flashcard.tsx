import { useState, useEffect } from 'react';
import type { Flashcard, CardState } from '../../types';
import { Button } from '../../components/ui/Button';

interface Props {
  card: Flashcard;
  currentState: CardState;
  onMark: (state: CardState) => void;
  index: number;
  total: number;
}

export function FlashcardView({ card, currentState, onMark, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip when card changes
  useEffect(() => { setFlipped(false); }, [card.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f); }
      if (flipped && e.key === 'k') onMark('known');
      if (flipped && e.key === 'r') onMark('review');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, onMark]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="text-xs text-cream-400 mb-4 font-mono">
        {index + 1} / {total} · {card.category}
        {currentState !== 'unseen' && (
          <span className={['ml-2', currentState === 'known' ? 'text-gain' : 'text-brass-500'].join(' ')}>
            · {currentState}
          </span>
        )}
      </div>

      {/* Flip card */}
      <div
        className="card-flip w-full cursor-pointer"
        style={{ perspective: '1000px', minHeight: '280px' }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Show question (press Space)' : 'Reveal answer (press Space)'}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f); } }}
      >
        <div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s ease',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
            className="bg-green-800 border border-green-700 rounded-xl p-8 flex flex-col items-center justify-center"
          >
            <p className="text-xs text-cream-400 uppercase tracking-wide mb-4">Question</p>
            <p className="font-cormorant text-2xl text-cream-200 text-center leading-snug">{card.question}</p>
            <p className="text-xs text-cream-400 mt-6">Click or press Space to reveal</p>
          </div>

          {/* Back */}
          <div
            style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}
            className="bg-green-900 border border-brass-500/30 rounded-xl p-8 flex flex-col items-center justify-center"
          >
            <p className="text-xs text-brass-500 uppercase tracking-wide mb-4">Answer</p>
            <p className="text-cream-100 text-center text-base leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      {/* Mark buttons — only show after flip */}
      <div className={['flex gap-3 mt-5 transition-opacity duration-200', flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'].join(' ')}>
        <Button
          variant="secondary"
          className="border-gain/30 text-gain hover:bg-gain/10"
          onClick={() => onMark('known')}
        >
          Known (K)
        </Button>
        <Button
          variant="secondary"
          className="border-brass-500/30 text-brass-500 hover:bg-brass-500/10"
          onClick={() => onMark('review')}
        >
          Review (R)
        </Button>
      </div>
    </div>
  );
}
