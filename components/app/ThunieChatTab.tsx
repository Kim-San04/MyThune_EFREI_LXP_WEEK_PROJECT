"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Zap } from "lucide-react";
import type { Budget, ThunieMessage, ThunieMode } from "@/lib/types";
import ThunieFox from "@/components/ThunieFox";

const SUGGESTIONS = [
  "Où part le plus gros de mon argent ?",
  "Comment je peux économiser ce mois-ci ?",
  "Est-ce que mon budget est équilibré ?",
  "Donne-moi un objectif réaliste pour le mois prochain",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

function buildSubcategoryContext(budget: Budget): string {
  const items: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("mythune_chips_")) {
        const txId = key.slice(14);
        const tx = budget.transactions.find(t => t.id === txId);
        if (!tx) continue;
        try {
          const chips: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
          if (chips.length) items.push(`${tx.cleanLabel} → ${chips.join(", ")}`);
        } catch {}
      } else if (key.startsWith("mythune_note_")) {
        const txId = key.slice(13);
        const tx = budget.transactions.find(t => t.id === txId);
        if (!tx) continue;
        const note = localStorage.getItem(key);
        if (note) items.push(`${tx.cleanLabel} (note: "${note}")`);
      }
    }
  } catch {}
  if (!items.length) return "";
  return `\nDétail des achats qualifié par l'utilisateur :\n${items.join("\n")}`;
}

function welcomeMessage(budget: Budget): ThunieMessage {
  const verdict =
    budget.remaining < 0
      ? `Attention, tu termines le mois à ${fmt(budget.remaining)} — on en parle ?`
      : `Tu termines le mois avec ${fmt(budget.remaining)} de marge, pas mal !`;
  return {
    role: "thunie",
    content: `Salut, c'est Thunie ! J'ai épluché ton relevé : ${verdict} Pose-moi une question, je connais chaque ligne de tes dépenses par cœur.`,
    timestamp: new Date().toISOString(),
  };
}

interface ThunieChatTabProps {
  budget: Budget;
}

export default function ThunieChatTab({ budget }: ThunieChatTabProps) {
  const [messages, setMessages] = useState<ThunieMessage[]>(() => [welcomeMessage(budget)]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ThunieMode>("bienveillant");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(content: string) {
    if (!content.trim() || isStreaming) return;

    const userMessage: ThunieMessage = { role: "user", content: content.trim(), timestamp: new Date().toISOString() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsStreaming(true);

    const placeholder: ThunieMessage = { role: "thunie", content: "", timestamp: new Date().toISOString() };
    setMessages([...history, placeholder]);

    try {
      const res = await fetch("/api/thunie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, budget, mode, subcategoryContext: buildSubcategoryContext(budget) }),
      });

      if (!res.ok || !res.body) throw new Error("Réponse indisponible");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { ...placeholder, content: acc }]);
      }

      setMessages([...history, { ...placeholder, content: acc || "Hmm, je n'ai pas pu formuler de réponse cette fois. Réessaie ?" }]);
    } catch {
      setMessages([
        ...history,
        { role: "thunie", content: "Oups, j'ai eu un petit bug de connexion. Réessaie dans un instant.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-9rem)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink mb-1">Thunie Chat</h1>
          <p className="text-sm text-ink-mid">Discute avec ton coach budget, en mode doux ou cash</p>
        </div>

        <div className="glass rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => setMode("bienveillant")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === "bienveillant" ? "bg-sage text-white shadow-sm" : "text-ink-mid hover:text-ink"
            }`}
          >
            <Smile size={14} strokeWidth={2.4} /> Bienveillant
          </button>
          <button
            onClick={() => setMode("sarcastique")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === "sarcastique" ? "bg-coral text-white shadow-sm" : "text-ink-mid hover:text-ink"
            }`}
          >
            <Zap size={14} strokeWidth={2.4} /> Cash
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto glass rounded-2xl px-5 py-5 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "thunie" && (
              <span className="w-8 h-8 shrink-0 rounded-full bg-amber-light flex items-center justify-center">
                <ThunieFox className="w-6 h-6" />
              </span>
            )}
            <div
              className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-coral text-white rounded-br-sm"
                  : "bg-cream-dark text-ink rounded-bl-sm"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-medium text-ink-mid bg-cream-dark hover:bg-amber-light hover:text-amber rounded-full px-3.5 py-2 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message à Thunie…"
          className="flex-1 px-4 py-3 rounded-2xl bg-cream-dark text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-amber/40"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="btn shrink-0 w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center shadow-warm disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send size={18} strokeWidth={2.4} />
        </button>
      </form>
    </motion.div>
  );
}
