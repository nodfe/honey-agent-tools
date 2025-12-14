export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Tailwind CSS 4 配置
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          // 动画名称映射
          keyframes: {
            'accordion-down': {
              from: { height: '0' },
              to: { height: 'var(--radix-accordion-content-height)' },
            },
            'accordion-up': {
              from: { height: 'var(--radix-accordion-content-height)' },
              to: { height: '0' },
            },
          },
        },
      },
    },
    autoprefixer: {},
  },
}
