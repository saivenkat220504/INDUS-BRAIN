import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      styles: 'bg-emerald-950/95 border-emerald-800 text-emerald-400 shadow-emerald-950/50',
    },
    error: {
      icon: AlertCircle,
      styles: 'bg-rose-950/95 border-rose-800 text-rose-400 shadow-rose-950/50',
    },
    info: {
      icon: Info,
      styles: 'bg-blue-950/95 border-blue-800 text-blue-400 shadow-blue-950/50',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-md transition-all animate-bounce-short ${config.styles}`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-80 transition-opacity">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
