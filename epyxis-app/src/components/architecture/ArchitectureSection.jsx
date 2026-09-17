import React, { useState } from 'react';
import { ShieldCheck, Cpu, Lock, HardDrive, FileCheck, Layers, Key, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ARCHITECTURE_NODES } from '../../data/platformData';

const iconMap = {
  'node-1': Cpu,
  'node-2': FileCheck,
  'node-3': Zap,
  'node-4': HardDrive,
  'node-5': Layers,
  'node-6': Key,
  'node-7': Shield,
  'node-8': Lock,
  'node-9': ShieldCheck,
  'node-10': Sparkles
};

export default function ArchitectureSection() {
  const [selectedNode, setSelectedNode] = useState(ARCHITECTURE_NODES[0]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 space-y-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-[#4A6CF7]" />
          <span>Kernel OS Topology Matrix</span>
        </div>
        <h2 className="editorial-headline text-3xl sm:text-5xl font-extrabold text-[#111111]">
          Decoupled Multi-Layer OS Security Topology.
        </h2>
        <p className="editorial-sub text-base text-[#555555]">
          Explore the 10 interconnected security layers operating across kernel ETW streams, hardware DPAPI descriptors, and WebGL topology visualization.
        </p>
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARCHITECTURE_NODES.map((node) => {
          const IconComp = iconMap[node.id] || Cpu;
          const isSelected = selectedNode.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`glass-card rounded-3xl p-6 space-y-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#4A6CF7] bg-white/95 shadow-xl scale-[1.02]'
                  : 'border-black/5 hover:border-black/20 bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider">
                  {node.layer}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#4A6CF7]/10 flex items-center justify-center text-[#4A6CF7]">
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-[#111111]">{node.title}</h3>
                <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">{node.description}</p>
              </div>

              <div className="pt-3 border-t border-black/5 flex flex-wrap gap-1.5">
                {node.specs.map((spec, sIdx) => (
                  <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-[#F8F8F6] text-[10px] font-semibold text-[#2D2D2D] border border-black/5">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Detail Banner */}
      {selectedNode && (
        <motion.div
          key={selectedNode.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/90 bg-gradient-to-br from-white/90 to-[#E6E6E2]/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-[#4A6CF7] text-white text-xs font-bold">
                Selected: {selectedNode.layer}
              </span>
              <h3 className="text-2xl font-extrabold text-[#111111]">{selectedNode.title}</h3>
            </div>
            <p className="text-sm text-[#555555] leading-relaxed">{selectedNode.description}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[#111111] text-white text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#4A6CF7]" />
              <span>Status: {selectedNode.status}</span>
            </div>
          </div>
        </motion.div>
      )}

    </section>
  );
}
