import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '待办事项应用',
  description: '一个简单的待办事项管理应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
} 