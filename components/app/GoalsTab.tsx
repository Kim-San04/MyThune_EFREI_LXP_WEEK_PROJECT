"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Target, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Budget, SavingsGoal } from "@/lib/types";
import { DEFAULT_GOAL_ICON_KEY, GOAL_ICON_OPTIONS, GOAL_ICONS } from "@/lib/icons";

const STORAGE_KEY = "mythune_savings_goals";
const COLOR_OPTIONS = [
  { label: "Ambre", value: "#F59E0B" },
  { label: "Corail", value: "#F97316" },
  { label: "Sauge", value: "#10B981" },
  { label: "Violet", value: "#8B5CF6" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function loadGoals(): SavingsGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavingsGoal[]) : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: SavingsGoal[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

interface GoalsTabProps {
  budget: Budget;
}

export default function GoalsTab({ budget }: GoalsTabProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setGoals(loadGoals());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGoals(goals);
  }, [goals, hydrated]);

  function handleCreate(goal: SavingsGoal) {
    setGoals((prev) => [...prev, goal]);
    setShowModal(false);
    toast.success(`Objectif "${goal.label}" ajouté — Thunie veille au grain.`);
  }

  function handleDelete(id: string) {
    const goal = goals.find((g) => g.id === id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (goal) toast(`Objectif "${goal.label}" supprimé`);
  }

  function handleContribute(id: string, amount: number) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g))
    );
  }

  const suggestedSaving = Math.max(0, Math.round(budget.remaining * 0.2));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink mb-1">Objectifs d'épargne</h1>
          <p className="text-sm text-ink-mid">
            {suggestedSaving > 0
              ? `Thunie suggère de mettre ${fmt(suggestedSaving)} de côté ce mois-ci (20% de ton reste à vivre).`
              : "Définis un objectif et suis ta progression au fil des mois."}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn shrink-0 flex items-center gap-2 bg-coral text-white font-heading font-bold text-sm px-5 py-3 rounded-2xl shadow-warm"
        >
          <Plus size={17} strokeWidth={2.6} />
          Nouvel objectif
        </button>
      </div>

      {goals.length ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const GoalIcon = GOAL_ICONS[goal.icon] ?? GOAL_ICONS[DEFAULT_GOAL_ICON_KEY];
            return (
              <div key={goal.id} className="glass rounded-2xl px-6 py-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: `${goal.color}22` }}
                    >
                      <GoalIcon size={22} strokeWidth={2.2} style={{ color: goal.color }} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-heading font-bold text-ink">{goal.label}</p>
                      <p className="text-xs text-ink-soft">
                        Échéance {new Date(goal.targetDate).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-ink-soft hover:text-coral transition-colors p-1"
                    aria-label="Supprimer cet objectif"
                  >
                    <Trash2 size={16} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="h-2.5 rounded-full bg-cream-dark overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-semibold text-ink tabular-nums">{fmt(goal.currentAmount)}</span>
                  <span className="text-ink-soft">{progress}% de {fmt(goal.targetAmount)}</span>
                </div>

                <div className="flex gap-2">
                  {[20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleContribute(goal.id, amount)}
                      className="flex-1 text-xs font-semibold text-ink-mid bg-cream-dark hover:bg-amber-light hover:text-amber rounded-xl py-2 transition-colors"
                    >
                      +{amount}€
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <Target size={40} strokeWidth={1.8} className="mx-auto mb-4 text-amber" aria-hidden="true" />
          <p className="font-heading font-bold text-ink mb-1">Aucun objectif pour l'instant</p>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            Crée ton premier objectif d'épargne — voyage, fonds d'urgence, nouvel ordi —
            et suis ta progression mois après mois.
          </p>
        </div>
      )}

      <AnimatePresence>
        {showModal && <GoalModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
      </AnimatePresence>
    </motion.div>
  );
}

function GoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (goal: SavingsGoal) => void }) {
  const [label, setLabel] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState(DEFAULT_GOAL_ICON_KEY);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(targetAmount.replace(",", "."));
    if (!label.trim() || !amount || amount <= 0 || !targetDate) {
      toast.error("Remplis le nom, le montant et la date pour créer ton objectif.");
      return;
    }

    onCreate({
      id: `goal-${Date.now()}`,
      label: label.trim(),
      targetAmount: amount,
      currentAmount: 0,
      targetDate: `${targetDate}-01`,
      icon,
      color,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="glass-strong rounded-3xl p-7 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-extrabold text-xl text-ink">Nouvel objectif</h2>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink transition-colors" aria-label="Fermer">
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-mid mb-1.5">Nom de l'objectif</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex : Voyage à Lisbonne"
              className="w-full px-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-mid mb-1.5">Montant cible</label>
              <input
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="800"
                inputMode="decimal"
                className="w-full px-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-mid mb-1.5">Échéance</label>
              <input
                type="month"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-mid mb-1.5">Icône</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICON_OPTIONS.map(({ key, icon: OptionIcon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    icon === key ? "bg-amber-light ring-2 ring-amber" : "bg-cream-dark hover:bg-amber-light/60"
                  }`}
                  aria-label={key}
                >
                  <OptionIcon size={18} strokeWidth={2.2} className="text-ink-mid" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-mid mb-1.5">Couleur</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c.value ? "ring-2 ring-offset-2 ring-ink/30" : ""}`}
                  style={{ background: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn w-full mt-7 bg-coral text-white font-heading font-bold text-sm py-3.5 rounded-2xl shadow-warm"
        >
          Créer l'objectif
        </button>
      </motion.form>
    </motion.div>
  );
}
