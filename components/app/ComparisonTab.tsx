"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from "chart.js";
import type { StoredStatement } from "@/lib/statements-db";
import { fmtCurrency, formatMonth } from "@/lib/format";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ComparisonTabProps {
  statements: StoredStatement[];
}

export default function ComparisonTab({ statements }: ComparisonTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);

  const sorted = useMemo(() => [...statements].sort((a, b) => a.month.localeCompare(b.month)), [statements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sorted.length < 2) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(ctx2d, {
      type: "bar",
      data: {
        labels: sorted.map((s) => formatMonth(s.month)),
        datasets: [
          {
            label: "Revenus",
            data: sorted.map((s) => s.budget.totalIncome),
            backgroundColor: "#10B981",
            borderRadius: 6,
          },
          {
            label: "Dépenses",
            data: sorted.map((s) => s.budget.totalExpenses),
            backgroundColor: "#F97316",
            borderRadius: 6,
          },
          {
            label: "Reste à vivre",
            data: sorted.map((s) => s.budget.remaining),
            backgroundColor: "#F59E0B",
            borderRadius: 6,
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
          legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.97)",
            borderColor: "#E5E0D8",
            borderWidth: 1,
            titleColor: "#1C1917",
            bodyColor: "#57534E",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (item) => ` ${item.dataset.label} : ${fmtCurrency(Number(item.parsed.y))}`,
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
        <p className="text-sm text-ink-mid">Suis l'évolution de tes revenus, dépenses et de ton reste à vivre, mois après mois.</p>
      </div>

      {sorted.length < 2 ? (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <BarChart3 size={40} strokeWidth={1.8} className="mx-auto mb-4 text-amber" aria-hidden="true" />
          <p className="font-heading font-bold text-ink mb-1">Pas encore assez de données</p>
          <p className="text-sm text-ink-soft max-w-sm mx-auto">
            Importe au moins deux relevés mensuels pour voir l'évolution de ton budget mois après mois.
          </p>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl px-6 py-6">
            <div className="h-[320px]">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EDE8E0] text-left text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Mois</th>
                  <th className="px-5 py-3 font-semibold text-right">Revenus</th>
                  <th className="px-5 py-3 font-semibold text-right">Dépenses</th>
                  <th className="px-5 py-3 font-semibold text-right">Reste à vivre</th>
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((s) => (
                  <tr key={s.id} className="border-b border-[#EDE8E0] last:border-0">
                    <td className="px-5 py-3 font-semibold text-ink">{formatMonth(s.month)}</td>
                    <td className="px-5 py-3 text-right text-sage font-semibold">{fmtCurrency(s.budget.totalIncome)}</td>
                    <td className="px-5 py-3 text-right text-coral font-semibold">{fmtCurrency(s.budget.totalExpenses)}</td>
                    <td className="px-5 py-3 text-right text-ink font-semibold">{fmtCurrency(s.budget.remaining)}</td>
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
