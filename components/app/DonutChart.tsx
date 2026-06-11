"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArcElement, Chart, DoughnutController, Tooltip } from "chart.js";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

Chart.register(ArcElement, DoughnutController, Tooltip);

const DONUT_COLORS: Partial<Record<Category, string>> = {
  alimentation: "#FF6B6B",
  transports: "#06D6A0",
  abonnements: "#118AB2",
  sorties_loisirs: "#FFD166",
  achats_divers: "#8338EC",
  electricite_telecom: "#FB5607",
  transfert_international: "#3A86FF",
  frais_bancaires: "#B5B5B5",
  autre: "#CFCFCF",
};

export function getDonutColor(cat: Category): string {
  return DONUT_COLORS[cat] ?? "#CFCFCF";
}

export interface DonutSegment {
  category: Category;
  value: number;
  pct: number;
}

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  onSegmentClick: (cat: Category) => void;
}

export default function DonutChart({ segments, total, onSegmentClick }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);
  // Keep latest callbacks/data in refs so the effect doesn't need to re-run on every render
  const onClickRef = useRef(onSegmentClick);
  onClickRef.current = onSegmentClick;
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const totalRef = useRef(total);
  totalRef.current = total;

  const chartData = useMemo(
    () => ({
      labels: segments.map((s) => CATEGORY_LABELS[s.category]),
      datasets: [
        {
          data: segments.map((s) => s.value),
          backgroundColor: segments.map((s) => getDonutColor(s.category)),
          borderColor: "#FDFAF5",
          borderWidth: 3,
          hoverBorderWidth: 3,
          hoverOffset: 12,
        },
      ],
    }),
    [segments]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(ctx2d, {
      type: "doughnut",
      data: chartData,
      options: {
        cutout: "65%",
        animation: {
          animateRotate: true,
          duration: 900,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.97)",
            borderColor: "#E5E0D8",
            borderWidth: 1,
            titleColor: "#1C1917",
            bodyColor: "#57534E",
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
            callbacks: {
              label: (ctx) =>
                ` ${fmtCompact(ctx.parsed)} · ${Math.round((ctx.parsed / totalRef.current) * 100)}%`,
            },
          },
        },
        onClick: (_, elements) => {
          if (elements.length > 0) {
            onClickRef.current(segmentsRef.current[elements[0].index].category);
          }
        },
      },
      plugins: [
        {
          id: "centerText",
          afterDraw(chart) {
            const { ctx: c, chartArea } = chart;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            c.save();
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.font = "500 13px system-ui, sans-serif";
            c.fillStyle = "#A8A29E";
            c.fillText("Total", cx, cy - 14);
            c.font = "700 26px system-ui, sans-serif";
            c.fillStyle = "#1C1917";
            c.fillText(fmtCompact(totalRef.current), cx, cy + 12);
            c.restore();
          },
        },
      ],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [chartData]);

  return (
    <div className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] mx-auto cursor-pointer">
      <canvas ref={canvasRef} />
    </div>
  );
}
