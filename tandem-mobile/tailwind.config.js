const tokens = require('./src/shared/constants/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // primary (teal) — shell
    'bg-primary-50', 'bg-primary-600', 'border-primary-200',
    // secondary (plum) — people
    'bg-secondary-50', 'bg-secondary-600', 'border-secondary-200',
    // cranberry (now tangerine) — accent / strain
    'bg-cranberry-50', 'bg-cranberry-200', 'bg-cranberry-500', 'bg-cranberry-700',
    'border-cranberry-200',
    'text-cranberry-600', 'text-cranberry-500', 'text-cranberry-300', 'text-cranberry-800',
    // evergreen — task actions
    'bg-evergreen-600', 'border-evergreen-600', 'bg-evergreen-50',
    // error — danger/validation
    'bg-error-50', 'bg-error-100', 'border-error-200', 'text-error-600', 'text-error-500',
    'border-error-600',
    // evergreen text (used in TaskDetailScreen done state)
    'text-evergreen-600',
    // neutral
    'bg-neutral-300', 'bg-neutral-500',
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
