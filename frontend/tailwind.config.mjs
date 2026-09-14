export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          surface: '#ffffff',
          subtle: '#f4f4f5',
          border: '#e4e4e7',
          line: '#cbd5e1',
          accent: '#09090b',
          alert: '#ef4444',
          warning: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
