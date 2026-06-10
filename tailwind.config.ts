import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      colors: {
        cream: "#FDFAF5",
        "cream-dark": "#F5F0E8",
        amber: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        coral: { DEFAULT: "#F97316", light: "#FFF0E8" },
        sage: { DEFAULT: "#10B981", light: "#ECFDF5" },
        violet: { DEFAULT: "#8B5CF6", light: "#F5F3FF" },
        ink: { DEFAULT: "#1C1917", mid: "#57534E", soft: "#A8A29E" },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(245, 158, 11, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
        warm: "0 8px 24px rgba(249, 115, 22, 0.25)",
        "warm-lg": "0 20px 48px rgba(245, 158, 11, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "float-blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-30px, 20px) scale(1.05)" },
          "66%": { transform: "translate(20px, -15px) scale(0.97)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
      },
      animation: {
        "float-blob": "float-blob 16s ease-in-out infinite",
        "float-blob-slow": "float-blob 22s ease-in-out infinite reverse",
        float: "float 3s ease-in-out infinite",
        sparkle: "sparkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
