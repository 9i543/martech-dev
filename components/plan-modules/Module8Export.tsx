'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { PlanData } from '../PlanForm'
import PlanDashboard from './PlanDashboard'



interface Props {
  plan: PlanData
  planId?: string | null
  onSave: () => void
}

// ── UTM source → platform mapping ────────────────────────────────────────────
const SOURCE_TO_PLATFORM: Record<string, string> = {
  google:       'search_platform',
  yahoo:        'search_platform',
  bing:         'search_platform',
  facebook:     'social_platform',
  instagram:    'social_platform',
  line:         'social_platform',
  youtube:      'video_platform',
  tiktok:       'video_platform',
  douyin:       'video_platform',
  email:        'crm_platform',
  notification: 'crm_platform',
  sms:          'crm_platform',
  qrcode:       'offline_touchpoint',
  offline:      'offline_touchpoint',
}

// ── Campaign type mappings (for ad platform exports) ─────────────────────────
const MEDIUM_TO_GADS_TYPE: Record<string, string> = {
  cpc:        'Search',
  display:    'Display',
  paid_video: 'Video',
  video:      'Video',
  paid_social:'Demand Gen',
  social:     'Demand Gen',
  email:      'Performance Max',
  push:       'Performance Max',
  dm:         'Display',
  qrcode:     'Display',
}

const STAGE_TO_META_OBJECTIVE: Record<string, string> = {
  Awareness:  'REACH',
  Interest:   'LINK_CLICKS',
  Desire:     'CONVERSIONS',
  Action:     'CONVERSIONS',
  Membership: 'CONVERSIONS',
}

const CTA_TO_META: Record<string, string> = {
  '了解更多': 'LEARN_MORE',
  '立即購買': 'SHOP_NOW',
  '立即報名': 'SIGN_UP',
  '免費試用': 'GET_OFFER',
  '加入會員': 'SUBSCRIBE',
  '聯絡我們': 'CONTACT_US',
  '下載':     'DOWNLOAD',
  '訂閱':     'SUBSCRIBE',
  '立即預約': 'BOOK_TRAVEL',
  '取得報價': 'GET_QUOTE',
  '非點擊類型': 'NO_BUTTON',
}

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
}

function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const FUNNEL_ORDER = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']

export default function Module8Export({ plan, onSave }: Props) {
  // Local edits for empty cells in the UTM table (key: `${rowId}.${field}`)
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({})
  // Track which row was just copied (for button feedback)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  // Track which cell is currently in edit mode (key: `${rowId}.${field}`)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const setEdit = (rowId: string, field: string, value: string) => {
    setLocalEdits((prev) => ({ ...prev, [`${rowId}.${field}`]: value }))
  }
  const getEdit = (rowId: string, field: string, fallback: string) => {
    const key = `${rowId}.${field}`
    return key in localEdits ? localEdits[key] : fallback
  }


  const tacticLabel = plan.tacticIntent
    ? `${plan.tacticIntent}${plan.tacticAngle ? ` › ${plan.tacticAngle}` : ''}`
    : '—'

  const totalBudget = typeof plan.totalBudget === 'number' ? plan.totalBudget : 0

  const sortedChannelRows = [...plan.channelRows].sort(
    (a, b) => FUNNEL_ORDER.indexOf(a.funnelStage) - FUNNEL_ORDER.indexOf(b.funnelStage)
  )

  // ── Build a UTM row object for each channel ───────────────────────────────
  interface UtmRow {
    id: string
    funnelStage: string
    channelType: string
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_term: string
    utm_content: string
    utm_marketing_tactic: string
    utm_creative_format: string
    utm_source_platform: string
    landing_url: string
  }

  const buildUtmRows = (): UtmRow[] =>
    sortedChannelRows.map((ch) => {
      const creative = plan.creativeRows.find((c) => c.channelRowId === ch.id)
      const audience = plan.audienceRows.find((a) => a.channelRowId === ch.id)
      const utmContent = creative ? `${creative.contentGroup}_${creative.contentVariant}` : ''
      const sourcePlatform = SOURCE_TO_PLATFORM[ch.utmSource?.toLowerCase() || ''] || ''
      const marketingTactic =
        plan.tacticIntent && plan.tacticAngle
          ? `${plan.tacticIntent}__${plan.tacticAngle}`
          : ''
      return {
        id: ch.id,
        funnelStage: ch.funnelStage,
        channelType: ch.channelType,
        utm_source: ch.utmSource || '',
        utm_medium: ch.utmMedium || '',
        utm_campaign: getEdit(ch.id, 'utm_campaign', ch.utmCampaign || ''),
        utm_term: getEdit(ch.id, 'utm_term', audience?.utmTerm || ''),
        utm_content: getEdit(ch.id, 'utm_content', utmContent),
        utm_marketing_tactic: marketingTactic,
        utm_creative_format: getEdit(ch.id, 'utm_creative_format', creative?.utmCreativeFormat || ''),
        utm_source_platform: getEdit(ch.id, 'utm_source_platform', sourcePlatform),
        landing_url: getEdit(ch.id, 'landing_url', ch.landingUrl || ''),
      }
    })

  const buildFullUTMUrl = (row: UtmRow): string => {
    const base = row.landing_url
    if (!base) return ''
    const params = new URLSearchParams()
    if (row.utm_source)           params.set('utm_source', row.utm_source)
    if (row.utm_medium)           params.set('utm_medium', row.utm_medium)
    if (row.utm_campaign)         params.set('utm_campaign', row.utm_campaign)
    if (row.utm_term)             params.set('utm_term', row.utm_term)
    if (row.utm_content)          params.set('utm_content', row.utm_content)
    if (row.utm_marketing_tactic) params.set('utm_marketing_tactic', row.utm_marketing_tactic)
    if (row.utm_creative_format)  params.set('utm_creative_format', row.utm_creative_format)
    if (row.utm_source_platform)  params.set('utm_source_platform', row.utm_source_platform)
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}${params.toString()}`
  }

  // ── Excel export ──────────────────────────────────────────────────────────
  const downloadExcel = () => {
    const rows = buildUtmRows()
    const data = rows.map((row) => ({
      '漏斗':                 row.funnelStage,
      '渠道類型':              row.channelType,
      'utm_source':           row.utm_source,
      'utm_medium':           row.utm_medium,
      'utm_campaign':         row.utm_campaign,
      'utm_term':             row.utm_term,
      'utm_content':          row.utm_content,
      'utm_marketing_tactic': row.utm_marketing_tactic,
      'utm_creative_format':  row.utm_creative_format,
      'utm_source_platform':  row.utm_source_platform,
      '落地頁':                row.landing_url,
      '完整 UTM 連結':         buildFullUTMUrl(row),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'UTM 參數')
    XLSX.writeFile(wb, `${plan.planName || 'plan'}_UTM.xlsx`)
  }

  // ── Google Ads Editor CSV ─────────────────────────────────────────────────
  const downloadGoogleAdsCSV = () => {
    const headers = [
      'Row Type', 'Action', 'Campaign status', 'Campaign', 'Campaign type',
      'Networks', 'Budget', 'Budget type', 'Bid strategy type',
      'Campaign start date', 'Campaign end date',
      'Language', 'Tracking template', 'Final URL suffix',
    ]
    const rows: string[] = [headers.join(',')]

    const googleChannels = plan.channelRows.filter((ch) => ['cpc', 'display'].includes(ch.utmMedium))
    if (googleChannels.length === 0) {
      alert('目前計畫中無 Google 渠道（cpc / display），無法產生範本')
      return
    }
    googleChannels.forEach((ch) => {
      const stageCfg = plan.funnelConfig[ch.funnelStage]
      const stageBudget = totalBudget && stageCfg?.enabled ? totalBudget * (stageCfg.ratio || 0) / 100 : 0
      const budget = stageBudget && ch.budgetRatio ? Math.round(stageBudget * Number(ch.budgetRatio) / 100) : 0
      const campaignType = MEDIUM_TO_GADS_TYPE[ch.utmMedium] || 'Search'
      const boundKpis = plan.kpiRows.filter((k) => k.channelRowId === ch.id)
      let bidStrategy = 'Maximize Conversions'
      if (boundKpis.some((k) => k.kpiType?.toLowerCase().includes('roas'))) bidStrategy = 'Target ROAS'
      else if (boundKpis.some((k) => k.kpiType?.toLowerCase().includes('cpa'))) bidStrategy = 'Target CPA'

      const trackingTemplate = ch.landingUrl
        ? `{lpurl}?utm_source=${ch.utmSource}&utm_medium=${ch.utmMedium}&utm_campaign={campaignid}`
        : ''
      const finalSuffix = `utm_source=${ch.utmSource}&utm_medium=${ch.utmMedium}`
      const campaignName = [plan.planName, ch.funnelStage, ch.channelType, ch.utmSource]
        .filter(Boolean).join('_')

      rows.push(csvRow([
        'Campaign', 'Add', 'Enabled', campaignName, campaignType,
        campaignType === 'Search' ? 'Google search' : 'Display Network',
        budget > 0 ? budget : '',
        'Daily', bidStrategy,
        plan.startDate || '', plan.endDate || '',
        'zh-TW', trackingTemplate, finalSuffix,
      ]))
    })

    downloadFile(rows.join('\n'), `${plan.planName || 'plan'}_GoogleAds.csv`)
  }

  // ── META Ads Manager CSV ──────────────────────────────────────────────────
  const downloadMetaAdsCSV = () => {
    const headers = [
      'Campaign Name', 'Campaign Status', 'Campaign Objective',
      'Campaign Daily Budget', 'Ad Set Name', 'Ad Set Run Status',
      'Ad Set Daily Budget', 'Publisher Platforms',
      'Facebook Positions', 'Instagram Positions',
      'Optimization Goal', 'Bid Amount', 'Ad Set Time Start', 'Ad Set Time Stop',
      'Ad Name', 'Ad Status', 'URL Tags', 'Call to Action',
    ]
    const rows: string[] = [headers.join(',')]

    const metaChannels = plan.channelRows.filter((ch) => ch.utmMedium === 'paid_social')
    if (metaChannels.length === 0) {
      alert('目前計畫中無付費社群渠道（paid_social），無法產生範本')
      return
    }
    metaChannels.forEach((ch) => {
      const stageCfg = plan.funnelConfig[ch.funnelStage]
      const stageBudget = totalBudget && stageCfg?.enabled ? totalBudget * (stageCfg.ratio || 0) / 100 : 0
      const budget = stageBudget && ch.budgetRatio ? Math.round(stageBudget * Number(ch.budgetRatio) / 100) : 0
      const objective = STAGE_TO_META_OBJECTIVE[ch.funnelStage] || 'LINK_CLICKS'
      const campaignName = [plan.planName, ch.funnelStage, ch.channelType].filter(Boolean).join('_')
      const adSetName = [ch.channelType, ch.utmMedium, ch.utmSource].filter(Boolean).join('_')

      const source = ch.utmSource?.toLowerCase() || ''
      const publishers = source.includes('instagram') ? 'instagram'
        : source.includes('facebook') || source.includes('meta') ? 'facebook'
        : 'facebook,instagram'

      const urlTags = [
        `utm_source=${ch.utmSource}`,
        `utm_medium=${ch.utmMedium}`,
        `utm_campaign={{campaign.name}}`,
        `utm_content={{ad.name}}`,
      ].join('&')

      const ctaLabel = ch.ctaType || '了解更多'
      const metaCta = CTA_TO_META[ctaLabel] || 'LEARN_MORE'

      const boundKpis = plan.kpiRows.filter((k) => k.channelRowId === ch.id)
      let optimizationGoal = objective === 'REACH' ? 'REACH' : 'LINK_CLICKS'
      if (boundKpis.some((k) => ['purchase', 'begin_checkout', 'add_payment_info'].includes(k.campaignGoal))) {
        optimizationGoal = 'OFFSITE_CONVERSIONS'
      } else if (boundKpis.some((k) => ['generate_lead', 'sign_up', 'contact'].includes(k.campaignGoal))) {
        optimizationGoal = 'LEAD_GENERATION'
      }

      rows.push(csvRow([
        campaignName, 'ACTIVE', objective,
        budget > 0 ? budget : '',
        adSetName, 'ACTIVE',
        budget > 0 ? Math.round(budget * 0.5) : '',
        publishers,
        publishers.includes('facebook') ? 'feed' : '',
        publishers.includes('instagram') ? 'stream' : '',
        optimizationGoal, '',
        plan.startDate || '', plan.endDate || '',
        adSetName + '_ad01', 'ACTIVE',
        urlTags, metaCta,
      ]))
    })

    downloadFile(rows.join('\n'), `${plan.planName || 'plan'}_META_AdsManager.csv`)
  }

  const utmRows = buildUtmRows()

  // ── Editable cell helper ──────────────────────────────────────────────────
  function EditableCell({
    rowId, field, value, className,
  }: { rowId: string; field: string; value: string; className?: string }) {
    const cellKey = `${rowId}.${field}`
    const current = getEdit(rowId, field, value)
    const isEditing = editingKey === cellKey

    // Non-empty and not in edit mode → show styled span with click-to-edit
    if (current && !isEditing) {
      return (
        <span
          title="點擊編輯"
          onClick={() => setEditingKey(cellKey)}
          className={`cursor-pointer group inline-flex items-center gap-1 ${className ?? ''}`}
        >
          {current}
          <span className="opacity-0 group-hover:opacity-40 text-gray-400 text-xs">✏️</span>
        </span>
      )
    }

    // Empty or in edit mode → show input
    return (
      <input
        autoFocus={isEditing}
        className="w-full min-w-[5rem] border border-dashed border-gray-300 rounded px-1 py-0.5 text-xs font-mono text-gray-500 focus:outline-none focus:border-blue-400 bg-gray-50"
        placeholder="填入..."
        value={localEdits[cellKey] ?? value}
        onChange={(e) => setEdit(rowId, field, e.target.value)}
        onBlur={() => setEditingKey(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingKey(null) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <span>⬇️</span> 模組 10：輸出與串接
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">活動名稱</div>
            <div className="font-bold text-gray-800">{plan.planName || '（未命名）'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">總預算</div>
            <div className="font-bold text-gray-800">
              {totalBudget > 0 ? `NT$ ${totalBudget.toLocaleString()}` : '—'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">活動期間</div>
            <div className="font-bold text-gray-800">
              {plan.startDate || '—'} ～ {plan.endDate || '—'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">策略目的</div>
            <div className="font-bold text-gray-800 text-sm font-mono">{tacticLabel}</div>
          </div>
        </div>
      </div>

      {/* Plan Dashboard — 3-chart visualization */}
      <PlanDashboard plan={plan} />

      {/* Channel Summary */}
      {plan.channelRows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-3">渠道清單（{plan.channelRows.length} 個）</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="px-3 py-2 text-left">漏斗</th>
                  <th className="px-3 py-2 text-left">類型</th>
                  <th className="px-3 py-2 text-left">utm_source</th>
                  <th className="px-3 py-2 text-left">utm_medium</th>
                  <th className="px-3 py-2 text-left">角色</th>
                  <th className="px-3 py-2 text-right">占比</th>
                  <th className="px-3 py-2 text-right">預算</th>
                </tr>
              </thead>
              <tbody>
                {sortedChannelRows.map((r) => {
                  const stageCfg = plan.funnelConfig[r.funnelStage]
                  const stageBudget = totalBudget && stageCfg?.enabled ? totalBudget * (stageCfg.ratio || 0) / 100 : 0
                  const computedBudget = stageBudget && r.budgetRatio ? Math.round(stageBudget * Number(r.budgetRatio) / 100) : 0
                  return (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{r.funnelStage}</td>
                      <td className="px-3 py-2">{r.channelType}</td>
                      <td className="px-3 py-2 font-mono">{r.utmSource}</td>
                      <td className="px-3 py-2 font-mono">{r.utmMedium}</td>
                      <td className="px-3 py-2">{r.channelRole}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {r.budgetRatio ? `${r.budgetRatio}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-700 font-medium">
                        {computedBudget > 0 ? `NT$${computedBudget.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UTM 參數總覽 */}
      {plan.channelRows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">UTM 參數總覽</h3>
            <button
              onClick={downloadExcel}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-medium"
            >
              📥 匯出 Excel
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">空白欄位可直接點擊填入；點選「產生連結」複製帶有完整 UTM 參數的連結。</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse" style={{ minWidth: '2000px', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '96px' }} />   {/* 產生連結 */}
                <col style={{ width: '90px' }} />   {/* 漏斗 */}
                <col style={{ width: '96px' }} />   {/* 渠道類型 */}
                <col style={{ width: '110px' }} />  {/* utm_source */}
                <col style={{ width: '120px' }} />  {/* utm_medium */}
                <col style={{ width: '380px' }} />  {/* utm_campaign */}
                <col style={{ width: '160px' }} />  {/* utm_term */}
                <col style={{ width: '210px' }} />  {/* utm_content */}
                <col style={{ width: '230px' }} />  {/* utm_marketing_tactic */}
                <col style={{ width: '150px' }} />  {/* utm_creative_format */}
                <col style={{ width: '160px' }} />  {/* utm_source_platform */}
                <col style={{ width: '210px' }} />  {/* 落地頁 */}
              </colgroup>
              <thead>
                <tr className="bg-gray-50 text-gray-400 border-b">
                  <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-center font-semibold whitespace-nowrap border-r border-gray-200">產生連結</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">漏斗</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">渠道類型</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_source</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_medium</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_campaign</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_term</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_content</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_marketing_tactic</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_creative_format</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">utm_source_platform</th>
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">落地頁</th>
                </tr>
              </thead>
              <tbody>
                {utmRows.map((row) => {
                  const fullUrl = buildFullUTMUrl(row)
                  return (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white border-r border-gray-100 px-2 py-2 text-center">
                        <button
                          onClick={() => {
                            if (!fullUrl) { alert('請先填入落地頁 URL'); return }
                            navigator.clipboard.writeText(fullUrl).then(() => {
                              setCopiedId(row.id)
                              setTimeout(() => setCopiedId((id) => id === row.id ? null : id), 2000)
                            })
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                            copiedId === row.id
                              ? 'bg-green-100 text-green-700'
                              : fullUrl
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {copiedId === row.id ? '✅ 已複製！' : '🔗 產生連結'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">{row.funnelStage}</td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">{row.channelType}</td>
                      <td className="px-3 py-2 font-mono text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis">{row.utm_source || '—'}</td>
                      <td className="px-3 py-2 font-mono text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis">{row.utm_medium || '—'}</td>
                      <td className="px-3 py-2 font-mono text-indigo-600">
                        <EditableCell rowId={row.id} field="utm_campaign" value={row.utm_campaign} className="font-mono text-indigo-600 whitespace-nowrap" />
                      </td>
                      <td className="px-3 py-2 font-mono">
                        <EditableCell rowId={row.id} field="utm_term" value={row.utm_term} className="font-mono text-green-600 whitespace-nowrap" />
                      </td>
                      <td className="px-3 py-2 font-mono">
                        <EditableCell rowId={row.id} field="utm_content" value={row.utm_content} className="font-mono text-purple-600 whitespace-nowrap" />
                      </td>
                      <td className="px-3 py-2 font-mono text-teal-600 whitespace-nowrap overflow-hidden text-ellipsis">
                        {row.utm_marketing_tactic || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        <EditableCell rowId={row.id} field="utm_creative_format" value={row.utm_creative_format} className="font-mono text-teal-600 whitespace-nowrap" />
                      </td>
                      <td className="px-3 py-2 font-mono">
                        <EditableCell rowId={row.id} field="utm_source_platform" value={row.utm_source_platform} className="font-mono text-orange-600 whitespace-nowrap" />
                      </td>
                      <td className="px-3 py-2">
                        <EditableCell rowId={row.id} field="landing_url" value={row.landing_url} className="text-gray-500 whitespace-nowrap" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">輸出 / 串接</h3>

        {/* General */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">計畫儲存 / UTM</div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onSave}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition text-sm"
            >
              💾 儲存計畫
            </button>
            <button
              onClick={downloadExcel}
              disabled={plan.channelRows.length === 0}
              className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-40 text-sm"
            >
              📥 匯出 UTM 清單 Excel
            </button>
          </div>
        </div>

        {/* Ad platform exports */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">廣告平台匯入範本</div>
          <div className="flex gap-3 flex-wrap">
            {(() => {
              const gCount = plan.channelRows.filter((ch) => ['cpc', 'display'].includes(ch.utmMedium)).length
              const mCount = plan.channelRows.filter((ch) => ch.utmMedium === 'paid_social').length
              return (
                <>
                  <button
                    onClick={downloadGoogleAdsCSV}
                    disabled={gCount === 0}
                    className="px-5 py-2.5 bg-white border-2 border-blue-400 text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition disabled:opacity-40 disabled:border-gray-200 disabled:text-gray-400 text-sm flex items-center gap-2"
                  >
                    <span className="text-base font-bold">G</span>
                    Google Ads Editor CSV
                    <span className={`text-xs font-normal ${gCount > 0 ? 'text-blue-400' : 'text-gray-300'}`}>
                      {gCount > 0 ? `(${gCount} 個 cpc/display)` : '（無 Google 渠道）'}
                    </span>
                  </button>
                  <button
                    onClick={downloadMetaAdsCSV}
                    disabled={mCount === 0}
                    className="px-5 py-2.5 bg-white border-2 border-indigo-400 text-indigo-700 font-medium rounded-xl hover:bg-indigo-50 transition disabled:opacity-40 disabled:border-gray-200 disabled:text-gray-400 text-sm flex items-center gap-2"
                  >
                    <span className="text-base font-bold">f</span>
                    META Ads Manager CSV
                    <span className={`text-xs font-normal ${mCount > 0 ? 'text-indigo-400' : 'text-gray-300'}`}>
                      {mCount > 0 ? `(${mCount} 個 paid_social)` : '（無付費社群渠道）'}
                    </span>
                  </button>
                </>
              )
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Google Ads：可直接透過 Google Ads Editor「匯入 CSV」上傳建立廣告活動。
            META：可透過 Ads Manager「匯入廣告」功能上傳。上傳前請確認帳號 ID 與預算設定。
          </p>
        </div>
      </div>
    </div>
  )
}
