import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, EyeOff, ArrowUpRight } from 'lucide-react';
import { FOOTER_SECTIONS } from '../../data/navigationData';

export default function Footer({ onOpenDashboard, onOpenExperience, showCta = true }) {
  return (
    <footer className="pt-20 pb-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Frosted Glass & Neumorphism CTA Banner */}
        {showCta && (
          <div className="glass-panel p-10 sm:p-16 rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 via-white/70 to-[#E6E6E2]/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4A6CF7]"></span>
                <span>Workspace Security Redefined</span>
              </div>
              <h2 className="editorial-headline text-4xl sm:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight">
                Ready to experience<br />
                <span className="text-[#4A6CF7]">privacy-first computing?</span>
              </h2>
              <p className="text-base text-[#555555] max-w-xl font-normal leading-relaxed">
                Deploy Epyxis Precision Endpoint Security across your desktop infrastructure today with zero keystroke persistence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <button
                onClick={onOpenDashboard}
                className="btn-magnetic inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2D2D2D] shadow-xl shadow-black/10 cursor-pointer"
              >
                <span>Launch Live Dashboard</span>
                <ArrowUpRight className="w-4 h-4 text-[#4A6CF7]" />
              </button>

              <button
                onClick={onOpenExperience}
                className="btn-magnetic inline-flex items-center space-x-2 px-6 py-4 rounded-2xl bg-white/80 text-[#111111] text-sm font-semibold hover:bg-white border border-black/10 shadow-xs cursor-pointer"
              >
                <span>Watch Experience</span>
              </button>
            </div>
          </div>
        )}

        {/* Frosted Glass Footer Links Container */}
        <div className="glass-panel p-10 sm:p-12 rounded-3xl border border-white/80 bg-white/60 backdrop-blur-2xl space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 text-xs">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/EPYXIS.png" alt="EPYXIS Security Logo" className="w-9 h-9 rounded-xl object-cover shadow-md border border-black/10" />
                <span className="font-extrabold text-xl text-[#111111] tracking-tight">{FOOTER_SECTIONS.brand.name}</span>
              </div>

              <p className="text-[#555555] leading-relaxed max-w-sm font-medium">
                {FOOTER_SECTIONS.brand.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-[#2D2D2D] font-semibold">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#4A6CF7]" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4 h-4 text-[#4A6CF7]" />
                  <span>Zero Keystroke Persistence</span>
                </div>
              </div>
            </div>

            {FOOTER_SECTIONS.columns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-extrabold text-[#111111] mb-4 uppercase tracking-wider text-[11px]">{col.title}</h4>
                <ul className="space-y-2.5 text-[#555555] font-semibold">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link to={link.path} className="hover:text-[#111111] transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* Bottom Rights */}
          <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888] gap-4 font-semibold">
            <div>
              {FOOTER_SECTIONS.brand.copyright}
            </div>
            <div className="flex items-center space-x-6">
              <span>Security Health: 98/100</span>
              <span className="text-[#4A6CF7]">All Systems Operational</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
