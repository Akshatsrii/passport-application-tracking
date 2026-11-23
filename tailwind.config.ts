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
        india: {
          saffron: "#FF9933",
          navy: "#000080",
          green: "#138808",
          sky: "#0284c7"
        }
      },
    },
  },
  plugins: [],
};
export default config;
