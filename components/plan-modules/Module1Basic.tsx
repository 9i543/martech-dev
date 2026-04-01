'use client'
import { useEffect, useState } from 'react'
import { PlanData } from '../PlanForm'
import { DEFAULT_INTENTS, getStoredTacticConfig, TacticIntent } from '@/lib/tactic-config'

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module1Basic({ plan, update }: Props) {
  const [intents, setIntents] = useState<TacticIntent[]>(DEFAULT_INTENTS)

  useEffect(() => {
    setIntents(getStoredTacticConfig().intents)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>📋</span> 模組 1：活動基本設定
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Row 1: 行銷活動名稱 + 品牌/客戶 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            行銷活動名稱 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：2024Q4 品牌聲量衝刺（建議格式：品牌_年季_主軸_活動主題）"
            value={plan.planName}
            onChange={(e) => update({ planName: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">此名稱將作為 utm_campaign 的活動識別基礎</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">品牌 / 客戶</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：OYAG"
            value={plan.brandName}
            onChange={(e) => update({ brandName: e.target.value })}
          />
        </div>

        {/* Row 2: 開始日期 + 結束日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={plan.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={plan.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">總預算（NTD）</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：500000"
            value={plan.totalBudget}
            onChange={(e) => update({ totalBudget: e.target.value ? Number(e.target.value) : '' })}
          />
        </div>

        {/* 策略目的 — replaces 行銷核心主軸 */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            策略目的 <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-400">可在模組 2 進一步選擇訊息訴求</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {intents.map((intent) => {
              const isSelected = plan.tacticIntent === intent.id
              return (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => update({ tacticIntent: isSelected ? '' : intent.id, tacticAngle: isSelected ? '' : plan.tacticAngle })}
                  className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    <span>{intent.icon}</span>
                    <span>{intent.label}</span>
                  </div>
                  <div className={`text-xs font-mono truncate w-full ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    {intent.id}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="活動背景、特殊需求..."
            value={plan.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
