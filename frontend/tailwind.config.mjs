export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          green: '#00ff66',
          dark: '#030d07',
          panel: '#07160d',
          border: '#0d381e',
          grid: '#0a2a16',
          alert: '#ff2a4b',
          warning: '#ffb300'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
