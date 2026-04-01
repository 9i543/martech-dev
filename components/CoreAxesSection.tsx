'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CoreAxis, DEFAULT_AXES, STAGE_KEYS, STAGE_LABELS, getStoredAxes, saveAxesToStorage } from '@/lib/core-axes'
import { v4 as uuidv4 } from 'uuid'

const STAGE_COLORS: Record<string, string> = {
  Awareness:  'text-blue-700',
  Interest:   'text-cyan-700',
  Desire:     'text-purple-700',
  Action:     'text-green-700',
  Membership: 'text-orange-600',
}

const STAGE_BG: Record<string, string> = {
  Awareness:  'bg-blue-50',
  Interest:   'bg-cyan-50',
  Desire:     'bg-purple-50',
  Action:     'bg-green-50',
  Membership: 'bg-orange-50',
}

export default function CoreAxesSection() {
  const [axes, setAxes] = useState<CoreAxis[]>(DEFAULT_AXES)
  const [activeTab, setActiveTab] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setAxes(getStoredAxes())
  }, [])

  const handleSaveAxes = (newAxes: CoreAxis[]) => {
    setAxes(newAxes)
    saveAxesToStorage(newAxes)
  }

  const activeAxis = axes[activeTab] ?? axes[0]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
          <span>🎯</span> 行銷核心主軸
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
          >
            ⚙️ 設定
          </button>
          <Link
            href={`/plans/new?axis=${activeAxis?.id ?? ''}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            + 新建計畫
          </Link>
        </div>
      </div>

      {/* Axis tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {axes.map((axis, i) => (
          <button
            key={axis.id}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition border ${
              activeTab === i
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {axis.icon} {axis.name}
          </button>
        ))}
      </div>

      {/* Active axis ratio card */}
      {activeAxis && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="text-xs text-gray-400 mb-3">{activeAxis.description}</div>
          <div className="flex gap-3">
            {STAGE_KEYS.map((stage) => {
              const ratio = activeAxis.ratios[stage]
              return (
                <div
                  key={stage}
                  className={`flex-1 rounded-lg px-2 py-2 text-center ${ratio > 0 ? STAGE_BG[stage] : 'bg-gray-50'}`}
                >
                  <div className="text-xs text-gray-400 mb-0.5">{STAGE_LABELS[stage].zh}</div>
                  <div className={`text-2xl font-bold leading-none ${ratio > 0 ? STAGE_COLORS[stage] : 'text-gray-300'}`}>
                    {ratio}%
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{stage}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {settingsOpen && (
        <AxesSettingsModal
          axes={axes}
          onSave={handleSaveAxes}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

function AxesSettingsModal({
  axes,
  onSave,
  onClose,
}: {
  axes: CoreAxis[]
  onSave: (axes: CoreAxis[]) => void
  onClose: () => void
}) {
  const [localAxes, setLocalAxes] = useState<CoreAxis[]>(axes)
  const [editingId, setEditingId] = useState<string | null>(null)

  const startEdit = (id: string) => setEditingId(editingId === id ? null : id)

  const updateAxis = (id: string, patch: Partial<CoreAxis>) => {
    setLocalAxes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  const updateRatio = (id: string, stage: string, value: number) => {
    setLocalAxes((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, ratios: { ...a.ratios, [stage]: isNaN(value) ? 0 : Math.max(0, Math.min(100, value)) } }
          : a
      )
    )
  }

  const deleteAxis = (id: string) => {
    setLocalAxes((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const addAxis = () => {
    const newAxis: CoreAxis = {
      id: uuidv4(),
      name: '新主軸',
      icon: '⭐',
      description: '',
      ratios: { Awareness: 25, Interest: 25, Desire: 25, Action: 25, Membership: 0 },
    }
    setLocalAxes((prev) => [...prev, newAxis])
    setEditingId(newAxis.id)
  }

  const resetToDefault = () => {
    setLocalAxes(DEFAULT_AXES)
    setEditingId(null)
  }

  const handleSave = () => {
    onSave(localAxes)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">⚙️ 行銷核心主軸設定</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {localAxes.map((axis) => {
            const total = Object.values(axis.ratios).reduce((s, v) => s + v, 0)
            const isEditing = editingId === axis.id
            return (
              <div key={axis.id} className={`border rounded-xl overflow-hidden ${isEditing ? 'border-blue-300' : 'border-gray-200'}`}>
                {/* Row header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          className="w-8 border rounded px-1 text-center text-sm"
                          value={axis.icon}
                          onChange={(e) => updateAxis(axis.id, { icon: e.target.value })}
                        />
                        <input
                          className="border rounded px-2 py-1 text-sm font-medium"
                          value={axis.name}
                          onChange={(e) => updateAxis(axis.id, { name: e.target.value })}
                        />
                      </>
                    ) : (
                      <span className="font-medium text-sm">{axis.icon} {axis.name}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${total === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      總計 {total}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(axis.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      {isEditing ? '收合' : '編輯'}
                    </button>
                    <button
                      onClick={() => deleteAxis(axis.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      刪除
                    </button>
                  </div>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div className="px-4 py-3 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">說明</label>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                        value={axis.description}
                        onChange={(e) => updateAxis(axis.id, { description: e.target.value })}
                        placeholder="簡短說明這個主軸的目的"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">AIDA+M 預設比例（合計須等於 100%）</label>
                      <div className="grid grid-cols-5 gap-2">
                        {STAGE_KEYS.map((stage) => (
                          <div key={stage} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">{STAGE_LABELS[stage].zh}</div>
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-14 border rounded px-1 py-1 text-sm text-center"
                                value={axis.ratios[stage]}
                                onChange={(e) => updateRatio(axis.id, stage, parseInt(e.target.value))}
                              />
                              <span className="text-xs text-gray-400">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact ratio display when not editing */}
                {!isEditing && (
                  <div className="flex px-4 py-2 gap-2">
                    {STAGE_KEYS.map((stage) => (
                      <div key={stage} className="flex-1 text-center">
                        <div className="text-xs text-gray-400">{STAGE_LABELS[stage].short}</div>
                        <div className={`text-sm font-bold ${axis.ratios[stage] > 0 ? STAGE_COLORS[stage] : 'text-gray-300'}`}>
                          {axis.ratios[stage]}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <button
            onClick={addAxis}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
          >
            + 新增核心主軸
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={resetToDefault}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            重設為預設值
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">取消</button>
            <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
