import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        geologica: ['var(--font-geologica)', 'sans-serif'],
      },
      colors: {
        cream: '#FFFCF8',
        ink: '#0A0A0A',
        orange: '#FE6D2C',
        blue: '#3653D4',
        green: '#568920',
      },
    },
  },
  plugins: [],
};

export default config;
