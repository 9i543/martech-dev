'use client'
import { useEffect, useState } from 'react'
import { PlanData } from '../PlanForm'
import {
  ALL_ANGLES,
  DEFAULT_INTENTS,
  DEFAULT_TACTIC_MAP,
  TacticConfig,
  getStoredTacticConfig,
  saveTacticConfig,
} from '@/lib/tactic-config'

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module2Strategy({ plan, update }: Props) {
  const [config, setConfig] = useState<TacticConfig>({ intents: DEFAULT_INTENTS, angleMap: DEFAULT_TACTIC_MAP })
  const [showSettings, setShowSettings] = useState(false)
  // Settings editing state
  const [newIntentLabel, setNewIntentLabel] = useState('')
  const [newIntentValue, setNewIntentValue] = useState('')
  const [newIntentIcon, setNewIntentIcon] = useState('')
  const [expandedIntent, setExpandedIntent] = useState<string | null>(null)

  useEffect(() => {
    setConfig(getStoredTacticConfig())
  }, [])

  const handleIntentSelect = (id: string) => {
    if (plan.tacticIntent === id) {
      update({ tacticIntent: '', tacticAngle: '' })
      return
    }
    const newAngle = config.angleMap[id]?.includes(plan.tacticAngle) ? plan.tacticAngle : ''
    update({ tacticIntent: id, tacticAngle: newAngle })
  }

  const handleAngleSelect = (id: string) => {
    update({ tacticAngle: id })
  }

  const saveConfig = (newConfig: TacticConfig) => {
    setConfig(newConfig)
    saveTacticConfig(newConfig)
    // If selected angle is no longer in map for selected intent, clear it
    if (plan.tacticIntent && plan.tacticAngle) {
      if (!newConfig.angleMap[plan.tacticIntent]?.includes(plan.tacticAngle)) {
        update({ tacticAngle: '' })
      }
    }
  }

  const moveIntent = (idx: number, dir: -1 | 1) => {
    const newIntents = [...config.intents]
    const target = idx + dir
    if (target < 0 || target >= newIntents.length) return
    ;[newIntents[idx], newIntents[target]] = [newIntents[target], newIntents[idx]]
    saveConfig({ ...config, intents: newIntents })
  }

  const deleteIntent = (id: string) => {
    const newIntents = config.intents.filter((i) => i.id !== id)
    const newMap = { ...config.angleMap }
    delete newMap[id]
    saveConfig({ intents: newIntents, angleMap: newMap })
    if (plan.tacticIntent === id) update({ tacticIntent: '', tacticAngle: '' })
  }

  const addIntent = () => {
    if (!newIntentLabel.trim() || !newIntentValue.trim()) return
    const id = newIntentValue.trim().toLowerCase().replace(/\s+/g, '_').replace(/__+/g, '_')
    if (config.intents.some((i) => i.id === id)) return
    const newIntents = [...config.intents, { id, label: newIntentLabel.trim(), icon: newIntentIcon || '📌' }]
    const newMap = { ...config.angleMap, [id]: [] }
    saveConfig({ intents: newIntents, angleMap: newMap })
    setNewIntentLabel('')
    setNewIntentValue('')
    setNewIntentIcon('')
  }

  const toggleAngleForIntent = (intentId: string, angleId: string) => {
    const current = config.angleMap[intentId] ?? []
    const newAngles = current.includes(angleId)
      ? current.filter((a) => a !== angleId)
      : [...current, angleId]
    saveConfig({ ...config, angleMap: { ...config.angleMap, [intentId]: newAngles } })
  }

  const resetToDefaults = () => {
    saveConfig({ intents: DEFAULT_INTENTS, angleMap: DEFAULT_TACTIC_MAP })
    update({ tacticIntent: '', tacticAngle: '' })
  }

  const selectedIntentObj = config.intents.find((i) => i.id === plan.tacticIntent)
  const availableAngles = plan.tacticIntent
    ? ALL_ANGLES.filter((a) => config.angleMap[plan.tacticIntent]?.includes(a.id))
    : []

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>💡</span> 模組 2：行銷策略
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">確定行銷策略目的與傳達訊息主要訴求</p>
        </div>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            showSettings
              ? 'bg-gray-200 text-gray-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚙️ 設定
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">策略目的 管理</h3>
            <button
              onClick={resetToDefaults}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1"
            >
              重設預設值
            </button>
          </div>

          {/* Intent list management */}
          <div className="space-y-2">
            {config.intents.map((intent, idx) => (
              <div key={intent.id} className="bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveIntent(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none">▲</button>
                    <button onClick={() => moveIntent(idx, 1)} disabled={idx === config.intents.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none">▼</button>
                  </div>
                  <span className="text-base">{intent.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700">{intent.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{intent.id}</span>
                  <button
                    onClick={() => setExpandedIntent(expandedIntent === intent.id ? null : intent.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 px-2 py-0.5 border border-blue-200 rounded"
                  >
                    {expandedIntent === intent.id ? '收合' : '訊息訴求'}
                  </button>
                  <button
                    onClick={() => deleteIntent(intent.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
                {/* Angle checkboxes for this intent */}
                {expandedIntent === intent.id && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-500 mb-2">勾選此策略目的可搭配的訊息訴求：</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_ANGLES.map((angle) => {
                        const checked = config.angleMap[intent.id]?.includes(angle.id) ?? false
                        return (
                          <label key={angle.id} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAngleForIntent(intent.id, angle.id)}
                              className="rounded"
                            />
                            <span className="text-xs text-gray-700">{angle.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new intent */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">新增選項</p>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1.5 text-sm"
                placeholder="中文名稱"
                value={newIntentLabel}
                onChange={(e) => setNewIntentLabel(e.target.value)}
              />
              <input
                className="w-40 border rounded px-2 py-1.5 text-sm font-mono"
                placeholder="英文值 (snake_case)"
                value={newIntentValue}
                onChange={(e) => setNewIntentValue(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              />
              <input
                className="w-16 border rounded px-2 py-1.5 text-sm text-center"
                placeholder="圖示"
                value={newIntentIcon}
                onChange={(e) => setNewIntentIcon(e.target.value)}
              />
              <button
                onClick={addIntent}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + 新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section A: 策略目的 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          策略目的 <span className="text-xs font-normal text-gray-400 ml-1">marketing_tactic_intent</span>
        </h3>
        <p className="text-xs text-gray-400 mb-3">本次規劃行銷活動 策略目的 Marketing Tactic Intent</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {config.intents.map((intent) => {
            const isSelected = plan.tacticIntent === intent.id
            return (
              <button
                key={intent.id}
                onClick={() => handleIntentSelect(intent.id)}
                className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>{intent.icon}</span>
                  <span>{intent.label}</span>
                </div>
                <div className={`text-xs font-mono ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {intent.id}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section B: 訊息訴求 — shown after intent selected */}
      {plan.tacticIntent && availableAngles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            訊息訴求 <span className="text-xs font-normal text-gray-400 ml-1">marketing_tactic_angle</span>
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            策略目的 傳達 訊息訴求 Marketing Tactic Angle
            {selectedIntentObj && (
              <span className="ml-2 text-blue-500 font-medium">{selectedIntentObj.icon} {selectedIntentObj.label}</span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableAngles.map((angle) => {
              const isSelected = plan.tacticAngle === angle.id
              return (
                <button
                  key={angle.id}
                  onClick={() => handleAngleSelect(angle.id)}
                  className={`flex flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                    {angle.label}
                  </div>
                  {angle.desc && (
                    <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {angle.desc}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Combined result chip */}
      {plan.tacticIntent && plan.tacticAngle && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {selectedIntentObj && <span className="text-base">{selectedIntentObj.icon}</span>}
            <span className="text-sm font-semibold text-gray-800">
              {selectedIntentObj?.label}
            </span>
            <span className="text-gray-400">×</span>
            <span className="text-sm font-semibold text-gray-800">
              {ALL_ANGLES.find((a) => a.id === plan.tacticAngle)?.label}
            </span>
          </div>
          <div className="ml-auto text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
            utm_marketing_tactic: {plan.tacticIntent}__{plan.tacticAngle}
          </div>
        </div>
      )}
    </div>
  )
}
