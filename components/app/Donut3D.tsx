"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Category } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";

const INNER_R = 1.1;
const OUTER_R = 2.0;
const DEPTH = 0.55;
const BEVEL_T = 0.18;
const BEVEL_S = 0.18;
const BEVEL_SEGS = 12;
const CURVE_SEGS = 64;
const GAP = 0.025;

// Vivid saturated colors for 3D effect (different from flat-bar colors)
const DONUT_COLORS: Partial<Record<Category, string>> = {
  alimentation: "#FF6B6B",
  transports: "#4ECDC4",
  abonnements: "#45B7D1",
  sorties_loisirs: "#96CEB4",
  achats_divers: "#FFEAA7",
  electricite_telecom: "#DDA0DD",
  transfert_international: "#98D8C8",
  frais_bancaires: "#B0BEC5",
  autre: "#CFD8DC",
};

function getDonutColor(cat: Category): string {
  return DONUT_COLORS[cat] ?? CATEGORY_COLORS[cat];
}

export interface DonutSegment {
  category: Category;
  value: number;
  pct: number;
}

function ringShape(startAngle: number, endAngle: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(Math.cos(startAngle) * OUTER_R, Math.sin(startAngle) * OUTER_R);
  shape.absarc(0, 0, OUTER_R, startAngle, endAngle, false);
  shape.lineTo(Math.cos(endAngle) * INNER_R, Math.sin(endAngle) * INNER_R);
  shape.absarc(0, 0, INNER_R, endAngle, startAngle, true);
  shape.closePath();
  return shape;
}

interface SegProps {
  category: Category;
  startAngle: number;
  endAngle: number;
  hovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
}

function SegmentMesh({ category, startAngle, endAngle, hovered, onHover, onUnhover, onClick }: SegProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(ringShape(startAngle + GAP / 2, endAngle - GAP / 2), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL_T,
      bevelSize: BEVEL_S,
      bevelSegments: BEVEL_SEGS,
      curveSegments: CURVE_SEGS,
    });
    return g;
  }, [startAngle, endAngle]);

  useFrame(() => {
    if (!meshRef.current) return;
    // Hover: lift segment (local Z = world Y after group tilt) + slight scale
    const targetPosZ = hovered ? 0.22 : 0;
    const targetScaleXY = hovered ? 1.03 : 1.0;
    const targetScaleZ = hovered ? 1.22 : 1.0;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetPosZ, 0.1);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScaleXY, 0.1);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleXY, 0.1);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScaleZ, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
      onPointerOut={onUnhover}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <meshPhysicalMaterial
        color={getDonutColor(category)}
        roughness={0.05}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.05}
        reflectivity={0.8}
      />
    </mesh>
  );
}

interface SceneProps {
  segments: DonutSegment[];
  hoveredCat: Category | null;
  setHoveredCat: (c: Category | null) => void;
  onSegmentClick: (c: Category) => void;
}

function DonutScene({ segments, hoveredCat, setHoveredCat, onSegmentClick }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.004;
  });

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cursor = -Math.PI / 2;

  return (
    // Tilt ring to lie flat: XY plane → XZ plane, extrusion direction → world Y (up)
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
      {segments.map((seg) => {
        const span = (seg.value / total) * 2 * Math.PI;
        const start = cursor;
        const end = cursor + span;
        cursor = end;
        return (
          <SegmentMesh
            key={seg.category}
            category={seg.category}
            startAngle={start}
            endAngle={end}
            hovered={hoveredCat === seg.category}
            onHover={() => setHoveredCat(seg.category)}
            onUnhover={() => setHoveredCat(null)}
            onClick={() => onSegmentClick(seg.category)}
          />
        );
      })}
    </group>
  );
}

interface Donut3DProps {
  segments: DonutSegment[];
  total: number;
  onSegmentClick: (cat: Category) => void;
}

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function Donut3D({ segments, total, onSegmentClick }: Donut3DProps) {
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const hoveredSeg = hoveredCat ? segments.find((s) => s.category === hoveredCat) : null;

  return (
    <div className="relative w-[320px] h-[320px] mx-auto select-none">
      <Canvas
        camera={{ position: [0, 3.5, 4.5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {/* Lumière ambiante douce */}
        <ambientLight color="#ffffff" intensity={0.4} />
        {/* Lumière principale haute — crée le highlight brillant sur le dessus */}
        <directionalLight position={[3, 6, 4]} intensity={2.0} color="#ffffff" />
        {/* Lumière rosée latérale — effet "glacé sucré" */}
        <pointLight position={[-2, 3, 2]} intensity={0.8} color="#ffe4e1" />
        {/* Lumière de remplissage en dessous */}
        <pointLight position={[0, -3, 1]} intensity={0.3} color="#e8f4f8" />
        <Suspense fallback={null}>
          <DonutScene
            segments={segments}
            hoveredCat={hoveredCat}
            setHoveredCat={setHoveredCat}
            onSegmentClick={onSegmentClick}
          />
        </Suspense>
      </Canvas>

      {/* Texte central superposé */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-ink-soft text-xs leading-none mb-0.5">Total · achats</p>
        <p className="font-heading font-extrabold text-ink text-xl leading-tight">{fmtCompact(total)}</p>
      </div>

      {/* Tooltip hover */}
      {hoveredSeg && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-ink text-cream text-xs rounded-xl px-3 py-2 pointer-events-none whitespace-nowrap shadow-lg z-10">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
            style={{ background: getDonutColor(hoveredSeg.category) }}
          />
          {CATEGORY_LABELS[hoveredSeg.category]} — {fmtCompact(hoveredSeg.value)} ({Math.round(hoveredSeg.pct)}%)
        </div>
      )}
    </div>
  );
}
