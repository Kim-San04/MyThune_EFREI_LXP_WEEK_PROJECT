"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap-animations";
import ThunieFox from "@/components/ThunieFox";

// Each stop is both a "place to roam to" and a line Thunie says once that
// part of the page comes into view — she wanders the screen as you scroll.
const STOPS: { id: string; text: string; left: string; top: string }[] = [
  { id: "hero", text: "Salut, moi c'est Thunie 🦊 Je te fais visiter ?", left: "13%", top: "82%" },
  { id: "fonctionnalites", text: "Ça te parle, hein ? On va arranger ça ensemble 😏", left: "9%", top: "40%" },
  { id: "comment-ca-marche", text: "4 étapes chrono en main, et c'est plié ⏱️", left: "89%", top: "58%" },
  { id: "dashboard-mockup", text: "Tu vois ? Une fois trié, c'est limpide 📊", left: "10%", top: "74%" },
  { id: "thunie", text: "Eh, c'est moi là-bas ! Choisis mon humeur 👇", left: "82%", top: "30%" },
  { id: "cta", text: "Allez, on se lance ensemble ? 🚀", left: "50%", top: "85%" },
];

export default function ThunieGuide() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const foxRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].text);
  const activeIdRef = useRef(STOPS[0].id);

  // Entrance + perpetual little waddle so she always feels alive
  useEffect(() => {
    const { gsap } = getGsap();
    gsap.set(wrapRef.current, {
      left: STOPS[0].left,
      top: STOPS[0].top,
      xPercent: -50,
      yPercent: -50,
    });
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.8)", delay: 1 }
      );
      gsap.to(foxRef.current, {
        rotate: 6,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  // Roam from spot to spot across the whole screen as the page scrolls
  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
      for (let i = 1; i < STOPS.length; i++) {
        tl.to(wrapRef.current, {
          left: STOPS[i].left,
          top: STOPS[i].top,
          ease: "power1.inOut",
          duration: 1,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // Greet whichever section is currently centered in the viewport
  useEffect(() => {
    const { gsap } = getGsap();
    const targets = STOPS.map((s) => ({ ...s, el: document.getElementById(s.id) })).filter(
      (s): s is { id: string; text: string; left: string; top: string; el: HTMLElement } => !!s.el
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = targets.find((t) => t.el === visible.target);
        if (!match || match.id === activeIdRef.current) return;
        activeIdRef.current = match.id;
        setLine(match.text);

        gsap
          .timeline()
          .to(foxRef.current, { y: -16, rotate: -10, duration: 0.22, ease: "power2.out" })
          .to(foxRef.current, { y: 0, rotate: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" });
        gsap.fromTo(
          bubbleRef.current,
          { opacity: 0, y: 10, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }
        );
      },
      { threshold: [0.4, 0.6] }
    );

    targets.forEach((t) => observer.observe(t.el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed z-40 flex flex-col items-center gap-2 opacity-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={bubbleRef}
        className="block max-w-[140px] sm:max-w-[180px] bg-white/95 backdrop-blur-sm border border-coral/15 rounded-2xl rounded-bl-sm px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-warm text-[11px] sm:text-[12px] leading-snug text-ink-mid text-left"
      >
        <span className="font-heading font-bold text-coral block mb-0.5">Thunie 🦊</span>
        {line}
      </div>
      <div ref={foxRef} className="w-[48px] h-[48px] sm:w-[76px] sm:h-[76px] animate-float">
        <ThunieFox className="w-full h-full drop-shadow-[0_10px_24px_rgba(249,115,22,0.35)]" />
      </div>
    </div>
  );
}
