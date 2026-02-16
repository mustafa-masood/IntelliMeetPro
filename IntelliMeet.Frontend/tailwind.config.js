/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        'text-primary': '#061b16',
        'text-secondary': '#2b3d39',
        'text-tertiary': '#5d6b68',
        'text-white': '#ffffff',
        'text-disable': '#c1c6c5',
        'bg-surface-pure': '#ffffff',
        'bg-surface-lv1': '#f5f6f6',
        'bg-surface-lv2': '#f0f1f1',
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
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],   // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['clamp(1.25rem, 2vw + 0.5rem, 1.5rem)', { lineHeight: '2rem' }], // Responsive
        '3xl': ['clamp(1.5rem, 3vw + 0.5rem, 2rem)', { lineHeight: '2.5rem' }],   // Responsive
      },
      spacing: {
        '0': '0px',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },
      borderRadius: {
        '4': '4px',
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        'card': '0px 1px 2px 0px rgba(9, 25, 72, 0.13)',
        'lg': '0px 12px 40px 1px rgba(0, 0, 0, 0.06)',
      },
      maxWidth: {
        'container': '1440px',
        'content': '1106px',
        'sidebar': '270px',
        'sidebar-right': '350px',
      },
    },
  },
  plugins: [],
}

