"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import UploadZone from "@/components/app/UploadZone";
import LoadingScreen from "@/components/app/LoadingScreen";
import Dashboard from "@/components/app/Dashboard";
import { deleteStatement, getStatements, saveStatement, type StoredStatement } from "@/lib/statements-db";
import type { Budget } from "@/lib/types";

type AppState = "loading" | "upload" | "analyzing" | "dashboard";

export default function AppPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [state, setState] = useState<AppState>("loading");
  const [statements, setStatements] = useState<StoredStatement[]>([]);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    getStatements(userId).then((stored) => {
      setStatements(stored);
      if (stored.length > 0) {
        setActiveBudget(stored[0].budget);
        setState("dashboard");
      } else {
        setState("upload");
      }
    });
  }, [status, userId]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!userId) return;
      setState("analyzing");

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
        setState("dashboard");
        toast.success(
          existed
            ? "Relevé mis à jour — Thunie a tout recalculé pour toi."
            : "Ton relevé est prêt ! Thunie a tout décortiqué pour toi."
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
        toast.error(message);
        setState(statements.length > 0 ? "dashboard" : "upload");
      }
    },
    [userId, statements]
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
          setState("upload");
        }
      }
      toast("Relevé supprimé");
    },
    [userId, statements, activeBudget]
  );

  const handleUploadNew = useCallback(() => {
    setState("upload");
  }, []);

  const handleCancelUpload = useCallback(() => {
    setState("dashboard");
  }, []);

  if (state === "loading" || state === "analyzing" || status === "loading") return <LoadingScreen />;
  if (state === "dashboard" && activeBudget) {
    return (
      <Dashboard
        budget={activeBudget}
        statements={statements}
        onSelectStatement={handleSelectStatement}
        onDeleteStatement={handleDeleteStatement}
        onUploadNew={handleUploadNew}
      />
    );
  }
  return <UploadZone onFileSelected={handleFile} onCancel={statements.length > 0 ? handleCancelUpload : undefined} />;
}
