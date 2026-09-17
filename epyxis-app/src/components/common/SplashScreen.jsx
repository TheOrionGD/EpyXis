import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [statusText, setStatusText] = useState('Initializing Epyxis Defensive Engine...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusText('Authenticating Kernel ETW Event Streams...');
    }, 600);

    const timer2 = setTimeout(() => {
      setStatusText('Zero-Trust Hardware Posture Verified.');
    }, 1200);

    const timer3 = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0D0F] text-white select-none overflow-hidden font-sans"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#4A6CF7]/20 via-[#ef4444]/10 to-transparent blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col items-center space-y-6 text-center px-4">
            {/* EPYXIS Lighthouse Icon with Glowing Pulsing Ring */}
            <div className="relative group">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#4A6CF7] via-[#ef4444] to-[#4A6CF7] opacity-60 blur-lg animate-pulse" />
              <img
                src="/EPYXIS.png"
                alt="EPYXIS Security Platform"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl relative object-cover shadow-2xl border border-white/20 transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Brand Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                EPYXIS<span className="text-[#4A6CF7]">.</span>
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Precision Endpoint Security & Zero-Trust Governance
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span className="font-mono text-[11px] text-zinc-300">{statusText}</span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.7, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#4A6CF7] via-[#ef4444] to-[#10b981]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
