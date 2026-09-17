import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Sparkles } from '@react-three/drei';
import KineticSculpture from './KineticSculpture';

export default function CanvasContainer() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleMouseMove = (event) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        setScrollProgress(currentProgress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        {/* Soft Volumetric Studio Lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[12, 14, 10]} intensity={2.0} color="#ffffff" castShadow />
        <directionalLight position={[-12, -10, -5]} intensity={0.7} color="#4A6CF7" />
        <pointLight position={[0, 4, 6]} intensity={1.0} color="#ffffff" />
        
        {/* Studio Environment Reflections */}
        <Environment preset="city" />

        {/* Studio Volumetric Floating Dust Particles */}
        <Sparkles
          count={75}
          scale={[14, 14, 10]}
          size={1.8}
          speed={0.3}
          opacity={0.35}
          color="#4A6CF7"
        />
        <Sparkles
          count={50}
          scale={[16, 16, 12]}
          size={1.2}
          speed={0.2}
          opacity={0.25}
          color="#2D2D2D"
        />

        {/* Dynamic 3D Kinetic Sculpture Adapting to Active Route & Scroll */}
        <KineticSculpture 
          mousePosition={mousePosition}
          scrollProgress={scrollProgress}
          currentPath={location.pathname}
        />

        {/* Soft Dynamic Studio Contact Shadow */}
        <ContactShadows
          position={[0, -3.2, 0]}
          opacity={0.35}
          scale={15}
          blur={2.8}
          far={6}
        />
      </Canvas>
    </div>
  );
}
