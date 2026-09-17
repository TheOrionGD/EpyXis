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
        {/* Placeholder video for development */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connections-background-30910-large.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
