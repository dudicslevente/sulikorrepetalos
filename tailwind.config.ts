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
        primary: {
          50: '#fcf3f3',
          100: '#f8e4e5',
          200: '#f2cdcf',
          300: '#e8a9ad',
          400: '#da7980',
          500: '#ca525c',
          600: '#b13540',
          700: '#952631',
          800: '#861016', // The requested base color
          900: '#6f191f',
          950: '#3e090e',
        },
      },
    },
  },
  plugins: [],
};
export default config;
