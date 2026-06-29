import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs text-cream-400 font-medium tracking-wide uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'bg-green-900 border rounded px-3 py-2 text-cream-100 text-sm',
            'placeholder:text-green-700 transition-colors duration-150',
            error
              ? 'border-loss focus:border-loss'
              : 'border-green-700 focus:border-brass-500',
            'focus:outline-none',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-loss">{error}</p>}
        {hint && !error && <p className="text-xs text-cream-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
