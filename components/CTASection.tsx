"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap-animations";
import ThunieFox from "@/components/ThunieFox";
import EnterAppButton from "@/components/EnterAppButton";

const TARGET_COUNT = 2847;
const CONFETTI_COLORS = ["#F59E0B", "#F97316", "#10B981", "#8B5CF6", "#FBBF24", "#FDA4AF"];
const CONFETTI_COUNT = 16;

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const { gsap, ScrollTrigger } = getGsap();
    const ctx = gsap.context(() => {
      gsap.from(".cta-content > *", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Count-up trigger — and a confetti burst the instant it lands on its target
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: TARGET_COUNT,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => setCount(Math.round(obj.val)),
            onComplete: () => fireConfetti(gsap, burstRef.current),
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative py-28 px-6 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, var(--amber-light) 0%, var(--coral-light) 60%, var(--cream) 100%)",
      }}
    >
      <div className="cta-content max-w-2xl mx-auto relative z-10">
        <div className="w-28 h-28 mx-auto mb-6 animate-float">
          <ThunieFox className="w-full h-full" />
        </div>

        <h2 className="font-heading font-extrabold text-4xl sm:text-[56px] leading-tight text-ink mb-4 text-balance">
          Prêt à reprendre le contrôle ?
        </h2>
        <p className="text-ink-mid text-lg sm:text-xl mb-9">
          Gratuit. Aucune inscription. Juste ton PDF et Thunie.
        </p>

        <EnterAppButton className="btn inline-block rounded-2xl bg-coral text-white font-heading font-bold text-lg px-10 py-5 shadow-warm hover:scale-[1.03] transition-transform">
          Commencer maintenant →
        </EnterAppButton>

        <p className="relative mt-6 font-heading font-bold text-ink inline-block">
          🔥 {count.toLocaleString("fr-FR")} étudiants ont rejoint MyThune
          <span ref={burstRef} className="absolute inset-0 overflow-visible">
            {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  width: i % 3 === 0 ? "10px" : "6px",
                  height: i % 3 === 0 ? "10px" : "6px",
                  borderRadius: i % 2 === 0 ? "9999px" : "3px",
                }}
              />
            ))}
          </span>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          🔒 Aucune donnée bancaire stockée · PDF analysé localement
        </p>
      </div>
    </section>
  );
}

function fireConfetti(gsap: typeof import("gsap").gsap, container: HTMLElement | null) {
  const pieces = container?.querySelectorAll<HTMLElement>(".confetti-piece");
  if (!pieces?.length) return;

  pieces.forEach((piece, i) => {
    const angle = (i / pieces.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const distance = 50 + Math.random() * 60;
    gsap.fromTo(
      piece,
      { x: 0, y: 0, opacity: 1, scale: 0, rotation: 0 },
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 24,
        scale: 1,
        opacity: 0,
        rotation: (Math.random() - 0.5) * 380,
        duration: 0.85 + Math.random() * 0.45,
        ease: "power2.out",
        delay: Math.random() * 0.08,
      }
    );
  });
}
