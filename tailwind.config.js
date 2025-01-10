/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "premium-shimmer": "premium-shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "content-reveal": "content-reveal 0.5s ease-out forwards",
        "hover-glow": "hover-glow 1.5s ease-in-out infinite",
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 8s linear infinite reverse',
        'pulse-fast': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-once': 'spin-once 1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'gradient-sphere': 'gradient-sphere 8s ease-in-out infinite',
      },
      keyframes: {
        "premium-shimmer": {
          "0%": {
            backgroundPosition: "200% 0",
            opacity: "0.5",
          },
          "100%": {
            backgroundPosition: "-200% 0",
            opacity: "0.5",
          }
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            backgroundSize: "200% 200%",
          },
        },
        "content-reveal": {
          "0%": {
            opacity: "0",
            transform: "translateY(8px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "hover-glow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.85",
          },
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(-5%) scale(1.05) rotate(360deg)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0) scale(1) rotate(360deg)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg) scale(1.2)' },
          '50%': { transform: 'rotate(3deg) scale(1.1)' },
        },
        'spin-once': {
          '0%': { transform: 'rotate(12deg)' },
          '100%': { transform: 'rotate(372deg)' },
        },
        'gradient-sphere': {
          '0%, 100%': {
            transform: 'scale(1) rotate(0deg)',
          },
          '50%': {
            transform: 'scale(1.1) rotate(45deg)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
