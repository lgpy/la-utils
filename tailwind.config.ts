import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--lavender))",
        input: "hsl(var(--pink))",
        ring: "hsl(var(--blue))",
        background: "hsl(var(--base))",
        background2: "hsl(var(--crust))",
        foreground: "hsl(var(--text))",
        primary: {
          DEFAULT: "hsl(var(--mauve))",
          foreground: "hsl(var(--base))",
        },
        secondary: {
          DEFAULT: "hsl(var(--pink))",
          foreground: "hsl(var(--base))",
        },
        destructive: {
          DEFAULT: "hsl(var(--red))",
          foreground: "hsl(var(--base))",
        },
        muted: {
          DEFAULT: "hsl(var(--crust))",
          foreground: "hsl(var(--subtext0))",
        },
        accent: {
          DEFAULT: "hsl(var(--surface2))",
          foreground: "hsl(var(--text))",
        },
        popover: {
          DEFAULT: "hsl(var(--base))",
          foreground: "hsl(var(--text))",
        },
        card: {
          DEFAULT: "hsl(var(--surface0))",
          foreground: "hsl(var(--text))",
        },
        success: {
          DEFAULT: "hsl(var(--green))",
          foreground: "hsl(var(--base))",
        },

        rosewater: "hsl(var(--rosewater))",
        flamingo: "hsl(var(--flamingo))",
        pink: "hsl(var(--pink))",
        mauve: "hsl(var(--mauve))",
        red: "hsl(var(--red))",
        maroon: "hsl(var(--maroon))",
        peach: "hsl(var(--peach))",
        yellow: "hsl(var(--yellow))",
        green: "hsl(var(--green))",
        teal: "hsl(var(--teal))",
        sky: "hsl(var(--sky))",
        sapphire: "hsl(var(--sapphire))",
        blue: "hsl(var(--blue))",
        lavender: "hsl(var(--lavender))",
        text: "hsl(var(--text))",
        subtext1: "hsl(var(--subtext1))",
        subtext0: "hsl(var(--subtext0))",
        overlay2: "hsl(var(--overlay2))",
        overlay1: "hsl(var(--overlay1))",
        overlay0: "hsl(var(--overlay0))",
        surface2: "hsl(var(--surface2))",
        surface1: "hsl(var(--surface1))",
        surface0: "hsl(var(--surface0))",
        base: "hsl(var(--base))",
        mantle: "hsl(var(--mantle))",
        crust: "hsl(var(--crust))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradient: {
          to: { "background-position": "200% center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "gradient 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
