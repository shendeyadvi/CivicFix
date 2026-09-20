/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#081220',
        darkSlate: {
          950: '#060E1A',
          900: '#081220',
          850: '#0B192C',
          800: '#0F1E33',
          750: '#132238',
          700: '#162846',
          600: '#1E355B',
          500: '#2A4A7F',
          400: '#47699F',
        },
        deepTeal: {
          950: '#042120',
          900: '#042F2E',
          800: '#064E3B',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
        },
        sageGreen: {
          900: '#2D3E35',
          800: '#3D5247',
          700: '#52796F',
          600: '#6B9080',
          500: '#84A98C',
          400: '#A4C3B2',
          300: '#CCE3DE',
        },
        softMint: {
          900: '#064E3B',
          700: '#047857',
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
          200: '#A7F3D0',
          100: '#D1FAE5',
          50: '#ECFDF5',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 35px -5px rgba(13, 148, 136, 0.35)',
        'glow-mint': '0 0 30px -5px rgba(110, 231, 183, 0.25)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(13, 148, 136, 0.15)',
        'subtle': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
