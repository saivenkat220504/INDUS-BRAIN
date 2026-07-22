import React from 'react';
import { FileText, Eye, Trash2, Calendar, HardDrive, Download } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { downloadDocumentFile } from '../services/api';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
};

export default function DocumentTable({ documents, loading, onDeleteDocument }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Document ID</th>
            <th className="py-3 px-4">File Name</th>
            <th className="py-3 px-4">File Size</th>
            <th className="py-3 px-4">Upload Date</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {loading ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-slate-500">
                Loading plant documentation database...
              </td>
            </tr>
          ) : documents.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-slate-500">
                No plant documents ingested yet. Upload PDFs above.
              </td>
            </tr>
          ) : (
            documents.map((doc, idx) => {
              const fileName = doc.name || doc.filename || 'document.pdf';
              return (
                <tr key={doc.id || idx} className="hover:bg-slate-800/40 transition-colors">
                  {/* Document ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    {doc.id || `UP-${1000 + idx}`}
                  </td>

                  {/* File Name */}
                  <td className="py-3.5 px-4 font-medium text-slate-100 max-w-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate" title={fileName}>
                        {fileName}
                      </span>
                    </div>
                  </td>

                  {/* File Size */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div className="flex items-center space-x-1">
                      <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formatBytes(doc.size)}</span>
                    </div>
                  </td>

                  {/* Upload Date */}
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={doc.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2 text-slate-400">
                      <button
                        onClick={() => downloadDocumentFile(fileName)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-lg transition-colors flex items-center space-x-1"
                        title={`Download ${fileName}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => downloadDocumentFile(fileName)}
                        className="p-1.5 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Inspect / Download Document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {onDeleteDocument && (
                        <button
                          onClick={() => onDeleteDocument(doc)}
                          className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

