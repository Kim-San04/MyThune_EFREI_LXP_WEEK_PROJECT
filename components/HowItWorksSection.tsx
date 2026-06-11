"use client";

import { useEffect, useRef } from "react";
import { Download, Upload, Sparkles, MessageCircle } from "lucide-react";
import { getGsap } from "@/lib/gsap-animations";

const STEPS = [
  {
    icon: Download,
    title: "Tu télécharges ton relevé",
    text: "Depuis l'espace client de ta banque. PDF standard, aucun format spécial requis.",
  },
  {
    icon: Upload,
    title: "Tu le glisses dans MyThune",
    text: "Drag & drop ou clic. La zone d'import est claire, grande, rassurante.",
  },
  {
    icon: Sparkles,
    title: "L'IA analyse tout",
    text: "En quelques secondes, chaque transaction est décodée et rangée dans la bonne catégorie.",
  },
  {
    icon: MessageCircle,
    title: "Thunie te parle cash",
    text: "Ton coach IA te donne un bilan clair et des conseils actionnables, sans jargon.",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      // Draw the connecting line left → right
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power2.inOut",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Cascade the steps
      gsap.from(".step-item", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.18,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="comment-ca-marche" className="relative py-14 sm:py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-heading font-bold text-2xl sm:text-4xl text-ink mb-10 sm:mb-16">
          En 4 étapes, c&apos;est réglé.
        </h2>

        <div className="relative">
          {/* connecting line (desktop only) */}
          <div
            ref={lineRef}
            className="dotted-line hidden md:block absolute top-6 left-[12.5%] right-[12.5%] origin-left"
            aria-hidden="true"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="step-item relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-light flex items-center justify-center mb-3 sm:mb-5">
                    <Icon size={18} className="text-amber sm:hidden" strokeWidth={2.4} />
                    <Icon size={20} className="text-amber hidden sm:block" strokeWidth={2.4} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center font-heading">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-ink mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-mid leading-relaxed max-w-[230px]">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
