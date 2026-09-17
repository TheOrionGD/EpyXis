import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function KineticSculpture({ mousePosition, scrollProgress = 0, currentPath = '/' }) {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const innerRingRef = useRef();
  const glassLensRef = useRef();
  const coreSphereRef = useRef();
  const elapsedTimeRef = useRef(0);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    const elapsedTime = elapsedTimeRef.current;
    const isMobile = state.viewport.width < 6;

    // Mouse Parallax Targets with Spring Physics
    const mouseX = (mousePosition.current.x * Math.PI) / 8;
    const mouseY = (mousePosition.current.y * Math.PI) / 8;

    // Base Scale: 1.82 Desktop Base Scale (Awwwards 35% larger)
    let targetPosX = isMobile ? 0 : 2.2;
    let targetPosY = 0;
    let targetPosZ = 0.2;
    let targetScale = isMobile ? 1.15 : 1.82;
    let explosionOffset = 0;
    let glassLensRotY = Math.sin(elapsedTime * 0.3) * 0.15;

    // PAGE ROUTE OVERRIDES
    if (currentPath === '/modules') {
      targetPosX = isMobile ? 0 : 1.5;
      targetPosY = -0.15;
      targetPosZ = -0.3;
      targetScale = isMobile ? 1.0 : 1.62;
      explosionOffset = 1.25; // Exploded rings
    } else if (currentPath === '/architecture') {
      targetPosX = isMobile ? 0 : -2.2;
      targetPosY = 0.1;
      targetPosZ = 0.25;
      targetScale = isMobile ? 1.08 : 1.7;
      explosionOffset = 0.45;
      glassLensRotY = Math.PI / 3;
    } else if (currentPath === '/dashboard') {
      targetPosX = isMobile ? 0 : 2.1;
      targetPosY = -0.25;
      targetPosZ = 1.0; // Macro focus
      targetScale = isMobile ? 1.15 : 1.86;
      explosionOffset = 0.55;
    } else if (currentPath === '/privacy') {
      targetPosX = isMobile ? 0 : -2.2;
      targetPosY = 0;
      targetPosZ = 0.35;
      targetScale = isMobile ? 1.08 : 1.72;
      glassLensRotY = Math.PI / 2; // Shield front
      explosionOffset = 0.3;
    } else if (currentPath === '/experience') {
      targetPosX = 0;
      targetPosY = 0.15;
      targetPosZ = 0.45;
      targetScale = isMobile ? 1.08 : 1.7;
      explosionOffset = 0.7;
    } else {
      // Home Page '/' (Scroll Driven Interpolation)
      if (scrollProgress <= 0.20) {
        const t = scrollProgress / 0.20;
        targetPosX = THREE.MathUtils.lerp(isMobile ? 0 : 2.2, isMobile ? 0 : 1.8, t);
        targetPosY = THREE.MathUtils.lerp(0, -0.15, t);
        targetPosZ = 0.2;
        targetScale = isMobile ? 1.15 : 1.82;
        explosionOffset = THREE.MathUtils.lerp(0, 0.22, t);
      } else if (scrollProgress <= 0.45) {
        const t = (scrollProgress - 0.20) / 0.25;
        targetPosX = THREE.MathUtils.lerp(isMobile ? 0 : 1.8, 0, t);
        targetPosY = THREE.MathUtils.lerp(-0.15, -0.25, t);
        targetPosZ = THREE.MathUtils.lerp(0.2, -0.5, t);
        explosionOffset = THREE.MathUtils.lerp(0.22, 1.4, t);
        targetScale = isMobile ? 1.0 : 1.62;
      } else if (scrollProgress <= 0.70) {
        const t = (scrollProgress - 0.45) / 0.25;
        targetPosX = THREE.MathUtils.lerp(0, isMobile ? 0 : -2.2, t);
        targetPosY = THREE.MathUtils.lerp(-0.25, 0.1, t);
        targetPosZ = THREE.MathUtils.lerp(-0.5, 0.35, t);
        explosionOffset = THREE.MathUtils.lerp(1.4, 0.35, t);
        glassLensRotY = THREE.MathUtils.lerp(0, Math.PI / 2, t);
        targetScale = isMobile ? 1.08 : 1.72;
      } else if (scrollProgress <= 0.88) {
        const t = (scrollProgress - 0.70) / 0.18;
        targetPosX = THREE.MathUtils.lerp(isMobile ? 0 : -2.2, 0, t);
        targetPosY = THREE.MathUtils.lerp(0.1, -0.2, t);
        targetPosZ = THREE.MathUtils.lerp(0.35, 1.5, t);
        explosionOffset = THREE.MathUtils.lerp(0.35, 0.55, t);
        targetScale = isMobile ? 1.15 : 1.86;
      } else {
        const t = (scrollProgress - 0.88) / 0.12;
        targetPosX = 0;
        targetPosY = THREE.MathUtils.lerp(-0.2, 0.45, t);
        targetPosZ = THREE.MathUtils.lerp(1.5, -0.15, t);
        explosionOffset = THREE.MathUtils.lerp(0.55, 0, t);
        targetScale = isMobile ? 1.0 : 1.55;
      }
    }

    // Apply Spring Physics Lerp
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.06);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.06);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.06);

      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.06);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.06);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.06);

      // Mouse Parallax & Gentle Scroll Inertia
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY + scrollProgress * Math.PI * 0.8, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX + elapsedTime * 0.1 + scrollProgress * Math.PI * 1.8, 0.05);
    }

    // Exploded View Ring Offsets & Micro Motions
    if (outerRingRef.current) {
      outerRingRef.current.position.z = THREE.MathUtils.lerp(outerRingRef.current.position.z, explosionOffset, 0.05);
      outerRingRef.current.rotation.z += delta * 0.18;
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.z -= delta * 0.22;
      middleRingRef.current.rotation.y = Math.cos(elapsedTime * 0.4) * 0.25;
    }

    if (innerRingRef.current) {
      innerRingRef.current.position.z = THREE.MathUtils.lerp(innerRingRef.current.position.z, -explosionOffset, 0.05);
      innerRingRef.current.rotation.x += delta * 0.28;
    }

    if (glassLensRef.current) {
      glassLensRef.current.rotation.y = THREE.MathUtils.lerp(glassLensRef.current.rotation.y, glassLensRotY, 0.05);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={groupRef} position={[2.2, 0, 0.2]} scale={1.82}>
        
        {/* Core Matte Ceramic Sphere */}
        <mesh ref={coreSphereRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.68, 64, 64]} />
          <meshStandardMaterial
            color="#2D2D2D"
            roughness={0.22}
            metalness={0.85}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Smoked Glass Transmission Shield Lens */}
        <mesh ref={glassLensRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.05, 48, 48]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.9}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            thickness={0.5}
            ior={1.45}
            chromaticAberration={0.03}
            anisotropy={0.15}
            color="#E6E6E2"
          />
        </mesh>

        {/* Inner Precision Brushed Aluminum Ring */}
        <group ref={innerRingRef}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.42, 0.048, 32, 100]} />
            <meshStandardMaterial
              color="#E6E6E2"
              metalness={0.95}
              roughness={0.08}
              envMapIntensity={2.4}
            />
          </mesh>
        </group>

        {/* Middle Machined Graphite Ring (Pure Clean Torus) */}
        <group ref={middleRingRef}>
          <mesh rotation={[0, Math.PI / 3, 0]}>
            <torusGeometry args={[1.82, 0.058, 32, 120]} />
            <meshStandardMaterial
              color="#111111"
              metalness={0.92}
              roughness={0.12}
              envMapIntensity={2.2}
            />
          </mesh>
        </group>

        {/* Outer Sculptural Precision Ring */}
        <group ref={outerRingRef}>
          <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
            <torusGeometry args={[2.28, 0.038, 32, 120]} />
            <meshStandardMaterial
              color="#E6E6E2"
              metalness={0.98}
              roughness={0.06}
              envMapIntensity={2.6}
            />
          </mesh>
        </group>

      </group>
    </Float>
  );
}
