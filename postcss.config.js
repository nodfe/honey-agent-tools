export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Tailwind CSS 4配置
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            danger: '#ef4444',
            success: '#10b981',
          },
        },
      },
    },
    autoprefixer: {},
  },
}
