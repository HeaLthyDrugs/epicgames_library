/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['var(--font-roboto)', 'sans-serif'],
      },
      colors: {
        epic: {
          blue: '#0074e4',
          darkBlue: '#0060ba',
          darkGray: '#121212',
          gray: '#2a2a2a',
          lightGray: '#202020',
        },
      },
    },
  },
  plugins: [],
}; 