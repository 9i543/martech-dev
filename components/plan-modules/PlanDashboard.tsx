'use client'
import { PlanData, KpiRow, ChannelRow } from '../PlanForm'
import { STAGE_LABELS, STAGE_KEYS } from '@/lib/core-axes'

const FUNNEL_ORDER = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']

// ── Stage visual tokens ────────────────────────────────────────────────────
const STAGE_TOKENS: Record<string, {
  bar: string; label: string; light: string; border: string; dot: string
}> = {
  Awareness:  { bar: 'bg-sky-300',     label: 'text-sky-700',    light: 'bg-sky-50',    border: 'border-sky-300',    dot: '#7DD3FC' },
  Interest:   { bar: 'bg-blue-400',    label: 'text-blue-700',   light: 'bg-blue-50',   border: 'border-blue-400',   dot: '#60A5FA' },
  Desire:     { bar: 'bg-violet-500',  label: 'text-violet-700', light: 'bg-violet-50', border: 'border-violet-500', dot: '#8B5CF6' },
  Action:     { bar: 'bg-green-500',   label: 'text-green-700',  light: 'bg-green-50',  border: 'border-green-500',  dot: '#22C55E' },
  Membership: { bar: 'bg-orange-500',  label: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-500', dot: '#F97316' },
}

// ── Channel type → color tokens ────────────────────────────────────────────
const CHANNEL_COLORS: Record<string, { solid: string; light: string; text: string; hex: string }> = {
  '付費社群': { solid: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700',   hex: '#3B82F6' },
  '自然社群': { solid: 'bg-teal-500',   light: 'bg-teal-100',   text: 'text-teal-700',   hex: '#14B8A6' },
  '部落格':   { solid: 'bg-green-500',  light: 'bg-green-100',  text: 'text-green-700',  hex: '#22C55E' },
  '搜尋點擊': { solid: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700', hex: '#F97316' },
  'Email':    { solid: 'bg-slate-400',  light: 'bg-slate-100',  text: 'text-slate-600',  hex: '#94A3B8' },
  'Display':  { solid: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', hex: '#8B5CF6' },
  '影片':     { solid: 'bg-rose-400',   light: 'bg-rose-100',   text: 'text-rose-700',   hex: '#FB7185' },
  'KOC':      { solid: 'bg-lime-500',   light: 'bg-lime-100',   text: 'text-lime-700',   hex: '#84CC16' },
}

function channelColor(ct: string) {
  return CHANNEL_COLORS[ct] ?? { solid: 'bg-gray-400', light: 'bg-gray-100', text: 'text-gray-600', hex: '#9CA3AF' }
}

function fmt(n: number) {
  return `NT$${n.toLocaleString()}`
}

function getGoalText(stage: string, kpiRows: KpiRow[], channelRows: ChannelRow[], fallback: string): string {
  const ids = new Set(channelRows.filter(c => c.funnelStage === stage).map(c => c.id))
  const rows = kpiRows.filter(k => k.channelRowId && ids.has(k.channelRowId) && k.campaignGoal)
  if (rows.length === 0) return fallback
  const score: Record<string, number> = {}
  for (const r of rows) score[r.campaignGoal] = (score[r.campaignGoal] || 0) + 1
  const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]
  const ZH: Record<string, string> = {
    purchase: '完成購買', add_to_cart: '加入購物車', begin_checkout: '開始結帳',
    generate_lead: '填寫表單', sign_up: '會員註冊', view_item: '查看商品',
    page_view: '頁面瀏覽', click_cta: '點擊按鈕', add_to_wishlist: '加入收藏',
    contact: '聯絡詢問', download: '下載', scroll: '捲動 90%',
  }
  return ZH[top] || top
}

interface Props { plan: PlanData }

export default function PlanDashboard({ plan }: Props) {
  const totalBudget = typeof plan.totalBudget === 'number' ? plan.totalBudget : 0

  const enabledStages = STAGE_KEYS
    .filter(k => plan.funnelConfig[k]?.enabled && plan.funnelConfig[k].ratio > 0)
    .map(k => ({
      key: k,
      zh: STAGE_LABELS[k].zh,
      ratio: plan.funnelConfig[k].ratio,
      budget: Math.round(totalBudget * plan.funnelConfig[k].ratio / 100),
      goal: getGoalText(k, plan.kpiRows, plan.channelRows, plan.funnelConfig[k].task || ''),
    }))

  const sortedChannels = [...plan.channelRows].sort(
    (a, b) => FUNNEL_ORDER.indexOf(a.funnelStage) - FUNNEL_ORDER.indexOf(b.funnelStage)
  )

  const uniqueChannelTypes = Array.from(new Set(sortedChannels.map(c => c.channelType)))
  const maxRatio = Math.max(...enabledStages.map(s => s.ratio), 1)

  if (enabledStages.length === 0 && plan.channelRows.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
      <h3 className="font-semibold text-gray-700 text-base">📊 行銷計畫總覽</h3>

      {/* ── Chart 1 漏斗預算分布 ──────────────────────────────────────── */}
      {enabledStages.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            1 · 漏斗預算分布
          </p>
          <div className="space-y-2.5">
            {enabledStages.map(s => {
              const tk = STAGE_TOKENS[s.key] ?? STAGE_TOKENS.Action
              const barW = Math.max(Math.round((s.ratio / maxRatio) * 100), 8)
              return (
                <div key={s.key} className="flex items-center gap-3">
                  {/* Stage label */}
                  <div className={`w-14 text-xs font-bold text-right shrink-0 ${tk.label}`}>
                    {s.zh}
                  </div>
                  {/* Bar track */}
                  <div className="flex-1 h-9 bg-gray-100 rounded-xl overflow-hidden">
                    <div
                      className={`h-full ${tk.bar} rounded-xl flex items-center gap-3 px-3 transition-all duration-500`}
                      style={{ width: `${barW}%` }}
                    >
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        {s.ratio}%
                      </span>
                      {s.goal && (
                        <span className="text-white/80 text-xs whitespace-nowrap hidden sm:inline">
                          {s.goal}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Budget */}
                  <div className={`w-28 text-xs font-semibold shrink-0 ${tk.label}`}>
                    {totalBudget > 0 ? fmt(s.budget) : `${s.ratio}%`}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {enabledStages.map(s => {
              const tk = STAGE_TOKENS[s.key] ?? STAGE_TOKENS.Action
              return (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${tk.bar}`} />
                  <span className={`text-xs ${tk.label}`}>{s.zh} {s.ratio}%</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Chart 2 各階段渠道拆解 ──────────────────────────────────── */}
      {plan.channelRows.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            2 · 各階段渠道拆解
          </p>
          <div className="space-y-3">
            {enabledStages.map(s => {
              const tk = STAGE_TOKENS[s.key] ?? STAGE_TOKENS.Action
              const stageChannels = sortedChannels.filter(c => c.funnelStage === s.key)
              if (stageChannels.length === 0) return null

              // Max budgetRatio for bar scaling within this stage
              const maxChanRatio = Math.max(...stageChannels.map(c => Number(c.budgetRatio) || 0), 1)

              return (
                <div key={s.key} className={`rounded-xl border ${tk.border} overflow-hidden`}>
                  {/* Stage header */}
                  <div className={`${tk.light} px-4 py-2 flex items-center justify-between`}>
                    <span className={`text-xs font-bold ${tk.label}`}>{s.zh}</span>
                    {totalBudget > 0 && s.budget > 0 && (
                      <span className={`text-xs font-semibold ${tk.label}`}>{fmt(s.budget)}</span>
                    )}
                  </div>
                  {/* Channel bars */}
                  <div className="px-4 py-3 space-y-2 bg-white">
                    {stageChannels.map(ch => {
                      const ratio = Number(ch.budgetRatio) || 0
                      const hasBudget = ratio > 0
                      const chBudget = hasBudget && s.budget ? Math.round(s.budget * ratio / 100) : 0
                      const barW = hasBudget ? Math.max(Math.round((ratio / maxChanRatio) * 100), 6) : 0
                      const cc = channelColor(ch.channelType)
                      const isMain = ch.channelRole === '主力'

                      return (
                        <div key={ch.id} className="flex items-center gap-2">
                          {/* Channel type label */}
                          <div className="w-18 shrink-0" style={{ width: '72px' }}>
                            <span className={`text-xs font-medium ${cc.text} truncate block`}>
                              {ch.channelType}
                            </span>
                          </div>

                          {/* Bar or dashed outline */}
                          <div className="flex-1 h-7 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative">
                            {hasBudget ? (
                              <div
                                className={`h-full ${cc.solid} rounded-lg flex items-center px-2.5 transition-all duration-500`}
                                style={{ width: `${barW}%` }}
                              >
                                <span className="text-white text-xs font-semibold whitespace-nowrap">
                                  {ratio}%
                                </span>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center px-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <span className="text-xs text-gray-400">
                                  {isMain ? 'Organic' : 'Assist'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Budget */}
                          <div className="shrink-0 text-right" style={{ width: '88px' }}>
                            {hasBudget && totalBudget > 0
                              ? <span className="text-xs font-semibold text-gray-700">{fmt(chBudget)}</span>
                              : <span className="text-xs text-gray-300">—</span>
                            }
                          </div>

                          {/* Role badge */}
                          <div className="shrink-0" style={{ width: '40px' }}>
                            {isMain
                              ? <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${cc.light} ${cc.text}`}>主力</span>
                              : <span className="text-xs px-1.5 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400">輔助</span>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Channel color legend */}
          <div className="flex gap-3 mt-3 flex-wrap">
            {uniqueChannelTypes.map(ct => {
              const cc = channelColor(ct)
              return (
                <div key={ct} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-sm ${cc.solid}`} />
                  <span className={`text-xs ${cc.text}`}>{ct}</span>
                </div>
              )
            })}
            <div className="flex items-center gap-1">
              <div className="w-10 h-2.5 border-2 border-dashed border-gray-300 rounded-sm" />
              <span className="text-xs text-gray-400">無預算 / 輔助</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Chart 3 渠道角色矩陣 ────────────────────────────────────── */}
      {enabledStages.length > 0 && uniqueChannelTypes.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            3 · 渠道角色矩陣
          </p>
          <p className="text-xs text-gray-400 mb-3">
            實心 = 主力（有預算）　虛線框 = 輔助 / Organic　· = 無配置
          </p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium pb-2 pr-4" style={{ width: '88px' }}>渠道類型</th>
                  {enabledStages.map(s => {
                    const tk = STAGE_TOKENS[s.key] ?? STAGE_TOKENS.Action
                    return (
                      <th key={s.key} className={`text-center pb-2 px-2 font-bold ${tk.label}`} style={{ minWidth: '100px' }}>
                        <div>{s.zh}</div>
                        {totalBudget > 0 && s.budget > 0 && (
                          <div className="font-normal text-gray-400 text-xs">{fmt(s.budget)}</div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {uniqueChannelTypes.map(ct => {
                  const cc = channelColor(ct)
                  return (
                    <tr key={ct} className="border-t border-gray-100">
                      <td className={`py-2 pr-4 font-semibold ${cc.text}`}>{ct}</td>
                      {enabledStages.map(s => {
                        const matches = plan.channelRows.filter(
                          c => c.funnelStage === s.key && c.channelType === ct
                        )
                        if (matches.length === 0) {
                          return (
                            <td key={s.key} className="py-2 px-2 text-center text-gray-200 text-base">·</td>
                          )
                        }
                        return (
                          <td key={s.key} className="py-2 px-2">
                            <div className="flex flex-col items-center gap-1">
                              {matches.map(ch => {
                                const ratio = Number(ch.budgetRatio) || 0
                                const chBudget = ratio && s.budget ? Math.round(s.budget * ratio / 100) : 0
                                const isMain = ch.channelRole === '主力'
                                const hasBudget = ratio > 0

                                return (
                                  <div
                                    key={ch.id}
                                    className={`rounded-lg px-2 py-1.5 text-center w-full ${
                                      isMain
                                        ? `${cc.solid} text-white`
                                        : `bg-white border-2 border-dashed border-gray-300`
                                    }`}
                                  >
                                    <div className={`font-bold text-xs ${isMain ? 'text-white' : cc.text}`}>
                                      {isMain ? '主力' : '輔助'}
                                    </div>
                                    {hasBudget && totalBudget > 0 ? (
                                      <div className={`text-xs ${isMain ? 'text-white/80' : 'text-gray-400'}`}>
                                        {fmt(chBudget)}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-300">organic</div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
