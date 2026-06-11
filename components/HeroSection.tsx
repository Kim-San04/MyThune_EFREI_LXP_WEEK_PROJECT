"use client";

import { useEffect, useRef } from "react";
import EnterAppButton from "@/components/EnterAppButton";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { getGsap } from "@/lib/gsap-animations";
import HeroMockup from "@/components/HeroMockup";

const ThreeDScene = dynamic(() => import("@/components/ThreeDScene"), { ssr: false });

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
        .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.6 }, "-=0.35")
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
      className="relative pt-24 pb-14 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-[55%_45%] gap-10 lg:gap-16 items-center overflow-visible"
    >
      {/* ── Left: copy ─────────────────────────────────────────── */}
      <div className="relative z-10">
        <span className="hero-badge inline-flex items-center gap-2 bg-amber-light text-amber font-semibold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-5 sm:mb-7">
          <Sparkles size={14} strokeWidth={2.4} className="sm:hidden" />
          <Sparkles size={16} strokeWidth={2.4} className="hidden sm:block" />
          Zéro connexion bancaire · Zéro saisie manuelle
        </span>

        <h1 className="font-heading font-extrabold text-[32px] leading-[1.15] sm:text-6xl lg:text-[72px] text-ink mb-6 text-balance">
          <HeroLine words={["Encore", "un"]} />
          <HeroLine words={["Uber", "Eats", "et"]} />
          <HeroLine words={["t'es", "actionnaire."]} gradient />
        </h1>

        <div className="hero-ctas flex flex-wrap items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          <EnterAppButton
            id="hero-cta"
            className="btn rounded-2xl bg-coral text-white font-heading font-bold text-sm sm:text-base px-6 py-3.5 sm:px-8 sm:py-4 shadow-warm hover:scale-[1.03] transition-transform"
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
