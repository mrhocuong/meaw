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
        plum: {
          DEFAULT: "#4C082A",
          dark: "#35051D",
          light: "#6E1340",
        },
        cream: {
          DEFAULT: "#F5EDD8",
          light: "#FAF5E8",
          pure: "#FFFBF2",
          dark: "#E8DEC3",
        },
        mint: "#BAE6CC",
        emeraldSou: "#00B389",
        sun: "#F8E25D",
        coral: "#FF623E",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
