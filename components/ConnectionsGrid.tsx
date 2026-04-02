'use client'
import { useState } from 'react'

// ── Brand SVG Icons ───────────────────────────────────────────────────────────

function GoogleAdsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="white" />
      {/* Google Ads triangle logo */}
      <polygon points="12,36 24,14 36,36" fill="none" stroke="#fbbc04" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="12" cy="36" r="4.5" fill="#4285f4" />
      <circle cx="36" cy="36" r="4.5" fill="#34a853" />
      <circle cx="24" cy="14" r="4.5" fill="#ea4335" />
    </svg>
  )
}

function GoogleAnalyticsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="white" />
      <rect x="10" y="28" width="8" height="12" rx="4" fill="#f9ab00" />
      <rect x="20" y="18" width="8" height="22" rx="4" fill="#e37400" />
      <rect x="30" y="8"  width="8" height="32" rx="4" fill="#e37400" />
    </svg>
  )
}

function GoogleMerchantIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="white" />
      {/* Shopping bag */}
      <path d="M16 20 L13 38 L35 38 L32 20 Z" fill="#4285f4" />
      <path d="M19 20 C19 14 29 14 29 20" fill="none" stroke="#4285f4" strokeWidth="3" strokeLinecap="round" />
      {/* G logo overlay */}
      <circle cx="30" cy="30" r="9" fill="white" />
      <path d="M35 30 L30 30 L30 27" stroke="#4285f4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M35 30 A5 5 0 1 1 30 25" stroke="#4285f4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function GoogleSearchConsoleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="white" />
      <circle cx="21" cy="21" r="10" fill="none" stroke="#34a853" strokeWidth="4" />
      <line x1="28" y1="28" x2="38" y2="38" stroke="#34a853" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function FacebookAdsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#1877f2" />
      <path d="M28 24 L26 24 L26 38 L20 38 L20 24 L18 24 L18 19 L20 19 L20 16 C20 12 22 10 26 10 L30 10 L30 15 L28 15 C27 15 26 15.5 26 17 L26 19 L30 19 Z" fill="white" />
    </svg>
  )
}

function LinkedInAdsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#0a66c2" />
      <rect x="10" y="18" width="7" height="20" rx="1" fill="white" />
      <circle cx="13.5" cy="12" r="4" fill="white" />
      <rect x="21" y="18" width="7" height="20" rx="1" fill="white" />
      <path d="M28 26 C28 22 35 21 35 26 L35 38 L31 38 L31 27 C31 25 28 25 28 27 Z" fill="white" />
    </svg>
  )
}

function MicrosoftAdsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="white" />
      <rect x="10" y="10" width="13" height="13" fill="#f25022" />
      <rect x="25" y="10" width="13" height="13" fill="#7fba00" />
      <rect x="10" y="25" width="13" height="13" fill="#00a4ef" />
      <rect x="25" y="25" width="13" height="13" fill="#ffb900" />
    </svg>
  )
}

function TaboolaIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#3d6ec5" />
      <text x="24" y="32" textAnchor="middle" style={{ fontSize: 26, fontWeight: 900, fill: 'white', fontFamily: 'sans-serif' }}>t</text>
    </svg>
  )
}

function TikTokAdsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#010101" />
      {/* TikTok note shape */}
      <path d="M28 10 C28 10 32 10.5 34 14 C36 17.5 36 18 36 18 L30 18 C30 18 30 17 28 15.5 L28 28 C28 32 24.5 35 20.5 35 C16.5 35 13 32 13 28 C13 24 16.5 21 20.5 21 C21.5 21 22.5 21.2 23.5 21.6 L23.5 27 C22.8 26.5 21.7 26.2 20.5 26.2 C18.5 26.2 17 27.4 17 28 C17 29.5 18.5 30.8 20.5 30.8 C22.5 30.8 24 29.5 24 28 L24 10 Z" fill="#fe2c55" />
      <path d="M26 10 C26 10 30 10.5 32 14 C34 17.5 34 18 34 18 L28 18 C28 18 28 17 26 15.5 L26 28 C26 32 22.5 35 18.5 35 C14.5 35 11 32 11 28 C11 24 14.5 21 18.5 21 C19.5 21 20.5 21.2 21.5 21.6 L21.5 27 C20.8 26.5 19.7 26.2 18.5 26.2 C16.5 26.2 15 27.4 15 28 C15 29.5 16.5 30.8 18.5 30.8 C20.5 30.8 22 29.5 22 28 L22 10 Z" fill="white" />
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#1db954" />
      <circle cx="24" cy="24" r="14" fill="#1db954" />
      {/* Spotify waves */}
      <path d="M14 20 C18 18 26 18 32 21" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M15 25 C19 23 25 23 30 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M16 30 C20 28 24 28 28 30" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function ShopifyIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#96bf48" />
      {/* Shopify bag */}
      <path d="M30 16 C30 14 28 12 26 12 C24 12 22 14 22 16 L20 16 L18 38 L34 38 Z" fill="white" />
      <path d="M22 16 C22 13 24 11 26 11 C28 11 30 13 30 16" fill="none" stroke="white" strokeWidth="2" />
      <rect x="22" y="16" width="8" height="4" fill="#96bf48" />
    </svg>
  )
}

function ShoplineIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <rect width="48" height="48" rx="8" fill="#ff6b35" />
      <text x="24" y="31" textAnchor="middle" style={{ fontSize: 18, fontWeight: 900, fill: 'white', fontFamily: 'sans-serif', letterSpacing: -1 }}>SL</text>
    </svg>
  )
}

// ── Platform config ───────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'google-ads',        name: 'Google Ads',             Icon: GoogleAdsIcon,         category: 'Google' },
  { id: 'google-analytics',  name: 'Google Analytics 4',     Icon: GoogleAnalyticsIcon,   category: 'Google' },
  { id: 'google-merchant',   name: 'Google Merchant Center', Icon: GoogleMerchantIcon,    category: 'Google' },
  { id: 'google-search',     name: 'Google Search Console',  Icon: GoogleSearchConsoleIcon, category: 'Google' },
  { id: 'facebook-ads',      name: 'Facebook Ads',           Icon: FacebookAdsIcon,       category: 'Social' },
  { id: 'linkedin-ads',      name: 'LinkedIn Ads',           Icon: LinkedInAdsIcon,       category: 'Social' },
  { id: 'microsoft-ads',     name: 'Microsoft Advertising',  Icon: MicrosoftAdsIcon,      category: 'Search' },
  { id: 'taboola',           name: 'Taboola',                Icon: TaboolaIcon,           category: 'Native' },
  { id: 'tiktok-ads',        name: 'TikTok Ads',             Icon: TikTokAdsIcon,         category: 'Social' },
  { id: 'spotify-ads',       name: 'Spotify Advertising',    Icon: SpotifyIcon,           category: 'Audio' },
  { id: 'shopify',           name: 'Shopify',                Icon: ShopifyIcon,           category: 'Commerce' },
  { id: 'shopline',          name: 'SHOPLINE',               Icon: ShoplineIcon,          category: 'Commerce' },
]

// ── Connection Card ───────────────────────────────────────────────────────────

function PlatformCard({ name, Icon, category }: Omit<typeof PLATFORMS[0], 'id'>) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')

  const handleClick = () => {
    if (status === 'connected') {
      if (confirm(`確定要中斷 ${name} 的連結嗎？`)) {
        setStatus('idle')
      }
      return
    }
    setStatus('connecting')
    // Simulate async connect flow (future: real OAuth)
    setTimeout(() => setStatus('connected'), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={`group relative bg-white border-2 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 text-left w-full
        ${status === 'connected'
          ? 'border-green-400 shadow-md shadow-green-100'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
    >
      {/* Status badge */}
      {status === 'connected' && (
        <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
          已連結
        </span>
      )}
      {status === 'idle' && (
        <span className="absolute top-3 right-3 bg-gray-100 text-gray-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          未連結
        </span>
      )}
      {status === 'connecting' && (
        <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full animate-pulse">
          連結中…
        </span>
      )}

      <Icon />

      <div className="text-center">
        <div className="text-sm font-semibold text-gray-800">{name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{category}</div>
      </div>

      {/* Hover CTA */}
      <div className={`text-xs font-medium mt-1 transition-colors
        ${status === 'connected' ? 'text-red-400' : 'text-blue-500 opacity-0 group-hover:opacity-100'}`}>
        {status === 'connected' ? '點擊中斷連結' : '點擊連結帳號'}
      </div>
    </button>
  )
}

// ── Grid ──────────────────────────────────────────────────────────────────────

export default function ConnectionsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {PLATFORMS.map((p) => (
        <PlatformCard key={p.id} {...p} />
      ))}
    </div>
  )
}
