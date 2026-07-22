import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileCheck, CheckCircle2, RefreshCw, ExternalLink, Download } from 'lucide-react';
import { fetchCompliance } from '../services/api';

export default function ComplianceDashboard() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadComplianceData = async () => {
    setLoading(true);
    const data = await fetchCompliance();
    setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const passedCount = rules.filter((r) => r.status === 'Met').length;
  const gapCount = rules.filter((r) => r.status === 'Gap').length;
  const totalCount = rules.length || 1;
  const auditScore = ((passedCount / totalCount) * 100).toFixed(1);

  const filteredRules = rules.filter((r) => {
    if (filterStatus === 'MET') return r.status === 'Met';
    if (filterStatus === 'GAP') return r.status === 'Gap';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Regulatory Audit Engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight">
            Industrial Compliance & Regulatory Safety
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Lightweight entity-based compliance evaluator auditing OSHA, ASME, ISO, and EPA standards.
          </p>
        </div>

        <button
          onClick={loadComplianceData}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Audit Rules</span>
        </button>
      </div>

      {/* Audit Summary Score Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Overall Compliance Score</span>
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {loading ? '...' : `${auditScore}%`}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {passedCount}/{totalCount} RULES MET
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Evaluated using extracted entities from ingested technical documentation.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Active Compliance Gaps:</span>
            <span className={`font-mono font-bold ${gapCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {gapCount} UNMET RULES
            </span>
          </div>
        </div>

        {/* Status Filter Cards (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setFilterStatus('ALL')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 border-blue-500'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-slate-400">All Audit Rules</span>
            <p className="mt-2 text-3xl font-black text-white">{rules.length}</p>
            <span className="text-[10px] text-blue-400 font-semibold mt-1 block">Click to view all</span>
          </div>

          <div
            onClick={() => setFilterStatus('MET')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              filterStatus === 'MET'
                ? 'bg-emerald-950/60 border-emerald-500'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-emerald-400">Passed Rules (Met)</span>
            <p className="mt-2 text-3xl font-black text-emerald-400">{passedCount}</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Verified with Evidence</span>
          </div>

          <div
            onClick={() => setFilterStatus('GAP')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all ${
              filterStatus === 'GAP'
                ? 'bg-amber-950/60 border-amber-500'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-amber-400">Compliance Gaps</span>
            <p className="mt-2 text-3xl font-black text-amber-400">{gapCount}</p>
            <span className="text-[10px] text-amber-400 font-semibold mt-1 block">Requires Documentation</span>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-400" />
              Safety & Regulatory Rule Audit Log
            </h2>
            <p className="text-xs text-slate-400">
              Rules defined in compliance/rules.json matched against plant entities
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evidence Location</th>
                <th className="py-3 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    Evaluating regulatory audit rules against entity database...
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule, idx) => {
                  const isMet = rule.status === 'Met';
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">{rule.rule}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isMet
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-amber-950/80 text-amber-400 border-amber-800'
                          }`}
                        >
                          {isMet ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          <span>{rule.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {isMet ? (
                          <span className="text-blue-400">{rule.evidence}</span>
                        ) : (
                          <span className="text-slate-500 italic">Not Found in Index</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rule.severity === 'HIGH'
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : rule.severity === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
