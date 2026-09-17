import React, { useState } from 'react';
import { SECURITY_MODULES } from '../../data/platformData';
import { Cpu, ShieldCheck, Activity, HardDrive, EyeOff, Bell, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MODULE_ICONS = {
  integrity: Cpu,
  trust: ShieldCheck,
  etw: Activity,
  usb: HardDrive,
  risk_rbac: EyeOff,
  ledger_reports: Bell
};

export default function ModuleShowcase({ onSelectModule }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredModules = activeTab === 'all' 
    ? SECURITY_MODULES 
    : SECURITY_MODULES.filter(m => m.id === activeTab);

  return (
    <section id="modules" className="py-28 relative max-w-7xl mx-auto px-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E6E6E2]/70 text-xs font-semibold text-[#2D2D2D]">
            <span>System Architecture</span>
          </div>
          <h2 className="editorial-headline text-4xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Engineered into Six Modular Engines.
          </h2>
          <p className="editorial-sub text-base sm:text-lg text-[#555555]">
            Each module executes independently to audit hardware, verify publisher authenticity, measure ergonomics, and protect endpoint integrity.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 glass-panel p-1.5 rounded-2xl border border-black/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#111111]'
            }`}
          >
            All Modules
          </button>
          {SECURITY_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === mod.id
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              {mod.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModules.map((module) => {
          const IconComponent = MODULE_ICONS[module.id] || Cpu;
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              onClick={() => onSelectModule(module)}
              className="glass-card rounded-3xl p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle Ambient Hover Shimmer */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#4A6CF7]/5 rounded-full blur-3xl group-hover:bg-[#4A6CF7]/15 transition-all duration-700 pointer-events-none" />

              <div>
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] flex items-center justify-center text-white shadow-md group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-[#4A6CF7]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#E6E6E2]/70 text-[11px] font-bold text-[#2D2D2D]">
                    {module.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#4A6CF7] transition-colors duration-300">
                  {module.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed mb-6">
                  {module.description}
                </p>

                {/* Live Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/70 border border-black/5">
                  {module.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#888888]">{m.label}</div>
                      <div className="text-base font-extrabold text-[#111111]">{m.value}</div>
                      <div className="text-[10px] text-[#4A6CF7] font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature Highlights */}
                <ul className="space-y-2.5 mb-6">
                  {module.highlights.map((h, idx) => (
                    <li key={idx} className="text-xs text-[#555555] flex items-start space-x-2.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A6CF7] mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs font-bold text-[#111111] group-hover:text-[#4A6CF7] transition-colors">
                <span>Inspect Engine Specs</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
