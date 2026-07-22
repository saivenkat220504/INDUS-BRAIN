import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Bot,
  Network,
  ShieldCheck,
  Settings,
  Cpu,
  Activity,
  ChevronRight,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
  { name: 'Upload Documents', path: '/upload', icon: UploadCloud, badge: 'NEW' },
  { name: 'AI Chat', path: '/chat', icon: Bot, badge: 'AI' },
  { name: 'Knowledge Graph', path: '/graph', icon: Network, badge: '3.4k' },
  { name: 'Compliance', path: '/compliance', icon: ShieldCheck, badge: '98%' },
  { name: 'Settings', path: '/settings', icon: Settings, badge: null },
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/40">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-lg text-white tracking-wide">Plant</span>
                <span className="font-extrabold text-lg text-blue-500">Brain</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Industrial Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-950/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-blue-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* System Status Footer Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-200">FastAPI Engine</p>
                <p className="text-[10px] text-slate-400">v0.1.0 • Port 8000</p>
              </div>
            </div>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
