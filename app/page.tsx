'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { LogIn, UserPlus, Brain, TrendingUp, FileText, Zap } from 'lucide-react'
import { authUtils } from '@/lib/storage'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем аутентификацию только на клиенте
    const authenticated = authUtils.isAuthenticated()
    setIsAuthenticated(authenticated)
    setIsLoading(false)
    
    if (authenticated) {
      router.push('/dashboard')
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Редирект происходит в useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🤖 FlowPlanr
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Умный рабочий дневник с экспортом для Claude AI
            </p>
            <p className="text-gray-500 mb-8">
              Структурированное ведение записей + персональная аналитика от искусственного интеллекта
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-3">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Начать бесплатно
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  <LogIn className="w-5 h-5 mr-2" />
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Features */}
        <section className="mb-12">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Структурированные записи</h3>
              <p className="text-gray-600 text-sm">
                Готовый шаблон для ведения рабочего дневника с приоритетами, сложностями и инсайтами
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <Brain className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Умный экспорт</h3>
              <p className="text-gray-600 text-sm">
                Готовые промпты для анализа вашей продуктивности в Claude AI за один клик
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Автоматическая аналитика</h3>
              <p className="text-gray-600 text-sm">
                Система автоматически выявляет паттерны в ваших записях и готовит данные для анализа
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 shadow-lg">
              <Zap className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Полностью бесплатно</h3>
              <p className="text-gray-600 text-sm">
                Без скрытых платежей, без лимитов на записи, без рекламы. Просто удобный инструмент
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Как это работает
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Ведите записи</h3>
                <p className="text-gray-600 text-sm">
                  Заполняйте структурированный дневник: приоритеты, задачи, сложности, инсайты
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Экспортируйте данные</h3>
                <p className="text-gray-600 text-sm">
                  Система подготовит персональные промпты для анализа ваших паттернов работы
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Получайте инсайты</h3>
                <p className="text-gray-600 text-sm">
                  Отправьте данные в Claude AI и получите персональные рекомендации по продуктивности
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Начните повышать продуктивность уже сегодня
            </h2>
            <p className="text-blue-100 mb-6">
              Присоединяйтесь к пользователям, которые улучшили свою работу с помощью AI-анализа
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                <UserPlus className="w-5 h-5 mr-2" />
                Создать аккаунт бесплатно
              </Button>
            </Link>
            <p className="text-blue-100 text-sm mt-4">
              Регистрация займет меньше минуты
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-white/80">
          <p className="text-sm">
            Made with ❤️ for productive people. Powered by Claude AI.
          </p>
        </footer>
      </div>
    </div>
  )
}