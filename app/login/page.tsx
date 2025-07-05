'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { authUtils } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем, не авторизован ли уже пользователь
    const isAuthenticated = authUtils.isAuthenticated()
    
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  return <LoginForm />
}