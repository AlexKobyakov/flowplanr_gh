'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Brain, Download, Copy, BarChart3, TrendingUp, Target, Lightbulb, CheckCircle } from 'lucide-react'
import { JournalEntry, userStorage } from '@/lib/storage'
import { ExportGenerator } from '@/lib/export-generator'

interface SmartExportProps {
  entries: JournalEntry[]
}

type ExportType = 'productivity' | 'blockers' | 'insights' | 'planning' | 'trends'

export function SmartExport({ entries }: SmartExportProps) {
  const [selectedType, setSelectedType] = useState<ExportType>('productivity')
  const [exportData, setExportData] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [isGenerating, setIsGenerating] = useState(false)

  const exportTypes = [
    {
      id: 'productivity' as ExportType,
      title: 'Анализ продуктивности',
      description: 'Общий обзор эффективности и выполнения задач',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      id: 'blockers' as ExportType,
      title: 'Анализ блокеров',
      description: 'Выявление препятствий и способов их решения',
      icon: Target,
      color: 'text-red-600'
    },
    {
      id: 'insights' as ExportType,
      title: 'Развитие инсайтов',
      description: 'Углубление понимания и практические применения',
      icon: Lightbulb,
      color: 'text-yellow-600'
    },
    {
      id: 'planning' as ExportType,
      title: 'Оптимизация планирования',
      description: 'Улучшение процессов и структуры работы',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'trends' as ExportType,
      title: 'Анализ трендов',
      description: 'Динамика изменений и рекомендации',
      icon: Brain,
      color: 'text-purple-600'
    }
  ]

  useEffect(() => {
    generateExport()
  }, [selectedType, entries])

  const generateExport = async () => {
    if (entries.length === 0) {
      setExportData('Недостаточно данных для экспорта. Ведите дневник несколько дней, чтобы получить качественный анализ.')
      return
    }

    setIsGenerating(true)

    try {
      // Имитируем обработку данных
      await new Promise(resolve => setTimeout(resolve, 1000))

      const userStats = ExportGenerator.generateUserStats(entries)
      const analysis = ExportGenerator.generateAnalysis(entries)
      const prompts = ExportGenerator.generateSmartPrompts({ user: userStats, analysis, entries })

      let exportText = ''

      // Генерируем экспорт в зависимости от типа
      switch (selectedType) {
        case 'productivity':
          exportText = `=== АНАЛИЗ ПРОДУКТИВНОСТИ ===

Период анализа: ${userStats.dateRange}
Всего записей: ${userStats.totalEntries}
Серия ведения дневника: ${userStats.streakDays} дней
Среднее задач в день: ${userStats.avgTasksPerDay}
Процент выполнения: ${analysis.completionRate}%

Самые продуктивные дни: ${analysis.mostProductiveDays.join(', ')}
Основные вызовы: ${analysis.topChallenges.join(', ')}
Тренд: ${analysis.trendAnalysis}

=== ПРОМПТ ДЛЯ CLAUDE ===

${prompts.productivity}

=== ИНСТРУКЦИЯ ===
Скопируйте промпт выше и отправьте Claude AI для получения персонального анализа продуктивности.`
          break

        case 'blockers':
          exportText = `=== АНАЛИЗ БЛОКЕРОВ ===

Период анализа: ${userStats.dateRange}
Повторяющиеся паттерны блокеров:
${analysis.blockerPatterns.map(pattern => `• ${pattern}`).join('\n')}

Основные сложности:
${analysis.topChallenges.map(challenge => `• ${challenge}`).join('\n')}

=== ПРОМПТ ДЛЯ CLAUDE ===

${prompts.blockers}

=== ДЕТАЛЬНЫЕ ЗАПИСИ О СЛОЖНОСТЯХ ===

${entries.slice(0, 5).map(entry => {
  const date = new Date(entry.date).toLocaleDateString('ru-RU')
  let text = `📅 ${date}\n`
  if (entry.difficulties) text += `🚧 Сложности: ${entry.difficulties}\n`
  if (entry.blockers) text += `🔧 Блокеры: ${entry.blockers}\n`
  return text
}).join('\n---\n')}

=== ИНСТРУКЦИЯ ===
Скопируйте промпт и отправьте Claude для анализа блокеров и рекомендаций по их преодолению.`
          break

        case 'insights':
          exportText = `=== РАЗВИТИЕ ИНСАЙТОВ ===

Период анализа: ${userStats.dateRange}
Ключевые темы инсайтов: ${analysis.insightKeywords.join(', ')}

=== ПРОМПТ ДЛЯ CLAUDE ===

${prompts.insights}

=== КОЛЛЕКЦИЯ ИНСАЙТОВ ===

${entries.filter(entry => entry.insights).slice(0, 10).map(entry => {
  const date = new Date(entry.date).toLocaleDateString('ru-RU')
  return `📅 ${date}\n💡 ${entry.insights}`
}).join('\n\n---\n\n')}

=== ИНСТРУКЦИЯ ===
Отправьте промпт Claude для углубления ваших инсайтов и получения практических рекомендаций.`
          break

        case 'planning':
          exportText = `=== ОПТИМИЗАЦИЯ ПЛАНИРОВАНИЯ ===

Статистика планирования:
• Среднее задач в день: ${userStats.avgTasksPerDay}
• Процент выполнения: ${analysis.completionRate}%
• Самые продуктивные дни: ${analysis.mostProductiveDays.join(', ')}
• Серия ведения дневника: ${userStats.streakDays} дней

=== ПРОМПТ ДЛЯ CLAUDE ===

${prompts.planning}

=== ПРИМЕРЫ ПЛАНИРОВАНИЯ ===

${entries.slice(0, 3).map(entry => {
  const date = new Date(entry.date).toLocaleDateString('ru-RU')
  let text = `📅 ${date}\n`
  if (entry.priorityA) text += `🚀 Приоритеты: ${entry.priorityA}\n`
  if (entry.dailyTasks) text += `📋 Задачи: ${entry.dailyTasks}\n`
  if (entry.completed) text += `✅ Выполнено: ${entry.completed}\n`
  if (entry.tomorrowFocus) text += `🎯 Завтра: ${entry.tomorrowFocus}\n`
  return text
}).join('\n---\n')}

=== ИНСТРУКЦИЯ ===
Используйте промпт для получения рекомендаций по улучшению планирования и структуры работы.`
          break

        case 'trends':
          exportText = `=== АНАЛИЗ ТРЕНДОВ ===

Период анализа: ${userStats.dateRange}
Динамика: ${analysis.trendAnalysis}
Процент выполнения: ${analysis.completionRate}%

=== ПРОМПТ ДЛЯ CLAUDE ===

${prompts.trends}

=== ХРОНОЛОГИЯ ЗАПИСЕЙ ===

${entries.slice(0, 7).map(entry => {
  const date = new Date(entry.date).toLocaleDateString('ru-RU')
  const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim()).length
  const completed = (entry.completed || '').split('\n').filter(t => t.trim()).length
  const completionRate = tasks > 0 ? Math.round((completed / tasks) * 100) : 0
  
  return `📅 ${date} | Задач: ${tasks} | Выполнено: ${completed} | ${completionRate}%`
}).join('\n')}

=== ИНСТРУКЦИЯ ===
Отправьте промпт для анализа ваших трендов и получения стратегических рекомендаций.`
          break
      }

      setExportData(exportText)
    } catch (error) {
      setExportData('Ошибка при генерации экспорта. Попробуйте еще раз.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
    }
  }

  const handleDownload = () => {
    const currentUser = userStorage.getCurrentUser()
    const filename = `flowplanr-${selectedType}-${new Date().toISOString().split('T')[0]}.txt`
    
    const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Недостаточно данных</h3>
        <p className="text-gray-600 mb-6">
          Ведите дневник несколько дней, чтобы получить качественный анализ от Claude AI.
        </p>
        <p className="text-sm text-gray-500">
          Рекомендуется минимум 3-5 записей для получения полезных инсайтов.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Type Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportTypes.map(type => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left btn-hover ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${type.color}`} />
              <h3 className="font-semibold text-gray-800 mb-1">{type.title}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          )
        })}
      </div>

      {/* Export Result */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {exportTypes.find(t => t.id === selectedType)?.title}
          </h3>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="btn-hover"
              disabled={!exportData || isGenerating}
            >
              {copyStatus === 'copied' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="btn-hover"
              disabled={!exportData || isGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать
            </Button>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Генерируем умный экспорт...</p>
            </div>
          </div>
        ) : (
          <Textarea
            value={exportData}
            readOnly
            className="min-h-[400px] font-mono text-sm custom-scrollbar export-data"
            placeholder="Здесь появится сгенерированный экспорт..."
          />
        )}

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Как использовать:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Скопируйте текст из поля выше</li>
            <li>2. Откройте Claude AI в новой вкладке</li>
            <li>3. Вставьте скопированный промпт</li>
            <li>4. Получите персональные рекомендации!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}