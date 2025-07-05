'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Save, Calendar, CheckCircle } from 'lucide-react'
import { JournalEntry as JournalEntryType, entryStorage, userStorage, generateId } from '@/lib/storage'
import { getDateKey, formatDate } from '@/lib/utils'

interface JournalEntryProps {
  initialEntry?: JournalEntryType | null
  selectedDate?: Date
}

export function JournalEntry({ initialEntry, selectedDate }: JournalEntryProps) {
  const today = selectedDate || new Date()
  const dateKey = getDateKey(today)
  
  const [formData, setFormData] = useState({
    priorityA: '',
    dailyTasks: '',
    completed: '',
    postponed: '',
    waitingFor: '',
    difficulties: '',
    blockers: '',
    insights: '',
    tomorrowFocus: '',
    notes: ''
  })
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Загружаем данные при изменении даты или начальной записи
  useEffect(() => {
    const currentUser = userStorage.getCurrentUser()
    if (!currentUser) return

    if (initialEntry) {
      setFormData({
        priorityA: initialEntry.priorityA || '',
        dailyTasks: initialEntry.dailyTasks || '',
        completed: initialEntry.completed || '',
        postponed: initialEntry.postponed || '',
        waitingFor: initialEntry.waitingFor || '',
        difficulties: initialEntry.difficulties || '',
        blockers: initialEntry.blockers || '',
        insights: initialEntry.insights || '',
        tomorrowFocus: initialEntry.tomorrowFocus || '',
        notes: initialEntry.notes || ''
      })
    } else {
      // Проверяем, есть ли запись на выбранную дату
      const existingEntry = entryStorage.getEntryByDate(currentUser.id, dateKey)
      if (existingEntry) {
        setFormData({
          priorityA: existingEntry.priorityA || '',
          dailyTasks: existingEntry.dailyTasks || '',
          completed: existingEntry.completed || '',
          postponed: existingEntry.postponed || '',
          waitingFor: existingEntry.waitingFor || '',
          difficulties: existingEntry.difficulties || '',
          blockers: existingEntry.blockers || '',
          insights: existingEntry.insights || '',
          tomorrowFocus: existingEntry.tomorrowFocus || '',
          notes: existingEntry.notes || ''
        })
      } else {
        // Сбрасываем форму для новой даты
        setFormData({
          priorityA: '',
          dailyTasks: '',
          completed: '',
          postponed: '',
          waitingFor: '',
          difficulties: '',
          blockers: '',
          insights: '',
          tomorrowFocus: '',
          notes: ''
        })
      }
    }
  }, [initialEntry, dateKey])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    const currentUser = userStorage.getCurrentUser()
    if (!currentUser) return

    setSaveStatus('saving')

    try {
      // Имитируем небольшую задержку для UX
      await new Promise(resolve => setTimeout(resolve, 300))

      const existingEntry = entryStorage.getEntryByDate(currentUser.id, dateKey)
      
      const entryData: JournalEntryType = {
        id: existingEntry?.id || generateId(),
        date: dateKey,
        userId: currentUser.id,
        createdAt: existingEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priorityA: formData.priorityA.trim() || undefined,
        dailyTasks: formData.dailyTasks.trim() || undefined,
        completed: formData.completed.trim() || undefined,
        postponed: formData.postponed.trim() || undefined,
        waitingFor: formData.waitingFor.trim() || undefined,
        difficulties: formData.difficulties.trim() || undefined,
        blockers: formData.blockers.trim() || undefined,
        insights: formData.insights.trim() || undefined,
        tomorrowFocus: formData.tomorrowFocus.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      entryStorage.saveEntry(entryData)
      setSaveStatus('saved')
      setLastSaved(new Date())
      
      // Автоматически сбрасываем статус через 2 секунды
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (error) {
      setSaveStatus('error')
      console.error('Ошибка сохранения:', error)
      
      // Сбрасываем статус ошибки через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const isFormEmpty = Object.values(formData).every(value => !value.trim())
  const canSave = !isFormEmpty && saveStatus !== 'saving'

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Запись дневника</h2>
            <p className="text-gray-600 text-sm">{formatDate(today)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Сохранено: {lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className={`btn-hover ${
              saveStatus === 'saved' 
                ? 'bg-green-600 hover:bg-green-700' 
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : ''
            }`}
          >
            {saveStatus === 'saving' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Сохранение...
              </div>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Сохранено
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Priority A Tasks */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🚀 Приоритет А (самые важные задачи)
          </label>
          <Textarea
            value={formData.priorityA}
            onChange={(e) => handleChange('priorityA', e.target.value)}
            placeholder="Что самое важное нужно сделать сегодня? (по одной задаче на строку)"
            className="min-h-[80px] custom-scrollbar form-input"
            rows={3}
          />
        </div>

        {/* Daily Tasks */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Все задачи на день
          </label>
          <Textarea
            value={formData.dailyTasks}
            onChange={(e) => handleChange('dailyTasks', e.target.value)}
            placeholder="Полный список задач и дел на сегодня"
            className="min-h-[100px] custom-scrollbar form-input"
            rows={4}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Completed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✅ Выполнено
            </label>
            <Textarea
              value={formData.completed}
              onChange={(e) => handleChange('completed', e.target.value)}
              placeholder="Что удалось сделать"
              className="min-h-[80px] custom-scrollbar form-input"
              rows={3}
            />
          </div>

          {/* Postponed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔄 Перенесено на завтра
            </label>
            <Textarea
              value={formData.postponed}
              onChange={(e) => handleChange('postponed', e.target.value)}
              placeholder="Что переносится"
              className="min-h-[80px] custom-scrollbar form-input"
              rows={3}
            />
          </div>
        </div>

        {/* Waiting For */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ⏰ Жду от других
          </label>
          <Textarea
            value={formData.waitingFor}
            onChange={(e) => handleChange('waitingFor', e.target.value)}
            placeholder="Что ожидаю от коллег, клиентов, партнеров"
            className="min-h-[60px] custom-scrollbar form-input"
            rows={2}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Difficulties */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🚧 Сложности дня
            </label>
            <Textarea
              value={formData.difficulties}
              onChange={(e) => handleChange('difficulties', e.target.value)}
              placeholder="С чем было сложно справиться"
              className="min-h-[80px] custom-scrollbar form-input"
              rows={3}
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔧 Блокеры и препятствия
            </label>
            <Textarea
              value={formData.blockers}
              onChange={(e) => handleChange('blockers', e.target.value)}
              placeholder="Что мешало работе, внешние факторы"
              className="min-h-[80px] custom-scrollbar form-input"
              rows={3}
            />
          </div>
        </div>

        {/* Insights */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💡 Инсайты и выводы
          </label>
          <Textarea
            value={formData.insights}
            onChange={(e) => handleChange('insights', e.target.value)}
            placeholder="Что понял, чему научился, какие идеи пришли"
            className="min-h-[80px] custom-scrollbar form-input"
            rows={3}
          />
        </div>

        {/* Tomorrow Focus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎯 Фокус на завтра
          </label>
          <Textarea
            value={formData.tomorrowFocus}
            onChange={(e) => handleChange('tomorrowFocus', e.target.value)}
            placeholder="Главные приоритеты и планы на завтра"
            className="min-h-[60px] custom-scrollbar form-input"
            rows={2}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 Дополнительные заметки
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Любые дополнительные мысли, наблюдения, планы"
            className="min-h-[80px] custom-scrollbar form-input"
            rows={3}
          />
        </div>
      </div>

      {/* Save Status Messages */}
      {saveStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          Ошибка при сохранении. Попробуйте еще раз.
        </div>
      )}
    </div>
  )
}