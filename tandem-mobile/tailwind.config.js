const tokens = require('./src/shared/constants/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-primary-50',
    'bg-primary-600',
    'border-primary-200',
    'bg-secondary-50',
    'bg-secondary-600',
    'border-secondary-200',
    'bg-neutral-500',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        nanum: ['NanumMyeongjo-Regular'],
      },
      colors: tokens,
    },
  },
  plugins: [],
};
