import React from 'react';
import { CheckCircle2, Clock, UploadCloud, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalizedStatus = (status || 'QUEUED').toUpperCase();

  const statusConfig = {
    UPLOADED: {
      label: 'UPLOADED',
      icon: UploadCloud,
      styles: 'bg-blue-950/80 text-blue-400 border-blue-800/80',
    },
    PROCESSED: {
      label: 'PROCESSED',
      icon: CheckCircle2,
      styles: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    },
    PROCESSING: {
      label: 'PARSING',
      icon: Clock,
      styles: 'bg-amber-950/80 text-amber-400 border-amber-800/80 animate-pulse',
    },
    QUEUED: {
      label: 'QUEUED',
      icon: Clock,
      styles: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    },
    ERROR: {
      label: 'FAILED',
      icon: AlertCircle,
      styles: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.QUEUED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.styles}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
}
