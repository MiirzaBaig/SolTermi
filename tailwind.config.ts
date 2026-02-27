import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "terminal-bg": "var(--terminal-bg)",
        "panel-bg": "var(--panel-bg)",
        border: "var(--border)",
        accent: "var(--accent)",
        profit: "var(--profit)",
        loss: "var(--loss)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "main-bg": "var(--terminal-bg)",
        "main-text": "var(--text-primary)",
        "main-muted": "var(--text-secondary)",
        "card-bg": "var(--panel-bg)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "IBM Plex Mono", "JetBrains Mono", "monospace"],
        sans: ["var(--font-mono)", "monospace"],
      },
      borderWidth: {
        3: "3px",
        4: "4px",
      },
      boxShadow: {
        brutal: "6px 6px 0 #000",
        "brutal-sm": "4px 4px 0 #000",
        "brutal-press": "2px 2px 0 #000",
      },
      transitionDuration: {
        smooth: "200ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
export default config;
