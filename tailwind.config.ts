import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        slateText: "#475467",
        line: "#d9e2f2",
        paper: "#ffffff",
        mist: "#f6f9ff",
        blueCore: "#1d4ed8",
        blueElectric: "#2563eb",
        violetCore: "#6d5efc",
        greenSoft: "#16a34a",
        coral: "#f9735b",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(31, 78, 121, 0.12)",
        panel: "0 10px 30px rgba(16, 24, 40, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
