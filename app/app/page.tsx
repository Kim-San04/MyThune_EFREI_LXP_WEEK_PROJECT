"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import LoadingScreen from "@/components/app/LoadingScreen";
import Dashboard from "@/components/app/Dashboard";
import UnlockScreen from "@/components/app/UnlockScreen";
import { deleteStatement, getCachedDek, getStatements, saveStatement, type StoredStatement } from "@/lib/statements-db";
import { importDekRaw } from "@/lib/crypto";
import { pushBackup } from "@/lib/vault-sync";
import { useVault } from "@/lib/vault-context";
import type { Budget } from "@/lib/types";

export default function AppPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const { dek, setDek } = useVault();

  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState<StoredStatement[]>([]);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    (async () => {
      const stored = await getStatements(userId);
      setStatements(stored);
      if (stored.length > 0) {
        setActiveBudget(stored[0].budget);
      }

      if (!dek) {
        const cached = await getCachedDek(userId);
        if (cached) {
          try {
            setDek(await importDekRaw(cached));
          } catch {
            setNeedsUnlock(true);
          }
        } else {
          setNeedsUnlock(true);
        }
        setLoading(false);
        return;
      }

      if (stored.length === 0) setUploadOpen(true);
      setLoading(false);
    })();
  }, [status, userId, dek]);

  const handleUnlocked = useCallback(async () => {
    if (!userId) return;
    const stored = await getStatements(userId);
    setStatements(stored);
    if (stored.length > 0) {
      setActiveBudget(stored[0].budget);
    } else {
      setUploadOpen(true);
    }
    setNeedsUnlock(false);
  }, [userId]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!userId) return;
      setAnalyzing(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/analyze-pdf", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Impossible d'analyser ce PDF.");
        }

        const budget = data.budget as Budget;
        const existed = statements.some((s) => s.month === budget.month);
        const stored = await saveStatement(userId, budget);

        setStatements((prev) =>
          [stored, ...prev.filter((s) => s.month !== budget.month)].sort((a, b) => b.month.localeCompare(a.month))
        );
        setActiveBudget(budget);
        setUploadOpen(false);
        toast.success(
          existed
            ? "Relevé mis à jour — Thunie a tout recalculé pour toi."
            : "Ton relevé est prêt ! Thunie a tout décortiqué pour toi."
        );

        if (dek) pushBackup(userId, dek).catch(() => {});
      } catch (err) {
        const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
        toast.error(message);
      } finally {
        setAnalyzing(false);
      }
    },
    [userId, statements, dek]
  );

  const handleSelectStatement = useCallback(
    (id: string) => {
      const found = statements.find((s) => s.id === id);
      if (found) setActiveBudget(found.budget);
    },
    [statements]
  );

  const handleDeleteStatement = useCallback(
    async (id: string) => {
      if (!userId) return;
      const removed = statements.find((s) => s.id === id);
      await deleteStatement(userId, id);
      const next = statements.filter((s) => s.id !== id);
      setStatements(next);

      if (removed && activeBudget && removed.budget.month === activeBudget.month) {
        if (next.length > 0) {
          setActiveBudget(next[0].budget);
        } else {
          setActiveBudget(null);
          setUploadOpen(true);
        }
      }
      toast("Relevé supprimé");

      if (dek) pushBackup(userId, dek).catch(() => {});
    },
    [userId, statements, activeBudget, dek]
  );

  const handleUploadNew = useCallback(() => {
    setUploadOpen(true);
  }, []);

  const handleCloseUpload = useCallback(() => {
    if (statements.length > 0) setUploadOpen(false);
  }, [statements]);

  if (loading || status === "loading") return <LoadingScreen />;
  if (needsUnlock && userId) return <UnlockScreen userId={userId} onUnlocked={handleUnlocked} />;

  return (
    <Dashboard
      budget={activeBudget}
      statements={statements}
      onSelectStatement={handleSelectStatement}
      onDeleteStatement={handleDeleteStatement}
      onUploadNew={handleUploadNew}
      uploadOpen={uploadOpen}
      analyzing={analyzing}
      onCloseUpload={handleCloseUpload}
      onFileSelected={handleFile}
    />
  );
}
