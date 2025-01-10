/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
        shimmer: "shimmer 5s cubic-bezier(0.17, 0.55, 0.55, 1) infinite",
        pulse: "pulse 4s ease-in-out infinite",
        "text-reveal": "text-reveal 0.5s ease-out forwards",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        pulse: {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.1" },
          "100%": { opacity: "0.4" },
        },
        "text-reveal": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
