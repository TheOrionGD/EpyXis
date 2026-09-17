import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgressControls() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setScrollPercent(0);
  }, [location.pathname]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolled = (winScroll / height) * 100;
        setScrollPercent(Math.min(100, Math.max(0, scrolled)));
      }
      setIsVisible(winScroll > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG Circular Progress Calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <>
      {/* Top Glassmorphic Hairline Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-black/5 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#4A6CF7] via-[#60a5fa] to-[#111111] transition-all duration-150 ease-out shadow-[0_0_12px_rgba(74,108,247,0.8)]"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Floating Glassmorphic Scroll-To-Top Button with Dynamic Progress Circle */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-500 transform ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="group relative flex items-center justify-center w-12 h-12 rounded-full glass-capsule border border-white/90 shadow-2xl bg-white/90 hover:bg-white text-[#111111] transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer"
        >
          {/* Dynamic Circular Progress Indicator Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5 pointer-events-none">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-black/5"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-[#4A6CF7] transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Arrow Icon */}
          <ArrowUp className="w-5 h-5 text-[#111111] group-hover:text-[#4A6CF7] group-hover:-translate-y-0.5 transition-all duration-300" />

          {/* Hover Tooltip with Percentage */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#111111] text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
            {Math.round(scrollPercent)}% Top
          </span>
        </button>
      </div>
    </>
  );
}
