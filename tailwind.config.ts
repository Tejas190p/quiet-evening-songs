import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { cream: '#FAF7FF', sage: '#DCCDF3', rose: '#EBDDF7', taupe: '#7A5CA8', ink: '#2E1F4A' },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'], serif: ['var(--font-serif)', 'var(--font-kr)', 'Georgia', 'serif'] },
      boxShadow: { warm: '0 10px 40px -12px rgba(122,92,168,0.35)' },
      animation: { 'spin-slow': 'spin 6s linear infinite' },
    },
  },
  plugins: [],
} satisfies Config;
