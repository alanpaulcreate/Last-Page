import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F0",
        "blue-lines": "#BFD7FF",
        "red-margin": "#FF6B6B",
        ink: "#1F4E79",
        pencil: "#2D2D2D",
        highlight: "#FFF3B0",
        "ink-light": "#2D6BA0",
        "paper-dark": "#EDE9DC",
      },
      fontFamily: {
        hand: ["Caveat", "cursive"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "notebook-lines": `repeating-linear-gradient(
          transparent 0px,
          transparent 27px,
          #BFD7FF 27px,
          #BFD7FF 28px
        )`,
      },
      boxShadow: {
        card: "3px 3px 0px #BFD7FF, 6px 6px 0px rgba(191,215,255,0.4)",
        "card-hover": "6px 10px 0px #BFD7FF, 10px 14px 0px rgba(191,215,255,0.3)",
        sticky: "4px 4px 8px rgba(0,0,0,0.15)",
        "sticky-hover": "8px 12px 16px rgba(0,0,0,0.2)",
        sketch: "2px 2px 0px #1F4E79",
      },
      keyframes: {
        paperLift: {
          "0%": { transform: "translateY(0) rotate(var(--card-rot, -1deg))" },
          "100%": { transform: "translateY(-8px) rotate(var(--card-rot, -1deg)) scale(1.02)" },
        },
        scribble: {
          "0%": { "stroke-dashoffset": "100" },
          "100%": { "stroke-dashoffset": "0" },
        },
        starBurst: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1.5) rotate(45deg)", opacity: "0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "paper-lift": "paperLift 0.2s ease forwards",
        "star-burst": "starBurst 0.6s ease forwards",
        wiggle: "wiggle 0.3s ease",
        "fade-in-up": "fadeInUp 0.4s ease forwards",
        "bounce-slow": "bounce 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
