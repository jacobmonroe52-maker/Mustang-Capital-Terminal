import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import type { CardState } from '../../types';
import { useFlashcardStore } from '../../store/flashcardStore';
import { useAuthStore } from '../../store/authStore';
import { useRole } from '../../store/authStore';
import { FlashcardView } from './Flashcard';
import { ProgressBar } from './ProgressBar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';

const CATEGORIES = ['Valuation', 'Accounting', 'Portfolio', 'Risk', 'Process', 'Fixed income', 'Markets', 'Behavioral Finance'];

export function Training() {
  const { profile } = useAuthStore();
  const { isOfficer } = useRole();
  const { cards, progress, isLoading, loadAll, upsertCard, deleteCard, markCard } = useFlashcardStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const [editCard, setEditCard] = useState<{ id?: string; question: string; answer: string; category: string } | null>(null);

  useEffect(() => {
    if (profile) loadAll(profile.id);
  }, [profile?.id]);

  // Build ordered deck: unseen → review → known, filtered by category
  const deck = useMemo(() => {
    const filtered = activeCategory ? cards.filter((c) => c.category === activeCategory) : cards;
    const stateOf = (id: string): CardState => progress.find((p) => p.card_id === id)?.state ?? 'unseen';
    const order: CardState[] = ['unseen', 'review', 'known'];
    return [...filtered].sort((a, b) => order.indexOf(stateOf(a.id)) - order.indexOf(stateOf(b.id)));
  }, [cards, progress, activeCategory]);

  const currentCard = deck[deckIndex] ?? null;
  const currentState: CardState = currentCard
    ? (progress.find((p) => p.card_id === currentCard.id)?.state ?? 'unseen')
    : 'unseen';

  const handleMark = async (state: CardState) => {
    if (!profile || !currentCard) return;
    await markCard(profile.id, currentCard.id, state);
    if (deckIndex < deck.length - 1) setDeckIndex((i) => i + 1);
  };

  const handleSaveCard = async () => {
    if (!editCard || !profile) return;
    await upsertCard({ ...editCard, created_by: profile.id });
    setEditCard(null);
  };

  const openNewCard = () => setEditCard({ question: '', answer: '', category: activeCategory ?? CATEGORIES[0] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl text-cream-200">Analyst Training</h1>
        {isOfficer && (
          <Button variant="secondary" size="sm" onClick={() => setAdminOpen(true)}>
            <Plus size={14} /> Manage Cards
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: category progress */}
        <Card className="lg:col-span-1">
          <h2 className="font-cormorant text-lg text-cream-200 mb-3">Progress</h2>
          <ProgressBar
            cards={cards}
            progress={progress}
            activeCategory={activeCategory}
            onSelectCategory={(cat) => { setActiveCategory(cat); setDeckIndex(0); }}
          />
        </Card>

        {/* Main: flashcard */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="animate-pulse bg-green-800 border border-green-700 rounded-xl h-64" />
          ) : deck.length === 0 ? (
            <Card>
              <EmptyState
                icon={<GraduationCap size={40} />}
                heading="No cards in this category"
                body={isOfficer ? 'Add cards using "Manage Cards" above.' : 'Ask an officer to add cards for this category.'}
              />
            </Card>
          ) : (
            <Card>
              <FlashcardView
                card={currentCard!}
                currentState={currentState}
                onMark={handleMark}
                index={deckIndex}
                total={deck.length}
              />
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-green-700">
                <Button variant="ghost" size="sm" onClick={() => setDeckIndex((i) => Math.max(0, i - 1))} disabled={deckIndex === 0}>
                  ← Prev
                </Button>
                <span className="text-xs text-cream-400 font-mono self-center px-2">
                  {deckIndex + 1}/{deck.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setDeckIndex((i) => Math.min(deck.length - 1, i + 1))} disabled={deckIndex === deck.length - 1}>
                  Next →
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeckIndex(0)}>
                  Restart
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Admin modal */}
      <Modal open={adminOpen} onClose={() => setAdminOpen(false)} title="Manage Flashcards" size="lg">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={openNewCard}><Plus size={12} /> New Card</Button>
          </div>
          {cards.map((c) => (
            <div key={c.id} className="flex items-start gap-3 px-3 py-2.5 bg-green-900 border border-green-700 rounded group">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brass-500 mb-0.5 font-mono">{c.category}</p>
                <p className="text-sm text-cream-100 truncate">{c.question}</p>
                <p className="text-xs text-cream-400 truncate mt-0.5">{c.answer}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                <button onClick={() => setEditCard({ id: c.id, question: c.question, answer: c.answer, category: c.category })}
                  className="p-1 text-cream-400 hover:text-brass-500 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteCard(c.id)} className="p-1 text-cream-400 hover:text-loss transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Edit/New card modal */}
      {editCard && (
        <Modal open title={editCard.id ? 'Edit Card' : 'New Card'} onClose={() => setEditCard(null)} size="md">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">Category</label>
              <select value={editCard.category} onChange={(e) => setEditCard((c) => c && ({ ...c, category: e.target.value }))}
                className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                <option value={editCard.category}>{editCard.category}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">Question</label>
              <textarea value={editCard.question} onChange={(e) => setEditCard((c) => c && ({ ...c, question: e.target.value }))}
                rows={3} className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">Answer</label>
              <textarea value={editCard.answer} onChange={(e) => setEditCard((c) => c && ({ ...c, answer: e.target.value }))}
                rows={3} className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none resize-none" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditCard(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveCard} disabled={!editCard.question || !editCard.answer}>Save Card</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
