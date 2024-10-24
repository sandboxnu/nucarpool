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
        "busy-red": "#FFA9A9",
        "okay-yellow": "#FFCB11",
        "good-green": "#C7EFB3",
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

    // ...
  ],
};
