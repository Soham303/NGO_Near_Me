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
        primary: {
          DEFAULT: "#2E7D32",
          hover: "#1B5E20",
          light: "#E8F5E9",
          border: "#A5D6A7",
          subtle: "#F1F8F4",
        },
        accent: {
          DEFAULT: "#F57C00",
          hover: "#E65100",
          light: "#FFF3E0",
        },
        urgency: {
          green: "#2E7D32",
          amber: "#F9A825",
          red: "#C62828",
        },
        neutral: {
          text: "#1F2933",
          muted: "#667085",
          border: "#E4E7EC",
          bg: "#FAFAF7",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(31, 41, 51, 0.08)",
        floating: "0 12px 32px -4px rgba(31, 41, 51, 0.14)",
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
