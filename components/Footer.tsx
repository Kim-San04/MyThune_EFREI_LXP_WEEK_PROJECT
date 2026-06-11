import ThunieFox from "@/components/ThunieFox";

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

export default function Footer() {
  return (
    <footer className="relative bg-cream-dark/70 pt-10 pb-6 sm:pt-16 sm:pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 mb-8 sm:gap-10 sm:mb-12">
          <div className="col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-3">
              <ThunieFox className="w-8 h-8" />
              <span className="font-heading font-extrabold text-xl text-ink">MyThune</span>
            </a>
            <p className="text-ink-mid text-sm leading-relaxed max-w-[220px]">
              Gère ton oseille sans flemme.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-heading font-bold text-ink text-sm mb-3 sm:mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2 sm:gap-2.5">
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
      </div>
    </footer>
  );
}
