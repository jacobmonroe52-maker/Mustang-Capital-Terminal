import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brass-500 text-ink hover:bg-brass-500/90 font-medium',
  secondary:
    'bg-green-700 text-cream-100 hover:bg-green-600 border border-green-600',
  ghost:
    'bg-transparent text-cream-400 hover:text-cream-100 hover:bg-green-800',
  danger:
    'bg-loss/20 text-loss hover:bg-loss/30 border border-loss/40',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-2.5 text-base rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
