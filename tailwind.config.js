/** @type {import('tailwindcss').Config} */
/**
 * TODO: add theme to follow the branding rules of Northeastern
 * https://brand.northeastern.edu/visual-design/typography/
 */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "northeastern-red": "#C8102E",
        "light-red": "#FFE6E6",
        "busy-red": "#FFA9A9",
        "okay-yellow": "#FFCB11",
        "good-green": "#C7EFB3",
      },
      keyframes: {
        gradientShift: {
          "0%": {
            backgroundSize: "100% 100%, 120% 120%",
          },
          "25%": {
            backgroundSize: "110%% 110%%, 110%% 110%",
          },
          "50%": {
            backgroundSize: "120% 120%, 100% 100%",
          },
          "75%": {
            backgroundSize: "110%% 110%, 110% 110%",
          },
          "100%": {
            backgroundSize: "100% 100%, 120% 120%",
          },
        },
      },
      animation: {
        "gradient-shift-15s": "gradientShift 15s ease-in-out infinite",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        lato: ["Lato", "sans-serif"],
      },
      backgroundImage: {
        floaty:
          "radial-gradient(ellipse 100% 80% at -10% 110% , #C8102E, #FFA9A9, transparent)," +
          "radial-gradient(ellipse 70% 100% at 110% -10% , #C8102E, #FFA9A9, white )",
      },
    },
    screens: {
      sm: "576px",
      // => @media (min-width: 576px) { ... }

      // ipad 14 size
      md: "834px",
      // => @media (min-width: 834px) { ... }

      lg: "1440px",
      // => @media (min-width: 1440px) { ... }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar")({
      nocompatible: true,
      preferredStrategy: "pseudoelements",
    }),
  ],
};
