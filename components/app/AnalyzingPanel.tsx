"use client";

import { motion } from "framer-motion";
import ThunieFox from "@/components/ThunieFox";

export default function AnalyzingPanel() {
  return (
    <div className="text-center py-10 max-w-sm mx-auto">
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0], y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 mx-auto mb-7 rounded-3xl bg-amber-light flex items-center justify-center"
        aria-hidden="true"
      >
        <ThunieFox className="w-14 h-14" />
      </motion.div>
      <h2 className="font-heading font-extrabold text-2xl text-ink mb-2">
        Thunie analyse ton relevé
      </h2>
      <p className="text-sm text-ink-soft mb-8">
        L&apos;IA lit, trie et catégorise chaque ligne — ça prend quelques secondes.
      </p>
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
