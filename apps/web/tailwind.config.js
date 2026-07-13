/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          900: '#831843',
        },
      },
      backgroundImage: {
        'gradient-pink-purple': 'linear-gradient(135deg, #ec4899, #a855f7)',
        'gradient-pink-purple-hover': 'linear-gradient(135deg, #db2777, #9333ea)',
        'gradient-active-nav': 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))',
        'gradient-logo': 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
        'gradient-avatar': 'linear-gradient(135deg, #ec4899, #a855f7)',
        'gradient-feminine': 'linear-gradient(135deg, #1a0533 0%, #2d0a4e 30%, #3d0f3f 60%, #1f0a2e 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.06)',
        'pink-glow': '0 8px 32px rgba(236,72,153,0.12)',
      },
    },
  },
  plugins: [],
};
