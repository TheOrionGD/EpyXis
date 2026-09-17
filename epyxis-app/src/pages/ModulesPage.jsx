import React from 'react';
import ModuleShowcase from '../components/modules/ModuleShowcase';
import Footer from '../components/common/Footer';
import ScrollReveal from '../components/common/ScrollReveal';
import PageTransition from '../components/common/PageTransition';
import { Cpu } from 'lucide-react';

export default function ModulesPage({ onSelectModule }) {
  return (
    <PageTransition>
      <div className="pt-32 pb-16 space-y-16 min-h-screen">
        
        {/* Page Header Banner */}
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="glass-panel rounded-3xl p-10 sm:p-14 relative overflow-hidden border border-black/5 bg-gradient-to-br from-white/80 to-[#E6E6E2]/40 shadow-2xl">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-[#4A6CF7]" />
                  <span>Modular Defensive Architecture</span>
                </div>
                <h1 className="editorial-headline text-4xl sm:text-6xl font-extrabold text-[#111111] tracking-tight">
                  Six Independent Defensive Security Engines.
                </h1>
                <p className="editorial-sub text-base sm:text-lg text-[#555555]">
                  Each module executes independently to audit hardware, verify publisher authenticity, measure ergonomics, and protect endpoint integrity.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Module Showcase Grid & Filter */}
        <ScrollReveal direction="up" delay={0.2}>
          <ModuleShowcase onSelectModule={onSelectModule} />
        </ScrollReveal>

        {/* Sub-page Footer */}
        <Footer showCta={false} />
      </div>
    </PageTransition>
  );
}
