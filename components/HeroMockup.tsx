"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const DATA = {
  labels: ["Loyer", "Alimentation", "Transports", "Sorties"],
  datasets: [
    {
      data: [42, 23, 12, 23],
      backgroundColor: ["#8B5CF6", "#F97316", "#10B981", "#F59E0B"],
      borderColor: "#FDFAF5",
      borderWidth: 3,
      hoverOffset: 6,
    },
  ],
};

const OPTIONS: ChartOptions<"doughnut"> = {
  cutout: "72%",
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  animation: { duration: 1100, easing: "easeOutQuart" },
};

const TRANSACTIONS = [
  { emoji: "🛒", label: "SP-MONOPRIX 451", cat: "Alimentation", amount: "-34,20 €" },
  { emoji: "🚕", label: "UBER* TRIP", cat: "Transports", amount: "-12,50 €" },
  { emoji: "🍔", label: "CB MCDO CHATELET", cat: "Fast-food", amount: "-8,90 €" },
];

export default function HeroMockup() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // gentle continuous float so the card feels alive even before scroll
    const el = cardRef.current;
    if (!el) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      el.style.setProperty("--floatY", `${Math.sin(t * 0.9) * 8}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={cardRef}
      className="glass-strong rounded-[28px] p-6 sm:p-7 max-w-md mx-auto relative"
      style={{ transform: "translateY(var(--floatY, 0px))" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-heading font-bold text-ink text-lg">Bonjour Lucas 👋</p>
          <p className="text-ink-soft text-xs font-medium">Janvier 2025</p>
        </div>
        <div className="text-right">
          <p className="text-ink-soft text-xs font-medium">Reste à vivre</p>
          <p className="font-heading font-extrabold text-sage text-lg">1 247 €</p>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-[110px] h-[110px] flex-shrink-0">
          <Doughnut data={DATA} options={OPTIONS} />
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <LegendRow color="#8B5CF6" emoji="🏠" label="Loyer & Charges" pct="42%" />
          <LegendRow color="#F97316" emoji="🍔" label="Alimentation" pct="23%" />
          <LegendRow color="#10B981" emoji="🚗" label="Transports" pct="12%" />
          <LegendRow color="#F59E0B" emoji="📱" label="Abonnements" pct="9%" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {TRANSACTIONS.map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-3 bg-cream-dark/70 rounded-xl px-3 py-2"
          >
            <span className="text-lg">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink truncate">{t.label}</p>
              <p className="text-[11px] text-ink-soft">{t.cat}</p>
            </div>
            <span className="text-[13px] font-bold text-coral">{t.amount}</span>
          </div>
        ))}
      </div>

      {/* Thunie bubble — the punchline gets star billing, not a footnote */}
      <div className="hero-bubble absolute -bottom-9 -right-5 sm:-right-12 max-w-[270px] bg-coral text-white rounded-2xl rounded-br-sm px-5 py-4 shadow-warm rotate-[-2deg]">
        <p className="text-[15px] sm:text-base leading-snug font-semibold text-balance">
          <span className="font-heading font-extrabold block mb-1">Thunie 🦊</span>
          3 Uber Eats cette semaine… encore un et ils t&apos;envoient les dividendes 📈😅
        </p>
      </div>
    </div>
  );
}

function LegendRow({ color, emoji, label, pct }: { color: string; emoji: string; label: string; pct: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-ink-mid font-medium">{emoji} {label}</span>
      <span className="ml-auto font-heading font-bold text-ink">{pct}</span>
    </div>
  );
}
