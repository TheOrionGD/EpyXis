import React, { useState } from 'react';
import { PRIVACY_COMPARISON } from '../../data/platformData';
import { CheckCircle2, ShieldCheck, Lock, EyeOff } from 'lucide-react';

export default function PrivacyMatrix() {
  const [activeTab, setActiveTab] = useState('both');

  return (
    <section id="privacy" className="py-28 relative max-w-7xl mx-auto px-6">
      
      {/* Container Panel */}
      <div className="glass-panel rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-black/5">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
            <EyeOff className="w-3.5 h-3.5 text-[#4A6CF7]" />
            <span>Privacy-by-Design Architecture</span>
          </div>

          <h2 className="editorial-headline text-4xl sm:text-5xl font-extrabold text-[#111111]">
            Guaranteed Privacy. Zero Keystroke Logging.
          </h2>

          <p className="editorial-sub text-base sm:text-lg text-[#555555]">
            Epyxis enforces absolute privacy boundaries at the operating system level. The system captures non-sensitive security metadata while strictly ignoring user content.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center space-x-2 mb-8 glass-card p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'both' ? 'bg-[#111111] text-white' : 'text-[#555555] hover:text-[#111111]'
            }`}
          >
            Full Comparison
          </button>
          <button
            onClick={() => setActiveTab('stored')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'stored' ? 'bg-[#4A6CF7] text-white' : 'text-[#555555] hover:text-[#111111]'
            }`}
          >
            ✔ What We Collect
          </button>
          <button
            onClick={() => setActiveTab('never')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'never' ? 'bg-[#2D2D2D] text-white' : 'text-[#555555] hover:text-[#111111]'
            }`}
          >
            ❌ Never Captured
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Stored Column */}
          {(activeTab === 'both' || activeTab === 'stored') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#4A6CF7]/10 border border-[#4A6CF7]/20 text-[#111111] font-bold text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4A6CF7]" />
                  <span>Security Metadata Stored (6 Categories)</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#4A6CF7] text-white font-semibold">Allowed</span>
              </div>

              <div className="space-y-3">
                {PRIVACY_COMPARISON.stored.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/80 border border-black/5 hover:border-[#4A6CF7]/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#4A6CF7]/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6CF7]" />
                      </div>
                      <span className="font-bold text-sm text-[#111111]">{item.title}</span>
                    </div>
                    <p className="text-xs text-[#555555] pl-8">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Never Stored Column */}
          {(activeTab === 'both' || activeTab === 'never') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#2D2D2D]/10 border border-[#2D2D2D]/20 text-[#111111] font-bold text-sm">
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-5 h-5 text-[#2D2D2D]" />
                  <span>User Data Never Captured (6 Categories)</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#2D2D2D] text-white font-semibold">Strictly Excluded</span>
              </div>

              <div className="space-y-3">
                {PRIVACY_COMPARISON.neverStored.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/80 border border-black/5 hover:border-[#2D2D2D]/30 transition-colors">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#2D2D2D]/10 flex items-center justify-center shrink-0">
                        <EyeOff className="w-3.5 h-3.5 text-[#2D2D2D]" />
                      </div>
                      <span className="font-bold text-sm text-[#111111]">{item.title}</span>
                    </div>
                    <p className="text-xs text-[#555555] pl-8">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#555555]">
          <div className="flex items-center space-x-3">
            <Lock className="w-4 h-4 text-[#4A6CF7]" />
            <span>Compliance Verified: GDPR Article 25 (Privacy by Design) & ISO/IEC 27001</span>
          </div>
          <div className="flex items-center space-x-2 text-[#111111]">
            <ShieldCheck className="w-4 h-4 text-[#4A6CF7]" />
            <span>Client-side Data Stripping Active</span>
          </div>
        </div>

      </div>

    </section>
  );
}
