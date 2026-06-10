"use client";

import { motion } from "framer-motion";
import ThunieFox from "@/components/ThunieFox";

export default function LoadingScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0], y: [0, -6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto mb-7 rounded-3xl bg-amber-light flex items-center justify-center"
          aria-hidden="true"
        >
          <ThunieFox className="w-14 h-14" />
        </motion.div>

        <h1 className="font-heading font-extrabold text-2xl text-ink mb-2">
          Thunie analyse ton relevé
        </h1>
        <p className="text-sm text-ink-soft mb-8">
          L&apos;IA lit, trie et catégorise chaque ligne — ça prend quelques secondes.
        </p>

        <div className="glass rounded-2xl px-5 py-4 text-left mb-6">
          <p className="font-heading font-bold text-sm text-ink mb-1">En cours…</p>
          <p className="text-xs text-ink-soft">Lecture + catégorisation intelligente par IA</p>
        </div>

        <div className="h-1.5 w-full rounded-full bg-cream-dark overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber to-coral"
            initial={{ width: "5%" }}
            animate={{ width: "85%" }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
        </div>
      </div>
    </main>
  );
}
