'use client'
import { PlanData, ChannelRow, KpiRow } from '../PlanForm'

const FUNNEL_STAGES = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']

const FUNNEL_STAGE_ZH: Record<string, string> = {
  Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員',
}

const BUCKET_LABELS: Record<string, string> = {
  paid: '採購媒體', owned: '自媒體', influence: '影響力',
}
const BUCKET_COLORS: Record<string, string> = {
  paid:      'bg-blue-50 text-blue-700 border-blue-200',
  owned:     'bg-green-50 text-green-700 border-green-200',
  influence: 'bg-purple-50 text-purple-700 border-purple-200',
}

// Goals that don't map to a button-click CTA (observation / view type)
const NON_CLICK_GOALS = new Set([
  'page_view', 'scroll', 'view_video', 'view_item', 'select_item',
  'add_to_wishlist', 'add_to_cart', 'view_cart', 'form_start', 'download',
])

// Suggested CTA per campaign_goal
const GOAL_CTA_SUGGESTION: Record<string, string> = {
  page_view:        '非點擊類型',
  scroll:           '非點擊類型',
  view_video:       '非點擊類型',
  view_item:        '非點擊類型',
  select_item:      '非點擊類型',
  click_cta:        '點擊按鈕',
  add_to_wishlist:  '非點擊類型',
  add_to_cart:      '非點擊類型',
  view_cart:        '非點擊類型',
  form_start:       '非點擊類型',
  sign_up:          '會員註冊',
  generate_lead:    '填寫表單',
  contact:          '聯絡詢問',
  appointment:      '預約',
  download:         '非點擊類型',
  begin_checkout:   '開始結帳',
  add_payment_info: '開始付款',
  purchase:         '完成購買',
  trial:            '試用申請',
  phone_call:       '撥打電話',
  share:            '分享內容',
}


const GOAL_LABELS: Record<string, string> = {
  page_view: '頁面瀏覽', scroll: '捲動 90%', view_video: '影片觀看',
  view_item: '查看商品', select_item: '選取商品', click_cta: '點擊按鈕',
  add_to_wishlist: '加入收藏', add_to_cart: '加入購物車', view_cart: '查看購物車',
  form_start: '開始填表', sign_up: '會員註冊', generate_lead: '填寫表單',
  contact: '聯絡詢問', appointment: '預約', download: '下載',
  begin_checkout: '開始結帳', add_payment_info: '開始付款', purchase: '完成購買',
  trial: '試用申請', phone_call: '撥打電話', share: '分享內容',
}

const CTA_TYPES = [
  '非點擊類型',
  '頁面瀏覽', '捲動 90%', '影片觀看', '查看商品', '選取商品', '點擊按鈕',
  '加入收藏', '加入購物車', '查看購物車', '開始填表', '會員註冊', '填寫表單',
  '聯絡詢問', '預約', '下載', '開始結帳', '開始付款', '完成購買',
  '試用申請', '撥打電話', '分享內容',
]

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module7Landing({ plan, update }: Props) {
  const channelRows = plan.channelRows
  const kpiRows = plan.kpiRows

  const updateChannelRow = (id: string, patch: Partial<ChannelRow>) => {
    update({ channelRows: channelRows.map((r) => r.id === id ? { ...r, ...patch } : r) })
  }

  const updateKpiRow = (id: string, patch: Partial<KpiRow>) => {
    update({ kpiRows: kpiRows.map((r) => r.id === id ? { ...r, ...patch } : r) })
  }

  const deleteKpiRow = (id: string) => {
    update({ kpiRows: kpiRows.filter((r) => r.id !== id) })
  }

  const deleteChannelRow = (id: string) => {
    update({
      channelRows:  plan.channelRows.filter((r) => r.id !== id),
      audienceRows: plan.audienceRows.filter((r) => r.channelRowId !== id),
      creativeRows: plan.creativeRows.filter((r) => r.channelRowId !== id),
      kpiRows:      plan.kpiRows.filter((r) => r.channelRowId !== id),
    })
  }

  const activeStages = FUNNEL_STAGES.filter((s) =>
    channelRows.some((r) => r.funnelStage === s)
  )

  const channelFilled = channelRows.filter((r) => r.landingUrl).length

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>🔗</span> 模組 9：活動網址
      </h2>

      <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
        💡 為每個渠道設定主要落地頁，並依模組 7 設定的目標逐一設定目標落地頁與 CTA 類型。非點擊類型目標（如頁面瀏覽、查看商品）請選擇「非點擊類型」。
      </div>

      {channelRows.length === 0 ? (
        <div className="text-center text-gray-400 py-10 border-2 border-dashed rounded-xl">
          請先在模組 4 新增渠道，此處將自動列出所有渠道供您設定落地頁
        </div>
      ) : (
        <div className="space-y-6">
          {activeStages.map((stage) => {
            const stageChannels = channelRows.filter((r) => r.funnelStage === stage)
            return (
              <div key={stage}>
                {/* Stage header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <span className="font-bold text-gray-800 text-sm">{FUNNEL_STAGE_ZH[stage]}</span>
                  <span className="text-xs text-gray-400">({stage})</span>
                </div>

                <div className="pl-4 space-y-4">
                  {stageChannels.map((ch) => {
                    const boundKpis = kpiRows.filter((r) => r.channelRowId === ch.id)
                    const chFilled = !!ch.landingUrl
                    const kpisDone = boundKpis.filter((r) =>
                      !!ch.landingUrl && !!(r.ctaType || GOAL_CTA_SUGGESTION[r.campaignGoal])
                    ).length

                    return (
                      <div key={ch.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Channel header row */}
                        <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${BUCKET_COLORS[ch.channelBucket] || ''}`}>
                              {BUCKET_LABELS[ch.channelBucket]} {ch.channelBucket.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">{ch.channelType}</span>
                            <code className="text-xs font-mono bg-white px-1.5 py-0.5 rounded text-gray-500 border">{ch.utmMedium}</code>
                            <span className="text-xs text-gray-400">{ch.utmSource}</span>
                            {ch.channelRole && (
                              <span className="text-xs text-gray-400 border rounded px-1.5 py-0.5">{ch.channelRole}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs">
                            {boundKpis.length > 0 && (
                              <span className={`px-2 py-0.5 rounded-full font-medium ${
                                kpisDone === boundKpis.length
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                KPI {kpisDone}/{boundKpis.length} 已設定
                              </span>
                            )}
                            <button
                              onClick={() => deleteChannelRow(ch.id)}
                              className="text-red-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition ml-1"
                              title="刪除此渠道（含所有關聯受眾、素材、KPI）"
                            >
                              ✕
                            </button>
                          </div>
                        </div>


                        {/* Channel-level landing URL */}
                        <div className="px-4 py-3 border-b bg-white">
                          <div className="text-xs font-medium text-gray-600 mb-2">渠道主要落地頁</div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">落地頁 URL</label>
                            <input
                              className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${chFilled ? 'border-green-300' : ''}`}
                              value={ch.landingUrl || ''}
                              onChange={(e) => updateChannelRow(ch.id, { landingUrl: e.target.value })}
                              placeholder="https://example.com/landing-page"
                            />
                          </div>
                          {ch.landingUrl && (() => {
                            const creative = plan.creativeRows.find((c) => c.channelRowId === ch.id)
                            const formatParam = creative?.utmCreativeFormat
                              ? `&utm_creative_format=${creative.utmCreativeFormat}`
                              : ''
                            return (
                              <div className="mt-1.5 text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 font-mono truncate">
                                {ch.landingUrl}?utm_source={ch.utmSource}&utm_medium={ch.utmMedium}{formatParam}
                              </div>
                            )
                          })()}
                        </div>

                        {/* KPI goal rows — CTA per goal + delete */}
                        {boundKpis.length > 0 && (
                          <div className="divide-y divide-gray-100">
                            {boundKpis.map((kpi) => {
                              const isNonClick = NON_CLICK_GOALS.has(kpi.campaignGoal)
                              const effectiveCta = kpi.ctaType || GOAL_CTA_SUGGESTION[kpi.campaignGoal] || '了解更多'
                              return (
                                <div key={kpi.id} className="px-4 py-2.5 bg-white flex items-center gap-3">
                                  {/* Goal info (read-only) */}
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                                    <span className="text-xs text-gray-400 shrink-0">目標</span>
                                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium shrink-0">
                                      {GOAL_LABELS[kpi.campaignGoal] || kpi.campaignGoal}
                                    </span>
                                    <code className="text-xs text-gray-400 font-mono shrink-0">({kpi.campaignGoal})</code>
                                    {kpi.kpiType && (
                                      <span className="text-xs text-gray-400 font-mono shrink-0">
                                        · {kpi.kpiType}{kpi.kpiValue !== '' ? ` ${kpi.kpiValue}` : ''}
                                      </span>
                                    )}
                                    {isNonClick && (
                                      <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded shrink-0">非點擊</span>
                                    )}
                                  </div>

                                  {/* CTA select */}
                                  <div className="shrink-0 w-32">
                                    <select
                                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={effectiveCta}
                                      onChange={(e) => updateKpiRow(kpi.id, { ctaType: e.target.value })}
                                    >
                                      {CTA_TYPES.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                  </div>

                                  {/* Delete */}
                                  <button
                                    onClick={() => deleteKpiRow(kpi.id)}
                                    className="shrink-0 text-red-300 hover:text-red-500 text-xs p-1 rounded hover:bg-red-50 transition"
                                    title="移除此目標"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {boundKpis.length === 0 && (
                          <div className="px-4 py-3 text-xs text-gray-300 italic">
                            尚未在模組 7 為此渠道設定 KPI 目標
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary progress */}
      {channelRows.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">落地頁設定進度</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${channelRows.length > 0 ? Math.round((channelFilled / channelRows.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 shrink-0">
              {channelFilled} / {channelRows.length} 渠道已設定落地頁
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
