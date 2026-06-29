import { useEffect } from 'react';
import { TrendingUp, Briefcase, PieChart, AlertTriangle, Clock } from 'lucide-react';
import { usePortfolioStore, selectEnrichedHoldings } from '../../store/portfolioStore';
import { MetricCard } from '../../components/shared/MetricCard';
import { Card } from '../../components/ui/Card';
import { ErrorBanner } from '../../components/shared/ErrorBanner';
import { EmptyState } from '../../components/shared/EmptyState';
import { HoldingsTable } from './HoldingsTable';
import { AllocationDonut } from './AllocationDonut';
import { AllocationBarChart } from './AllocationBarChart';
import { NavHistoryChart } from './NavHistoryChart';
import { fmtCompactUSD, fmtPct, fmtRelativeTime, gainLossClass } from '../../lib/format';

export function Dashboard() {
  const store = usePortfolioStore();
  const enriched = usePortfolioStore(selectEnrichedHoldings);
  useEffect(() => {
    store.loadAll();
  }, []);

  const totalMV = enriched.reduce((s, h) => s + h.market_value, 0);
  const totalBookValue = enriched.reduce((s, h) => s + h.book_value, 0);
  const totalGainLoss = totalMV - totalBookValue;
  const totalGainLossPct = totalBookValue > 0 ? totalGainLoss / totalBookValue : 0;
  const cashBalance = store.fundSettings?.cash_balance ?? 0;
  const aum = totalMV + cashBalance;
  const concentrationLimit = store.fundSettings?.concentration_limit ?? 0.25;
  const maxWeight = enriched.length > 0 ? Math.max(...enriched.map((h) => h.weight)) : 0;
  const concentrationBreached = maxWeight > concentrationLimit;

  const sectorWeights = enriched.reduce<Record<string, number>>((acc, h) => {
    acc[h.sector] = (acc[h.sector] ?? 0) + h.weight;
    return acc;
  }, {});
  const maxSectorWeight = Object.values(sectorWeights).length > 0 ? Math.max(...Object.values(sectorWeights)) : 0;

  const lastUpdated = store.holdings.length > 0 ? store.holdings[0].updated_at : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl text-cream-200">Portfolio Dashboard</h1>
        {store.priceStatus === 'error' && (
          <ErrorBanner message="Live prices unavailable — showing seed prices. Add VITE_MARKET_API_KEY to enable real-time data." />
        )}
      </div>

      {/* Metric header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total AUM"
          value={fmtCompactUSD(aum)}
          subvalue={`${fmtCompactUSD(totalMV)} invested · ${fmtCompactUSD(cashBalance)} cash`}
          subvalueClass="text-cream-400"
          icon={<Briefcase size={20} />}
          loading={store.isLoading}
        />
        <MetricCard
          label="Unrealized P&L"
          value={`${totalGainLoss >= 0 ? '+' : ''}${fmtCompactUSD(totalGainLoss)}`}
          subvalue={`${totalGainLossPct >= 0 ? '+' : ''}${fmtPct(totalGainLossPct)}`}
          subvalueClass={gainLossClass(totalGainLoss)}
          icon={<TrendingUp size={20} />}
          loading={store.isLoading}
        />
        <MetricCard
          label="Positions"
          value={String(enriched.length)}
          subvalue={`${Object.keys(sectorWeights).length} sectors`}
          icon={<PieChart size={20} />}
          loading={store.isLoading}
        />
        <MetricCard
          label="Max Sector Weight"
          value={fmtPct(maxSectorWeight)}
          subvalue={concentrationBreached ? `Limit: ${fmtPct(concentrationLimit)} — breach` : `Limit: ${fmtPct(concentrationLimit)}`}
          subvalueClass={concentrationBreached ? 'text-loss' : 'text-cream-400'}
          icon={<AlertTriangle size={20} />}
          alert={concentrationBreached}
          loading={store.isLoading}
        />
      </div>

      {/* Holdings table */}
      <Card padded={false}>
        <div className="px-5 pt-4 pb-3 border-b border-green-700 flex items-center justify-between">
          <h2 className="font-cormorant text-lg text-cream-200">Holdings</h2>
          {lastUpdated && (
            <span className="text-xs text-cream-400 flex items-center gap-1">
              <Clock size={12} /> {fmtRelativeTime(lastUpdated)}
            </span>
          )}
        </div>
        <div className="p-4">
          {enriched.length === 0 && !store.isLoading ? (
            <EmptyState
              icon={<Briefcase size={36} />}
              heading="No holdings yet"
              body="Add your first position using the button above."
            />
          ) : (
            <HoldingsTable holdings={enriched} />
          )}
        </div>
      </Card>

      {/* Charts row */}
      {enriched.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="font-cormorant text-lg text-cream-200 mb-4">Allocation</h2>
            <AllocationDonut holdings={enriched} cashBalance={cashBalance} totalAum={aum} />
          </Card>
          <Card>
            <h2 className="font-cormorant text-lg text-cream-200 mb-4">Actual vs. Target Weight</h2>
            <AllocationBarChart holdings={enriched} />
          </Card>
        </div>
      )}

      {/* NAV History */}
      {store.navHistory.length > 0 && (
        <Card>
          <h2 className="font-cormorant text-lg text-cream-200 mb-1">NAV History</h2>
          <p className="text-xs text-cream-400 mb-4">
            Fund vs. {store.fundSettings?.benchmark_ticker ?? 'Benchmark'}
          </p>
          <NavHistoryChart navHistory={store.navHistory} />
        </Card>
      )}
    </div>
  );
}
