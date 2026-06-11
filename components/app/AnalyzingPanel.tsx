"use client";

import { motion } from "framer-motion";
import ThunieCoinLoader from "@/components/app/ThunieCoinLoader";

export default function AnalyzingPanel() {
  return (
    <div className="text-center max-w-sm mx-auto">
      <ThunieCoinLoader
        className="max-w-xs h-[26vh] min-h-[160px] max-h-[240px] mb-2"
        foxClassName="w-24 h-24 sm:w-28 sm:h-28"
      />
      <h2 className="font-heading font-extrabold text-2xl text-ink mb-8">
        Thunie analyse ton relevé
      </h2>
      <div className="h-1.5 w-full rounded-full bg-cream-dark overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber to-coral"
          initial={{ width: "5%" }}
          animate={{ width: "85%" }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
