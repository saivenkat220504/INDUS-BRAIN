import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadDocuments from './pages/UploadDocuments';
import AIChat from './pages/AIChat';
import KnowledgeGraph from './pages/KnowledgeGraph';
import ComplianceDashboard from './pages/ComplianceDashboard';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadDocuments />} />
          <Route path="chat" element={<AIChat />} />
          <Route path="graph" element={<KnowledgeGraph />} />
          <Route path="compliance" element={<ComplianceDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
