"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap-animations";
import ThunieFox from "@/components/ThunieFox";

type Mode = "bienveillant" | "sarcastique";

const CONVERSATIONS: Record<Mode, { from: "thunie" | "user"; text: string }[]> = {
  bienveillant: [
    {
      from: "thunie",
      text: "Ce mois était chaud, mais t'as bien géré l'essentiel. Voilà 3 petits trucs pour récupérer 40 € d'ici la fin du mois 💪",
    },
    { from: "user", text: "Vas-y, je t'écoute" },
    {
      from: "thunie",
      text: "1. Pause Uber Eats mardi-jeudi · 2. Résilie Netflix vu que tu le regardes plus · 3. Fais tes courses le mercredi (promos Monop')",
    },
  ],
  sarcastique: [
    {
      from: "thunie",
      text: "4 UberEats en une semaine. On va appeler ça un régime Pad Thaï international 🍜",
    },
    { from: "user", text: "Aïe" },
    {
      from: "thunie",
      text: "Bonne nouvelle : j'ai un plan. Mauvaise : ça implique de cuisiner. On en parle ?",
    },
  ],
};

const MODES: { id: Mode; label: string; emoji: string }[] = [
  { id: "bienveillant", label: "Bienveillant", emoji: "🤗" },
  { id: "sarcastique", label: "Sarcastique", emoji: "😏" },
];

export default function ThunieChatSection() {
  const [mode, setMode] = useState<Mode>("bienveillant");
  const sectionRef = useRef<HTMLElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered cascade entrance for bubbles
  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.from(".chat-bubble", {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".thunie-illustration", {
        scale: 0.85,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Cross-fade bubbles when mode changes
  useEffect(() => {
    const { gsap } = getGsap();
    const el = bubblesRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [mode]);

  return (
    <section ref={sectionRef} id="thunie" className="relative py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink mb-3">
          Thunie, ton pote de poche.
        </h2>
        <p className="text-ink-soft text-lg mb-12">
          Un coach IA qui te parle comme un ami, pas comme une banque.
        </p>

        <div className="thunie-illustration mx-auto w-44 h-44 sm:w-52 sm:h-52 mb-10 animate-float">
          <ThunieFox className="w-full h-full drop-shadow-[0_12px_32px_rgba(249,115,22,0.25)]" />
        </div>

        {/* Mode toggle */}
        <div className="inline-flex glass rounded-full p-1.5 gap-1 mb-10">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-heading font-bold transition-all duration-300 ${
                mode === m.id
                  ? "bg-coral text-white shadow-warm"
                  : "text-ink-mid hover:text-coral"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div ref={bubblesRef} className="flex flex-col gap-4 text-left">
          {CONVERSATIONS[mode].map((bubble, i) => (
            <div
              key={`${mode}-${i}`}
              className={`chat-bubble flex ${bubble.from === "thunie" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 leading-relaxed text-[15px] ${
                  bubble.from === "thunie"
                    ? "bg-coral-light border border-coral/20 rounded-tl-sm text-ink-mid"
                    : "bg-violet text-white rounded-tr-sm shadow-warm"
                }`}
              >
                {bubble.from === "thunie" && (
                  <span className="font-heading font-bold text-coral block mb-1">Thunie 🦊</span>
                )}
                {bubble.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
