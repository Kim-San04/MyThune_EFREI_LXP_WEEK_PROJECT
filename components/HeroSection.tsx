"use client";

import { useEffect, useRef } from "react";
import EnterAppButton from "@/components/EnterAppButton";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { getGsap } from "@/lib/gsap-animations";
import HeroMockup from "@/components/HeroMockup";

const ThreeDScene = dynamic(() => import("@/components/ThreeDScene"), { ssr: false });

const AVATARS = [
  { initials: "LM", color: "#F59E0B" },
  { initials: "JD", color: "#F97316" },
  { initials: "SK", color: "#10B981" },
  { initials: "RA", color: "#8B5CF6" },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupWrapRef = useRef<HTMLDivElement>(null);

  // Entrance timeline
  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.5 })
        .from(".hero-word", {
          yPercent: 115,
          opacity: 0,
          rotate: 6,
          stagger: 0.05,
          duration: 0.85,
          ease: "back.out(1.8)",
        }, "-=0.2")
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.35")
        .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-proof", { y: 16, opacity: 0, duration: 0.5 }, "-=0.25")
        .from(".hero-mockup", { x: 40, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.6")
        .from(".hero-bubble", { scale: 0, opacity: 0, rotate: -18, duration: 0.65, ease: "back.out(2.4)" }, "-=0.15");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Scroll-driven depth: the mockup gently zooms & lifts as you scroll past the hero
  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.to(".hero-mockup", {
        scale: 1.07,
        y: -36,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Mouse parallax on the mockup card
  useEffect(() => {
    const wrap = mockupWrapRef.current;
    const card = wrap?.querySelector<HTMLElement>(".mockup-card");
    if (!wrap || !card) return;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(0)`;
    };
    const onLeave = () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative pt-36 pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-[55%_45%] gap-16 items-center overflow-visible"
    >
      {/* ── Left: copy ─────────────────────────────────────────── */}
      <div className="relative z-10">
        <span className="hero-badge inline-flex items-center gap-2 bg-amber-light text-amber font-semibold text-sm px-4 py-2 rounded-full mb-7">
          <Sparkles size={16} strokeWidth={2.4} />
          Zéro connexion bancaire · Zéro saisie manuelle
        </span>

        <h1 className="font-heading font-extrabold text-[42px] leading-[1.08] sm:text-6xl lg:text-[72px] text-ink mb-6 text-balance">
          <HeroLine words={["Encore", "un"]} />
          <HeroLine words={["Uber", "Eats", "et"]} />
          <HeroLine words={["t'es", "actionnaire."]} gradient />
        </h1>

        <p className="hero-sub font-body text-lg text-ink-mid max-w-xl mb-9 leading-relaxed">
          Glisse ton relevé PDF. Thunie, ton coach IA, décortique tout en 10
          secondes et te dit où va vraiment ta thune.
        </p>

        <div className="hero-ctas flex flex-wrap items-center gap-6 mb-10">
          <EnterAppButton
            id="hero-cta"
            className="btn rounded-2xl bg-coral text-white font-heading font-bold text-base px-8 py-4 shadow-warm hover:scale-[1.03] transition-transform"
          >
            Analyser mon relevé →
          </EnterAppButton>
          <a
            href="#comment-ca-marche"
            className="text-ink-soft font-semibold underline decoration-2 underline-offset-4 hover:text-coral transition-colors"
          >
            Voir comment ça marche ↓
          </a>
        </div>

        <div className="hero-proof flex items-center gap-3">
          <div className="flex -space-x-3">
            {AVATARS.map((a) => (
              <div
                key={a.initials}
                className="w-10 h-10 rounded-full border-2 border-cream flex items-center justify-center text-white text-xs font-bold font-heading"
                style={{ background: a.color }}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-mid font-medium">
            <span className="font-heading font-bold text-ink">2 847 étudiants</span> gèrent
            mieux leur argent
          </p>
        </div>
      </div>

      {/* ── Right: floating mockup + 3D coins ──────────────────── */}
      <div className="hero-mockup relative">
        <div className="absolute -inset-20 rounded-full bg-amber/15 blur-3xl -z-10" />
        <ThreeDScene />
        <div
          ref={mockupWrapRef}
          className="relative"
          style={{ perspective: "1200px" }}
        >
          <div
            className="mockup-card transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: "rotate(2deg)", transformStyle: "preserve-3d" }}
          >
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLine({ words, gradient = false }: { words: string[]; gradient?: boolean }) {
  return (
    <span className="block overflow-hidden pb-1">
      {words.map((word, i) => (
        <span key={i} className={`hero-word inline-block ${gradient ? "gradient-text" : ""}`}>
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
