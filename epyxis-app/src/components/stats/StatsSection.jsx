import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Cpu, EyeOff } from 'lucide-react';
import { STATS_SECTION_DATA } from '../../data/platformData';
import { telemetryService } from '../../services/telemetryService';

const iconMap = {
  latency: ShieldCheck,
  privacy: EyeOff,
  trust: Lock,
  uptime: Cpu
};

function CounterCard({ counter }) {
  const IconComponent = iconMap[counter.id] || ShieldCheck;

  return (
    <div className="glass-card rounded-3xl p-8 space-y-4 border border-black/5 hover:border-[#4A6CF7]/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-2xl bg-[#111111] flex items-center justify-center text-white shadow-md">
          <IconComponent className="w-5 h-5 text-[#4A6CF7]" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">Verified</span>
      </div>

      <div>
        <div className="text-4xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          {counter.value}
        </div>
        <div className="text-sm font-bold text-[#111111] mt-1">{counter.label}</div>
        <div className="text-xs text-[#555555] font-medium mt-0.5">{counter.subtext}</div>
      </div>
    </div>
  );
}

export default function StatsSection() {
  const [counters, setCounters] = useState(STATS_SECTION_DATA.counters);

  useEffect(() => {
    async function loadLiveCounters() {
      try {
        const stats = await telemetryService.getStats();
        if (stats) {
          setCounters(prev => prev.map(c => {
            if (c.id === 'trust') {
              return { ...c, value: `${stats.trustScore}%`, subtext: `${stats.activeDevices} registered host active` };
            }
            if (c.id === 'privacy') {
              return { ...c, value: stats.privacyScore, subtext: stats.textCaptured };
            }
            if (c.id === 'uptime') {
              return { ...c, value: stats.uptime, subtext: `${stats.processesTracked} processes tracked` };
            }
            return c;
          }));
        }
      } catch (e) {
        console.error('Error fetching live telemetry statistics:', e);
      }
    }
    loadLiveCounters();
  }, []);

  return (
    <section className="py-20 max-w-7xl mx-auto px-6 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="editorial-headline text-3xl sm:text-4xl font-extrabold text-[#111111]">
          {STATS_SECTION_DATA.headline}
        </h2>
        <p className="editorial-sub text-sm sm:text-base text-[#555555]">
          {STATS_SECTION_DATA.subheadline}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {counters.map((c) => (
          <CounterCard key={c.id} counter={c} />
        ))}
      </div>
    </section>
  );
}
