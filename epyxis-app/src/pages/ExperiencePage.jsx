import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import ScrollReveal from '../components/common/ScrollReveal';
import PageTransition from '../components/common/PageTransition';
import { EyeOff, Cpu, HardDrive, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { EXPERIENCE_SCENARIOS } from '../data/platformData';

const iconMap = {
  EyeOff,
  Cpu,
  HardDrive
};

export default function ExperiencePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const scenario = EXPERIENCE_SCENARIOS[currentStep] || EXPERIENCE_SCENARIOS[0];
  const Icon = iconMap[scenario.iconName] || EyeOff;

  return (
    <PageTransition>
      <div className="pt-32 pb-16 space-y-16 min-h-screen">
        
        {/* Page Header Banner */}
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="flex items-center justify-between glass-panel p-8 sm:p-12 rounded-3xl border border-black/5 bg-gradient-to-br from-white/80 to-[#E6E6E2]/40 shadow-2xl">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4A6CF7]"></span>
                  <span>Interactive Product Walkthrough</span>
                </div>
                <h1 className="editorial-headline text-4xl sm:text-5xl font-extrabold text-[#111111]">
                  Cinematic Product Experience
                </h1>
                <p className="editorial-sub text-base text-[#555555]">
                  Experience how Epyxis defends endpoint input, validates binary signatures, and guarantees zero text persistence.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-black/10 text-xs font-semibold text-[#111111] hover:bg-black/5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 text-[#4A6CF7]" />
                <span>Return Overview</span>
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Main Experience Interactive Panel */}
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up" delay={0.2}>
            <div className="glass-panel rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-black/5 bg-white/90 shadow-2xl space-y-10">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-widest uppercase text-[#888888]">
                  SCENARIO 0{scenario.step} OF 0{EXPERIENCE_SCENARIOS.length}
                </span>
                <div className="flex space-x-2">
                  {EXPERIENCE_SCENARIOS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        idx === currentStep ? 'w-10 bg-[#4A6CF7]' : 'w-2.5 bg-black/15'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F8F8F6] border border-black/5 text-xs font-extrabold text-[#4A6CF7]">
                    <Icon className="w-4 h-4" />
                    <span>{scenario.subtitle}</span>
                  </div>

                  <h2 className="editorial-headline text-3xl sm:text-5xl font-extrabold text-[#111111]">
                    {scenario.title}
                  </h2>

                  <p className="editorial-sub text-base sm:text-lg text-[#555555] leading-relaxed">
                    {scenario.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-black/5 text-xs text-[#2D2D2D] font-medium space-y-1">
                    <div className="font-bold text-[#111111] flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4A6CF7]" />
                      <span>Verified System Metric: {scenario.stat}</span>
                    </div>
                    <div className="text-[11px] text-[#888888] pl-6">{scenario.detail}</div>
                  </div>
                </div>

                <div className="lg:col-span-5 h-80 rounded-3xl bg-[#111111] p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#4A6CF7] border border-white/10">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">Live Telemetry Simulation</div>
                    <div className="text-3xl font-extrabold">{scenario.stat}</div>
                    <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4A6CF7] h-full rounded-full w-full animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Controls */}
              <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                    currentStep === 0 ? 'text-zinc-400 cursor-not-allowed opacity-50' : 'bg-white text-[#111111] border border-black/10 hover:bg-black/5 shadow-xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Scenario</span>
                </button>

                {currentStep < EXPERIENCE_SCENARIOS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(EXPERIENCE_SCENARIOS.length - 1, prev + 1))}
                    className="btn-magnetic flex items-center space-x-2 px-7 py-3 rounded-2xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] transition-colors cursor-pointer shadow-md"
                  >
                    <span>Next Scenario</span>
                    <ChevronRight className="w-4 h-4 text-[#4A6CF7]" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-magnetic flex items-center space-x-2 px-7 py-3 rounded-2xl bg-[#4A6CF7] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
                  >
                    <span>Launch Defensive Dashboard</span>
                  </button>
                )}
              </div>

            </div>
          </ScrollReveal>
        </div>

        {/* Sub-page Footer */}
        <Footer showCta={false} />
      </div>
    </PageTransition>
  );
}
