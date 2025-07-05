// Генератор умного экспорта для Claude AI

import { JournalEntry } from './storage'
import { formatDate } from './utils'

export interface UserStats {
  totalEntries: number
  dateRange: string
  streakDays: number
  avgTasksPerDay: number
  completionRate: number
}

export interface AnalysisData {
  completionRate: number
  topChallenges: string[]
  mostProductiveDays: string[]
  blockerPatterns: string[]
  insightKeywords: string[]
  trendAnalysis: string
}

export class ExportGenerator {
  
  static generateUserStats(entries: JournalEntry[]): UserStats {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        dateRange: 'Нет данных',
        streakDays: 0,
        avgTasksPerDay: 0,
        completionRate: 0
      }
    }

    const sortedEntries = entries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const firstDate = new Date(sortedEntries[0].date)
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date)
    
    const dateRange = `${formatDate(firstDate)} - ${formatDate(lastDate)}`
    
    // Подсчет серии дней
    const streakDays = this.calculateStreak(entries)
    
    // Среднее количество задач
    const totalTasks = entries.reduce((sum, entry) => {
      const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim().length > 0)
      return sum + tasks.length
    }, 0)
    const avgTasksPerDay = Math.round(totalTasks / entries.length)
    
    // Процент выполнения
    const completionRate = this.calculateCompletionRate(entries)

    return {
      totalEntries: entries.length,
      dateRange,
      streakDays,
      avgTasksPerDay,
      completionRate
    }
  }

  static generateAnalysis(entries: JournalEntry[]): AnalysisData {
    if (entries.length === 0) {
      return {
        completionRate: 0,
        topChallenges: [],
        mostProductiveDays: [],
        blockerPatterns: [],
        insightKeywords: [],
        trendAnalysis: 'Недостаточно данных для анализа'
      }
    }

    const completionRate = this.calculateCompletionRate(entries)
    const topChallenges = this.extractTopChallenges(entries)
    const mostProductiveDays = this.findProductiveDays(entries)
    const blockerPatterns = this.extractBlockerPatterns(entries)
    const insightKeywords = this.extractInsightKeywords(entries)
    const trendAnalysis = this.generateTrendAnalysis(entries)

    return {
      completionRate,
      topChallenges,
      mostProductiveDays,
      blockerPatterns,
      insightKeywords,
      trendAnalysis
    }
  }

  private static calculateStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0
    
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasEntry = sortedEntries.some(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.toDateString() === checkDate.toDateString()
      })
      
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  private static calculateCompletionRate(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0
    
    let totalTasks = 0
    let completedTasks = 0
    
    entries.forEach(entry => {
      const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim().length > 0)
      const completed = (entry.completed || '').split('\n').filter(t => t.trim().length > 0)
      
      totalTasks += tasks.length
      completedTasks += completed.length
    })
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  private static extractTopChallenges(entries: JournalEntry[]): string[] {
    const challenges: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const difficulties = entry.difficulties || ''
      const blockers = entry.blockers || ''
      
      // Простая экстракция ключевых слов
      const text = (difficulties + ' ' + blockers).toLowerCase()
      const words = text.split(/\W+/).filter(word => word.length > 3)
      
      words.forEach(word => {
        challenges[word] = (challenges[word] || 0) + 1
      })
    })
    
    return Object.entries(challenges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }

  private static findProductiveDays(entries: JournalEntry[]): string[] {
    const productiveDays: { day: string, score: number }[] = []
    
    entries.forEach(entry => {
      const date = new Date(entry.date)
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' })
      
      const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim().length > 0)
      const completed = (entry.completed || '').split('\n').filter(t => t.trim().length > 0)
      
      const score = completed.length > 0 ? (completed.length / Math.max(tasks.length, 1)) * 100 : 0
      
      productiveDays.push({ day: dayName, score })
    })
    
    // Группируем по дням недели и считаем средний показатель
    const dayAverages: { [key: string]: number[] } = {}
    productiveDays.forEach(({ day, score }) => {
      if (!dayAverages[day]) dayAverages[day] = []
      dayAverages[day].push(score)
    })
    
    const avgByDay = Object.entries(dayAverages).map(([day, scores]) => ({
      day,
      avg: scores.reduce((sum, score) => sum + score, 0) / scores.length
    }))
    
    return avgByDay
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(item => item.day)
  }

  private static extractBlockerPatterns(entries: JournalEntry[]): string[] {
    const patterns: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const blockers = (entry.blockers || '').toLowerCase()
      if (blockers.trim()) {
        // Простое извлечение паттернов
        const sentences = blockers.split(/[.!?]/).filter(s => s.trim().length > 10)
        sentences.forEach(sentence => {
          const key = sentence.trim().substring(0, 50)
          patterns[key] = (patterns[key] || 0) + 1
        })
      }
    })
    
    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pattern]) => pattern)
  }

  private static extractInsightKeywords(entries: JournalEntry[]): string[] {
    const keywords: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const insights = (entry.insights || '').toLowerCase()
      const words = insights.split(/\W+/).filter(word => word.length > 4)
      
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1
      })
    })
    
    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 7)
      .map(([keyword]) => keyword)
  }

  private static generateTrendAnalysis(entries: JournalEntry[]): string {
    if (entries.length < 3) return 'Недостаточно данных для анализа трендов'
    
    const recentEntries = entries.slice(-7) // Последние 7 записей
    const olderEntries = entries.slice(0, Math.min(7, entries.length - 7))
    
    const recentCompletion = this.calculateCompletionRate(recentEntries)
    const olderCompletion = this.calculateCompletionRate(olderEntries)
    
    if (recentCompletion > olderCompletion + 10) {
      return 'Положительная динамика: продуктивность растет'
    } else if (recentCompletion < olderCompletion - 10) {
      return 'Снижение продуктивности: стоит обратить внимание'
    } else {
      return 'Стабильная продуктивность'
    }
  }

  static generateSmartPrompts(data: { user: UserStats, analysis: AnalysisData, entries: JournalEntry[] }) {
    const { user, analysis } = data
    
    return {
      productivity: `Проанализируй мою продуктивность за ${user.dateRange}. У меня ${user.totalEntries} записей, процент выполнения задач ${analysis.completionRate}%, серия ведения дневника ${user.streakDays} дней. Основные сложности: ${analysis.topChallenges.join(', ')}. Что можно улучшить?`,
      
      blockers: `Помоги разобраться с блокерами в работе. Повторяющиеся паттерны: ${analysis.blockerPatterns.join('; ')}. Как превратить эти препятствия в возможности?`,
      
      insights: `Развей мои инсайты в конкретные действия. Ключевые темы: ${analysis.insightKeywords.join(', ')}. Как применить эти понимания для роста?`,
      
      planning: `Оптимизируй мое планирование. Самые продуктивные дни: ${analysis.mostProductiveDays.join(', ')}. Среднее количество задач в день: ${user.avgTasksPerDay}. Как лучше структурировать рабочую неделю?`,
      
      trends: `${analysis.trendAnalysis}. Проанализируй динамику и дай рекомендации на следующий период.`
    }
  }
}