"use client";

import { motion } from "framer-motion";
import ThunieFox from "@/components/ThunieFox";
import ThreeDScene from "@/components/ThreeDScene";

interface ThunieCoinLoaderProps {
  className?: string;
  foxClassName?: string;
}

export default function ThunieCoinLoader({
  className = "max-w-md h-[50vh] min-h-[300px]",
  foxClassName = "w-44 h-44 sm:w-60 sm:h-60",
}: ThunieCoinLoaderProps) {
  return (
    <div className={`relative w-full mx-auto ${className}`} aria-hidden="true">
      <ThreeDScene spread={1} />
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <ThunieFox className={foxClassName} />
      </motion.div>
    </div>
  );
}
