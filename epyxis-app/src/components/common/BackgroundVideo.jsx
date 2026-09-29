import React from 'react';

export default function BackgroundVideo() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[2px]"></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-80"
      >
        {/* High-definition architectural cybersecurity visualization */}
        <source src="/desktop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
