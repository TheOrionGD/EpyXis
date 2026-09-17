import React, { useState } from 'react';
import { ShieldCheck, Cpu, Activity, HardDrive, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PLATFORM_METRICS } from '../../data/platformData';
import { motion } from 'framer-motion';

export default function DashboardPreviewSection({ onOpenDashboard }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="py-28 relative max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-[#4A6CF7]" />
          <span>Real-time Telemetry Dashboard</span>
        </div>
        <h2 className="editorial-headline text-4xl sm:text-6xl font-extrabold text-[#111111] tracking-tight">
          Precision Engineering. Instant Visibility.
        </h2>
        <p className="editorial-sub text-base sm:text-xl text-[#555555] max-w-2xl mx-auto">
          Monitor process authenticity, USB device authorization, kernel drivers, and cryptographic audit logs from a single unified workspace interface.
        </p>
      </div>

      {/* Floating 3D Perspective Glass Dashboard Panel */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onOpenDashboard}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="glass-dark rounded-3xl p-8 sm:p-12 cursor-pointer relative overflow-hidden shadow-2xl group border border-white/10"
      >
        {/* Subtle Light Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Dashboard Header Bar */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A6CF7]/20 border border-[#4A6CF7]/40 flex items-center justify-center text-[#4A6CF7]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-white">Epyxis Precision Endpoint Security</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4A6CF7]/20 text-[#4A6CF7] text-[10px] font-bold uppercase tracking-wider border border-[#4A6CF7]/30">
                  Live System
                </span>
              </div>
              <p className="text-xs text-zinc-400">Windows OS Kernel Driver & ETW Subscription Engine</p>
            </div>
          </div>

          <button className="btn-magnetic hidden sm:inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4A6CF7] text-white text-xs font-semibold hover:bg-blue-600 shadow-md">
            <span>Open Interactive Dashboard</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs text-zinc-400 font-medium">System Health Score</div>
            <div className="text-3xl font-extrabold text-white">{PLATFORM_METRICS.healthScore} / 100</div>
            <div className="text-[11px] text-[#4A6CF7] font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Optimal Security State</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs text-zinc-400 font-medium">Publisher Trust Score</div>
            <div className="text-3xl font-extrabold text-[#4A6CF7]">{PLATFORM_METRICS.trustScore}%</div>
            <div className="text-[11px] text-zinc-400 font-medium">Authenticode Validated</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs text-zinc-400 font-medium">USB HIDs Audited</div>
            <div className="text-3xl font-extrabold text-white">{PLATFORM_METRICS.usbDevicesAudited} Devices</div>
            <div className="text-[11px] text-emerald-400 font-medium">0 BadUSB Threats</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-xs text-zinc-400 font-medium">Privacy Status</div>
            <div className="text-2xl font-extrabold text-white">100%</div>
            <div className="text-[11px] text-[#4A6CF7] font-semibold">Zero Text Captured</div>
          </div>
        </div>

        {/* Live Micro-Chart Simulation Bar */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-[#4A6CF7] animate-pulse shrink-0" />
            <div className="text-xs text-zinc-300">
              <span className="font-bold text-white">ETW Kernel Stream Active:</span> Listening to process creation & privilege escalation events...
            </div>
          </div>

          {/* Micro Visualizer Waves using Framer Motion */}
          <div className="flex items-center space-x-1.5 h-10 items-end">
            {[40, 75, 55, 90, 60, 80, 45, 95, 70, 85, 50, 65, 80].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: h * 0.15 }}
                animate={{ height: [h * 0.15, h * 0.35, h * 0.15] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="w-1.5 bg-[#4A6CF7] rounded-full transition-colors group-hover:bg-white"
              />
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
