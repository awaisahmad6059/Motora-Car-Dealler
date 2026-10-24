/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0F',
        carbon: '#121218',
        racing: '#E10600',
        'racing-dark': '#B80500',
        gold: '#C9A227',
        mist: '#F4F4F6',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(11, 11, 15, 0.28)',
        lift: '0 26px 70px -24px rgba(11, 11, 15, 0.38)',
        glow: '0 0 0 1px rgba(225, 6, 0, 0.18), 0 20px 60px -20px rgba(225, 6, 0, 0.4)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse at 20% 40%, rgba(225,6,0,0.20), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(201,162,39,0.10), transparent 45%)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1.12)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        road: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-220px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        kenburns: 'kenburns 18s ease-out forwards',
        shimmer: 'shimmer 1.6s infinite',
        road: 'road 1.8s linear infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
