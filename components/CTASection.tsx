"use client";

import { useEffect, useRef } from "react";
import { getGsap } from "@/lib/gsap-animations";
import ThunieFox from "@/components/ThunieFox";
import EnterAppButton from "@/components/EnterAppButton";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative py-16 sm:py-20 md:py-28 px-6 text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, var(--amber-light) 0%, var(--coral-light) 60%, var(--cream) 100%)",
      }}
    >
      <div className="cta-content max-w-2xl mx-auto relative z-10">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 animate-float">
          <ThunieFox className="w-full h-full" />
        </div>

        <h2 className="font-heading font-extrabold text-3xl sm:text-[56px] leading-tight text-ink mb-6 sm:mb-9 text-balance">
          Prêt à reprendre le contrôle ?
        </h2>

        <EnterAppButton className="btn inline-block rounded-2xl bg-coral text-white font-heading font-bold text-base sm:text-lg px-8 py-4 sm:px-10 sm:py-5 shadow-warm hover:scale-[1.03] transition-transform">
          Commencer maintenant →
        </EnterAppButton>
      </div>
    </section>
  );
}
