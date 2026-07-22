import React, { useState, useEffect } from 'react';
import { Network, Search, Cpu, Info, RefreshCw, Layers, Database, FileText } from 'lucide-react';
import { fetchGraph, fetchGraphEntity } from '../services/api';

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], stats: { total_nodes: 0, total_edges: 0 } });
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityDetails, setEntityDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGraphData = async () => {
    setLoading(true);
    const data = await fetchGraph();
    setGraphData(data);
    if (data.nodes && data.nodes.length > 0) {
      setSelectedNode(data.nodes[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      const getDetails = async () => {
        const details = await fetchGraphEntity(selectedNode.id);
        setEntityDetails(details);
      };
      getDetails();
    }
  }, [selectedNode]);

  const filteredNodes = graphData.nodes.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              Graph Engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight">
            Plant Topology & NetworkX Knowledge Graph
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            NetworkX visualization graph connecting documents, equipment IDs, standards, failure modes, and locations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={loadGraphData}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800"
            title="Rebuild & Refresh Graph"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas (3 cols) */}
        <div className="lg:col-span-3 relative h-[520px] rounded-2xl border border-slate-800 bg-slate-950/90 p-4 backdrop-blur-md overflow-hidden flex flex-col justify-between">
          {/* Top Controls Overlay */}
          <div className="z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300">
              <Network className="h-4 w-4 text-blue-400" />
              <span>
                NetworkX Canvas • {graphData.stats?.total_nodes || filteredNodes.length} Nodes •{' '}
                {graphData.stats?.total_edges || graphData.edges.length} Edges
              </span>
            </div>
          </div>

          {/* Dynamic Nodes Grid Map */}
          <div className="absolute inset-0 flex items-center justify-center p-8 overflow-auto">
            {loading ? (
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                <span>Loading NetworkX Graph Topology...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-900/40 scale-105'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:scale-102'
                      }`}
                    >
                      <div
                        className="h-3 w-3 rounded-full mb-2"
                        style={{ backgroundColor: node.color || '#3b82f6' }}
                      />
                      <span className="font-mono font-bold text-xs text-white truncate max-w-[120px]">
                        {node.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-1">
                        {node.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                        {node.degree || 1} deg
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Canvas Legend */}
          <div className="z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold uppercase">Legend:</span>
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
              <span>Equipment</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Standards</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Failure Modes</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Locations</span>
            </span>
            <span className="flex items-center space-x-1.5 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>Documents</span>
            </span>
          </div>
        </div>

        {/* Node Detail Inspector Panel (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Info className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Node Inspector</h2>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Node ID</span>
                <p className="font-mono text-sm font-bold text-blue-400">{selectedNode.id}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Node Type</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: selectedNode.color || '#3b82f6' }}
                  />
                  <span className="font-medium text-slate-200">{selectedNode.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Connections</span>
                  <p className="font-mono font-bold text-white">{selectedNode.degree || 1} edges</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Source File</span>
                  <p className="font-mono font-bold text-blue-400 truncate" title={selectedNode.document}>
                    {selectedNode.document || 'System'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">
                  Connected Documents & Relations
                </span>
                <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {entityDetails && entityDetails.related_documents?.length > 0 ? (
                    entityDetails.related_documents.map((rd, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 text-slate-300 text-[11px] border border-slate-800 flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{rd.document}</span>
                        <span className="font-mono text-[9px] text-blue-400">pg {rd.page}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-950 text-slate-500 text-[11px]">
                      Co-occurring node relations active
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select a node from the canvas to inspect topology.</p>
          )}
        </div>
      </div>
    </div>
  );
}
