"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { BarChart3, LayoutGrid, ListChecks, LogOut, MessagesSquare, RotateCcw, Target, User } from "lucide-react";
import type { Budget } from "@/lib/types";
import type { StoredStatement } from "@/lib/statements-db";
import OverviewTab from "@/components/app/OverviewTab";
import TransactionsTab from "@/components/app/TransactionsTab";
import ThunieChatTab from "@/components/app/ThunieChatTab";
import GoalsTab from "@/components/app/GoalsTab";
import ProfileTab from "@/components/app/ProfileTab";
import ComparisonTab from "@/components/app/ComparisonTab";
import UploadPanel from "@/components/app/UploadPanel";
import AnalyzingPanel from "@/components/app/AnalyzingPanel";
import UploadModal from "@/components/app/UploadModal";
import ThunieFox from "@/components/ThunieFox";
import { formatMonth } from "@/lib/format";

interface DashboardProps {
  budget: Budget | null;
  statements: StoredStatement[];
  onSelectStatement: (id: string) => void;
  onDeleteStatement: (id: string) => void;
  onUploadNew: () => void;
  uploadOpen: boolean;
  analyzing: boolean;
  onCloseUpload: () => void;
  onFileSelected: (file: File) => void;
}

type TabKey = "overview" | "transactions" | "chat" | "goals" | "comparison" | "profile";

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { key: "transactions", label: "Transactions", icon: ListChecks },
  { key: "chat", label: "Thunie Chat", icon: MessagesSquare },
  { key: "goals", label: "Objectifs", icon: Target },
  { key: "comparison", label: "Comparaison", icon: BarChart3 },
  { key: "profile", label: "Profil", icon: User },
];

export default function Dashboard({
  budget,
  statements,
  onSelectStatement,
  onDeleteStatement,
  onUploadNew,
  uploadOpen,
  analyzing,
  onCloseUpload,
  onFileSelected,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (!budget) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="safe-top px-5 sm:px-8 py-4 flex items-center justify-between border-b border-ink/5">
          <div className="flex items-center gap-2">
            <ThunieFox className="w-8 h-8 shrink-0" />
            <span className="font-heading font-extrabold text-ink">MyThune</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm font-semibold text-ink-mid hover:text-coral bg-cream-dark hover:bg-coral-light rounded-xl px-4 py-2.5 transition-colors"
          >
            <LogOut size={16} strokeWidth={2.2} />
            Se déconnecter
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 safe-bottom">
          {analyzing ? <AnalyzingPanel /> : <UploadPanel onFileSelected={onFileSelected} />}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-[224px] shrink-0 flex-col border-r border-[#EDE8E0] bg-white px-4 py-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <ThunieFox className="w-9 h-9 shrink-0" />
          <span className="font-heading font-bold text-[18px] text-ink">MyThune</span>
        </div>

        <nav className="flex-1 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-coral text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)]"
                    : "text-ink-soft hover:bg-[#FAF7F2] hover:text-ink"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-coral" aria-hidden="true" />
                )}
                <Icon size={20} strokeWidth={2.2} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#EDE8E0]">
          <p className="px-2 mb-3 text-[13px] text-ink-soft">
            Relevé · <span className="font-semibold text-ink-mid">{formatMonth(budget.month)}</span>
          </p>
          <button
            onClick={onUploadNew}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-amber border border-dashed border-amber hover:bg-amber-light transition-colors"
          >
            <RotateCcw size={17} strokeWidth={2.2} />
            Analyser un autre relevé
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-ink/5 safe-top px-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThunieFox className="w-7 h-7 shrink-0" />
            <span className="font-heading font-extrabold text-ink">MyThune</span>
          </div>
          <button onClick={onUploadNew} className="text-ink-soft hover:text-coral transition-colors" aria-label="Analyser un autre relevé">
            <RotateCcw size={19} strokeWidth={2.2} />
          </button>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-7 max-w-6xl w-full mx-auto">
          {activeTab === "overview" && <OverviewTab budget={budget} onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "transactions" && <TransactionsTab budget={budget} />}
          {activeTab === "chat" && <ThunieChatTab budget={budget} />}
          {activeTab === "goals" && <GoalsTab budget={budget} />}
          {activeTab === "comparison" && <ComparisonTab statements={statements} />}
          {activeTab === "profile" && (
            <ProfileTab
              statements={statements}
              activeBudget={budget}
              onSelectStatement={(id) => {
                onSelectStatement(id);
                setActiveTab("overview");
              }}
              onDeleteStatement={onDeleteStatement}
              onUploadNew={onUploadNew}
            />
          )}
        </main>

        <nav className="lg:hidden sticky bottom-0 z-20 bg-cream/95 backdrop-blur-md border-t border-ink/5 px-3 pt-2 safe-bottom flex items-center justify-around">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  isActive ? "text-coral" : "text-ink-soft"
                }`}
              >
                <Icon size={19} strokeWidth={2.2} />
                {label.split(" ")[0]}
              </button>
            );
          })}
        </nav>
      </div>

      <UploadModal open={uploadOpen} analyzing={analyzing} onClose={onCloseUpload} onFileSelected={onFileSelected} />
    </div>
  );
}
