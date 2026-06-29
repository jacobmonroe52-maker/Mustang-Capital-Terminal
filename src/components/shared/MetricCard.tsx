import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  subvalueClass?: string;
  icon?: ReactNode;
  loading?: boolean;
  alert?: boolean;
}

export function MetricCard({
  label,
  value,
  subvalue,
  subvalueClass,
  icon,
  loading = false,
  alert = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-24 bg-green-700/50 rounded" />
          <div className="h-8 w-32 bg-green-700/50 rounded" />
          <div className="h-3 w-20 bg-green-700/50 rounded" />
        </div>
      </Card>
    );
  }
  return (
    <Card className={alert ? 'border-loss/50' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-cream-400 uppercase tracking-wide font-medium mb-1">{label}</p>
          <p
            className="font-mono text-2xl font-medium text-cream-100 leading-none truncate"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {value}
          </p>
          {subvalue && (
            <p className={['text-xs font-mono mt-1', subvalueClass ?? 'text-cream-400'].join(' ')}>
              {subvalue}
            </p>
          )}
        </div>
        {icon && <div className="text-brass-500 shrink-0 mt-0.5">{icon}</div>}
      </div>
    </Card>
  );
}
