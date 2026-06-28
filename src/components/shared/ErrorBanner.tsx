import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-loss/10 border border-loss/30 rounded-lg text-sm text-loss">
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 hover:text-loss/70 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
