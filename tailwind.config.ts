import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0b",
        panel: "#121214",
        line: "#222226",
        lime: "#b8f000",
        cyan: "#22d3ee",
        danger: "#f43f5e",
        warn: "#fbbf24",
      },
    },
  },
  plugins: [],
};
export default config;
