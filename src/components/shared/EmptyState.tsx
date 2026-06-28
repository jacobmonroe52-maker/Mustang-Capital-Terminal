import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-green-600 mb-4">{icon}</div>}
      <h3 className="font-cormorant text-xl text-cream-200 mb-2">{heading}</h3>
      <p className="text-sm text-cream-400 max-w-xs mb-6">{body}</p>
      {action}
    </div>
  );
}
