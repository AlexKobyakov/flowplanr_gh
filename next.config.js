/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем статический экспорт для GitHub Pages
  output: 'export',
  
  // Отключаем оптимизацию изображений для статического экспорта
  images: {
    unoptimized: true
  },

  // Настройка для вашего репозитория flowplanr_gh
  basePath: process.env.NODE_ENV === 'production' ? '/flowplanr_gh' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/flowplanr_gh' : '',
  
  // Настройки для GitHub Pages
  trailingSlash: true,
  
  // Отключаем проверки при билде (для быстрого деплоя)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Оптимизация для продакшена
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig