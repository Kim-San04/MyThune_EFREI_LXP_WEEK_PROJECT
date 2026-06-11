"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import ThunieFox from "@/components/ThunieFox";
import {
  deriveKek,
  exportDekRaw,
  generateDek,
  generateSalt,
  unwrapDek,
  wrapDek,
} from "@/lib/crypto";
import { mergeBackup, pushBackup } from "@/lib/vault-sync";
import { saveCachedDek } from "@/lib/statements-db";
import { useVault } from "@/lib/vault-context";

interface UnlockScreenProps {
  userId: string;
  onUnlocked: () => void;
}

export default function UnlockScreen({ userId, onUnlocked }: UnlockScreenProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setDek } = useVault();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/vault");
      const vault = await res.json();
      if (!res.ok) throw new Error("vault-fetch-failed");

      let dek: CryptoKey;

      if (!vault.hasVault) {
        const salt = generateSalt();
        const kek = await deriveKek(password, salt);
        dek = await generateDek();
        const { wrappedDek, wrappedDekIv } = await wrapDek(dek, kek);

        await fetch("/api/vault", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salt, wrappedDek, wrappedDekIv }),
        });

        pushBackup(userId, dek).catch(() => {});
      } else {
        const kek = await deriveKek(password, vault.kdfSalt);
        dek = await unwrapDek({ wrappedDek: vault.wrappedDek, wrappedDekIv: vault.wrappedDekIv }, kek);

        if (vault.encryptedData && vault.dataIv) {
          await mergeBackup(userId, { data: vault.encryptedData, iv: vault.dataIv }, dek);
        } else {
          pushBackup(userId, dek).catch(() => {});
        }
      }

      await saveCachedDek(userId, await exportDekRaw(dek));
      setDek(dek);
      onUnlocked();
    } catch {
      toast.error("Mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 safe-top safe-bottom safe-x">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="glass-strong rounded-3xl p-5 sm:p-7 w-full max-w-md max-h-full overflow-y-auto my-auto"
      >
        <div className="flex items-center gap-3 mb-2">
          <ThunieFox className="w-10 h-10" />
          <h2 className="font-heading font-extrabold text-xl text-ink">Débloque tes données</h2>
        </div>
        <p className="text-sm text-ink-soft mb-6">
          Pour des raisons de sécurité, entre à nouveau ton mot de passe pour retrouver tes
          relevés sur cet appareil.
        </p>

        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" strokeWidth={2.4} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full mt-7 bg-coral text-white font-heading font-bold text-sm py-3.5 rounded-2xl shadow-warm disabled:opacity-60"
        >
          {loading ? "Un instant…" : "Débloquer"}
        </button>
      </motion.form>
    </main>
  );
}
