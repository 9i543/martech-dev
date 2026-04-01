'use client'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PlanData, ChannelRow, FunnelStageConfig } from '../PlanForm'

// ── Channel definitions (aligned with Excel utm_medium spec) ─────────────

const ALL_CHANNELS: {
  label: string
  utmMedium: string
  buckets: string[]
  freeSource?: boolean
}[] = [
  { label: '付費社群',  utmMedium: 'paid_social', buckets: ['paid', 'influence'] },
  { label: '搜尋點擊',  utmMedium: 'cpc',         buckets: ['paid', 'influence'] },
  { label: '多媒體廣告', utmMedium: 'display',     buckets: ['paid', 'influence'] },
  { label: '付費影音',  utmMedium: 'paid_video',   buckets: ['paid', 'influence'] },
  { label: '聯盟行銷',  utmMedium: 'affiliate',    buckets: ['paid', 'influence'], freeSource: true },
  { label: '自然社群',  utmMedium: 'social',       buckets: ['owned', 'influence'] },
  { label: '自然影音',  utmMedium: 'video',        buckets: ['owned', 'influence'] },
  { label: '自然搜尋',  utmMedium: 'organic',      buckets: ['owned', 'influence'] },
  { label: 'Email',    utmMedium: 'email',         buckets: ['owned'] },
  { label: '簡訊',     utmMedium: 'sms',           buckets: ['owned'] },
  { label: '推播',     utmMedium: 'push',          buckets: ['owned'] },
  { label: '文宣品',   utmMedium: 'dm',            buckets: ['owned'] },
  { label: 'QR Code',  utmMedium: 'qrcode',        buckets: ['owned'] },
  { label: '推薦流量',  utmMedium: 'referral',     buckets: ['influence'] },
  { label: '部落格',   utmMedium: 'blog',          buckets: ['paid', 'owned', 'influence'], freeSource: true },
]

// Per-bucket channel list (preserving display order)
const CHANNEL_TYPES: Record<string, typeof ALL_CHANNELS> = {
  paid:      ALL_CHANNELS.filter((c) => c.buckets.includes('paid')),
  owned:     ALL_CHANNELS.filter((c) => c.buckets.includes('owned')),
  influence: ALL_CHANNELS.filter((c) => c.buckets.includes('influence')),
}

const UTM_SOURCES: Record<string, string[]> = {
  paid_social: ['facebook', 'instagram', 'line', 'tiktok', 'douyin'],
  cpc:         ['google', 'yahoo', 'bing'],
  organic:     ['google', 'yahoo', 'bing'],
  referral:    ['facebook', 'instagram'],
  display:     ['google', 'line', 'tiktok', 'douyin'],
  paid_video:  ['youtube', 'tiktok', 'douyin'],
  social:      ['facebook', 'instagram', 'tiktok', 'douyin'],
  video:       ['youtube', 'tiktok', 'douyin'],
  email:       ['email'],
  sms:         ['sms'],
  push:        ['notification'],
  blog:        [],   // free-text input
  dm:          ['qrcode', 'offline'],
  qrcode:      ['qrcode', 'offline'],
  affiliate:   [],   // free-text input
}

const UTM_SOURCE_ZH: Record<string, string> = {
  google:       'Google',
  facebook:     'Facebook',
  instagram:    'Instagram',
  youtube:      'YouTube',
  email:        'EDM',
  notification: '推播通知',
  line:         'LINE',
  qrcode:       'QR Code',
  offline:      '線下',
  sms:          '簡訊',
  tiktok:       '抖音海外',
  douyin:       '抖音中國',
  yahoo:        'Yahoo',
  bing:         'Bing',
}

const FUNNEL_STAGES = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']
const FUNNEL_STAGE_ZH: Record<string, string> = {
  Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員',
}
const ROLES = ['主力', '輔助', '測試']

// ── Preset definitions ────────────────────────────────────────────────────

interface PresetRow {
  channelBucket: string
  channelType: string
  utmMedium: string
  utmSource: string
  funnelStage: string
  channelRole: string
  budgetRatio: number
}
interface ChannelPreset {
  id: string
  name: string
  description?: string
  rows: PresetRow[]
}

const DEFAULT_PRESETS: ChannelPreset[] = [
  {
    id: 'brand_awareness',
    name: '品牌曝光',
    description: '以曝光觸及為主，強化品牌認知（A:60% / I:40%）',
    rows: [
      { channelBucket: 'paid', channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'facebook', funnelStage: 'Awareness', channelRole: '主力', budgetRatio: 60 },
      { channelBucket: 'paid', channelType: '付費影音', utmMedium: 'paid_video',  utmSource: 'youtube',  funnelStage: 'Awareness', channelRole: '輔助', budgetRatio: 40 },
      { channelBucket: 'owned',    channelType: '自然社群', utmMedium: 'social',      utmSource: 'instagram', funnelStage: 'Interest',  channelRole: '輔助', budgetRatio: 0 },
      { channelBucket: 'influence', channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'instagram', funnelStage: 'Interest',  channelRole: '輔助', budgetRatio: 40 },
    ],
  },
  {
    id: 'lead_gen',
    name: '名單蒐集',
    description: '以興趣互動→欲望考慮→行動留單為核心（I:40% / D:30% / A:30%）',
    rows: [
      { channelBucket: 'paid', channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'facebook', funnelStage: 'Interest', channelRole: '主力', budgetRatio: 50 },
      { channelBucket: 'paid', channelType: '多媒體廣告', utmMedium: 'display',    utmSource: 'google',   funnelStage: 'Desire',   channelRole: '輔助', budgetRatio: 50 },
      { channelBucket: 'paid', channelType: '搜尋點擊', utmMedium: 'cpc',         utmSource: 'google',   funnelStage: 'Action',   channelRole: '主力', budgetRatio: 70 },
      { channelBucket: 'owned', channelType: 'Email',  utmMedium: 'email',        utmSource: 'email',    funnelStage: 'Action',   channelRole: '輔助', budgetRatio: 0 },
    ],
  },
  {
    id: 'ecommerce',
    name: '電商轉換',
    description: '以高意圖導購與結帳轉換為核心（I:20% / D:30% / A:50%）',
    rows: [
      { channelBucket: 'paid', channelType: '搜尋點擊', utmMedium: 'cpc',         utmSource: 'google',   funnelStage: 'Action',   channelRole: '主力', budgetRatio: 70 },
      { channelBucket: 'paid', channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'facebook', funnelStage: 'Desire',   channelRole: '主力', budgetRatio: 50 },
      { channelBucket: 'paid', channelType: '多媒體廣告', utmMedium: 'display',   utmSource: 'google',   funnelStage: 'Interest', channelRole: '輔助', budgetRatio: 50 },
      { channelBucket: 'owned', channelType: 'Email',  utmMedium: 'email',        utmSource: 'email',    funnelStage: 'Action',   channelRole: '輔助', budgetRatio: 0 },
    ],
  },
  {
    id: 'membership',
    name: '會員經營',
    description: '以既有會員再活化與回購為核心（A:40% / M:40%）',
    rows: [
      { channelBucket: 'owned', channelType: 'Email',  utmMedium: 'email',        utmSource: 'email',        funnelStage: 'Action',     channelRole: '主力', budgetRatio: 0 },
      { channelBucket: 'owned', channelType: '推播',   utmMedium: 'push',         utmSource: 'notification', funnelStage: 'Action',     channelRole: '輔助', budgetRatio: 0 },
      { channelBucket: 'owned', channelType: '簡訊',   utmMedium: 'sms',          utmSource: 'sms',          funnelStage: 'Desire',     channelRole: '測試', budgetRatio: 0 },
      { channelBucket: 'paid',  channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'facebook',    funnelStage: 'Membership', channelRole: '主力', budgetRatio: 50 },
    ],
  },
  {
    id: 'content',
    name: '內容導流',
    description: '以內容觸及與興趣深化為核心（A:20% / I:50% / D:30%）',
    rows: [
      { channelBucket: 'paid',      channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'facebook',  funnelStage: 'Awareness', channelRole: '主力', budgetRatio: 70 },
      { channelBucket: 'owned',     channelType: '自然社群', utmMedium: 'social',      utmSource: 'facebook',  funnelStage: 'Interest',  channelRole: '主力', budgetRatio: 0 },
      { channelBucket: 'owned',     channelType: '自然影音', utmMedium: 'video',       utmSource: 'youtube',   funnelStage: 'Interest',  channelRole: '輔助', budgetRatio: 0 },
      { channelBucket: 'influence', channelType: '付費社群', utmMedium: 'paid_social', utmSource: 'instagram', funnelStage: 'Interest',  channelRole: '輔助', budgetRatio: 30 },
    ],
  },
]

const PRESETS_STORAGE_KEY = 'martech_channel_presets_v1'

// ── Helper ────────────────────────────────────────────────────────────────

function stageAllocated(rows: ChannelRow[], stageKey: string) {
  return rows
    .filter((r) => r.funnelStage === stageKey)
    .reduce((sum, r) => sum + (r.budgetRatio !== '' ? Number(r.budgetRatio) : 0), 0)
}

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

// ── Main component ────────────────────────────────────────────────────────

export default function Module3Channel({ plan, update }: Props) {
  const rows = plan.channelRows
  const totalBudget = typeof plan.totalBudget === 'number' ? plan.totalBudget : 0
  const funnelConfig = plan.funnelConfig

  const [presets, setPresets] = useState<ChannelPreset[]>(DEFAULT_PRESETS)
  const [presetOpen, setPresetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
      if (stored) setPresets(JSON.parse(stored))
    } catch {}
  }, [])

  const savePresets = (p: ChannelPreset[]) => {
    setPresets(p)
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(p))
  }

  const addRow = (bucket: string) => {
    const ch = CHANNEL_TYPES[bucket][0]
    const sources = UTM_SOURCES[ch.utmMedium] || []
    const newRow: ChannelRow = {
      id: uuidv4(),
      funnelStage: 'Awareness',
      channelBucket: bucket,
      channelType: ch.label,
      utmSource: sources[0] || '',
      utmMedium: ch.utmMedium,
      channelRole: '主力',
      plannedBudget: '',
      budgetRatio: '',
      notes: '',
      landingUrl: '',
      ctaType: '了解更多',
      utmCampaign: '',
    }
    update({ channelRows: [newRow, ...rows] })
  }

  const updateRow = (id: string, patch: Partial<ChannelRow>) => {
    update({
      channelRows: rows.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, ...patch }
        // Auto-update utmMedium and reset utmSource when channelType changes
        if (patch.channelType) {
          const match = ALL_CHANNELS.find((c) => c.label === patch.channelType)
          if (match) {
            next.utmMedium = match.utmMedium
            const sources = UTM_SOURCES[match.utmMedium] || []
            if (sources.length > 0) next.utmSource = sources[0]
            else if (match.freeSource) next.utmSource = ''
          }
        }
        return next
      }),
    })
  }

  const deleteRow = (id: string) => {
    update({ channelRows: rows.filter((r) => r.id !== id) })
  }

  const loadPreset = (preset: ChannelPreset) => {
    const newRows: ChannelRow[] = preset.rows.map((r) => ({
      id: uuidv4(),
      funnelStage: r.funnelStage,
      channelBucket: r.channelBucket,
      channelType: r.channelType,
      utmSource: r.utmSource,
      utmMedium: r.utmMedium,
      channelRole: r.channelRole,
      plannedBudget: '',
      budgetRatio: r.budgetRatio,
      notes: '',
      landingUrl: '',
      ctaType: '了解更多',
      utmCampaign: '',
    }))
    update({ channelRows: [...newRows, ...rows] })
    setPresetOpen(false)
  }

  const bucketGroups = ['paid', 'owned', 'influence']
  const bucketLabels: Record<string, string> = {
    paid: '採購媒體 Paid',
    owned: '自媒體 Owned',
    influence: '影響力 Influence',
  }

  const enabledStages = FUNNEL_STAGES.filter((s) => funnelConfig[s]?.enabled)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>📡</span> 模組 4：渠道規劃矩陣
      </h2>

      {/* Stage budget allocation */}
      {totalBudget > 0 && enabledStages.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-500 mb-3">漏斗階段預算配置狀況（渠道比例 % = 各階段預算內的占比）</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${enabledStages.length}, 1fr)` }}>
            {enabledStages.map((stageKey) => {
              const cfg: FunnelStageConfig = funnelConfig[stageKey]
              const stageBudget = Math.round(totalBudget * cfg.ratio / 100)
              const allocated = stageAllocated(rows, stageKey)
              const isOver = allocated > 100
              const isFull = allocated === 100
              return (
                <div key={stageKey} className={`rounded-lg p-3 border ${isOver ? 'bg-red-50 border-red-200' : isFull ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="text-xs font-semibold text-gray-700">
                    {FUNNEL_STAGE_ZH[stageKey]}
                    <span className="text-gray-400 ml-1">({cfg.ratio}%)</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">NT$ {stageBudget.toLocaleString()}</div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isFull ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(allocated, 100)}%` }}
                    />
                  </div>
                  <div className={`text-xs mt-1 font-medium ${isOver ? 'text-red-600' : isFull ? 'text-green-600' : 'text-gray-600'}`}>
                    {isOver ? `⚠️ 超出 ${allocated - 100}%` : `已配 ${allocated}% · 剩 ${100 - allocated}%`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {bucketGroups.map((b) => (
            <button key={b} onClick={() => addRow(b)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg font-medium transition">
              + {bucketLabels[b]}
            </button>
          ))}
        </div>

        {/* Preset loader + settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition border border-gray-200"
            title="管理預設配置"
          >
            ⚙️ 管理預設
          </button>
          <div className="relative">
            <button
              onClick={() => setPresetOpen((v) => !v)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-lg font-medium transition flex items-center gap-1.5 border border-indigo-200"
            >
              📋 載入預設配置
            </button>
            {presetOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {presets.map((p) => (
                  <button key={p.id} onClick={() => loadPreset(p)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition border-b border-gray-100 last:border-0">
                    <div className="font-medium">{p.name}
                      <span className="text-xs text-gray-400 ml-1 font-normal">({p.rows.length} 行)</span>
                    </div>
                    {p.description && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{p.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel rows — Stage-first, Bucket second */}
      {rows.length === 0 ? (
        <div className="text-center text-gray-400 py-10 border-2 border-dashed rounded-xl">
          點擊上方按鈕新增渠道，或載入預設配置
        </div>
      ) : (
        <div className="space-y-6">
          {FUNNEL_STAGES
            .filter((stage) => rows.some((r) => r.funnelStage === stage))
            .map((stage) => {
              const stageRows = rows.filter((r) => r.funnelStage === stage)
              const cfg = funnelConfig[stage]
              const isActive = cfg?.enabled && (cfg.ratio ?? 0) > 0
              const stageBudget = isActive && totalBudget ? Math.round(totalBudget * cfg.ratio / 100) : 0
              const allocated = stageAllocated(rows, stage)
              const isOver = allocated > 100
              const isFull = allocated === 100
              const stageLabel = FUNNEL_STAGE_ZH[stage] ?? stage
              return (
                <div key={stage}>
                  {/* Stage header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1 h-5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="font-bold text-gray-800 text-sm">{stageLabel}</span>
                    <span className="text-xs text-gray-400">({stage})</span>
                    {isActive ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isOver ? 'bg-red-100 text-red-600'
                        : isFull ? 'bg-green-100 text-green-700'
                        : 'bg-blue-50 text-blue-600'
                      }`}>
                        NT$ {stageBudget.toLocaleString()} · 已配 {allocated}%
                        {isOver && ' ⚠️ 超出'}
                        {isFull && ' ✓'}
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                        ⚠️ 本次計畫未設定 {stageLabel}
                      </span>
                    )}
                  </div>

                  {/* Buckets within this stage */}
                  <div className="pl-4 space-y-4">
                    {bucketGroups
                      .filter((bucket) => stageRows.some((r) => r.channelBucket === bucket))
                      .map((bucket) => {
                        const bucketStageRows = stageRows.filter((r) => r.channelBucket === bucket)
                        const isFilled = (r: ChannelRow) => r.budgetRatio !== ''
                        const pendingCount = bucketStageRows.filter((r) => !isFilled(r)).length
                        return (
                          <div key={bucket}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                {bucketLabels[bucket]}
                              </div>
                              {pendingCount > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                  {pendingCount} 筆待填比例
                                </span>
                              )}
                            </div>
                            {bucketStageRows.map((row) => (
                              <ChannelRowEditor
                                key={row.id}
                                row={row}
                                funnelConfig={funnelConfig}
                                totalBudget={totalBudget}
                                onChange={(p) => updateRow(row.id, p)}
                                onDelete={() => deleteRow(row.id)}
                              />
                            ))}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Summary */}
      {rows.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">渠道摘要</div>
          <div className="grid grid-cols-3 gap-3">
            {bucketGroups.map((b) => {
              const bRows = rows.filter((r) => r.channelBucket === b)
              const totalAmt = bRows.reduce((s, r) => {
                if (r.budgetRatio === '') return s
                const cfg = funnelConfig[r.funnelStage]
                if (!cfg?.enabled || !totalBudget) return s
                const stageBudget = totalBudget * cfg.ratio / 100
                return s + (stageBudget * Number(r.budgetRatio) / 100)
              }, 0)
              return (
                <div key={b} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="text-gray-500 text-xs">{bucketLabels[b]}</div>
                  <div className="font-bold text-gray-800">{bRows.length} 個渠道</div>
                  {totalAmt > 0 && <div className="text-blue-600">NT$ {Math.round(totalAmt).toLocaleString()}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {settingsOpen && (
        <PresetSettingsModal
          presets={presets}
          onSave={savePresets}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

// ── Channel Row Editor ────────────────────────────────────────────────────

function ChannelRowEditor({
  row, funnelConfig, totalBudget, onChange, onDelete,
}: {
  row: ChannelRow
  funnelConfig: Record<string, FunnelStageConfig>
  totalBudget: number
  onChange: (p: Partial<ChannelRow>) => void
  onDelete: () => void
}) {
  const typeOptions = CHANNEL_TYPES[row.channelBucket] || []
  const channelDef = ALL_CHANNELS.find((c) => c.label === row.channelType)
  const isFreeSource = channelDef?.freeSource ?? false
  const sources = UTM_SOURCES[row.utmMedium] || []

  const stageCfg = funnelConfig[row.funnelStage]
  const stageBudget = totalBudget && stageCfg?.enabled ? totalBudget * (stageCfg.ratio || 0) / 100 : 0
  const filled = row.budgetRatio !== ''
  const computedBudget = (stageBudget && filled) ? Math.round(stageBudget * Number(row.budgetRatio) / 100) : null

  return (
    <div className={`rounded-xl p-4 mb-2 transition border-l-4 ${
      filled
        ? 'border border-gray-200 border-l-green-400 bg-white hover:shadow-sm'
        : 'border-2 border-dashed border-amber-300 border-l-amber-400 bg-amber-50/40'
    }`}>
      {!filled && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            ✏️ 新增渠道 — 請填入占階段比例（自媒體可填 0%）
          </span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-2 items-end">
        {/* Funnel Stage */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">漏斗階段</label>
          <select className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.funnelStage}
            onChange={(e) => onChange({ funnelStage: e.target.value })}>
            {FUNNEL_STAGES.map((s) => (
              <option key={s} value={s}>{FUNNEL_STAGE_ZH[s]} ({s})</option>
            ))}
          </select>
        </div>

        {/* Channel Type → utm_medium */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">渠道類型</label>
          <select className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.channelType}
            onChange={(e) => onChange({ channelType: e.target.value })}>
            {typeOptions.map((t) => (
              <option key={t.utmMedium} value={t.label}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* utm_medium (read-only badge) */}
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">utm_medium</label>
          <div className="bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-600 truncate">
            {row.utmMedium}
          </div>
        </div>

        {/* utm_source — dropdown or free text */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">
            utm_source
            {isFreeSource && <span className="ml-1 text-amber-600">（自行輸入）</span>}
          </label>
          {isFreeSource ? (
            <input
              className="w-full border rounded px-2 py-1.5 text-xs font-mono"
              value={row.utmSource}
              onChange={(e) => onChange({ utmSource: e.target.value })}
              placeholder="請輸入來源名稱"
            />
          ) : (
            <select className="w-full border rounded px-2 py-1.5 text-xs"
              value={row.utmSource}
              onChange={(e) => onChange({ utmSource: e.target.value })}>
              {sources.map((s) => (
                <option key={s} value={s}>{UTM_SOURCE_ZH[s] || s}</option>
              ))}
              {row.utmSource && !sources.includes(row.utmSource) && (
                <option value={row.utmSource}>{UTM_SOURCE_ZH[row.utmSource] || row.utmSource}</option>
              )}
            </select>
          )}
        </div>

        {/* Role */}
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">角色</label>
          <select className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.channelRole}
            onChange={(e) => onChange({ channelRole: e.target.value })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Budget Ratio */}
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">
            占比
            {stageBudget > 0 && (
              <span className="text-gray-400 ml-0.5">(NT${Math.round(stageBudget / 1000)}k)</span>
            )}
          </label>
          <div className="flex items-center gap-1">
            <input type="number" min={0} max={100}
              className="w-12 border rounded px-1 py-1.5 text-xs text-center"
              placeholder="—"
              value={row.budgetRatio}
              onChange={(e) => onChange({ budgetRatio: e.target.value !== '' ? Number(e.target.value) : '' })}
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>

        {/* Computed Budget */}
        <div className="col-span-1 flex flex-col justify-end">
          <label className="block text-xs text-gray-500 mb-1">金額</label>
          {(!stageCfg?.enabled || stageCfg.ratio === 0) && filled ? (
            <div className="text-xs text-amber-600 font-medium py-1.5 flex items-center gap-1"
              title={`本次計畫未設定 ${FUNNEL_STAGE_ZH[row.funnelStage] ?? row.funnelStage}，請至「漏斗配置」啟用並設定比例後金額才會計算`}>
              <span>⚠️</span>
              <span>本次計畫未設定 {FUNNEL_STAGE_ZH[row.funnelStage] ?? row.funnelStage}</span>
            </div>
          ) : (
            <div className="text-xs font-medium text-blue-700 py-1.5">
              {computedBudget !== null ? `NT$${computedBudget.toLocaleString()}` : '—'}
            </div>
          )}
        </div>

        {/* Delete */}
        <div className="col-span-1 flex justify-end items-end pb-0.5">
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
        </div>
      </div>
    </div>
  )
}

// ── Preset Settings Modal ─────────────────────────────────────────────────

function PresetSettingsModal({
  presets, onSave, onClose,
}: {
  presets: ChannelPreset[]
  onSave: (p: ChannelPreset[]) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<ChannelPreset[]>(presets)
  const [editingId, setEditingId] = useState<string | null>(null)

  const updatePreset = (id: string, patch: Partial<ChannelPreset>) =>
    setLocal((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))

  const updatePresetRow = (pid: string, idx: number, patch: Partial<PresetRow>) =>
    setLocal((prev) => prev.map((p) => {
      if (p.id !== pid) return p
      const rows = [...p.rows]
      rows[idx] = { ...rows[idx], ...patch }
      // Auto-set medium when channelType changes
      if (patch.channelType) {
        const ch = ALL_CHANNELS.find((c) => c.label === patch.channelType)
        if (ch) {
          rows[idx].utmMedium = ch.utmMedium
          const srcs = UTM_SOURCES[ch.utmMedium] || []
          rows[idx].utmSource = srcs[0] || ''
        }
      }
      return { ...p, rows }
    }))

  const deletePresetRow = (pid: string, idx: number) =>
    setLocal((prev) => prev.map((p) =>
      p.id === pid ? { ...p, rows: p.rows.filter((_, i) => i !== idx) } : p
    ))

  const addPresetRow = (pid: string) => {
    const ch = ALL_CHANNELS[0]
    const srcs = UTM_SOURCES[ch.utmMedium] || []
    setLocal((prev) => prev.map((p) =>
      p.id === pid
        ? { ...p, rows: [...p.rows, { channelBucket: 'paid', channelType: ch.label, utmMedium: ch.utmMedium, utmSource: srcs[0] || '', funnelStage: 'Awareness', channelRole: '主力', budgetRatio: 0 }] }
        : p
    ))
  }

  const addPreset = () => {
    const np: ChannelPreset = { id: uuidv4(), name: '新預設', description: '', rows: [] }
    setLocal((prev) => [...prev, np])
    setEditingId(np.id)
  }

  const deletePreset = (id: string) => {
    setLocal((prev) => prev.filter((p) => p.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const BUCKET_LABELS: Record<string, string> = { paid: '採購媒體', owned: '自媒體', influence: '影響力' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">⚙️ 預設配置管理</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {local.map((preset) => {
            const isEditing = editingId === preset.id
            return (
              <div key={preset.id} className={`border rounded-xl overflow-hidden ${isEditing ? 'border-indigo-300' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    {isEditing ? (
                      <input
                        className="border rounded px-2 py-1 text-sm font-medium flex-1 max-w-xs"
                        value={preset.name}
                        onChange={(e) => updatePreset(preset.id, { name: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium text-sm">{preset.name}</span>
                    )}
                    <span className="text-xs text-gray-400">{preset.rows.length} 行</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(isEditing ? null : preset.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50">
                      {isEditing ? '收合' : '編輯'}
                    </button>
                    <button onClick={() => deletePreset(preset.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
                      刪除
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="px-4 py-3 space-y-3">
                    <input
                      className="w-full border rounded px-2 py-1.5 text-xs text-gray-600"
                      placeholder="說明（選填）"
                      value={preset.description || ''}
                      onChange={(e) => updatePreset(preset.id, { description: e.target.value })}
                    />
                    <div className="space-y-2">
                      {preset.rows.map((row, idx) => {
                        const bktChannels = CHANNEL_TYPES[row.channelBucket] || CHANNEL_TYPES.paid
                        const ch = ALL_CHANNELS.find((c) => c.label === row.channelType)
                        const isFree = ch?.freeSource ?? false
                        const srcs = UTM_SOURCES[row.utmMedium] || []
                        return (
                          <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-gray-50 rounded-lg p-2">
                            <select className="col-span-2 border rounded px-1 py-1 text-xs"
                              value={row.channelBucket}
                              onChange={(e) => updatePresetRow(preset.id, idx, { channelBucket: e.target.value })}>
                              <option value="paid">採購媒體</option>
                              <option value="owned">自媒體</option>
                              <option value="influence">影響力</option>
                            </select>
                            <select className="col-span-2 border rounded px-1 py-1 text-xs"
                              value={row.channelType}
                              onChange={(e) => updatePresetRow(preset.id, idx, { channelType: e.target.value })}>
                              {bktChannels.map((c) => <option key={c.utmMedium} value={c.label}>{c.label}</option>)}
                            </select>
                            <div className="col-span-2 bg-white border rounded px-1 py-1 text-xs font-mono text-gray-500 truncate">{row.utmMedium}</div>
                            {isFree ? (
                              <input className="col-span-2 border rounded px-1 py-1 text-xs" placeholder="utm_source"
                                value={row.utmSource}
                                onChange={(e) => updatePresetRow(preset.id, idx, { utmSource: e.target.value })} />
                            ) : (
                              <select className="col-span-2 border rounded px-1 py-1 text-xs"
                                value={row.utmSource}
                                onChange={(e) => updatePresetRow(preset.id, idx, { utmSource: e.target.value })}>
                                {srcs.map((s) => <option key={s} value={s}>{UTM_SOURCE_ZH[s] || s}</option>)}
                              </select>
                            )}
                            <select className="col-span-2 border rounded px-1 py-1 text-xs"
                              value={row.funnelStage}
                              onChange={(e) => updatePresetRow(preset.id, idx, { funnelStage: e.target.value })}>
                              {FUNNEL_STAGES.map((s) => <option key={s} value={s}>{FUNNEL_STAGE_ZH[s]}</option>)}
                            </select>
                            <select className="col-span-1 border rounded px-1 py-1 text-xs"
                              value={row.channelRole}
                              onChange={(e) => updatePresetRow(preset.id, idx, { channelRole: e.target.value })}>
                              {ROLES.map((r) => <option key={r}>{r}</option>)}
                            </select>
                            <button onClick={() => deletePresetRow(preset.id, idx)}
                              className="col-span-1 text-red-400 hover:text-red-600 text-xs text-center">✕</button>
                          </div>
                        )
                      })}
                      <button onClick={() => addPresetRow(preset.id)}
                        className="w-full text-xs text-indigo-600 hover:bg-indigo-50 border border-dashed border-indigo-300 rounded-lg py-1.5 transition">
                        + 新增渠道行
                      </button>
                    </div>
                  </div>
                )}

                {!isEditing && (
                  <div className="px-4 py-2 flex flex-wrap gap-1.5">
                    {preset.rows.map((row, idx) => (
                      <span key={idx} className="text-xs bg-white border rounded-full px-2 py-0.5 text-gray-600">
                        {BUCKET_LABELS[row.channelBucket]} · {row.channelType} · {FUNNEL_STAGE_ZH[row.funnelStage]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addPreset}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition">
            + 新增預設配置
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button onClick={() => { setLocal(DEFAULT_PRESETS); setEditingId(null) }}
            className="text-sm text-gray-500 hover:text-gray-700">
            重設為預設值
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">取消</button>
            <button onClick={() => { onSave(local); onClose() }}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
