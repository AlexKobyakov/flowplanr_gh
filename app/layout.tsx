import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter'
})

export const metadata = {
  title: 'FlowPlanr - Умный рабочий дневник',
  description: 'FlowPlanr: Умный рабочий дневник с экспортом для Claude AI. Структурированное ведение записей и персональная аналитика продуктивности.',
  keywords: 'flowplanr, рабочий дневник, продуктивность, Claude AI, анализ работы, планирование',
  authors: [{ name: 'FlowPlanr Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'FlowPlanr - Умный рабочий дневник',
    description: 'FlowPlanr: Умный рабочий дневник с экспортом для Claude AI',
    type: 'website',
    locale: 'ru_RU'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div id="__next">
          {children}
        </div>
      </body>
    </html>
  )
}