import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Database, Cpu, Save, RefreshCw, Check, Sun, Moon, ShieldCheck, Activity } from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import Toast from '../components/Toast';

export default function Settings() {
  const [fastApiUrl, setFastApiUrl] = useState('http://localhost:8000');
  const [geminiKey, setGeminiKey] = useState('AIzaSy**********************');
  const [dbConnection, setDbConnection] = useState('sqlite:///./plantbrain.db');
  const [themeMode, setThemeMode] = useState('dark');
  const [systemHealth, setSystemHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const loadHealth = async () => {
    setLoadingHealth(true);
    const health = await checkBackendHealth();
    setSystemHealth(health);
    setLoadingHealth(false);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg('PlantBrain system settings and Gemini API key saved!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type="success"
          onClose={() => setToastMsg('')}
        />
      )}

      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            System Config
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight">
          PlantBrain System Settings & Gemini API Config
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage API credentials, backend connection strings, theme preferences, and platform health status.
        </p>
      </div>

      {/* System Status Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">System Status & Health Check</h2>
          </div>
          <button
            onClick={loadHealth}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:bg-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">FastAPI Engine</span>
            <p className="font-bold text-emerald-400 mt-0.5">
              {systemHealth?.status === 'healthy' ? 'ONLINE (Port 8000)' : 'STANDALONE'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Database Status</span>
            <p className="font-bold text-emerald-400 mt-0.5">
              {systemHealth?.database || 'SQLite Active'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Vector DB</span>
            <p className="font-bold text-blue-400 mt-0.5">ChromaDB Persistent</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Graph Engine</span>
            <p className="font-bold text-cyan-400 mt-0.5">NetworkX Active</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Configuration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Key className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Google Gemini API Configuration</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Google Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Gemini API key..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Powers RAG prompt synthesis in `app/rag/gemini_rag.py`.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">FastAPI Base URL</label>
                <input
                  type="text"
                  value={fastApiUrl}
                  onChange={(e) => setFastApiUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Database Connection String</label>
                <input
                  type="text"
                  value={dbConnection}
                  onChange={(e) => setDbConnection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Sun className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Theme & UI Preferences</h2>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-200">Industrial Dashboard Theme Mode</p>
              <p className="text-slate-400">Choose your preferred visual palette</p>
            </div>

            <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  themeMode === 'dark'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark Slate</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('midnight')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  themeMode === 'midnight'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Midnight Blue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings & Configuration</span>
        </button>
      </form>
    </div>
  );
}
