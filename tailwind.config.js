/** @type {import('tailwindcss').Config} */
export default {
  experimental: {
    containerQueries: true,
  },
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xl2: "1250px",
      },


      keyframes: {
        blinkZoom: {
          '0%': { transform: 'scale(1)', backgroundColor: '#FF161A' },
          '50%': { transform: 'scale(1.1)', backgroundColor: '#ff4d50' },
          '100%': { transform: 'scale(1)', backgroundColor: '#FF161A' },
        }
      },

        animation: {
        blinkZoom: 'blinkZoom 1s ease-in-out infinite',
      },


      fontFamily: {
        sans: [
          "IBMPlexSans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "20%": { transform: "rotate(2deg)" },
          "40%": { transform: "rotate(-2deg)" },
          "60%": { transform: "rotate(2deg)" },
          "80%": { transform: "rotate(-1deg)" },
        },
        slideInDown: {
          "0%": { transform: "translate(-50%, -20px)", opacity: 0 },
          "100%": { transform: "translate(-50%, 0)", opacity: 1 },
        },
        slideOutUp: {
          "0%": { transform: "translate(-50%, 0)", opacity: 1 },
          "100%": { transform: "translate(-50%, -20px)", opacity: 0 },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        breatheColor: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.3)" },
        },
        flashHighlight: {
          "0%": { backgroundColor: "rgba(255, 255, 0, 0.4)" },
          "100%": { backgroundColor: "rgba(255, 255, 0, 0)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.8s ease-in-out",
        slideInDown: "slideInDown 0.4s ease-out",
        slideOutUp: "slideOutUp 0.5s ease-in",
        "fade-in": "fadeIn 0.3s ease-in-out",
        breathe: "breathe 1s ease-in-out infinite",
        breatheColor: "breatheColor 1s ease-in-out infinite",
        "flash-highlight": "flashHighlight 1s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
  variants: {
    extend: {},
  },
  corePlugins: {},
  utilities: {
    ".scrollbar-hide": {
      /* Firefox */
      "scrollbar-width": "none",
      /* Safari and Chrome */
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
};
