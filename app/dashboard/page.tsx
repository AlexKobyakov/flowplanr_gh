'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JournalEntry } from '@/components/journal/JournalEntry'
import { EntryHistory } from '@/components/journal/EntryHistory'
import { SmartExport } from '@/components/export/SmartExport'
import { LogOut, Calendar, Brain, FileText, User, TrendingUp } from 'lucide-react'
import { authUtils, entryStorage, userStorage, JournalEntry as JournalEntryType, User as UserType } from '@/lib/storage'
import { getDateKey } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [entries, setEntries] = useState<JournalEntryType[]>([])
  const [todayEntry, setTodayEntry] = useState<JournalEntryType | null>(null)
  const [activeTab, setActiveTab] = useState('today')
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка данных пользователя
  useEffect(() => {
    const user = userStorage.getCurrentUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setCurrentUser(user)
    loadUserData(user.id)
    setIsLoading(false)
  }, [router])

  const loadUserData = (userId: string) => {
    // Загружаем все записи пользователя
    const userEntries = entryStorage.getEntries(userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    setEntries(userEntries)

    // Ищем запись на сегодня
    const today = getDateKey(new Date())
    const existingTodayEntry = entryStorage.getEntryByDate(userId, today)
    setTodayEntry(existingTodayEntry)
  }

  const handleLogout = () => {
    authUtils.logout()
    router.push('/')
  }

  const refreshData = () => {
    if (currentUser) {
      loadUserData(currentUser.id)
    }
  }

  // Вычисляем статистику
  const calculateStats = () => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        streak: 0,
        thisWeekEntries: 0,
        avgCompletionRate: 0
      }
    }

    // Серия дней
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateKey = getDateKey(checkDate)
      
      const hasEntry = entries.some(entry => entry.date === dateKey)
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Записи на этой неделе
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    
    const thisWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart
    }).length

    // Средний процент выполнения
    let totalTasks = 0
    let totalCompleted = 0
    
    entries.forEach(entry => {
      const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim().length > 0)
      const completed = (entry.completed || '').split('\n').filter(t => t.trim().length > 0)
      
      totalTasks += tasks.length
      totalCompleted += completed.length
    })
    
    const avgCompletionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

    return {
      totalEntries: entries.length,
      streak,
      thisWeekEntries,
      avgCompletionRate
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка дашборда...</div>
      </div>
    )
  }

  if (!currentUser) {
    return null // Редирект происходит в useEffect
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📝 FlowPlanr
              </h1>
              <p className="text-gray-600">
                Добро пожаловать, <span className="font-medium">{currentUser.name || currentUser.email}</span>!
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div className="stat-card bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
                <div className="text-xs text-gray-600">Всего записей</div>
              </div>
              <div className="stat-card bg-green-50">
                <div className="text-2xl font-bold text-green-600">{stats.streak}</div>
                <div className="text-xs text-gray-600">Дней подряд</div>
              </div>
              <div className="stat-card bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">{stats.thisWeekEntries}</div>
                <div className="text-xs text-gray-600">На этой неделе</div>
              </div>
              <div className="stat-card bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">{stats.avgCompletionRate}%</div>
                <div className="text-xs text-gray-600">Выполнение</div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Пользователь</span>
                </div>
                <p className="font-medium text-sm">{currentUser.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 btn-hover"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Выход</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1 inline-flex">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="today" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Сегодня
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileText className="w-4 h-4" />
                История
              </TabsTrigger>
              <TabsTrigger 
                value="export"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Brain className="w-4 h-4" />
                Умный экспорт
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today">
            <div className="space-y-6">
              <JournalEntry 
                initialEntry={todayEntry} 
                selectedDate={new Date()}
              />
              
              {/* Refresh Button */}
              <div className="text-center">
                <Button 
                  onClick={refreshData}
                  variant="outline"
                  className="btn-hover"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Обновить данные
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <EntryHistory 
              entries={entries}
              onSelectEntry={(entry) => {
                // Можно добавить функцию редактирования конкретной записи
                setActiveTab('today')
              }}
            />
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-6">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    🧠 Умный экспорт для Claude AI
                  </h2>
                  <p className="text-gray-600">
                    Получите персональные рекомендации по продуктивности на основе ваших записей
                  </p>
                </div>
                
                <SmartExport entries={entries} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Tips for New Users */}
        {entries.length === 0 && (
          <div className="mt-8 bg-amber-50/90 backdrop-blur-lg border border-amber-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
              💡 Советы для начала
            </h3>
            <ul className="text-amber-700 space-y-2 text-sm">
              <li>• Начните с заполнения приоритетных задач дня в разделе "Сегодня"</li>
              <li>• Записывайте не только планы, но и результаты выполнения</li>
              <li>• Фиксируйте сложности и блокеры — это поможет найти паттерны</li>
              <li>• Ведите записи регулярно для получения качественного AI-анализа</li>
              <li>• Через неделю записей попробуйте "Умный экспорт" для анализа</li>
            </ul>
          </div>
        )}

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50/90 backdrop-blur-lg border border-blue-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            🚀 Демо версия FlowPlanr
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• Все данные сохраняются локально в вашем браузере</p>
            <p>• Полностью бесплатно, без ограничений</p>
            <p>• Умный экспорт работает без внешних API</p>
            <p>• Готово к интеграции с Claude AI</p>
          </div>
        </div>
      </div>
    </div>
  )
}