import type { Config } from 'tailwindcss';

/**
 * Dark OmdaFit palette with a sharp red action colour.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        paper: '#ffffff',
        // Brand accent — driven by the --brand-rgb CSS variable (set from
        // SITE.brandRgb in the root layout), so `bg-blood`/`text-blood` re-skin
        // with a single value change in lib/site.ts.
        blood: 'rgb(var(--brand-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 22s linear infinite',
        'marquee-slow': 'marquee 55s linear infinite',
        'marquee-rev': 'marqueeReverse 60s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
