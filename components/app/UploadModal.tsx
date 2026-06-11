"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import UploadPanel from "@/components/app/UploadPanel";
import AnalyzingPanel from "@/components/app/AnalyzingPanel";

interface UploadModalProps {
  open: boolean;
  analyzing: boolean;
  onClose?: () => void;
  onFileSelected: (file: File) => void;
}

export default function UploadModal({ open, analyzing, onClose, onFileSelected }: UploadModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto"
          onClick={() => !analyzing && onClose?.()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl px-5 py-6 sm:px-10 sm:py-10 w-full max-w-xl max-h-full overflow-y-auto my-auto relative"
          >
            {onClose && !analyzing && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors"
                aria-label="Fermer"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            )}

            {analyzing ? (
              <AnalyzingPanel />
            ) : (
              <>
                <h2 className="font-heading font-extrabold text-xl text-ink mb-5">Importer un relevé</h2>
                <UploadPanel onFileSelected={onFileSelected} compact />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
