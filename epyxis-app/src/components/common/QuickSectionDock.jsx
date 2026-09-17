import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Layers, Cpu, Eye, Lock, Send, ChevronUp } from 'lucide-react';
import { QUICK_DOCK_SECTIONS } from '../../data/navigationData';

const iconMap = {
  ChevronUp,
  Shield,
  Layers,
  Cpu,
  Eye,
  Lock,
  Send
};

export default function QuickSectionDock() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isDockVisible, setIsDockVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      setIsDockVisible(window.scrollY > 400);

      // Check which section is in view
      for (let i = QUICK_DOCK_SECTIONS.length - 1; i >= 0; i--) {
        const sec = QUICK_DOCK_SECTIONS[i];
        if (sec.id === 'hero') {
          if (window.scrollY < 400) {
            setActiveSection('hero');
            break;
          }
        } else {
          const el = document.getElementById(sec.id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <AnimatePresence>
      {isDockVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center space-x-1 p-1.5 rounded-full glass-capsule border border-white/90 bg-white/85 shadow-2xl backdrop-blur-2xl"
        >
          {QUICK_DOCK_SECTIONS.map((sec) => {
            const Icon = iconMap[sec.iconName] || ChevronUp;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dockActivePill"
                    className="absolute inset-0 rounded-full bg-[#111111] shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4A6CF7]' : ''}`} />
                <span className="text-[11px] tracking-tight">{sec.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
