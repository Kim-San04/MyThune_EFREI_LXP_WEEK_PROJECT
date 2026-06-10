import { Heart, MessageCircle, Send, Mail } from "lucide-react";

const COLUMNS = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Comment ça marche", "Thunie", "FAQ"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "Conditions d'utilisation", "RGPD", "Cookies"],
  },
  {
    title: "Nous",
    links: ["À propos", "Contact", "Blog", "Carrières"],
  },
];

const SOCIALS = [Heart, MessageCircle, Send, Mail];

export default function Footer() {
  return (
    <footer className="relative bg-cream-dark/70 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <a href="#" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🦊</span>
              <span className="font-heading font-extrabold text-xl text-ink">MyThune</span>
            </a>
            <p className="text-ink-mid text-sm leading-relaxed max-w-[220px]">
              Gère ton oseille sans flemme.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-heading font-bold text-ink text-sm mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-ink-mid text-sm hover:text-coral transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink-soft text-xs">
            © 2025 MyThune — Fait avec ☕ et beaucoup d&apos;amour
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-ink-soft hover:text-coral transition-colors"
                aria-label="social link"
              >
                <Icon size={18} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
