"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSession, signIn } from "next-auth/react";
import { Lock, Mail, User, X } from "lucide-react";
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

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: Mode;
}

export default function AuthModal({ open, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setDek } = useVault();

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (mode === "register") {
      if (!name.trim() || !email.trim() || password.length < 8) {
        toast.error("Vérifie ton nom, ton email et ton mot de passe (8 caractères minimum).");
        return;
      }
    } else if (!email.trim() || !password) {
      toast.error("Renseigne ton email et ton mot de passe.");
      return;
    }

    setLoading(true);

    try {
      let registerDek: CryptoKey | null = null;

      if (mode === "register") {
        const salt = generateSalt();
        const kek = await deriveKek(password, salt);
        const dek = await generateDek();
        const { wrappedDek, wrappedDekIv } = await wrapDek(dek, kek);

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            vault: { salt, wrappedDek, wrappedDekIv },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error ?? "Impossible de créer ton compte.");
          setLoading(false);
          return;
        }
        registerDek = dek;
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }

      if (registerDek) {
        const session = await getSession();
        const uid = session?.user?.id;
        if (uid) saveCachedDek(uid, await exportDekRaw(registerDek)).catch(() => {});
        setDek(registerDek);
      } else {
        await unlockVault(password);
      }

      reset();
      onSuccess();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  }

  async function unlockVault(currentPassword: string) {
    try {
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const res = await fetch("/api/vault");
      const vault = await res.json();
      if (!res.ok) return;

      if (!vault.hasVault) {
        const salt = generateSalt();
        const kek = await deriveKek(currentPassword, salt);
        const dek = await generateDek();
        const { wrappedDek, wrappedDekIv } = await wrapDek(dek, kek);

        await fetch("/api/vault", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salt, wrappedDek, wrappedDekIv }),
        });

        await saveCachedDek(userId, await exportDekRaw(dek));
        setDek(dek);
        pushBackup(userId, dek).catch(() => {});
        return;
      }

      const kek = await deriveKek(currentPassword, vault.kdfSalt);
      const dek = await unwrapDek({ wrappedDek: vault.wrappedDek, wrappedDekIv: vault.wrappedDekIv }, kek);

      if (vault.encryptedData && vault.dataIv) {
        await mergeBackup(userId, { data: vault.encryptedData, iv: vault.dataIv }, dek);
      } else {
        pushBackup(userId, dek).catch(() => {});
      }

      await saveCachedDek(userId, await exportDekRaw(dek));
      setDek(dek);
    } catch {
      // Sync silencieuse — l'utilisateur reste connecté même si la sauvegarde échoue.
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto"
          onClick={handleClose}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="glass-strong rounded-3xl p-5 sm:p-7 w-full max-w-md max-h-full overflow-y-auto my-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <ThunieFox className="w-10 h-10" />
                <h2 className="font-heading font-extrabold text-xl text-ink">
                  {mode === "login" ? "Content de te revoir" : "Rejoindre MyThune"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-ink-soft hover:text-ink transition-colors"
                aria-label="Fermer"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              {mode === "login"
                ? "Connecte-toi pour retrouver ton tableau de bord."
                : "Crée ton compte pour accéder à ton tableau de bord."}
            </p>

            <div className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" strokeWidth={2.4} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ton prénom"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" strokeWidth={2.4} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" strokeWidth={2.4} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full mt-7 bg-coral text-white font-heading font-bold text-sm py-3.5 rounded-2xl shadow-warm disabled:opacity-60"
            >
              {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>

            <p className="text-center text-sm text-ink-soft mt-5">
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-semibold text-coral hover:underline"
              >
                {mode === "login" ? "Crée-en un" : "Connecte-toi"}
              </button>
            </p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
