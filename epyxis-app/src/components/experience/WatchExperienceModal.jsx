import React, { useState } from 'react';
import { X, Play, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, EyeOff, Cpu, HardDrive } from 'lucide-react';

const SCENARIOS = [
  {
    step: 1,
    title: 'Zero-Keystroke Input Privacy',
    icon: EyeOff,
    subtitle: 'Client-side Hardware Trapping',
    description: 'Epyxis intercepts operating system hardware events directly at the Windows ETW layer. Event duration and cadence are logged, while character payloads are stripped before touching memory.',
    stat: '100% Privacy Preserved',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    step: 2,
    title: 'Authenticode Application Scoring',
    icon: Cpu,
    subtitle: 'Binary Reputation Verification',
    description: 'Every launched binary is audited for digital signatures. Unsigned or modified executables are assigned a lowered trust score and isolated from system hooks.',
    stat: '99.8% Publisher Trust',
    color: 'from-slate-800 to-zinc-900'
  },
  {
    step: 3,
    title: 'Hardware HID Defense',
    icon: HardDrive,
    subtitle: 'BadUSB & Rubber Ducky Shield',
    description: 'New USB input devices are fingerprinted for Vendor ID and Product ID matching. Non-whitelisted HID devices attempting high-speed keystroke injection are blocked instantly.',
    stat: '< 12ms Block Latency',
    color: 'from-[#4A6CF7] to-blue-700'
  }
];

export default function WatchExperienceModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const scenario = SCENARIOS[currentStep];
  const Icon = scenario.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-lg animate-fadeIn">
      
      <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative">
        
        {/* Header */}
        <div className="p-6 bg-[#111111] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#4A6CF7]">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="uppercase tracking-wider">Cinematic Product Walkthrough</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Scenario Presentation */}
        <div className="p-8 sm:p-12 space-y-8 bg-[#F8F8F6]">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#888888]">STEP 0{scenario.step} OF 03</span>
            <div className="flex space-x-2">
              {SCENARIOS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-8 bg-[#4A6CF7]' : 'w-2 bg-black/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-black/5 text-xs font-bold text-[#4A6CF7]">
                <Icon className="w-3.5 h-3.5" />
                <span>{scenario.subtitle}</span>
              </div>

              <h3 className="editorial-headline text-3xl sm:text-4xl font-extrabold text-[#111111]">
                {scenario.title}
              </h3>

              <p className="editorial-sub text-sm sm:text-base text-[#555555]">
                {scenario.description}
              </p>

              <div className="pt-4 flex items-center space-x-3 text-xs font-extrabold text-[#111111]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Metric: {scenario.stat}</span>
              </div>
            </div>

            <div className="md:col-span-5 h-64 rounded-2xl bg-[#111111] p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#4A6CF7]">
                <Icon className="w-6 h-6" />
              </div>

              <div className="space-y-2 relative z-10">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Live Hardware Test</div>
                <div className="text-xl font-bold">{scenario.stat}</div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4A6CF7] h-full rounded-full w-full animate-pulse" />
                </div>
              </div>
            </div>

          </div>

          {/* Stepper Controls */}
          <div className="pt-6 border-t border-black/5 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                currentStep === 0 ? 'text-zinc-400 cursor-not-allowed' : 'bg-white text-[#111111] border border-black/10 hover:bg-black/5'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep < SCENARIOS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(SCENARIOS.length - 1, prev + 1))}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] transition-colors cursor-pointer"
              >
                <span>Next Scenario</span>
                <ChevronRight className="w-4 h-4 text-[#4A6CF7]" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#4A6CF7] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
              >
                <span>Finish Experience</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
