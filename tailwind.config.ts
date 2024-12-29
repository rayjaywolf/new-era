import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-variant': 'var(--primary-variant)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        error: 'var(--error)',
        'on-primary': 'var(--on-primary)',
        'on-secondary': 'var(--on-secondary)',
        'on-background': 'var(--on-background)',
        'on-surface': 'var(--on-surface)',
        'on-error': 'var(--on-error)',
        'surface-1': 'var(--surface-1dp)',
        'surface-2': 'var(--surface-2dp)',
        'surface-3': 'var(--surface-3dp)',
        'surface-4': 'var(--surface-4dp)',
        'surface-6': 'var(--surface-6dp)',
        'surface-8': 'var(--surface-8dp)',
        'surface-12': 'var(--surface-12dp)',
        'surface-16': 'var(--surface-16dp)',
        'surface-24': 'var(--surface-24dp)',
        'surface-hover': 'var(--surface-hover)',
        'surface-selected': 'var(--surface-selected)',
        'surface-pressed': 'var(--surface-pressed)',
        'surface-disabled': 'var(--surface-disabled)',
        'on-surface-disabled': 'var(--on-surface-disabled)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
