/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // enables dark mode using `.dark` class
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Light and dark brand palette
          primary: {
            light: '#818cf8',
            DEFAULT: '#6366f1',
            dark: '#4f46e5',
          },
          secondary: '#22d3ee',
          accent: '#f472b6',
  
          // Custom background & glass colors
          darkBg: '#0f172a', // 👈 This is what fixes the error
          glass: 'rgba(255, 255, 255, 0.1)', 
        },
        boxShadow: {
          glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
          glow: '0 0 10px rgba(99, 102, 241, 0.6)',
        },
        backdropBlur: {
          xs: '2px',
          sm: '4px',
          md: '8px',
          lg: '12px',
          xl: '16px',
          '2xl': '24px',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        },
        animation: {
          float: 'float 6s ease-in-out infinite',
          fadeIn: 'fadeIn 1s ease-in-out forwards',
        },
      },
    },
    plugins: [],
  };
  