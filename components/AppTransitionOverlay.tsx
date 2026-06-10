"use client";

import { AnimatePresence, motion } from "framer-motion";
import ThunieFox from "@/components/ThunieFox";

export default function AppTransitionOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-cream flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <ThunieFox className="w-20 h-20 animate-float" />
            <p className="font-heading font-bold text-ink">Ouverture de ton tableau de bord…</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
