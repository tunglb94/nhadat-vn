import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:   "#EFF6FF",
          100:  "#DBEAFE",
          200:  "#BFDBFE",
          300:  "#93C5FD",
          400:  "#60A5FA",
          500:  "#3B82F6",
          600:  "#2563EB",
          700:  "#1D4ED8",
          800:  "#1E40AF",
          900:  "#1E3A8A",
          dark: "#0F172A",
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0zM0 0h20v20H0V0z' fill='%232563eb' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        'hero-gradient': "linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)",
      },
      boxShadow: {
        soft:  "0 4px 20px -2px rgba(0,0,0,0.05)",
        card:  "0 10px 40px -10px rgba(0,0,0,0.08)",
        fab:   "0 10px 40px -10px rgba(37,99,235,0.50)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
    },
  },
  plugins: [],
};

export default config;