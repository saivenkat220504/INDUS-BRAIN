import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function Navbar({ onMenuToggle }) {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const verifyHealth = async () => {
      const data = await checkBackendHealth();
      setBackendStatus(data.status === 'healthy' ? 'online' : 'offline');
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Plant ID Tag */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>PLANT FACILITY #04</span>
          <span className="text-slate-600">•</span>
          <span className="text-blue-400 font-semibold">UNIT ALPHA</span>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search plant documents, graph nodes, equipment IDs..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-1.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Right Actions: Status & User */}
      <div className="flex items-center space-x-3">
        {/* Backend API Live Status Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-950/60">
          {backendStatus === 'online' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">API Connected</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400">Standalone / Demo</span>
            </>
          )}
        </div>

        {/* Notifications Button */}
        <button
          className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-900"></span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-blue-400 border border-slate-700 font-bold text-xs">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200">Alex Morgan</p>
            <p className="text-[10px] text-slate-400">Lead Plant Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
