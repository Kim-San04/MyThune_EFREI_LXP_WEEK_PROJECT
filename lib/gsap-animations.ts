"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

let registered = false;

/** Registers GSAP plugins once (safe to call from every client component). */
export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Generic scroll-triggered fade/rise-in for a list of elements. */
export function fadeInOnScroll(
  targets: gsap.TweenTarget,
  opts: { trigger: Element | string; y?: number; stagger?: number; start?: string }
) {
  const { gsap } = getGsap();
  return gsap.from(targets, {
    y: opts.y ?? 50,
    opacity: 0,
    duration: 0.8,
    stagger: opts.stagger ?? 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: opts.trigger,
      start: opts.start ?? "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}
