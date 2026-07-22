import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

export default function Dropzone({ onFilesSelected, isUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf')
      );
      if (filesArr.length > 0) {
        setSelectedFiles((prev) => [...prev, ...filesArr]);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Interactive Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-950/30 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:border-blue-500/50 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base font-bold text-white">
          Drag & Drop PDF Plant Documentation
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-md">
          Supports multiple PDF technical manuals, P&ID schematics, and safety standard specs.
        </p>

        <div className="mt-4 inline-flex items-center space-x-2 text-[11px] text-slate-500 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          <span>Supported Format: .PDF</span>
          <span>•</span>
          <span>Max File Size: 50MB</span>
        </div>
      </div>

      {/* Selected Batch Preview */}
      {selectedFiles.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Selected Files Batch ({selectedFiles.length})
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-[11px] text-rose-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="font-medium text-slate-200 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartUpload}
            disabled={isUploading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload {selectedFiles.length} File(s) to FastAPI Server</span>
          </button>
        </div>
      )}
    </div>
  );
}
