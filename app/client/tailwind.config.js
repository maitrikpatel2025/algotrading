/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        // Precision Swiss Neutral Scale
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Primary Blue
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          foreground: '#FFFFFF',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#CA8A04',
          light: '#FEF9C3',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          foreground: '#FFFFFF',
        },
        // Trading-specific
        profit: '#16A34A',
        loss: '#DC2626',
        // Legacy mappings for compatibility
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#2563EB',
        background: '#FAFAFA',
        foreground: '#171717',
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#404040',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#737373',
        },
        accent: {
          DEFAULT: '#EFF6FF',
          foreground: '#2563EB',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#171717',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#171717',
        },
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      spacing: {
        // 8px grid system
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      keyframes: {
        "price-flash": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(37, 99, 235, 0.1)" },
          "100%": { backgroundColor: "transparent" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "price-flash": "price-flash 250ms ease-out",
        "slide-in": "slide-in 300ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
}
