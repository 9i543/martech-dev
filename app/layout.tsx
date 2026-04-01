import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'MarTech 規劃平台',
  description: '行銷規劃 × UTM 串接 × 成效儀表板',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
