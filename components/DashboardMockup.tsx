"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getGsap } from "@/lib/gsap-animations";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORIES = [
  { emoji: "🏠", label: "Loyer & Charges", pct: 42, color: "#8B5CF6" },
  { emoji: "🍔", label: "Alimentation", pct: 23, color: "#F97316" },
  { emoji: "🚗", label: "Transports", pct: 12, color: "#10B981" },
  { emoji: "📱", label: "Abonnements", pct: 9, color: "#F59E0B" },
  { emoji: "🎉", label: "Sorties", pct: 14, color: "#FDA4AF" },
];

const DATA = {
  labels: CATEGORIES.map((c) => c.label),
  datasets: [
    {
      data: CATEGORIES.map((c) => c.pct),
      backgroundColor: CATEGORIES.map((c) => c.color),
      borderColor: "#FFFFFF",
      borderWidth: 4,
      hoverOffset: 10,
    },
  ],
};

const OPTIONS: ChartOptions<"doughnut"> = {
  cutout: "70%",
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1C1917",
      titleFont: { family: "var(--font-jakarta)", weight: "bold" },
      bodyFont: { family: "var(--font-nunito)" },
      padding: 10,
      cornerRadius: 10,
      callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` },
    },
  },
  animation: { duration: 1200, easing: "easeOutQuart" },
};

const TRANSACTIONS = [
  { emoji: "🛒", label: "SP-MONOPRIX 451", decoded: "Courses", cat: "Alimentation", amount: -34.2 },
  { emoji: "🚗", label: "UBER* TRIP", decoded: "Uber", cat: "Transports", amount: -12.5 },
  { emoji: "🍔", label: "CB MCDO CHATELET", decoded: "McDonald's", cat: "Fast-food", amount: -8.9 },
  { emoji: "🏠", label: "VIR LOYER", decoded: "Loyer", cat: "Charges", amount: -650.0 },
  { emoji: "💰", label: "VIR BOURSE CROUS", decoded: "Bourse Crous", cat: "Revenus", amount: 452.0 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default function DashboardMockup() {
  const sectionRef = useRef<HTMLElement>(null);
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();
    const ctx = gsap.context(() => {
      gsap.from(".dash-mockup-card", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Categories pop in one by one with a playful overshoot once the card is in view
      gsap.from(".dash-category", {
        scale: 0.4,
        opacity: 0,
        y: 14,
        duration: 0.55,
        stagger: 0.09,
        ease: "back.out(2.2)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      // Transactions cascade in just after, for a "data coming alive" feel
      gsap.from(".dash-transaction", {
        x: -22,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // Mount the doughnut only once the card scrolls into view, so its
      // built-in arc animation plays as a "the chart draws itself" reveal.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => setChartVisible(true),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // gentle mouse parallax
  useEffect(() => {
    const section = sectionRef.current;
    const card = section?.querySelector<HTMLElement>(".dash-mockup-card");
    if (!section || !card) return;
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${px * 5}deg) rotateX(${-py * 5}deg)`;
    };
    const onLeave = () => { card.style.transform = "rotateY(0) rotateX(0)"; };
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="dashboard-mockup"
      className="relative py-24 px-6 bg-cream-dark/60"
      style={{ perspective: "1500px" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink mb-3">
            Vois exactement où va ton argent.
          </h2>
          <p className="text-ink-soft text-lg">
            Ce que voit Lucas après avoir uploadé son relevé Boursorama.
          </p>
        </div>

        <div
          className="dash-mockup-card glass-strong rounded-[28px] p-6 sm:p-9 will-change-transform transition-transform duration-300 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <p className="font-heading font-bold text-xl text-ink">Bonjour Lucas 👋</p>
              <p className="text-ink-soft text-sm font-medium">Janvier 2025</p>
            </div>
            <div className="bg-sage-light text-sage font-heading font-extrabold text-lg px-5 py-2.5 rounded-2xl">
              1 247 € restants
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Donut + legend */}
            <div className="flex flex-col items-center">
              <div className="relative w-[200px] h-[200px] mb-6">
                {chartVisible && <Doughnut data={DATA} options={OPTIONS} />}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-ink-soft text-xs">Total dépensé</p>
                  <p className="font-heading font-extrabold text-ink text-xl">1 542 €</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-xs">
                {CATEGORIES.map((c) => (
                  <div key={c.label} className="dash-category flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-ink-mid font-medium truncate">{c.emoji} {c.label}</span>
                    <span className="ml-auto font-heading font-bold text-ink">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction list */}
            <div className="flex flex-col gap-2">
              {TRANSACTIONS.map((t) => (
                <div
                  key={t.label}
                  className="dash-transaction flex items-center gap-3 bg-cream/80 hover:bg-cream rounded-xl px-4 py-3 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{t.decoded}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                      <span className="bg-cream-dark px-2 py-0.5 rounded-full font-medium">{t.cat}</span>
                      <span className="truncate">{t.label}</span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-heading font-bold flex-shrink-0 ${
                      t.amount < 0 ? "text-coral" : "text-sage"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {fmt(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Thunie bubble */}
          <div className="mt-8 flex items-start gap-3 bg-coral-light border border-coral/20 rounded-2xl rounded-tl-sm px-5 py-4 max-w-xl ml-auto">
            <span className="text-2xl flex-shrink-0">🦊</span>
            <p className="text-sm text-ink-mid leading-relaxed">
              <span className="font-heading font-bold text-coral">Thunie — </span>
              Hé Lucas ! T&apos;as mangé 3x Uber Eats cette semaine 😅 Si tu cuisines
              mardi et jeudi, tu récupères facilement 24&nbsp;€. On essaie ?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
