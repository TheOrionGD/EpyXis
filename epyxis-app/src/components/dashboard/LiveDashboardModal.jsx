import React from 'react';
import LiveDashboardContent from './LiveDashboardContent';
import { X } from 'lucide-react';

export default function LiveDashboardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>
        <LiveDashboardContent />
      </div>
    </div>
  );
}
