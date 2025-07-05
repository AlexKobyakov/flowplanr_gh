// Утилиты для работы с localStorage вместо базы данных

export interface User {
  id: string
  email: string
  name?: string
  password: string // В реальном приложении пароли нужно хешировать!
  createdAt: string
}

export interface JournalEntry {
  id: string
  date: string
  priorityA?: string
  dailyTasks?: string
  completed?: string
  postponed?: string
  waitingFor?: string
  difficulties?: string
  blockers?: string
  insights?: string
  tomorrowFocus?: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Ключи для localStorage
const STORAGE_KEYS = {
  USERS: 'flowplanr_users',
  CURRENT_USER: 'flowplanr_current_user',
  ENTRIES: 'flowplanr_entries'
}

// Утилиты для пользователей
export const userStorage = {
  getUsers(): User[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    return data ? JSON.parse(data) : []
  },

  saveUser(user: User): void {
    if (typeof window === 'undefined') return
    const users = this.getUsers()
    const existingIndex = users.findIndex(u => u.id === user.id)
    
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  findByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.email === email) || null
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  },

  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  }
}

// Утилиты для записей дневника
export const entryStorage = {
  getEntries(userId?: string): JournalEntry[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES)
    const allEntries = data ? JSON.parse(data) : []
    
    if (userId) {
      return allEntries.filter((entry: JournalEntry) => entry.userId === userId)
    }
    
    return allEntries
  },

  saveEntry(entry: JournalEntry): void {
    if (typeof window === 'undefined') return
    const entries = this.getEntries()
    const existingIndex = entries.findIndex(e => e.id === entry.id)
    
    if (existingIndex >= 0) {
      entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() }
    } else {
      entries.push(entry)
    }
    
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries))
  },

  getEntryByDate(userId: string, date: string): JournalEntry | null {
    const entries = this.getEntries(userId)
    return entries.find(entry => entry.date === date) || null
  },

  deleteEntry(entryId: string): void {
    if (typeof window === 'undefined') return
    const entries = this.getEntries()
    const filtered = entries.filter(entry => entry.id !== entryId)
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered))
  }
}

// Утилиты для аутентификации
export const authUtils = {
  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const user = userStorage.findByEmail(email)
    
    if (!user) {
      return { success: false, error: 'Пользователь не найден' }
    }
    
    // В реальном приложении нужно сравнивать хеши паролей!
    if (user.password !== password) {
      return { success: false, error: 'Неверный пароль' }
    }
    
    userStorage.setCurrentUser(user)
    return { success: true, user }
  },

  register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    const existingUser = userStorage.findByEmail(email)
    
    if (existingUser) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }
    
    const newUser: User = {
      id: generateId(),
      email,
      name,
      password, // В реальном приложении нужно хешировать!
      createdAt: new Date().toISOString()
    }
    
    userStorage.saveUser(newUser)
    userStorage.setCurrentUser(newUser)
    
    return { success: true, user: newUser }
  },

  logout(): void {
    userStorage.setCurrentUser(null)
  },

  isAuthenticated(): boolean {
    return userStorage.getCurrentUser() !== null
  }
}

// Генератор уникальных ID (fallback для старых браузеров)
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback для старых браузеров
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}