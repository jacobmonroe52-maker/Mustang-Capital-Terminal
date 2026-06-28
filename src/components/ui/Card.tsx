import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-green-800 border border-green-700 rounded-lg',
        padded ? 'p-5' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
