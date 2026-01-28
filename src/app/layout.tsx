import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YAML翻译工具',
  description: '基于AI的智能YAML文件翻译工具，支持实时翻译和自定义词典',
  keywords: ['YAML', '翻译', 'AI', '国际化', 'i18n'],
  authors: [{ name: 'YAML Translator' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
}