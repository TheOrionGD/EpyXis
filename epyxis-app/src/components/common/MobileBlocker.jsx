import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Mobile is typically < 768px. Tablets (768px+) and Desktops pass.
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#111111] text-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <AlertTriangle className="w-16 h-16 text-[#4A6CF7] animate-pulse" />
        <h1 className="text-2xl font-extrabold tracking-tight">Desktop Experience Required</h1>
        <p className="text-[#888888] text-sm max-w-sm leading-relaxed">
          The Epyxis Precision Endpoint Security dashboard requires a desktop or tablet resolution to display advanced telemetry, the SHA-256 audit ledger, and real-time process monitoring effectively.
        </p>
        <p className="text-xs text-[#555555] font-mono mt-8 border border-white/10 p-3 rounded-lg bg-white/5">
          ERR_UNSUPPORTED_VIEWPORT: {window.innerWidth}px
        </p>
      </div>
    );
  }

  return children;
}
