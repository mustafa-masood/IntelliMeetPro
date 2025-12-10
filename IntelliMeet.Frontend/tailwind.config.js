/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text-primary': '#061b16',
        'text-secondary': '#2b3d39',
        'text-tertiary': '#5d6b68',
        'text-white': '#ffffff',
        'text-disable': '#c1c6c5',
        'bg-surface-pure': '#ffffff',
        'bg-surface-lv1': '#f5f6f6',
        'bg-surface-alpha-90': 'rgba(255, 255, 255, 0.8)',
        'stroke-primary': '#e8f2f2',
        'stroke-secondary': '#dadddc',
        'primary-500': '#16a34a',
        'primary-50': '#e8f6ed',
        'neutral-900': '#061b16',
        'neutral-700': '#243632',
        'neutral-400': '#5d6b68',
        'neutral-300': '#c1c6c5',
        'orange-500': '#ea580c',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'inter-tight': ['Inter Tight', 'sans-serif'],
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '6px',
        '12': '12px',
      },
      borderRadius: {
        '4': '4px',
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        'full': '360px',
      },
      boxShadow: {
        'xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'card': '0px 1px 2px 0px rgba(9, 25, 72, 0.13)',
      },
    },
  },
  plugins: [],
}

