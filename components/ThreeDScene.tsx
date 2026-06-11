"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoinProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  offset?: number;
}

// Overshoot ease so coins "pop" past their final size before settling — a burst, not a fade.
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function Coin({ position, scale = 1, speed = 1, offset = 0 }: CoinProps) {
  const ref = useRef<THREE.Mesh>(null);
  const startY = position[1];
  const mountTime = useRef<number | null>(null);
  const burstDelay = offset * 0.12;
  const burstDuration = 0.8;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (mountTime.current === null) mountTime.current = clock.getElapsedTime();

    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.y = startY + Math.sin(t) * 0.35;
    // Gentle wobble that keeps the coin's gold face mostly toward the camera
    // (a cylinder seen edge-on reads as a thin dark bar, which looks like a glitch)
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.5;
    ref.current.rotation.x = Math.cos(t * 0.4) * 0.25 - 0.15;

    // Burst-in entrance: scale 0 → target with a staggered overshoot, like coins popping into frame
    const elapsed = clock.getElapsedTime() - mountTime.current - burstDelay;
    const progress = THREE.MathUtils.clamp(elapsed / burstDuration, 0, 1);
    const burst = elapsed <= 0 ? 0 : easeOutBack(progress);
    ref.current.scale.setScalar(scale * Math.max(burst, 0));
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <cylinderGeometry args={[0.85, 0.85, 0.16, 40]} />
      <meshStandardMaterial
        color="#D97706"
        metalness={0.75}
        roughness={0.22}
        emissive="#F59E0B"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function CoinField({ spread }: { spread: number }) {
  const coins = useMemo<CoinProps[]>(
    () => [
      { position: [-1.8 * spread, 0.95 * spread, -1.0], scale: 1.3, speed: 0.8, offset: 0 },
      { position: [1.8 * spread, 0.1 * spread, -1.0], scale: 1.0, speed: 1.1, offset: 1.4 },
      { position: [1.55 * spread, 1.25 * spread, -1.2], scale: 0.7, speed: 0.95, offset: 2.6 },
      { position: [-1.65 * spread, -1.15 * spread, -1.2], scale: 0.85, speed: 1.05, offset: 3.6 },
      { position: [0.15 * spread, 1.65 * spread, -1.4], scale: 0.6, speed: 1.2, offset: 0.8 },
      { position: [-0.2 * spread, -1.65 * spread, -1.2], scale: 0.65, speed: 0.9, offset: 4.2 },
    ],
    [spread]
  );

  return (
    <>
      {coins.map((c, i) => (
        <Coin key={i} {...c} />
      ))}
    </>
  );
}

interface ThreeDSceneProps {
  /** Multiplier applied to each coin's x/y position — lower values pull the coins toward the center. */
  spread?: number;
}

/**
 * Lightweight ambient 3D scene: a handful of slowly spinning, bobbing gold
 * coins behind the hero mockup. Kept minimal (low geometry, no postprocessing)
 * so it stays smooth on modest laptops/phones.
 */
export default function ThreeDScene({ spread = 1.4 }: ThreeDSceneProps) {
  return (
    <div
      className="absolute -inset-12 sm:-inset-24 -z-10 pointer-events-none"
      style={{
        maskImage: "radial-gradient(closest-side, black 55%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side, black 55%, transparent 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} color="#FFFFFF" />
        <directionalLight position={[-5, -3, 2]} intensity={1} color="#8B5CF6" />
        <Suspense fallback={null}>
          <CoinField spread={spread} />
        </Suspense>
      </Canvas>
    </div>
  );
}
