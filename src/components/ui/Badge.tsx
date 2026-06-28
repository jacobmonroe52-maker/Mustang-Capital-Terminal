import { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'buy' | 'sell' | 'hold' | 'pending' | 'approved' | 'rejected' | 'sector';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-green-700 text-cream-400',
  buy: 'bg-gain/20 text-gain border border-gain/30',
  sell: 'bg-loss/20 text-loss border border-loss/30',
  hold: 'bg-brass-500/20 text-brass-500 border border-brass-500/30',
  pending: 'bg-cream-400/10 text-cream-400 border border-cream-400/20',
  approved: 'bg-gain/20 text-gain border border-gain/30',
  rejected: 'bg-loss/20 text-loss border border-loss/30',
  sector: 'bg-green-700/60 text-cream-400 border border-green-700',
};

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono tracking-wide',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
