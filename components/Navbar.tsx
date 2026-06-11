"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap } from "@/lib/gsap-animations";
import EnterAppButton from "@/components/EnterAppButton";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#thunie", label: "Thunie" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const hasAnimatedIn = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (hasAnimatedIn.current || !navRef.current) return;
    hasAnimatedIn.current = true;
    const { gsap } = getGsap();
    gsap.from(navRef.current, {
      y: -28,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      delay: 0.1,
    });
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
        scrolled ? "bg-[rgba(253,250,245,0.85)] backdrop-blur-2xl shadow-glass" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 safe-top pb-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="text-2xl">🦊</span>
          <span className="font-heading font-extrabold text-xl text-ink group-hover:text-coral transition-colors">
            MyThune
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-ink-mid">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-coral transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <EnterAppButton className="btn shrink-0 rounded-xl2 bg-coral text-white font-heading font-semibold text-sm px-4 py-2.5 sm:px-5 shadow-warm">
          <span className="sm:hidden">Essayer</span>
          <span className="hidden sm:inline">Essayer gratuitement</span>
        </EnterAppButton>
      </div>
    </nav>
  );
}
