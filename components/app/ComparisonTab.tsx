"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { StoredStatement } from "@/lib/statements-db";
import { fmtCurrency, formatMonth } from "@/lib/format";

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

interface ComparisonTabProps {
  statements: StoredStatement[];
}

export default function ComparisonTab({ statements }: ComparisonTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);

  const sorted = useMemo(() => [...statements].sort((a, b) => a.month.localeCompare(b.month)), [statements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sorted.length < 2) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    chartRef.current?.destroy();

    const gradient = ctx2d.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "rgba(249, 115, 22, 0.25)");
    gradient.addColorStop(1, "rgba(249, 115, 22, 0)");

    chartRef.current = new Chart(ctx2d, {
      type: "line",
      data: {
        labels: sorted.map((s) => formatMonth(s.month)),
        datasets: [
          {
            label: "Dépenses",
            data: sorted.map((s) => s.budget.totalExpenses),
            borderColor: "#F97316",
            backgroundColor: gradient,
            pointBackgroundColor: "#F97316",
            pointBorderColor: "#FFFFFF",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "#EDE8E0" },
            ticks: { callback: (value) => fmtCurrency(Number(value)) },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.97)",
            borderColor: "#E5E0D8",
            borderWidth: 1,
            titleColor: "#1C1917",
            bodyColor: "#57534E",
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (item) => `Dépenses : ${fmtCurrency(Number(item.parsed.y))}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [sorted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-ink mb-1">Comparaison mensuelle</h1>
        <p className="text-sm text-ink-mid">Suis l&apos;évolution de tes dépenses, mois après mois.</p>
      </div>

      {sorted.length < 2 ? (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <TrendingUp size={40} strokeWidth={1.8} className="mx-auto mb-4 text-amber" aria-hidden="true" />
          <p className="font-heading font-bold text-ink mb-1">Pas encore assez de données</p>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            Importe au moins deux relevés mensuels pour voir l&apos;évolution de tes dépenses mois après mois.
          </p>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl px-6 py-6">
            <div className="h-[280px]">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EDE8E0] text-left text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Mois</th>
                  <th className="px-5 py-3 font-semibold text-right">Dépenses</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((s) => (
                  <tr key={s.id} className="border-b border-[#EDE8E0] last:border-0">
                    <td className="px-5 py-3 font-semibold text-ink">{formatMonth(s.month)}</td>
                    <td className="px-5 py-3 text-right text-coral font-semibold">{fmtCurrency(s.budget.totalExpenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}
