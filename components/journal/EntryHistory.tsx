'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calendar, Search, FileText, Eye, Trash2, Filter } from 'lucide-react'
import { JournalEntry as JournalEntryType, entryStorage, userStorage } from '@/lib/storage'
import { formatDate, isToday } from '@/lib/utils'

interface EntryHistoryProps {
  entries: JournalEntryType[]
  onSelectEntry?: (entry: JournalEntryType) => void
}

export function EntryHistory({ entries: initialEntries, onSelectEntry }: EntryHistoryProps) {
  const [entries, setEntries] = useState<JournalEntryType[]>(initialEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'recent' | 'thisWeek' | 'thisMonth'>('all')
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

  // Обновляем записи при изменении props
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  // Перезагружаем записи из storage
  const refreshEntries = () => {
    const currentUser = userStorage.getCurrentUser()
    if (currentUser) {
      const updatedEntries = entryStorage.getEntries(currentUser.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(updatedEntries)
    }
  }

  // Фильтрация записей
  const filteredEntries = entries.filter(entry => {
    // Поиск по тексту
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = Object.values(entry).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }

    // Фильтр по дате
    const entryDate = new Date(entry.date)
    const now = new Date()
    
    switch (filter) {
      case 'recent':
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
        return entryDate >= threeDaysAgo
      
      case 'thisWeek':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1) // Понедельник
        weekStart.setHours(0, 0, 0, 0)
        return entryDate >= weekStart
      
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return entryDate >= monthStart
      
      default:
        return true
    }
  })

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.')) {
      entryStorage.deleteEntry(entryId)
      refreshEntries()
    }
  }

  const getEntryPreview = (entry: JournalEntryType): string => {
    const fields = [
      entry.priorityA,
      entry.dailyTasks,
      entry.completed,
      entry.insights
    ].filter(Boolean)
    
    const preview = fields.join(' ').substring(0, 150)
    return preview || 'Пустая запись'
  }

  const getEntryStats = (entry: JournalEntryType) => {
    const tasks = (entry.dailyTasks || '').split('\n').filter(t => t.trim().length > 0)
    const completed = (entry.completed || '').split('\n').filter(t => t.trim().length > 0)
    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
    
    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      completionRate
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Записей пока нет</h3>
        <p className="text-gray-600 mb-6">
          Начните вести дневник, чтобы видеть здесь историю ваших записей и анализировать продуктивность.
        </p>
        <Button onClick={() => window.location.reload()} className="btn-hover">
          Обновить
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">История записей</h2>
            <p className="text-gray-600 text-sm">Всего записей: {entries.length}</p>
          </div>
        </div>
        
        <Button onClick={refreshEntries} variant="outline" size="sm" className="btn-hover">
          Обновить
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по записям..."
            className="pl-10"
          />
        </div>

        {/* Date Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Все' },
            { key: 'recent', label: 'Последние 3 дня' },
            { key: 'thisWeek', label: 'Эта неделя' },
            { key: 'thisMonth', label: 'Этот месяц' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              onClick={() => setFilter(key as any)}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              className="btn-hover"
            >
              <Filter className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {filteredEntries.length !== entries.length && (
        <div className="mb-4 text-sm text-gray-600">
          Показано {filteredEntries.length} из {entries.length} записей
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredEntries.map(entry => {
          const stats = getEntryStats(entry)
          const isExpanded = expandedEntries.has(entry.id)
          const entryDate = new Date(entry.date)
          
          return (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {formatDate(entryDate)}
                      {isToday(entryDate) && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Сегодня
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      <span>Задач: {stats.totalTasks}</span>
                      <span>Выполнено: {stats.completedTasks}</span>
                      {stats.totalTasks > 0 && (
                        <span className={`${
                          stats.completionRate >= 80 ? 'text-green-600' :
                          stats.completionRate >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stats.completionRate}% выполнения
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleExpanded(entry.id)}
                    variant="outline"
                    size="sm"
                    className="btn-hover"
                  >
                    <Eye className="w-4 h-4" />
                    {isExpanded ? 'Свернуть' : 'Развернуть'}
                  </Button>
                  
                  {onSelectEntry && (
                    <Button
                      onClick={() => onSelectEntry(entry)}
                      variant="outline"
                      size="sm"
                      className="btn-hover"
                    >
                      Редактировать
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleDeleteEntry(entry.id)}
                    variant="destructive"
                    size="sm"
                    className="btn-hover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Entry Preview/Content */}
              {isExpanded ? (
                <div className="space-y-3 text-sm">
                  {entry.priorityA && (
                    <div>
                      <strong className="text-gray-700">🚀 Приоритет А:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.priorityA}</p>
                    </div>
                  )}
                  {entry.dailyTasks && (
                    <div>
                      <strong className="text-gray-700">📋 Задачи:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.dailyTasks}</p>
                    </div>
                  )}
                  {entry.completed && (
                    <div>
                      <strong className="text-gray-700">✅ Выполнено:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.completed}</p>
                    </div>
                  )}
                  {entry.difficulties && (
                    <div>
                      <strong className="text-gray-700">🚧 Сложности:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.difficulties}</p>
                    </div>
                  )}
                  {entry.insights && (
                    <div>
                      <strong className="text-gray-700">💡 Инсайты:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.insights}</p>
                    </div>
                  )}
                  {entry.tomorrowFocus && (
                    <div>
                      <strong className="text-gray-700">🎯 Завтра:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.tomorrowFocus}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {getEntryPreview(entry)}...
                </p>
              )}
            </div>
          )
        })}
      </div>

      {filteredEntries.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>По запросу "{searchTerm}" ничего не найдено</p>
        </div>
      )}
    </div>
  )
}