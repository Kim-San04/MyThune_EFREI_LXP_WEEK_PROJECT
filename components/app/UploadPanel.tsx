"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface UploadPanelProps {
  onFileSelected: (file: File) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

const REASSURANCES = [
  { icon: ShieldCheck, text: "Aucune connexion bancaire — ton PDF reste local à l'analyse" },
  { icon: Sparkles, text: "Catégorisation automatique par IA en quelques secondes" },
  { icon: FileText, text: "Compatible avec la plupart des relevés bancaires français" },
];

export default function UploadPanel({
  onFileSelected,
  title = "Dépose ton relevé, Thunie s'occupe du reste",
  subtitle = "Glisse ton relevé bancaire au format PDF ci-dessous. En quelques secondes, Thunie le lit, le trie par catégorie et te prépare ton tableau de bord.",
  compact = false,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Ce fichier dépasse 15 Mo — essaie un relevé plus court.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      {!compact && (
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-amber-light text-amber font-semibold text-sm px-4 py-2 rounded-full mb-5">
            <Sparkles size={16} strokeWidth={2.4} />
            Étape 1 sur 1 — c&apos;est tout ce qu&apos;il faut
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink mb-3">{title}</h1>
          <p className="font-body text-ink-mid max-w-md mx-auto leading-relaxed">{subtitle}</p>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`glass-strong rounded-3xl px-8 py-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragging
            ? "border-amber bg-amber-light/40 scale-[1.02]"
            : "border-amber/30 hover:border-amber/60 hover:scale-[1.01]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-coral-light flex items-center justify-center">
          <UploadCloud size={30} className="text-coral" strokeWidth={2} />
        </div>

        <p className="font-heading font-bold text-lg text-ink mb-1">
          {isDragging ? "Lâche-le ici !" : "Glisse ton PDF ici, ou clique pour parcourir"}
        </p>
        <p className="text-sm text-ink-soft">Format PDF uniquement · 15 Mo max</p>
      </div>

      {!compact && (
        <ul className="mt-9 space-y-3">
          {REASSURANCES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-ink-mid">
              <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-sage-light flex items-center justify-center">
                <Icon size={14} className="text-sage" strokeWidth={2.4} />
              </span>
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
