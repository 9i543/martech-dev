'use client'
import { useEffect } from 'react'
import { PlanData, ChannelRow } from '../PlanForm'
import { STAGE_LABELS } from '@/lib/core-axes'

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

const FUNNEL_ORDER = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']

function sanitize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/__+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function formatDate(d: string): string {
  return d ? d.replace(/-/g, '') : ''
}

function generateCampaign(ch: ChannelRow, plan: PlanData): string {
  const stage = sanitize(ch.funnelStage)
  const source = sanitize(ch.utmSource)
  const tactic = sanitize(plan.tacticIntent)
  const friendlyName = sanitize(plan.mycampaignNameEn)
  const creative = plan.creativeRows.find((c) => c.channelRowId === ch.id)
  const content = creative
    ? sanitize(`${creative.contentGroup}_${creative.contentVariant}`)
    : ''
  const kpi = plan.kpiRows.find((k) => k.channelRowId === ch.id)
  const goal = sanitize(kpi?.campaignGoal || '')
  const start = formatDate(plan.startDate)
  const end = formatDate(plan.endDate)
  return [stage, source, tactic, friendlyName, content, goal, start, end].join('__')
}

const SEGMENT_LABELS = ['階段', '來源', '策略', '友善名稱', '內容', '目標', '起始', '結束']
const SEGMENT_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-green-100 text-green-800',
  'bg-rose-100 text-rose-800',
]

const STAGE_COLOR: Record<string, string> = {
  Awareness:  'bg-blue-50 border-blue-200 text-blue-700',
  Interest:   'bg-cyan-50 border-cyan-200 text-cyan-700',
  Desire:     'bg-purple-50 border-purple-200 text-purple-700',
  Action:     'bg-green-50 border-green-200 text-green-700',
  Membership: 'bg-orange-50 border-orange-200 text-orange-700',
}

// Validate English friendly name: lowercase, no spaces, no __, only a-z0-9_
function sanitizeEnInput(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/__+/g, '_').replace(/[^a-z0-9_]/g, '')
}

export default function Module8Campaign({ plan, update }: Props) {
  // Auto-generate utmCampaign for channels that don't have one
  useEffect(() => {
    const needsGeneration = plan.channelRows.some((ch) => !ch.utmCampaign)
    if (needsGeneration) {
      const newRows = plan.channelRows.map((ch) => ({
        ...ch,
        utmCampaign: ch.utmCampaign || generateCampaign(ch, plan),
      }))
      update({ channelRows: newRows })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateChannelRow = (id: string, patch: Partial<ChannelRow>) => {
    update({
      channelRows: plan.channelRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  const regenerate = (ch: ChannelRow) => {
    updateChannelRow(ch.id, { utmCampaign: generateCampaign(ch, plan) })
  }

  const regenerateAll = () => {
    update({
      channelRows: plan.channelRows.map((ch) => ({
        ...ch,
        utmCampaign: generateCampaign(ch, plan),
      })),
    })
  }

  const zhLen = [...(plan.mycampaignNameZh || '')].length
  const zhError = zhLen > 8

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📣</span> 模組 8：廣告活動
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">確認各渠道的 utm_campaign 廣告活動識別碼</p>
        </div>
        <button
          onClick={regenerateAll}
          className="text-xs text-blue-600 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
        >
          🔄 全部重新產生
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl px-4 py-2 text-xs text-blue-700">
        💡 utm_campaign 格式：<span className="font-mono">[階段]__[來源]__[策略]__[友善辨識名稱]__[內容]__[目標]__[起始]__[結束]</span>，以雙底線連接，各段內部使用單底線。
      </div>

      {/* ── 友善辨識名稱 ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-700">廣告活動友善辨識名稱</div>
        <div className="grid grid-cols-2 gap-4">
          {/* 中文 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              中文名稱 <span className="text-gray-400">（僅供頁面呈現，上限 8 字）</span>
            </label>
            <input
              type="text"
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${zhError ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              placeholder="例：會員招募活動"
              value={plan.mycampaignNameZh || ''}
              onChange={(e) => {
                const val = e.target.value
                // allow typing but show error if over 8
                update({ mycampaignNameZh: val })
              }}
            />
            <div className={`text-xs mt-1 flex justify-between ${zhError ? 'text-red-500' : 'text-gray-400'}`}>
              <span>{zhError ? '超過 8 個中文字限制' : ''}</span>
              <span>{zhLen} / 8</span>
            </div>
          </div>

          {/* 英文 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              英文識別碼 <span className="text-gray-400">（mycampaign_name，用於 utm_campaign）</span>
            </label>
            <input
              type="text"
              className="w-full font-mono text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="例：member_recruitment"
              value={plan.mycampaignNameEn || ''}
              onChange={(e) => {
                update({ mycampaignNameEn: sanitizeEnInput(e.target.value) })
              }}
            />
            <div className="text-xs text-gray-400 mt-1">小寫英文、數字，以 _ 連接，不可包含 __</div>
          </div>
        </div>
      </div>

      {/* Segment legend */}
      <div className="flex flex-wrap gap-2">
        {SEGMENT_LABELS.map((label, i) => (
          <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEGMENT_COLORS[i]}`}>
            {label}
          </span>
        ))}
      </div>

      {plan.channelRows.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-8">請先在模組 4 新增渠道</div>
      )}

      <div className="space-y-4">
        {[...plan.channelRows]
          .sort((a, b) => FUNNEL_ORDER.indexOf(a.funnelStage) - FUNNEL_ORDER.indexOf(b.funnelStage))
          .map((ch) => {
          const auto = generateCampaign(ch, plan)
          const segments = (ch.utmCampaign || auto).split('__')
          const stageColor = STAGE_COLOR[ch.funnelStage] || 'bg-gray-50 border-gray-200 text-gray-700'
          const stageZh = STAGE_LABELS[ch.funnelStage]?.zh || ch.funnelStage

          return (
            <div key={ch.id} className={`rounded-xl border-2 ${stageColor} p-4 space-y-3`}>
              {/* Channel header */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-sm">{stageZh}</span>
                <span className="text-xs text-gray-500">{ch.channelType}</span>
                <span className="font-mono text-xs text-blue-600">{ch.utmSource}</span>
                <span className="font-mono text-xs text-blue-600">{ch.utmMedium}</span>
                <button
                  onClick={() => regenerate(ch)}
                  className="ml-auto text-xs text-gray-400 hover:text-blue-600 border border-gray-200 rounded px-2 py-0.5 transition"
                >
                  🔄 重新套用
                </button>
              </div>

              {/* Segment breakdown */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {SEGMENT_LABELS.map((label, i) => (
                  <span key={label}>
                    {i > 0 && <span className="text-gray-300 text-xs mr-1">__</span>}
                    <span className={`inline-flex flex-col items-center text-xs rounded px-2 py-0.5 ${SEGMENT_COLORS[i]}`}>
                      <span className="text-[10px] opacity-60">{label}</span>
                      <span className="font-mono font-semibold">{segments[i] || '—'}</span>
                    </span>
                  </span>
                ))}
              </div>

              {/* Editable campaign value */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">utm_campaign</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 font-mono text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={ch.utmCampaign || auto}
                    onChange={(e) => updateChannelRow(ch.id, { utmCampaign: e.target.value })}
                    placeholder={auto}
                  />
                  {ch.utmCampaign && ch.utmCampaign !== auto && (
                    <button
                      onClick={() => regenerate(ch)}
                      title="還原自動產生值"
                      className="text-xs text-gray-400 hover:text-orange-500 px-2"
                    >
                      ↩
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
