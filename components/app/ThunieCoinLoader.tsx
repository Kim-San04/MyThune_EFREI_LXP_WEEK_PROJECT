"use client";

import { motion } from "framer-motion";
import ThunieFox from "@/components/ThunieFox";

function Coin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
      <circle cx="20" cy="20" r="12" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.5" />
      <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill="#F59E0B" fontFamily="var(--font-jakarta), sans-serif">
        €
      </text>
    </svg>
  );
}

const COINS = [
  { left: "6%", size: 26, delay: 0, duration: 1.7 },
  { left: "28%", size: 20, delay: 0.5, duration: 1.9 },
  { left: "50%", size: 24, delay: 1, duration: 1.6 },
  { left: "70%", size: 18, delay: 0.25, duration: 2 },
  { left: "88%", size: 22, delay: 0.75, duration: 1.8 },
];

export default function ThunieCoinLoader() {
  return (
    <div className="relative w-full max-w-[260px] h-60 mx-auto" aria-hidden="true">
      {COINS.map((coin, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{ left: coin.left, width: coin.size, height: coin.size }}
          animate={{ y: [-10, 130], opacity: [0, 1, 1, 0], rotate: [0, 200, 380] }}
          transition={{
            duration: coin.duration,
            repeat: Infinity,
            delay: coin.delay,
            ease: "easeIn",
            times: [0, 0.6, 1],
          }}
        >
          <Coin className="w-full h-full drop-shadow-sm" />
        </motion.div>
      ))}

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -6, 6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 w-24 h-24 rounded-3xl bg-amber-light flex items-center justify-center shadow-warm"
      >
        <ThunieFox className="w-16 h-16" />
      </motion.div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex -space-x-3">
        <Coin className="w-9 h-9" />
        <Coin className="w-9 h-9" />
        <Coin className="w-9 h-9" />
      </div>
    </div>
  );
}
