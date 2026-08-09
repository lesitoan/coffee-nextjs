import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#a37c68",
          600: "#8c604b",
          700: "#6b4736",
          800: "#4a3023",
          900: "#2b1b13"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Arial", "Helvetica", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"]
      }
    }
  },
  plugins: [typography]
};

export default config;
