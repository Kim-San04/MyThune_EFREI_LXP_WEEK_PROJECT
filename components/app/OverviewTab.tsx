"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Info, Landmark, Trophy, Wallet, X } from "lucide-react";
import type { Budget, Category, Transaction } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/icons";
import ThunieFox from "@/components/ThunieFox";
import DonutChart, { type DonutSegment } from "./DonutChart";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const CHART_EXCLUDED = new Set<Category>([
  "revenus", "virements_emis", "transfert_international", "retrait_especes", "remboursement",
]);
const REAL_EXCLUDED = new Set<Category>([
  "revenus", "virements_emis", "transfert_international", "retrait_especes", "remboursement", "frais_bancaires",
]);

// ── Sub-group definitions ─────────────────────────────────────────────────────

type SubgroupDef = { id: string; label: string; patterns: RegExp[] };
const SUBGROUP_DEFS: Partial<Record<Category, SubgroupDef[]>> = {
  alimentation: [
    { id: "supermarches", label: "Supermarchés", patterns: [/lidl|aldi|carrefour|leclerc|intermarche|casino|monoprix|auchan|franprix|spar|super\s?u|biocoop|naturalia|grand\s?frais/i] },
    { id: "boulangerie", label: "Boulangerie & Pâtisserie", patterns: [/boulang|patiss/i] },
    { id: "snack", label: "Snack & Fast food", patterns: [/mcdo|burger|kfc|subway|pizza|domino|kebab|snack|sandwi/i] },
    { id: "resto", label: "Restaurants & Cafés", patterns: [/restaurant|bistro|brasserie|caf[eé]\b|bar\b/i] },
  ],
  transports: [
    { id: "vtc", label: "VTC & Covoiturage", patterns: [/uber|bolt\b|blablacar|heetch|kapten/i] },
    { id: "commun", label: "Transports en commun", patterns: [/ratp|navigo|sncf|transilien|oura|tisseo|tcl\b|tbc\b/i] },
    { id: "carburant", label: "Carburant", patterns: [/total\s?energ|bp\b|shell|esso|sp95|gazole|carburant|station/i] },
    { id: "parking", label: "Parking", patterns: [/parking|vinci|indigo|saemes|effia/i] },
  ],
  abonnements: [
    { id: "video", label: "Streaming vidéo", patterns: [/netflix|canal\b|disney|prime\s?video|hbo|apple\s?tv|molotov|mycanal/i] },
    { id: "musique", label: "Musique", patterns: [/spotify|deezer|apple\s?music|tidal|qobuz/i] },
    { id: "gaming", label: "Gaming", patterns: [/xbox|playstation|steam|nintendo|epic|twitch/i] },
    { id: "logiciels", label: "Services & Logiciels", patterns: [/adobe|microsoft\s?365|google\s?one|icloud|dropbox|notion|canva|1password/i] },
  ],
  achats_divers: [
    { id: "generaliste", label: "Généraliste", patterns: [/gifi|action\b|normal\b|hema\b|daiso/i] },
    { id: "hightech", label: "High-tech & Multimédia", patterns: [/boulanger|fnac|apple\s?store|darty|cdiscount|ldlc/i] },
    { id: "sport", label: "Sport", patterns: [/decathlon|go\s?sport|intersport|sport\s?2000/i] },
    { id: "mode", label: "Mode & Habillement", patterns: [/zara|h&m|shein|vinted|primark|uniqlo|mango|kiabi|celio/i] },
  ],
  sorties_loisirs: [
    { id: "culture", label: "Culture", patterns: [/cinema|cine\b|theatre|musee|concert|ugc|mk2|path[eé]/i] },
    { id: "wellness", label: "Sport & Bien-être", patterns: [/salle\s?sport|gym\b|yoga|pilates|fitness|piscine|basic\s?fit|neoness/i] },
  ],
};

// ── Chip sets ─────────────────────────────────────────────────────────────────

const CHIP_SETS: { pattern: RegExp; chips: string[] }[] = [
  {
    pattern: /lidl|aldi|carrefour|leclerc|intermarche|casino|monoprix|auchan|franprix|biocoop|super\s?u|grand\s?frais/i,
    chips: ["Alimentation", "Hygiène", "Maison", "Vêtements", "Électronique", "Animaux", "Loisirs", "Pharmacie"],
  },
  {
    pattern: /gifi|action\b|normal\b|hema\b|daiso/i,
    chips: ["Déco & maison", "Cadeaux", "Jouets", "Fournitures", "Jardin", "Loisirs créatifs"],
  },
  {
    pattern: /boulanger|fnac|apple\s?store|darty|cdiscount|ldlc/i,
    chips: ["Ordinateur", "Téléphone", "Audio", "Photo/vidéo", "Gaming", "TV & écrans"],
  },
  {
    pattern: /decathlon|go\s?sport|intersport|sport\s?2000/i,
    chips: ["Équipement sport", "Fitness", "Sport collectif", "Vélo", "Natation", "Yoga & bien-être"],
  },
];

const DEFAULT_ACHAT_CHIPS = [
  "Nourriture", "Vêtements", "Maison", "Santé", "Loisirs", "High-tech", "Cadeau",
];

function getChipsForMerchant(label: string, category: Category): string[] | null {
  for (const cs of CHIP_SETS) {
    if (cs.pattern.test(label)) return cs.chips;
  }
  if (category === "achats_divers") return DEFAULT_ACHAT_CHIPS;
  return null;
}

function getSubgroups(cat: Category, txs: Transaction[]): { id: string; label: string; txs: Transaction[] }[] {
  const defs = SUBGROUP_DEFS[cat];
  if (!defs) return [{ id: "all", label: "Toutes les opérations", txs }];
  const used = new Set<string>();
  const groups: { id: string; label: string; txs: Transaction[] }[] = [];
  for (const def of defs) {
    const matching = txs.filter(tx => {
      if (used.has(tx.id)) return false;
      return def.patterns.some(p => p.test(`${tx.cleanLabel} ${tx.rawLabel}`));
    });
    if (matching.length) {
      matching.forEach(tx => used.add(tx.id));
      groups.push({ id: def.id, label: def.label, txs: matching });
    }
  }
  const rest = txs.filter(tx => !used.has(tx.id));
  if (rest.length) groups.push({ id: "autres", label: "Autres", txs: rest });
  return groups.length ? groups : [{ id: "all", label: "Toutes les opérations", txs }];
}

function normalizeMerchant(s: string) { return s.toLowerCase().trim(); }

function topMerchantsSubtitle(txs: Transaction[], max = 3): string {
  const freq = new Map<string, { count: number; display: string }>();
  for (const tx of txs) {
    const key = normalizeMerchant(tx.cleanLabel);
    if (!freq.has(key)) freq.set(key, { count: 0, display: tx.cleanLabel });
    freq.get(key)!.count++;
  }
  const sorted = Array.from(freq.values()).sort((a, b) => b.count - a.count).map(v => v.display);
  return sorted.slice(0, max).join(", ") + (sorted.length > max ? "…" : "");
}

function topMerchant(txs: Transaction[]): string {
  const freq = new Map<string, { count: number; display: string }>();
  for (const tx of txs) {
    const key = normalizeMerchant(tx.cleanLabel);
    if (!freq.has(key)) freq.set(key, { count: 0, display: tx.cleanLabel });
    freq.get(key)!.count++;
  }
  if (!freq.size) return "—";
  return Array.from(freq.values()).sort((a, b) => b.count - a.count)[0].display;
}

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function buildTip(
  budget: Budget,
  topEntries: [Category, Budget["byCategory"][Category]][],
  realTotal: number
): string {
  const abosTotal = budget.byCategory["abonnements"]?.total ?? 0;
  const alimentTotal = budget.byCategory["alimentation"]?.total ?? 0;
  if (realTotal > 0 && abosTotal / realTotal > 0.15) {
    const pct = Math.round((abosTotal / realTotal) * 100);
    return `Tes abonnements représentent ${pct}% de tes dépenses (${fmt(abosTotal)}/mois = ${fmt(abosTotal * 12)}/an). As-tu vraiment utilisé tous tes services ce mois-ci ?`;
  }
  if (realTotal > 0 && alimentTotal / realTotal > 0.3) {
    const pct = Math.round((alimentTotal / realTotal) * 100);
    return `${pct}% de tes achats en alimentation (${fmt(alimentTotal)} ce mois). Cuisiner en batch le dimanche peut réduire la note.`;
  }
  const top = topEntries[0];
  if (top && realTotal > 0) {
    const pct = Math.round((top[1].total / realTotal) * 100);
    const advice: Partial<Record<Category, string>> = {
      alimentation: "Cuisiner en batch le dimanche peut réduire la facture globale.",
      transports: "Vérifie si un abonnement mensuel revient moins cher que les titres à l'unité.",
      achats_divers: "La règle des 48h : attends avant tout achat non planifié.",
      sorties_loisirs: "Bonne nouvelle, profiter de la vie c'est important — garde juste un œil sur le total.",
      abonnements: "Vérifie si tu utilises vraiment tous tes abonnements actifs.",
      electricite_telecom: "Pense à comparer les offres énergie/télécom annuellement.",
    };
    return `${CATEGORY_LABELS[top[0]]} est ton poste n°1 ce mois (${pct}%, ${fmt(top[1].total)}). ${advice[top[0]] ?? "Regarde si c'est récurrent ou exceptionnel."}`;
  }
  return "Plutôt calme ce mois-ci ! Continue comme ça, tu gardes de la marge.";
}

// ── Level 3 Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  category: Category;
  subgroupLabel: string;
  txs: Transaction[];
  onClose: () => void;
  chips: Record<string, string[]>;
  notes: Record<string, string>;
  toggleChip: (txId: string, chip: string) => void;
  setNote: (txId: string, text: string) => void;
}

function CategoryDrawer({ category, subgroupLabel, txs, onClose, chips, notes, toggleChip, setNote }: DrawerProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, { display: string; txs: Transaction[] }>();
    for (const tx of txs) {
      const key = normalizeMerchant(tx.cleanLabel);
      if (!map.has(key)) map.set(key, { display: tx.cleanLabel, txs: [] });
      map.get(key)!.txs.push(tx);
    }
    return Array.from(map.values()).sort((a, b) => {
      return b.txs.reduce((s, t) => s + Math.abs(t.amount), 0) - a.txs.reduce((s, t) => s + Math.abs(t.amount), 0);
    });
  }, [txs]);

  const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDE8E0]">
          <div>
            <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">{CATEGORY_LABELS[category]}</p>
            <h3 className="font-heading font-bold text-lg text-ink mt-0.5">{subgroupLabel}</h3>
            <p className="text-sm text-ink-mid">{txs.length} transaction{txs.length > 1 ? "s" : ""} · {fmt(total)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-ink-mid hover:text-ink transition-colors"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {grouped.map(({ display: merchant, txs: merchantTxs }) => {
            const merchantTotal = merchantTxs.reduce((s, t) => s + Math.abs(t.amount), 0);
            const chipSet = category !== "autre" ? getChipsForMerchant(merchant, category) : null;
            const showNote = category === "autre";
            const repId = merchantTxs[0].id;
            return (
              <div key={normalizeMerchant(merchant)} className="bg-white border border-[#EDE8E0] rounded-2xl px-5 py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[15px] text-ink">{merchant}</p>
                    <p className="text-[12px] text-ink-soft mt-0.5">{merchantTxs.length}× · {merchantTxs.map(t => fmtDate(t.date)).join(", ")}</p>
                  </div>
                  <span className="font-bold text-[15px] text-coral tabular-nums shrink-0">−{fmt(merchantTotal)}</span>
                </div>
                {chipSet && (
                  <div className="flex flex-wrap gap-2">
                    {chipSet.map(chip => {
                      const selected = (chips[repId] ?? []).includes(chip);
                      return (
                        <button
                          key={chip}
                          onClick={() => toggleChip(repId, chip)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                            selected
                              ? "bg-coral-light text-coral shadow-sm scale-[1.02]"
                              : "bg-[#F5F0E8] text-ink-mid hover:bg-coral-light/60 hover:text-coral"
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                )}
                {showNote && (
                  <input
                    type="text"
                    maxLength={40}
                    value={notes[repId] ?? ""}
                    onChange={e => setNote(repId, e.target.value)}
                    placeholder="Note… (40 car. max)"
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F0E8] text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface OverviewTabProps {
  budget: Budget;
  onNavigate: (tab: "overview" | "transactions" | "chat" | "goals") => void;
}

export default function OverviewTab({ budget, onNavigate }: OverviewTabProps) {
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [drawer, setDrawer] = useState<{ category: Category; subgroupLabel: string; txs: Transaction[] } | null>(null);
  const [chips, setChips] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const c: Record<string, string[]> = {};
    const n: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith("mythune_chips_")) {
          try { c[key.slice(14)] = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch {}
        } else if (key.startsWith("mythune_note_")) {
          n[key.slice(13)] = localStorage.getItem(key) ?? "";
        }
      }
    } catch {}
    setChips(c);
    setNotes(n);
  }, []);

  function toggleChip(txId: string, chip: string) {
    setChips(prev => {
      const current = prev[txId] ?? [];
      const updated = current.includes(chip) ? current.filter(c => c !== chip) : [...current, chip];
      try {
        if (updated.length) {
          localStorage.setItem(`mythune_chips_${txId}`, JSON.stringify(updated));
        } else {
          localStorage.removeItem(`mythune_chips_${txId}`);
        }
      } catch {}
      return { ...prev, [txId]: updated };
    });
  }

  function setNote(txId: string, text: string) {
    setNotes(prev => {
      try {
        if (text) {
          localStorage.setItem(`mythune_note_${txId}`, text);
        } else {
          localStorage.removeItem(`mythune_note_${txId}`);
        }
      } catch {}
      return { ...prev, [txId]: text };
    });
  }

  const monthLabel = useMemo(() => {
    const [year, m] = budget.month.split("-");
    const s = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [budget.month]);

  const dateRange = useMemo(() => {
    const fd = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    if (budget.periodStart && budget.periodEnd) {
      return `${fd(budget.periodStart)} – ${fd(budget.periodEnd)}`;
    }
    const dates = budget.transactions.map(t => t.date).filter(Boolean).sort();
    if (!dates.length) return "";
    return `${fd(dates[0])} – ${fd(dates[dates.length - 1])}`;
  }, [budget.periodStart, budget.periodEnd, budget.transactions]);

  const categoryEntries = useMemo(
    () =>
      (Object.entries(budget.byCategory) as [Category, Budget["byCategory"][Category]][])
        .filter(([cat, v]) => !CHART_EXCLUDED.has(cat) && v.total > 0)
        .sort((a, b) => b[1].total - a[1].total),
    [budget]
  );

  const realExpenses = useMemo(
    () =>
      Object.entries(budget.byCategory)
        .filter(([cat]) => !REAL_EXCLUDED.has(cat as Category))
        .reduce((s, [, v]) => s + v.total, 0),
    [budget]
  );

  const topEntries = useMemo(
    () =>
      (Object.entries(budget.byCategory) as [Category, Budget["byCategory"][Category]][])
        .filter(([cat, v]) => !REAL_EXCLUDED.has(cat) && v.total > 0)
        .sort((a, b) => b[1].total - a[1].total),
    [budget]
  );

  const donutSegments = useMemo<DonutSegment[]>(
    () =>
      categoryEntries
        .filter(([cat, v]) => !(cat === "autre" && v.total <= 5))
        .map(([cat, v]) => ({
          category: cat,
          value: v.total,
          pct: realExpenses > 0 ? (v.total / realExpenses) * 100 : 0,
        })),
    [categoryEntries, realExpenses]
  );

  const topCat = topEntries[0] ?? null;
  const topCatLabel = topCat ? CATEGORY_LABELS[topCat[0]] : "—";
  const topCatTopMerchant = topCat ? topMerchant(topCat[1].transactions) : "—";

  const recentExpenses = useMemo(
    () =>
      [...budget.transactions]
        .filter(t => t.amount < 0 && t.type !== "virement_emis" && t.type !== "transfert_international" && t.type !== "retrait")
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [budget]
  );

  const animatedExpenses = useCountUp(realExpenses);
  const animatedTransfers = useCountUp(budget.totalTransfers);
  const animatedTopCat = useCountUp(topCat?.[1].total ?? 0);

  const tip = useMemo(() => buildTip(budget, topEntries, realExpenses), [budget, topEntries, realExpenses]);

  function handleCatClick(cat: Category) {
    setOpenCategory(prev => (prev === cat ? null : cat));
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-3 sm:space-y-6"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 pb-1 sm:pb-2">
          <div>
            <h1 className="font-heading font-bold text-[24px] sm:text-[32px] text-ink leading-tight mb-1">{monthLabel}</h1>
            {dateRange && (
              <p className="text-[13px] sm:text-[15px] text-ink-soft">Relevé · {dateRange}</p>
            )}
          </div>
          <span className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-coral-light text-coral border border-[#FDBA74] text-[11px] sm:text-[13px] font-medium mt-1 whitespace-nowrap">
            <CheckCircle2 size={13} strokeWidth={2.4} aria-hidden="true" className="sm:hidden" />
            <CheckCircle2 size={15} strokeWidth={2.4} aria-hidden="true" className="hidden sm:block" />
            <span className="hidden sm:inline">Analysé par Thunie</span>
            <span className="sm:hidden">Thunie</span>
          </span>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {/* Card 1 — Dépenses */}
          <div
            className="relative rounded-xl sm:rounded-2xl px-3.5 py-3.5 sm:px-6 sm:py-5"
            style={{ background: "linear-gradient(135deg, #FFE4D4 0%, #FFBFA0 100%)" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
              <Wallet
                size={64}
                strokeWidth={1.5}
                className="absolute right-2 bottom-[-10px] text-coral opacity-[0.12] select-none sm:w-[88px] sm:h-[88px]"
                aria-hidden="true"
              />
            </div>
            <p className="text-[10px] sm:text-[12px] font-semibold text-coral/60 mb-1.5 sm:mb-4">Dépenses du mois</p>
            <p className="font-heading font-bold text-[19px] sm:text-[38px] text-coral tabular-nums leading-none break-words">
              {fmt(animatedExpenses)}
            </p>
          </div>

          {/* Card 2 — Virements */}
          <div
            className="relative rounded-xl sm:rounded-2xl px-3.5 py-3.5 sm:px-6 sm:py-5"
            style={{ background: "linear-gradient(135deg, #EDE7DC 0%, #D9D2C4 100%)" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
              <Landmark
                size={64}
                strokeWidth={1.5}
                className="absolute right-2 bottom-[-10px] text-ink-mid opacity-[0.12] select-none sm:w-[88px] sm:h-[88px]"
                aria-hidden="true"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-4">
              <p className="text-[10px] sm:text-[12px] font-semibold text-ink-soft">Virements émis</p>
              <div className="relative group">
                <Info size={11} className="text-ink-soft cursor-default" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 sm:w-52 text-[11px] sm:text-xs bg-ink text-cream rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center leading-snug shadow-lg">
                  Transferts entre comptes — non comptés dans les dépenses
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
                </div>
              </div>
            </div>
            <p className="font-heading font-bold text-[19px] sm:text-[38px] text-ink-mid tabular-nums leading-none break-words">
              {fmt(animatedTransfers)}
            </p>
          </div>

          {/* Card 3 — Poste n°1 */}
          <div
            className="relative rounded-xl sm:rounded-2xl px-3.5 py-3.5 sm:px-6 sm:py-5 col-span-2 sm:col-span-1"
            style={{ background: "linear-gradient(135deg, #FEF0A0 0%, #F9C924 100%)" }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
              <Trophy
                size={64}
                strokeWidth={1.5}
                className="absolute right-2 bottom-[-10px] text-amber opacity-[0.12] select-none sm:w-[88px] sm:h-[88px]"
                aria-hidden="true"
              />
            </div>
            <p className="text-[10px] sm:text-[12px] font-semibold text-amber/70 mb-1.5 sm:mb-3">Là où tu dépenses le plus</p>
            {topCat ? (
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  {(() => {
                    const TopIcon = CATEGORY_ICONS[topCat[0]];
                    return <TopIcon size={18} strokeWidth={2.2} className="shrink-0 text-amber sm:w-[22px] sm:h-[22px]" aria-hidden="true" />;
                  })()}
                  <span className="font-heading font-bold text-[14px] sm:text-[17px] text-ink leading-tight truncate">{topCatLabel}</span>
                </div>
                <p className="font-heading font-bold text-[22px] sm:text-[28px] text-amber tabular-nums leading-tight">
                  {fmt(animatedTopCat)}
                </p>
                <p className="text-[11px] sm:text-[12px] text-amber/70 mt-1 truncate">{topCatTopMerchant}</p>
              </div>
            ) : (
              <p className="text-ink-soft text-sm">Aucune dépense</p>
            )}
          </div>
        </div>

        {/* ── Répartition ──────────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE8E0] rounded-xl sm:rounded-2xl px-4 py-4 sm:px-7 sm:py-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="font-heading font-semibold text-[15px] sm:text-[18px] text-ink mb-3 sm:mb-6">Répartition par catégorie</h2>
          {categoryEntries.length ? (
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 items-start">
              {/* Donut Chart.js */}
              <div className="shrink-0 mx-auto lg:mx-0">
                <DonutChart
                  segments={donutSegments}
                  total={realExpenses}
                  onSegmentClick={handleCatClick}
                />
              </div>

              {/* Category list */}
              <div className="flex-1 min-w-0 w-full">
                {categoryEntries.map(([cat, v]) => {
                  const isOpen = openCategory === cat;
                  const subgroups = isOpen ? getSubgroups(cat, v.transactions) : [];
                  const showSubgroupTitles = subgroups.length > 1;
                  const subtitle = topMerchantsSubtitle(v.transactions);

                  return (
                    <div key={cat} className="border-b border-[#F5F0E8] last:border-0">
                      {/* Level 1 row */}
                      <button
                        onClick={() => handleCatClick(cat)}
                        className="w-full flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-2.5 sm:py-3 rounded-lg hover:bg-[#FAF7F2] transition-colors duration-150"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: CATEGORY_COLORS[cat] }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] sm:text-[15px] font-semibold text-ink">{CATEGORY_LABELS[cat]}</p>
                          {subtitle && (
                            <p className="text-[11px] sm:text-[12px] text-ink-soft mt-0.5 truncate">{subtitle}</p>
                          )}
                        </div>
                        <span className="text-[14px] sm:text-[16px] font-bold text-ink tabular-nums min-w-[56px] sm:min-w-[64px] text-right shrink-0">
                          {fmt(v.total)}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`text-[#D4CFC8] shrink-0 ml-1 transition-transform duration-200 ${isOpen ? "rotate-90 text-coral" : ""}`}
                        />
                      </button>

                      {/* Level 2 accordion */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div
                              className="ml-5 my-2 rounded-r-lg py-3 pr-3 pl-5"
                              style={{
                                background: "#FAF7F2",
                                borderLeft: `3px solid ${CATEGORY_COLORS[cat]}`,
                              }}
                            >
                              {subgroups.map((sg, sgIdx) => {
                                const merchantMap = new Map<string, { display: string; txs: Transaction[] }>();
                                for (const tx of sg.txs) {
                                  const key = normalizeMerchant(tx.cleanLabel);
                                  if (!merchantMap.has(key)) merchantMap.set(key, { display: tx.cleanLabel, txs: [] });
                                  merchantMap.get(key)!.txs.push(tx);
                                }
                                const merchants = Array.from(merchantMap.values()).sort(
                                  (a, b) =>
                                    b.txs.reduce((s, t) => s + Math.abs(t.amount), 0) -
                                    a.txs.reduce((s, t) => s + Math.abs(t.amount), 0)
                                );

                                return (
                                  <div key={sg.id} className={sgIdx > 0 ? "mt-3" : ""}>
                                    {showSubgroupTitles && (
                                      <p className="text-[13px] font-semibold text-ink-mid mb-1">
                                        {sg.label}
                                      </p>
                                    )}
                                    {merchants.map(({ display: merchant, txs: mTxs }) => {
                                      const mTotal = mTxs.reduce((s, t) => s + Math.abs(t.amount), 0);
                                      return (
                                        <button
                                          key={normalizeMerchant(merchant)}
                                          onClick={() =>
                                            setDrawer({ category: cat, subgroupLabel: merchant, txs: mTxs })
                                          }
                                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white transition-colors text-left"
                                        >
                                          <span className="text-[14px] font-medium text-ink truncate mr-3">
                                            {merchant}
                                          </span>
                                          <span className="text-[14px] font-semibold text-coral shrink-0">
                                            {fmt(mTotal)}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-soft py-10 text-center">Pas encore de dépenses à afficher.</p>
          )}
        </div>

        {/* ── Dernières dépenses ────────────────────────────────────── */}
        <div className="bg-white border border-[#EDE8E0] rounded-xl sm:rounded-2xl px-4 py-4 sm:px-7 sm:py-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-2.5 sm:mb-5">
            <h2 className="font-heading font-semibold text-[15px] sm:text-[18px] text-ink">Dernières dépenses</h2>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-[13px] sm:text-[14px] font-medium text-coral hover:underline underline-offset-4"
            >
              Voir tout →
            </button>
          </div>
          {recentExpenses.length ? (
            <ul className="divide-y divide-[#F5F0E8]">
              {recentExpenses.map(tx => {
                const Icon = CATEGORY_ICONS[tx.category];
                return (
                <li key={tx.id} className="flex items-center gap-2.5 sm:gap-3.5 py-2.5 sm:py-3.5">
                  <span
                    className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center"
                    style={{ background: `${CATEGORY_COLORS[tx.category]}26` }}
                  >
                    <Icon size={18} strokeWidth={2.2} style={{ color: CATEGORY_COLORS[tx.category] }} aria-hidden="true" className="sm:w-5 sm:h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] sm:text-[15px] font-semibold text-ink truncate">{tx.cleanLabel}</p>
                    <p className="text-[11px] sm:text-[13px] text-ink-soft">{CATEGORY_LABELS[tx.category]}</p>
                  </div>
                  <span className="hidden sm:inline text-[13px] text-ink-soft shrink-0">{fmtDate(tx.date)}</span>
                  <span className="text-[13px] sm:text-[16px] font-bold text-coral tabular-nums ml-2 sm:ml-4 shrink-0">
                    {fmt(tx.amount)}
                  </span>
                </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft py-6 text-center">Aucune dépense détectée.</p>
          )}
        </div>

        {/* ── Bulle Thunie ─────────────────────────────────────────── */}
        <div
          className="rounded-xl sm:rounded-2xl px-4 py-4 sm:px-6 sm:py-6 border border-[#FDBA74]"
          style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFF8EC 100%)" }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
              <ThunieFox className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] sm:text-[15px] text-[#7C2D12] leading-relaxed">{tip}</p>
              <button
                onClick={() => onNavigate("chat")}
                className="mt-2.5 sm:mt-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[10px] bg-coral text-white text-[13px] sm:text-[14px] font-semibold hover:bg-[#EA6C0A] transition-colors"
              >
                Parler à Thunie →
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Level 3 drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {drawer && (
          <CategoryDrawer
            key="drawer"
            category={drawer.category}
            subgroupLabel={drawer.subgroupLabel}
            txs={drawer.txs}
            onClose={() => setDrawer(null)}
            chips={chips}
            notes={notes}
            toggleChip={toggleChip}
            setNote={setNote}
          />
        )}
      </AnimatePresence>
    </>
  );
}
