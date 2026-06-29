import type { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  displayValue?: string;
}

export function Slider({ label, displayValue, className = '', ...props }: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs text-cream-400 font-medium uppercase tracking-wide">{label}</label>
          {displayValue && (
            <span className="text-sm font-mono text-brass-500">{displayValue}</span>
          )}
        </div>
      )}
      <input
        type="range"
        className={[
          'w-full h-1.5 bg-green-700 rounded-full appearance-none cursor-pointer',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-brass-500 [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
