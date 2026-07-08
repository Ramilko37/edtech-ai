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
        ink: "#06141f",
        slateText: "#5f7183",
        line: "#c9d8df",
        paper: "#ffffff",
        mist: "#edf5f7",
        blueCore: "#08799a",
        blueElectric: "#29c8f2",
        violetCore: "#5b6ff0",
        greenSoft: "#28d6a3",
        coral: "#ffb14a",
        deep: "#07111c",
        tealDeep: "#07323b",
        cyanGlow: "#31d7ff",
        amberSignal: "#ffc64a",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(2, 20, 31, 0.18)",
        panel: "0 14px 36px rgba(2, 20, 31, 0.12)",
        glow: "0 0 40px rgba(49, 215, 255, 0.28)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
