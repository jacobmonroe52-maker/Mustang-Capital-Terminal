import { useState } from 'react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import type { EnrichedHolding } from '../../types';
import { usePortfolioStore } from '../../store/portfolioStore';
import { useRole } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { fmtUSD, fmtPct, fmtShares, gainLossClass } from '../../lib/format';

type SortKey = keyof EnrichedHolding;
type SortDir = 'asc' | 'desc';

const SECTORS = ['Technology', 'Financials', 'Healthcare', 'Consumer Disc.', 'Energy', 'Industrials', 'Utilities', 'Real Estate'];

function SortableHeader({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  className = '',
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={['px-3 py-2.5 text-left text-xs font-medium text-cream-400 uppercase tracking-wide cursor-pointer select-none', 'hover:text-cream-100 transition-colors whitespace-nowrap', active ? 'text-brass-500' : '', className].join(' ')}
    >
      {label}
      {active && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}

interface HoldingFormState {
  ticker: string;
  company_name: string;
  sector: string;
  shares: string;
  cost_basis: string;
  target_weight: string;
}

const emptyForm: HoldingFormState = {
  ticker: '', company_name: '', sector: SECTORS[0], shares: '', cost_basis: '', target_weight: '',
};

function fromHolding(h: EnrichedHolding): HoldingFormState {
  return {
    ticker: h.ticker,
    company_name: h.company_name,
    sector: h.sector,
    shares: String(h.shares),
    cost_basis: String(h.cost_basis),
    target_weight: String(Math.round(h.target_weight * 100)),
  };
}

export function HoldingsTable({ holdings }: { holdings: EnrichedHolding[] }) {
  const { isOfficer } = useRole();
  const { upsertHolding, deleteHolding } = usePortfolioStore();
  const [sortKey, setSortKey] = useState<SortKey>('ticker');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HoldingFormState>(emptyForm);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<HoldingFormState>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSort = (col: SortKey) => {
    if (sortKey === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col); setSortDir('asc'); }
  };

  const sorted = [...holdings].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    const cmp = typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const startEdit = (h: EnrichedHolding) => {
    setEditingId(h.id);
    setEditForm(fromHolding(h));
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(emptyForm); };

  const saveEdit = async (h: EnrichedHolding) => {
    await upsertHolding({
      id: h.id,
      ticker: editForm.ticker.toUpperCase(),
      company_name: editForm.company_name,
      sector: editForm.sector,
      shares: Number(editForm.shares),
      cost_basis: Number(editForm.cost_basis),
      target_weight: Number(editForm.target_weight) / 100,
    });
    setEditingId(null);
  };

  const saveAdd = async () => {
    await upsertHolding({
      ticker: addForm.ticker.toUpperCase(),
      company_name: addForm.company_name,
      sector: addForm.sector,
      shares: Number(addForm.shares),
      cost_basis: Number(addForm.cost_basis),
      target_weight: Number(addForm.target_weight) / 100,
    });
    setAddOpen(false);
    setAddForm(emptyForm);
  };

  const th = { sortKey, sortDir, onSort: handleSort };

  return (
    <div>
      {isOfficer && (
        <div className="flex justify-end mb-3">
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Holding
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-green-700">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-900 border-b border-green-700">
              <SortableHeader label="Ticker" col="ticker" {...th} />
              <SortableHeader label="Company" col="company_name" {...th} />
              <SortableHeader label="Sector" col="sector" {...th} />
              <SortableHeader label="Shares" col="shares" {...th} className="text-right" />
              <SortableHeader label="Cost Basis" col="cost_basis" {...th} className="text-right" />
              <SortableHeader label="Price" col="current_price" {...th} className="text-right" />
              <SortableHeader label="Mkt Value" col="market_value" {...th} className="text-right" />
              <SortableHeader label="Weight" col="weight" {...th} className="text-right" />
              <SortableHeader label="P&L $" col="gain_loss" {...th} className="text-right" />
              <SortableHeader label="P&L %" col="gain_loss_pct" {...th} className="text-right" />
              {isOfficer && <th className="px-3 py-2.5 w-16" />}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h, i) => (
              <tr
                key={h.id}
                className={['border-b border-green-700/50 transition-colors', i % 2 === 0 ? 'bg-green-800/30' : 'bg-green-800/10', 'hover:bg-green-700/20'].join(' ')}
              >
                {editingId === h.id ? (
                  <>
                    <td className="px-2 py-1.5">
                      <input value={editForm.ticker} onChange={(e) => setEditForm((f) => ({ ...f, ticker: e.target.value }))}
                        className="w-20 bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100 font-mono uppercase" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={editForm.company_name} onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                        className="w-36 bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={editForm.sector} onChange={(e) => setEditForm((f) => ({ ...f, sector: e.target.value }))}
                        className="bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100">
                        {SECTORS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input type="number" value={editForm.shares} onChange={(e) => setEditForm((f) => ({ ...f, shares: e.target.value }))}
                        className="w-20 bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100 font-mono text-right" />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input type="number" value={editForm.cost_basis} onChange={(e) => setEditForm((f) => ({ ...f, cost_basis: e.target.value }))}
                        className="w-24 bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100 font-mono text-right" />
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-cream-400 text-xs">—</td>
                    <td className="px-3 py-2 text-right font-mono text-cream-400 text-xs">—</td>
                    <td className="px-2 py-1.5 text-right">
                      <input type="number" value={editForm.target_weight} onChange={(e) => setEditForm((f) => ({ ...f, target_weight: e.target.value }))}
                        className="w-16 bg-green-900 border border-green-600 rounded px-2 py-1 text-xs text-cream-100 font-mono text-right"
                        placeholder="%" />
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-cream-400 text-xs">—</td>
                    <td className="px-3 py-2 text-right font-mono text-cream-400 text-xs">—</td>
                    <td className="px-2 py-1.5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => saveEdit(h)} className="p-1 text-gain hover:bg-gain/10 rounded" title="Save">
                          <Check size={14} />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-cream-400 hover:bg-green-700 rounded" title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-medium text-brass-500 text-xs tracking-wide">{h.ticker}</span>
                    </td>
                    <td className="px-3 py-2.5 text-cream-100 text-sm max-w-[180px] truncate">{h.company_name}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="sector">{h.sector}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-cream-400">{fmtShares(h.shares)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-cream-400">{fmtUSD(h.cost_basis)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-cream-100">{fmtUSD(h.current_price)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-cream-100">{fmtUSD(h.market_value)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">
                      <span className="text-cream-100">{fmtPct(h.weight)}</span>
                      <span className="text-cream-400 ml-1">/ {fmtPct(h.target_weight)}</span>
                    </td>
                    <td className={['px-3 py-2.5 text-right font-mono text-xs', gainLossClass(h.gain_loss)].join(' ')}>
                      {h.gain_loss >= 0 ? '+' : ''}{fmtUSD(h.gain_loss)}
                    </td>
                    <td className={['px-3 py-2.5 text-right font-mono text-xs', gainLossClass(h.gain_loss_pct)].join(' ')}>
                      {h.gain_loss_pct >= 0 ? '+' : ''}{fmtPct(h.gain_loss_pct)}
                    </td>
                    {isOfficer && (
                      <td className="px-2 py-2.5">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100">
                          <button onClick={() => startEdit(h)} className="p-1 text-cream-400 hover:text-brass-500 hover:bg-brass-500/10 rounded transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(h.id)} className="p-1 text-cream-400 hover:text-loss hover:bg-loss/10 rounded transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Holding Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddForm(emptyForm); }} title="Add Holding" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ticker" value={addForm.ticker} onChange={(e) => setAddForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))} placeholder="AAPL" />
            <Input label="Sector" value={addForm.sector} onChange={() => {}} id="sector-select"
              style={{ display: 'none' }} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cream-400 font-medium tracking-wide uppercase">Sector</label>
              <select value={addForm.sector} onChange={(e) => setAddForm((f) => ({ ...f, sector: e.target.value }))}
                className="bg-green-900 border border-green-700 rounded px-3 py-2 text-cream-100 text-sm focus:border-brass-500 focus:outline-none">
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <Input label="Company Name" value={addForm.company_name} onChange={(e) => setAddForm((f) => ({ ...f, company_name: e.target.value }))} placeholder="Apple Inc." />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Shares" type="number" value={addForm.shares} onChange={(e) => setAddForm((f) => ({ ...f, shares: e.target.value }))} placeholder="100" />
            <Input label="Cost Basis" type="number" value={addForm.cost_basis} onChange={(e) => setAddForm((f) => ({ ...f, cost_basis: e.target.value }))} placeholder="150.00" />
            <Input label="Target Weight %" type="number" value={addForm.target_weight} onChange={(e) => setAddForm((f) => ({ ...f, target_weight: e.target.value }))} placeholder="15" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setAddOpen(false); setAddForm(emptyForm); }}>Cancel</Button>
            <Button variant="primary" onClick={saveAdd} disabled={!addForm.ticker || !addForm.company_name || !addForm.shares || !addForm.cost_basis}>
              Add Holding
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirm Delete" size="sm">
        <p className="text-cream-100 mb-6">
          Remove <span className="font-mono text-brass-500">{sorted.find((h) => h.id === confirmDeleteId)?.ticker}</span> from the portfolio? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={async () => { if (confirmDeleteId) { await deleteHolding(confirmDeleteId); setConfirmDeleteId(null); } }}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
