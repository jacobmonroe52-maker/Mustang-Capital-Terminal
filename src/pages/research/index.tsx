import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, BookOpen, Search, X, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import type { ResearchNote } from '../../types';
import { useResearchStore } from '../../store/researchStore';
import { useAuthStore } from '../../store/authStore';
import { useRole } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/shared/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { fmtDate, fmtRelativeTime } from '../../lib/format';

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="font-cormorant text-lg text-cream-200 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-cormorant text-xl text-cream-200 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-cormorant text-2xl text-cream-200 mt-6 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream-100">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-cream-200">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-green-900 px-1 py-0.5 rounded text-xs font-mono text-brass-500">$1</code>')
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ');
      return `<tr>${cells.map((c: string) => `<td class="border border-green-700 px-3 py-1.5 text-sm text-cream-400">${c}</td>`).join('')}</tr>`;
    })
    .replace(/^- (.+)$/gm, '<li class="text-cream-400 ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-cream-400 ml-4 list-decimal">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-cream-400 my-2">')
    .replace(/\n/g, '<br/>')
    .trim();
}

function NoteCard({ note, onSelect, onDelete, canDelete }: { note: ResearchNote; onSelect: () => void; onDelete: () => void; canDelete: boolean }) {
  return (
    <div className="bg-green-800 border border-green-700 rounded-lg p-4 hover:border-green-600 transition-colors cursor-pointer group"
      onClick={onSelect}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {note.ticker && <span className="font-mono text-xs text-brass-500">{note.ticker}</span>}
          {note.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="sector">{t}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-cream-400 hover:text-loss transition-colors">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-cormorant text-lg text-cream-200 mb-1">{note.title}</h3>
      <p className="text-sm text-cream-400 line-clamp-2">{note.content.replace(/[#*`]/g, '').slice(0, 200)}</p>
      <p className="text-xs text-cream-400 mt-2">{fmtRelativeTime(note.updated_at)}</p>
    </div>
  );
}

function NoteEditor({ note, onSave, onBack }: { note: Partial<ResearchNote>; onSave: (n: Partial<ResearchNote>) => Promise<void>; onBack: () => void }) {
  const [form, setForm] = useState({
    title: note.title ?? '',
    ticker: note.ticker ?? '',
    tags: (note.tags ?? []).join(', '),
    content: note.content ?? '',
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerSave = useCallback(async () => {
    setSaveStatus('saving');
    setSaving(true);
    await onSave({
      ...note,
      title: form.title,
      ticker: form.ticker || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      content: form.content,
    });
    setSaving(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [form, note, onSave]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    clearTimeout(timerRef.current);
    if (note.title) {
      timerRef.current = setTimeout(triggerSave, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={14} /> Back</Button>
        <div className="flex gap-2 ml-auto items-center">
          <span className="text-xs font-mono text-cream-400">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : ''}
          </span>
          <button
            onClick={() => setPreview((p) => !p)}
            className={['px-3 py-1 text-xs font-mono rounded border transition-colors', preview ? 'bg-brass-500/20 text-brass-500 border-brass-500/40' : 'text-cream-400 border-green-700 hover:text-cream-100'].join(' ')}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <Button variant="primary" size="sm" onClick={triggerSave} disabled={saving || !form.title}>
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <input value={form.title} onChange={handleChange('title')} placeholder="Note title"
            className="w-full bg-transparent border-b border-green-700 pb-2 font-cormorant text-2xl text-cream-200 focus:outline-none focus:border-brass-500 placeholder:text-green-600" />
        </div>
        <div className="flex gap-2">
          <input value={form.ticker} onChange={handleChange('ticker')} placeholder="Ticker"
            className="w-20 bg-green-900 border border-green-700 rounded px-2 py-1.5 text-xs font-mono text-brass-500 uppercase focus:border-brass-500 focus:outline-none" />
        </div>
      </div>

      <input value={form.tags} onChange={handleChange('tags')} placeholder="Tags (comma separated)"
        className="w-full bg-green-900 border border-green-700 rounded px-3 py-1.5 text-xs text-cream-400 focus:border-brass-500 focus:outline-none" />

      {preview ? (
        <Card>
          <div
            className="prose-sm leading-relaxed min-h-[400px] text-cream-400"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
          />
        </Card>
      ) : (
        <textarea
          value={form.content}
          onChange={handleChange('content')}
          rows={20}
          placeholder="Write your research note in Markdown..."
          className="w-full bg-green-900 border border-green-700 rounded px-4 py-3 text-cream-100 text-sm font-mono focus:border-brass-500 focus:outline-none resize-none leading-relaxed"
        />
      )}
    </div>
  );
}

export function Research() {
  const { profile } = useAuthStore();
  const { isOfficer } = useRole();
  const { notes, isLoading, query, loadNotes, upsertNote, deleteNote, setQuery } = useResearchStore();
  const [selected, setSelected] = useState<Partial<ResearchNote> | null>(null);

  useEffect(() => { loadNotes(); }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    loadNotes(q || undefined);
  };

  const handleNew = () => {
    setSelected({ title: '', content: '', tags: [], ticker: null, author_id: profile?.id });
  };

  const handleSave = async (n: Partial<ResearchNote>) => {
    if (!profile) return;
    const saved = await upsertNote({
      id: n.id,
      title: n.title ?? '',
      content: n.content ?? '',
      tags: n.tags ?? [],
      ticker: n.ticker ?? null,
      author_id: profile.id,
    });
    setSelected(saved);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    await deleteNote(id);
    if (selected && 'id' in selected && selected.id === id) setSelected(null);
  };

  const canDelete = (authorId: string) => isOfficer || authorId === profile?.id;

  if (selected) {
    return (
      <div>
        <NoteEditor note={selected} onSave={handleSave} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl text-cream-200">Research Knowledge Base</h1>
        <Button variant="primary" size="sm" onClick={handleNew}>
          <Plus size={14} /> New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by title, ticker, tag, or content..."
          className="w-full bg-green-900 border border-green-700 rounded-lg pl-9 pr-9 py-2.5 text-sm text-cream-100 focus:border-brass-500 focus:outline-none"
        />
        {query && (
          <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-100">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-green-800 border border-green-700 rounded-lg h-36" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          heading={query ? 'No results found' : 'No research notes yet'}
          body={query ? `No notes matching "${query}".` : 'Document your research. Notes are searchable and persist for the whole team.'}
          action={!query ? <Button variant="primary" size="sm" onClick={handleNew}>Write First Note</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSelect={() => setSelected(note)}
              onDelete={() => handleDelete(note.id)}
              canDelete={canDelete(note.author_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
