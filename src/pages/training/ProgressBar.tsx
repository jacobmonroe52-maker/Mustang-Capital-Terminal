import type { Flashcard, FlashcardProgress } from '../../types';

interface Props {
  cards: Flashcard[];
  progress: FlashcardProgress[];
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export function ProgressBar({ cards, progress, activeCategory, onSelectCategory }: Props) {
  const categories = Array.from(new Set(cards.map((c) => c.category))).sort();

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={['w-full text-left px-3 py-2 rounded transition-colors text-sm', activeCategory === null ? 'bg-green-700 text-cream-100' : 'text-cream-400 hover:bg-green-800 hover:text-cream-100'].join(' ')}
      >
        All Categories
        <span className="ml-1 font-mono text-xs">({cards.length})</span>
      </button>
      {categories.map((cat) => {
        const catCards = cards.filter((c) => c.category === cat);
        const catIds = new Set(catCards.map((c) => c.id));
        const prog = progress.filter((p) => catIds.has(p.card_id));
        const known = prog.filter((p) => p.state === 'known').length;
        const review = prog.filter((p) => p.state === 'review').length;
        const total = catCards.length;
        const knownPct = total > 0 ? known / total : 0;
        const reviewPct = total > 0 ? review / total : 0;

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={['w-full text-left px-3 py-2.5 rounded transition-colors', activeCategory === cat ? 'bg-green-700 text-cream-100' : 'text-cream-400 hover:bg-green-800 hover:text-cream-100'].join(' ')}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm">{cat}</span>
              <span className="font-mono text-xs">{known}/{total}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
              <div className="bg-gain rounded-l" style={{ width: `${knownPct * 100}%` }} />
              <div className="bg-brass-500" style={{ width: `${reviewPct * 100}%` }} />
              <div className="bg-green-700 rounded-r flex-1" />
            </div>
            <div className="flex gap-3 mt-1 text-xs font-mono">
              <span className="text-gain">{known} known</span>
              <span className="text-brass-500">{review} review</span>
              <span className="text-cream-400">{total - known - review} unseen</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
