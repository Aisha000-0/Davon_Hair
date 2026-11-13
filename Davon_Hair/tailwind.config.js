/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080808',
        charcoal: '#151515',
        slate: '#1E1E1E',
        gold: '#D4AF37',
        champagne: '#F1D78A',
        smoke: '#A3A3A3',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.22em',
        wide2: '0.14em',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.35), 0 20px 60px -30px rgba(212,175,55,0.35)',
        card: '0 30px 60px -40px rgba(0,0,0,0.9)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fadeIn 0.9s ease both',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
