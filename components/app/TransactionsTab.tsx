"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Banknote, ChevronDown, ChevronRight, Search, Send } from "lucide-react";
import type { Budget, Category, Transaction } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/icons";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "date-desc", label: "Date (récent → ancien)" },
  { key: "date-asc", label: "Date (ancien → récent)" },
  { key: "amount-desc", label: "Montant (élevé → faible)" },
  { key: "amount-asc", label: "Montant (faible → élevé)" },
];

const PAGE_SIZE = 12;

// Types shown in dedicated sections (not the main list)
const SECTION_TYPES = new Set(["virement_emis", "transfert_international", "retrait"]);

function virementRecipient(tx: Transaction): string {
  if (tx.destinataire) return tx.destinataire;
  return tx.cleanLabel;
}

function virementTypeLabel(tx: Transaction): string {
  if (tx.type === "transfert_international") return "Transfert international";
  if (/wero\b/i.test(tx.rawLabel)) return "Virement Wero";
  if (/instantane|inst\b|sct\s*inst/i.test(tx.rawLabel)) return "Virement instantané";
  if (/europeen|sepa|sct\b/i.test(tx.rawLabel)) return "Virement SEPA";
  if (/logitel/i.test(tx.rawLabel)) return "Virement Logitel";
  return "Virement";
}

interface TransactionsTabProps {
  budget: Budget;
}

export default function TransactionsTab({ budget }: TransactionsTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [page, setPage] = useState(1);
  const [transfersOpen, setTransfersOpen] = useState(false);
  const [retraitsOpen, setRetraitsOpen] = useState(false);

  const virementsEmis = useMemo(
    () => budget.transactions.filter(
      (t) => t.type === "virement_emis" || t.type === "transfert_international"
    ),
    [budget]
  );
  const virementsTotal = useMemo(
    () => virementsEmis.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [virementsEmis]
  );

  const retraits = useMemo(
    () => budget.transactions.filter((t) => t.type === "retrait"),
    [budget]
  );
  const retraitsTotal = useMemo(
    () => retraits.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [retraits]
  );

  // Categories available in filter dropdown (exclude section categories)
  const categories = useMemo(() => {
    return (Object.keys(budget.byCategory) as Category[]).filter(
      (c) =>
        c !== "virements_emis" &&
        c !== "transfert_international" &&
        c !== "retrait_especes" &&
        budget.byCategory[c].transactions.length &&
        // Also exclude transactions that live in sections
        budget.byCategory[c].transactions.some((t) => !SECTION_TYPES.has(t.type))
    );
  }, [budget]);

  const filtered = useMemo(() => {
    let list = budget.transactions.filter((t) => !SECTION_TYPES.has(t.type));
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) => t.cleanLabel.toLowerCase().includes(q) || t.rawLabel.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "date-asc":    return a.date.localeCompare(b.date);
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc":  return a.amount - b.amount;
        default:            return b.date.localeCompare(a.date);
      }
    });
    return list;
  }, [budget, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetToFirstPage = () => setPage(1);

  const mainCount = budget.transactions.length - virementsEmis.length - retraits.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-5"
    >
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-ink mb-1">Transactions</h1>
        <p className="text-sm text-ink-mid">
          {mainCount} opération{mainCount > 1 ? "s" : ""}
          {virementsEmis.length > 0 && ` · ${virementsEmis.length} virement${virementsEmis.length > 1 ? "s" : ""} émis`}
          {retraits.length > 0 && ` · ${retraits.length} retrait${retraits.length > 1 ? "s" : ""} DAB`}
        </p>
      </div>

      {virementsEmis.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setTransfersOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-dark/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Send size={17} strokeWidth={2.2} className="text-indigo-500" aria-hidden="true" />
              </span>
              <div className="text-left">
                <p className="font-heading font-bold text-sm text-ink">Virements émis</p>
                <p className="text-xs text-ink-soft">
                  {virementsEmis.length} virement{virementsEmis.length > 1 ? "s" : ""} — non comptés dans les dépenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-sm text-indigo-500 tabular-nums">
                −{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(virementsTotal)}
              </span>
              {transfersOpen ? <ChevronDown size={16} className="text-ink-soft" /> : <ChevronRight size={16} className="text-ink-soft" />}
            </div>
          </button>
          {transfersOpen && (
            <ul className="divide-y divide-ink/5 border-t border-ink/5">
              {virementsEmis.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-3 bg-cream-dark/30">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink truncate">{virementRecipient(tx)}</p>
                    <p className="text-xs text-ink-soft">{virementTypeLabel(tx)} · non compté dans les achats</p>
                  </div>
                  <span className="text-xs text-ink-soft w-14 text-right shrink-0">{fmtDate(tx.date)}</span>
                  <span className="font-heading font-bold text-sm text-indigo-500 tabular-nums w-24 text-right shrink-0">
                    {fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {retraits.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setRetraitsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-dark/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                <Banknote size={17} strokeWidth={2.2} className="text-slate-400" aria-hidden="true" />
              </span>
              <div className="text-left">
                <p className="font-heading font-bold text-sm text-ink">Retraits espèces</p>
                <p className="text-xs text-ink-soft">
                  {retraits.length} retrait{retraits.length > 1 ? "s" : ""} DAB — non comptés dans les achats
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-sm text-slate-400 tabular-nums">
                −{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(retraitsTotal)}
              </span>
              {retraitsOpen ? <ChevronDown size={16} className="text-ink-soft" /> : <ChevronRight size={16} className="text-ink-soft" />}
            </div>
          </button>
          {retraitsOpen && (
            <ul className="divide-y divide-ink/5 border-t border-ink/5">
              {retraits.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-3 bg-cream-dark/30">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink">Retrait espèces</p>
                    <p className="text-xs text-ink-soft">{tx.rawLabel.replace(/RETRAIT\s+DAB\s+/i, "").slice(0, 40)}</p>
                  </div>
                  <span className="text-xs text-ink-soft w-14 text-right shrink-0">{fmtDate(tx.date)}</span>
                  <span className="font-heading font-bold text-sm text-slate-400 tabular-nums w-24 text-right shrink-0">
                    {fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" strokeWidth={2.4} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetToFirstPage(); }}
            placeholder="Rechercher un commerçant…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as Category | "all"); resetToFirstPage(); }}
          className="px-4 py-2.5 rounded-xl bg-cream-dark text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/40"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <div className="relative">
          <ArrowUpDown size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" strokeWidth={2.4} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-cream-dark text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/40 appearance-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {pageItems.length ? (
          <ul className="divide-y divide-ink/5">
            {pageItems.map((tx) => {
              const Icon = CATEGORY_ICONS[tx.category];
              return (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream-dark/60 transition-colors">
                <span
                  className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: `${CATEGORY_COLORS[tx.category]}1A` }}
                >
                  <Icon size={18} strokeWidth={2.2} style={{ color: CATEGORY_COLORS[tx.category] }} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-ink truncate">{tx.cleanLabel}</p>
                  <p className="text-xs text-ink-soft truncate">{tx.rawLabel}</p>
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-ink-mid bg-cream-dark rounded-full px-3 py-1">
                  {CATEGORY_LABELS[tx.category]}
                </span>
                <span className="text-xs text-ink-soft w-14 text-right shrink-0">{fmtDate(tx.date)}</span>
                <span
                  className={`font-heading font-bold text-sm tabular-nums w-24 text-right shrink-0 ${
                    tx.amount < 0 ? "text-ink" : "text-sage"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}{fmt(tx.amount)}
                </span>
              </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft py-12 text-center">Aucune transaction ne correspond à ta recherche.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-mid bg-cream-dark disabled:opacity-40 hover:bg-amber-light hover:text-amber transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-sm text-ink-soft px-2">Page {currentPage} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-mid bg-cream-dark disabled:opacity-40 hover:bg-amber-light hover:text-amber transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </motion.div>
  );
}
