"use client";

import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { FileText, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Budget } from "@/lib/types";
import type { StoredStatement } from "@/lib/statements-db";
import { fmtCurrency, formatMonth } from "@/lib/format";
import ThunieFox from "@/components/ThunieFox";

interface ProfileTabProps {
  statements: StoredStatement[];
  activeBudget: Budget;
  onSelectStatement: (id: string) => void;
  onDeleteStatement: (id: string) => void;
  onUploadNew: () => void;
}

export default function ProfileTab({ statements, activeBudget, onSelectStatement, onDeleteStatement, onUploadNew }: ProfileTabProps) {
  const { data: session } = useSession();

  function handleDelete(statement: StoredStatement) {
    if (statements.length === 1) {
      toast.error("Tu dois garder au moins un relevé — importe-en un nouveau avant de supprimer celui-ci.");
      return;
    }
    onDeleteStatement(statement.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-ink mb-1">Profil</h1>
        <p className="text-sm text-ink-mid">Tes informations de compte et l'historique de tes relevés.</p>
      </div>

      <div className="glass rounded-2xl px-6 py-5 flex items-center gap-4">
        <ThunieFox className="w-14 h-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-ink truncate">{session?.user?.name ?? "Utilisateur"}</p>
          <p className="text-sm text-ink-soft truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="shrink-0 flex items-center gap-2 text-sm font-semibold text-ink-mid hover:text-coral bg-cream-dark hover:bg-coral-light rounded-xl px-4 py-2.5 transition-colors"
        >
          <LogOut size={16} strokeWidth={2.2} />
          Se déconnecter
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-lg text-ink">Tes relevés ({statements.length})</h2>
        <button
          onClick={onUploadNew}
          className="btn shrink-0 flex items-center gap-2 bg-coral text-white font-heading font-bold text-sm px-5 py-3 rounded-2xl shadow-warm"
        >
          <Plus size={17} strokeWidth={2.6} />
          Importer un relevé
        </button>
      </div>

      <div className="space-y-3">
        {statements.map((statement) => {
          const isActive = statement.budget.month === activeBudget.month;
          return (
            <div
              key={statement.id}
              className={`glass rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors ${
                isActive ? "ring-2 ring-coral" : ""
              }`}
            >
              <span className="w-11 h-11 shrink-0 rounded-2xl bg-coral-light flex items-center justify-center">
                <FileText size={20} strokeWidth={2.2} className="text-coral" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-ink truncate">
                  {formatMonth(statement.month)}
                  {isActive && <span className="ml-2 text-xs font-semibold text-coral">· Affiché</span>}
                </p>
                <p className="text-xs text-ink-soft">
                  Importé le {new Date(statement.uploadedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end text-sm shrink-0">
                <span className="font-semibold text-sage">+{fmtCurrency(statement.budget.totalIncome)}</span>
                <span className="font-semibold text-coral">-{fmtCurrency(statement.budget.totalExpenses)}</span>
              </div>
              {!isActive && (
                <button
                  onClick={() => onSelectStatement(statement.id)}
                  className="shrink-0 text-sm font-semibold text-ink-mid hover:text-coral bg-cream-dark hover:bg-coral-light rounded-xl px-4 py-2.5 transition-colors"
                >
                  Voir
                </button>
              )}
              <button
                onClick={() => handleDelete(statement)}
                className="shrink-0 text-ink-soft hover:text-coral transition-colors p-1"
                aria-label="Supprimer ce relevé"
              >
                <Trash2 size={17} strokeWidth={2.2} />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
