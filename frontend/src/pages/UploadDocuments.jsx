import React, { useState, useEffect } from 'react';
import { FileText, Filter, RefreshCw, CheckCircle2, FileUp } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import ProgressBar from '../components/ProgressBar';
import DocumentTable from '../components/DocumentTable';
import { fetchDocuments, uploadDocuments } from '../services/api';

export default function UploadDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeUploadFile, setActiveUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const loadDocs = async () => {
    setLoading(true);
    const data = await fetchDocuments();
    setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccessMsg('');

    const activeName =
      files.length === 1 ? files[0].name : `${files.length} PDF Technical Documents Batch`;
    setActiveUploadFile(activeName);

    try {
      const result = await uploadDocuments(files, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);
      setUploadSuccessMsg(
        `Successfully uploaded ${files.length} document(s) to storage/uploads/`
      );

      // Refresh documents table from backend
      setTimeout(async () => {
        await loadDocs();
        setIsUploading(false);
        setActiveUploadFile(null);
      }, 1000);
    } catch (err) {
      console.error('Upload Error:', err);
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (docToDelete) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              Ingestion Pipeline
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight">
            Upload Plant Technical Documentation
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Drag and drop P&ID engineering schematics, maintenance manuals, and safety compliance PDFs.
          </p>
        </div>

        <button
          onClick={loadDocs}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Drag and Drop Zone Component */}
      <Dropzone onFilesSelected={handleUploadFiles} isUploading={isUploading} />

      {/* Active Upload Progress Bar */}
      {isUploading && (
        <ProgressBar
          progress={uploadProgress}
          filename={activeUploadFile}
          isComplete={uploadProgress === 100}
        />
      )}

      {/* Success Alert Banner */}
      {uploadSuccessMsg && !isUploading && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{uploadSuccessMsg}</span>
          </div>
          <button
            onClick={() => setUploadSuccessMsg('')}
            className="text-xs hover:underline text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Document Ingestion Queue Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Uploaded Plant Documentation Directory
            </h2>
            <p className="text-xs text-slate-400">
              Persisted technical files in storage/uploads/ ready for parsing and RAG indexing
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Documents</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <DocumentTable
            documents={documents}
            loading={loading}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>
      </div>
    </div>
  );
}
