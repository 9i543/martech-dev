'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DEFAULT_INTENTS, getStoredTacticConfig } from '@/lib/tactic-config'

// 使用情境簡述（依 intent id 對應）
const INTENT_CONTEXT: Record<string, string> = {
  brand_awareness:    '擴大曝光與首次品牌認識',
  traffic_acquisition:'導流、提升網站流量',
  engagement:         '互動、瀏覽、觀看、點擊',
  lead_gen:           '表單留單、名單蒐集',
  registration:       '會員註冊、帳號建立',
  lead_nurture:       '意圖名單持續培養養成',
  remarketing:        '高意圖對象再接觸召回',
  sales_conversion:   '購買、下單、付費成交',
  promo_conversion:   '促銷限時優惠帶動成交',
  member_get_member:  '會員推薦帶入新會員',
}

export default function TacticIntentSection() {
  const router = useRouter()
  const [intents, setIntents] = useState(DEFAULT_INTENTS)
  const [selectedIntent, setSelectedIntent] = useState<string>('')

  useEffect(() => {
    const cfg = getStoredTacticConfig()
    setIntents(cfg.intents)
  }, [])

  const handleStart = () => {
    const url = selectedIntent
      ? `/plans/new?intent=${selectedIntent}`
      : '/plans/new'
    router.push(url)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
            <span>💡</span> 請選擇行銷活動的策略目的
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">選好策略目的後點擊「新建計畫」繼續建立後續行銷規劃相關內容</p>
        </div>
        <button
          onClick={handleStart}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition whitespace-nowrap ${
            selectedIntent
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
        >
          + 新建計畫
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {intents.map((intent) => {
          const isSelected = selectedIntent === intent.id
          const context = INTENT_CONTEXT[intent.id] ?? ''
          return (
            <button
              key={intent.id}
              onClick={() => setSelectedIntent(isSelected ? '' : intent.id)}
              className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2.5 text-left transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <span>{intent.icon}</span>
                <span>{intent.label}</span>
              </div>
              <div className={`text-xs font-mono truncate w-full ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                {intent.id}
              </div>
              {context && (
                <div className={`text-xs leading-snug mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {context}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
