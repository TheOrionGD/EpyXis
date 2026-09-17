import React from 'react';
import { ArrowRight, Play, Shield, Lock, EyeOff, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HERO_CONTENT } from '../../data/platformData';

const iconMap = {
  Shield: Shield,
  EyeOff: EyeOff,
  Lock: Lock
};

export default function HeroSection({ onExplorePlatform, onWatchExperience }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen w-full pt-16 sm:pt-20 pb-16 flex flex-col justify-start items-center overflow-hidden">
      
      {/* Studio Lighting Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-radial from-white/90 via-[#F8F8F6] to-[#E6E6E2]/40 -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Editorial Content */}
        <div className="lg:col-span-7 space-y-9 z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-black/5 shadow-xs text-xs font-semibold text-[#2D2D2D]">
            <span className="w-2 h-2 rounded-full bg-[#4A6CF7]"></span>
            <span className="tracking-widest uppercase text-[10px] text-[#888888]">{HERO_CONTENT.trustBadge.category}</span>
            <span className="text-[#E6E6E2]">|</span>
            <span className="text-[#4A6CF7]">{HERO_CONTENT.trustBadge.tagline}</span>
          </div>

          {/* Large Editorial Headline */}
          <div className="space-y-1">
            {HERO_CONTENT.titleLines.map((line, idx) => (
              <h1
                key={idx}
                className={`editorial-title text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-extrabold tracking-tighter leading-[0.94] ${
                  line.highlight ? 'text-[#4A6CF7]' : 'text-[#111111]'
                }`}
              >
                {line.text}
              </h1>
            ))}
          </div>

          {/* Subheadline */}
          <p className="editorial-sub text-base sm:text-lg text-[#555555] max-w-[500px] font-normal leading-relaxed">
            {HERO_CONTENT.subheadline}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onExplorePlatform}
              className="btn-magnetic inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-[#111111] text-white font-semibold text-sm hover:bg-[#2D2D2D] shadow-xl shadow-black/10 cursor-pointer"
            >
              <span>{HERO_CONTENT.primaryCta}</span>
              <ArrowRight className="w-4 h-4 text-[#4A6CF7]" />
            </button>

            <button
              onClick={onWatchExperience}
              className="btn-magnetic inline-flex items-center space-x-3 px-7 py-4 rounded-2xl bg-white/90 text-[#111111] font-semibold text-sm border border-black/10 hover:bg-white shadow-sm cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#4A6CF7]/10 flex items-center justify-center text-[#4A6CF7]">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>{HERO_CONTENT.secondaryCta}</span>
            </button>
          </div>

          {/* Core Assurance Badges */}
          <div className="pt-8 border-t border-black/5 grid grid-cols-3 gap-4 text-xs font-semibold text-[#555555]">
            {HERO_CONTENT.badges.map((b, idx) => {
              const IconComp = iconMap[b.iconName] || Shield;
              return (
                <div key={idx} className="flex items-center space-x-2.5">
                  <IconComp className="w-4 h-4 text-[#4A6CF7]" />
                  <span>{b.label}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side Focus Container */}
        <div className="lg:col-span-5 h-[480px] lg:h-[620px] relative flex flex-col justify-end p-8 pointer-events-none">
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-semibold uppercase tracking-widest text-[#888888] bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 w-fit shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#4A6CF7] animate-spin" />
            <span>{HERO_CONTENT.sculptureLabel}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
