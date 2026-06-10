"use client";

/**
 * Flat-illustration fox mascot — coral, soft lines, gentle floating animation
 * (handled by the parent via the `animate-float` utility class).
 */
export default function ThunieFox({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* glow */}
      <circle cx="110" cy="118" r="92" fill="url(#foxGlow)" opacity="0.4" />

      {/* ears */}
      <path d="M62 70 L48 28 L96 58 Z" fill="#F97316" />
      <path d="M158 70 L172 28 L124 58 Z" fill="#F97316" />
      <path d="M67 64 L58 38 L88 56 Z" fill="#FFE3D1" />
      <path d="M153 64 L162 38 L132 56 Z" fill="#FFE3D1" />

      {/* head */}
      <ellipse cx="110" cy="116" rx="62" ry="58" fill="#FB923C" />
      {/* cheeks/snout patch */}
      <path d="M75 122 Q110 162 145 122 Q132 150 110 150 Q88 150 75 122 Z" fill="#FFF4EC" />

      {/* eyes — the right one gives a slow, charming wink */}
      <ellipse cx="89" cy="112" rx="8" ry="10" fill="#1C1917" />
      <ellipse className="fox-eye-wink" cx="131" cy="112" rx="8" ry="10" fill="#1C1917" />
      <circle cx="92" cy="108.5" r="2.6" fill="#FFFFFF" />
      <circle className="fox-eye-wink" cx="134" cy="108.5" r="2.6" fill="#FFFFFF" />

      {/* blush */}
      <ellipse cx="76" cy="128" rx="9" ry="6" fill="#F97316" opacity="0.35" />
      <ellipse cx="144" cy="128" rx="9" ry="6" fill="#F97316" opacity="0.35" />

      {/* nose + smile */}
      <ellipse cx="110" cy="132" rx="6" ry="4.5" fill="#1C1917" />
      <path d="M110 136 Q110 144 100 146" stroke="#1C1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M110 136 Q110 144 120 146" stroke="#1C1917" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* sparkles */}
      <g className="origin-center">
        <Sparkle x={48} y={56} size={10} delay="0s" />
        <Sparkle x={176} y={92} size={7} delay="0.6s" />
        <Sparkle x={42} y={150} size={8} delay="1.1s" />
      </g>

      <defs>
        <radialGradient id="foxGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: string }) {
  return (
    <g style={{ transformOrigin: `${x}px ${y}px`, animation: `sparkle 2.4s ease-in-out infinite`, animationDelay: delay }}>
      <path
        d={`M${x} ${y - size} L${x + size * 0.28} ${y - size * 0.28} L${x + size} ${y} L${x + size * 0.28} ${y + size * 0.28} L${x} ${y + size} L${x - size * 0.28} ${y + size * 0.28} L${x - size} ${y} L${x - size * 0.28} ${y - size * 0.28} Z`}
        fill="#FBBF24"
      />
    </g>
  );
}
