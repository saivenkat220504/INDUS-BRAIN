import React from 'react';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProgressBar({ progress, filename, isComplete }) {
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg backdrop-blur-md space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate pr-2">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
          )}
          <span className="font-semibold text-slate-200 truncate">{filename || 'Uploading Document(s)...'}</span>
        </div>
        <span className="font-mono font-extrabold text-blue-400">{progress}%</span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>FastAPI Transfer Stream</span>
        <span>{isComplete ? 'Transfer Complete' : `${progress}% uploaded`}</span>
      </div>
    </div>
  );
}
