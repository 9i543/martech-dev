'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  email?: string
}

export default function NavHeader({ email }: Props) {
  const pathname = usePathname()

  const navItems = [
    { href: '/',            label: '整體行銷成效' },
    { href: '/plans',       label: '建立行銷計劃' },
    { href: '/connections', label: '帳號連結' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📊</span>
            <span className="font-bold text-gray-800 text-base">MarTech 規劃平台</span>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {email && <span className="text-sm text-gray-500">{email}</span>}
          <a
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1 transition-colors"
          >
            登出
          </a>
        </div>
      </div>
    </header>
  )
}
