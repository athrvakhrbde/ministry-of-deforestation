import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        black: "var(--black)",
        paper: "var(--paper)",
        "red-stamp": "var(--red-stamp)",
        "green-forest": "var(--green-forest)",
        "amber-warn": "var(--amber-warn)",
        muted: "var(--muted)",
        ink: "var(--ink)",
        surface: "var(--surface-raised)",
      },
      fontFamily: {
        display: ["var(--font-special-elite)", "serif"],
        data: ["var(--font-dm-mono)", "monospace"],
        stat: ["var(--font-bebas-neue)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "header": "var(--header-height)",
        "footer": "var(--footer-height)",
        "sidebar": "var(--sidebar-width)",
      },
      maxWidth: {
        archive: "72rem",
        dossier: "28rem",
      },
      minHeight: {
        touch: "var(--touch-min)",
      },
      borderRadius: {
        stamp: "var(--radius-sm)",
      },
      transitionDuration: {
        panel: "300ms",
      },
    },
  },
  plugins: [],
};
export default config;
