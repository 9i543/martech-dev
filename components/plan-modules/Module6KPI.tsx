'use client'
import { v4 as uuidv4 } from 'uuid'
import { PlanData, KpiRow, ChannelRow } from '../PlanForm'

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

const STAGE_KPIS: Record<string, string[]> = {
  Awareness:  ['UV', 'PV', 'reach', 'impression', 'CPM', 'VTR'],
  Interest:   ['CTR', 'CPC', 'engaged_sessions', 'avg_session_duration'],
  Desire:     ['add_to_cart_rate', 'CPL', 'leads', 'form_start_rate', 'wishlist_rate'],
  Action:     ['ROAS', 'CPA', 'revenue', 'conversion_rate', 'CPL'],
  Membership: ['retention_rate', 'repeat_purchase_rate', 'reactivation_rate', 'share_rate'],
}

const GOAL_KPI_MAP: Record<string, string[]> = {
  page_view:        ['UV', 'PV', 'bounce_rate'],
  scroll:           ['scroll_rate', 'engaged_sessions'],
  view_video:       ['VTR', 'views', 'CPV'],
  view_item:        ['view_item_rate', 'sessions'],
  select_item:      ['CTR', 'click_rate'],
  click_cta:        ['CTR', 'CPC'],
  add_to_wishlist:  ['wishlist_rate'],
  add_to_cart:      ['add_to_cart_rate', 'ROAS'],
  view_cart:        ['view_cart_rate', 'cart_abandonment_rate'],
  form_start:       ['form_start_rate'],
  sign_up:          ['registration_rate', 'CAC'],
  generate_lead:    ['CPL', 'leads', 'lead_rate'],
  contact:          ['contact_rate', 'CPA'],
  appointment:      ['CPA', 'appointment_rate'],
  download:         ['downloads', 'cost_per_download'],
  begin_checkout:   ['checkout_rate'],
  add_payment_info: ['payment_completion_rate'],
  purchase:         ['ROAS', 'CPA', 'revenue', 'conversion_rate'],
  trial:            ['trial_rate', 'cost_per_trial'],
  phone_call:       ['calls', 'call_rate', 'CPCv'],
  share:            ['share_rate', 'shares'],
}

const CAMPAIGN_GOALS: { value: string; label: string; desc: string; stages: string[] }[] = [
  { value: 'page_view',        label: '頁面瀏覽',          desc: '進入頁面、瀏覽主要內容',                   stages: ['Awareness'] },
  { value: 'scroll',           label: '捲動 90%',          desc: '深度瀏覽頁面至 90% 位置',                  stages: ['Awareness'] },
  { value: 'view_video',       label: '影片觀看',          desc: '觀看影片內容或廣告影片',                   stages: ['Awareness', 'Interest'] },
  { value: 'view_item',        label: '查看商品',          desc: '查看商品頁或商品內容',                     stages: ['Interest', 'Desire'] },
  { value: 'select_item',      label: '選取商品',          desc: '從清單中選取商品或點擊商品卡',             stages: ['Interest', 'Desire'] },
  { value: 'click_cta',        label: '點擊按鈕',          desc: '點擊主要 CTA 按鈕或重點導流按鈕',          stages: ['Interest', 'Desire'] },
  { value: 'add_to_wishlist',  label: '加入收藏',          desc: '收藏商品或加入願望清單',                   stages: ['Desire'] },
  { value: 'add_to_cart',      label: '加入購物車',        desc: '將商品加入購物車',                         stages: ['Desire'] },
  { value: 'view_cart',        label: '查看購物車',        desc: '查看購物車內容時',                         stages: ['Desire'] },
  { value: 'form_start',       label: '開始填表',          desc: '開始填寫表單但尚未送出',                   stages: ['Desire'] },
  { value: 'sign_up',          label: '會員註冊',          desc: '完成會員註冊或帳號建立',                   stages: ['Desire'] },
  { value: 'generate_lead',    label: '填寫表單',          desc: '完成表單填寫並送出，成功成為潛在名單',     stages: ['Desire'] },
  { value: 'contact',          label: '聯絡詢問',          desc: '完成聯絡諮詢、詢價或洽詢',                 stages: ['Desire', 'Action'] },
  { value: 'appointment',      label: '預約',              desc: '完成預約、預約諮詢或預約到店',             stages: ['Desire', 'Action'] },
  { value: 'download',         label: '下載',              desc: '完成檔案、素材或文件下載',                 stages: ['Desire'] },
  { value: 'begin_checkout',   label: '開始結帳',          desc: '進入結帳流程',                             stages: ['Action'] },
  { value: 'add_payment_info', label: '開始付款',          desc: '進入付款頁或付款流程',                     stages: ['Action'] },
  { value: 'purchase',         label: '完成購買',          desc: '完成購買、下單或付款成功',                 stages: ['Action'] },
  { value: 'trial',            label: '試用申請',          desc: '完成試用、體驗或試驗申請',                 stages: ['Desire', 'Action'] },
  { value: 'phone_call',       label: '撥打電話',          desc: '點擊撥號或完成來電聯繫',                   stages: ['Action'] },
  { value: 'share',            label: '分享內容',          desc: '分享內容、商品或活動頁面',                 stages: ['Interest', 'Membership'] },
]

const getGoalsForStage = (stage: string) =>
  CAMPAIGN_GOALS.filter((g) => g.stages.includes(stage))

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module6KPI({ plan, update }: Props) {
  const rows = plan.kpiRows
  const channelRows = plan.channelRows

  const activeStages = FUNNEL_STAGES.filter((s) =>
    channelRows.some((r) => r.funnelStage === s)
  )

  const addRow = (channelRow: ChannelRow, goalValue?: string) => {
    const defaultGoal = goalValue || getGoalsForStage(channelRow.funnelStage)[0]?.value || 'page_view'
    const defaultKpiType = GOAL_KPI_MAP[defaultGoal]?.[0] || STAGE_KPIS[channelRow.funnelStage]?.[0] || ''
    update({
      kpiRows: [
        ...rows,
        {
          id: uuidv4(),
          funnelStage: channelRow.funnelStage,
          campaignGoal: defaultGoal,
          kpiType: defaultKpiType,
          kpiValue: '',
          kpiCost: '',
          notes: '',
          channelRowId: channelRow.id,
        },
      ],
    })
  }

  const updateRow = (id: string, patch: Partial<KpiRow>) => {
    const extra: Partial<KpiRow> = {}
    if (patch.campaignGoal) {
      const suggested = GOAL_KPI_MAP[patch.campaignGoal]?.[0]
      if (suggested) extra.kpiType = suggested
    }
    update({ kpiRows: rows.map((r) => r.id === id ? { ...r, ...patch, ...extra } : r) })
  }

  const deleteRow = (id: string) => {
    update({ kpiRows: rows.filter((r) => r.id !== id) })
  }

  const getStageBudget = (stage: string) => {
    const cfg = plan.funnelConfig[stage]
    const total = typeof plan.totalBudget === 'number' ? plan.totalBudget : 0
    return total && cfg?.enabled ? Math.round(total * cfg.ratio / 100) : 0
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>📈</span> 模組 7：目標與 KPI
      </h2>

      {/* campaign_goal 對照表 */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">campaign_goal 轉換目標對照</span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-[5.5rem_8rem_1fr_10rem] px-4 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-400">
            <span>中文名稱</span>
            <span>campaign_goal</span>
            <span>使用情境</span>
            <span>對應漏斗階段</span>
          </div>
          {CAMPAIGN_GOALS.map((g) => (
            <div key={g.value} className="grid grid-cols-[5.5rem_8rem_1fr_10rem] px-4 py-2 text-xs hover:bg-gray-50">
              <span className="font-medium text-gray-800">{g.label}</span>
              <code className="font-mono text-blue-600">{g.value}</code>
              <span className="text-gray-500 leading-relaxed">{g.desc}</span>
              <span className="text-gray-400">{g.stages.map((s) => ({ Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員' } as Record<string,string>)[s]).join('、')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 各階段 KPI 參考指標 */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">各階段 KPI 參考指標</span>
        </div>
        <div className="grid grid-cols-5 gap-0 divide-x divide-gray-100">
          {FUNNEL_STAGES.map((stage) => (
            <div key={stage} className={`p-3 ${activeStages.includes(stage) ? '' : 'opacity-40'}`}>
              <div className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                {FUNNEL_STAGE_ZH[stage]}
                {activeStages.includes(stage) && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
              </div>
              <div className="space-y-0.5">
                {(STAGE_KPIS[stage] || []).map((k) => (
                  <div key={k} className="text-xs text-gray-500 font-mono">{k}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {channelRows.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          💡 請先在模組 4 配置渠道，KPI 設定將依各渠道項目分別規劃
        </div>
      ) : (
        <div className="space-y-6">
          {activeStages.map((stage) => {
            const stageChannels = channelRows.filter((r) => r.funnelStage === stage)
            const stageKpis = rows.filter((r) => r.funnelStage === stage)
            const filledCount = stageKpis.filter((r) => r.kpiValue !== '' || r.kpiCost !== '').length
            const stageBudget = getStageBudget(stage)

            return (
              <div key={stage}>
                {/* Stage header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <span className="font-bold text-gray-800 text-sm">{FUNNEL_STAGE_ZH[stage]}</span>
                  <span className="text-xs text-gray-400">({stage})</span>
                  {stageBudget > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      NT${stageBudget.toLocaleString()}
                    </span>
                  )}
                  {stageKpis.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      filledCount === stageKpis.length
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {filledCount}/{stageKpis.length} 已填寫
                    </span>
                  )}
                </div>

                {/* Channel groups */}
                <div className="pl-4 space-y-4">
                  {stageChannels.map((ch) => {
                    const boundKpis = rows.filter((r) => r.channelRowId === ch.id)
                    const pendingCount = boundKpis.filter((r) => r.kpiValue === '' && r.kpiCost === '').length
                    const stageGoals = getGoalsForStage(stage).slice(0, 4)

                    return (
                      <div key={ch.id}>
                        {/* Channel sub-header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${BUCKET_COLORS[ch.channelBucket] || ''}`}>
                              {BUCKET_LABELS[ch.channelBucket]} {ch.channelBucket.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">{ch.channelType}</span>
                            <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border">{ch.utmMedium}</code>
                            <span className="text-xs text-gray-400">{ch.utmSource}</span>
                            {ch.channelRole && (
                              <span className="text-xs text-gray-400 border rounded px-1.5 py-0.5">{ch.channelRole}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {pendingCount > 0 && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {pendingCount} 待填
                              </span>
                            )}
                            <button
                              onClick={() => addRow(ch)}
                              className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-gray-500 px-3 py-1 rounded-lg transition"
                            >
                              + 新增 KPI
                            </button>
                          </div>
                        </div>

                        {/* Goal quick-add chips */}
                        {stageGoals.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {stageGoals.map((goal) => (
                              <button
                                key={goal.value}
                                onClick={() => addRow(ch, goal.value)}
                                className="text-xs bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-gray-500 px-2 py-0.5 rounded-lg transition"
                                title={`建議 KPI：${(GOAL_KPI_MAP[goal.value] || []).join(', ')}`}
                              >
                                + {goal.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* KPI cards */}
                        {boundKpis.length === 0 ? (
                          <div className="text-xs text-gray-300 border border-dashed rounded-xl px-4 py-3 text-center">
                            點擊「+ 新增 KPI」或上方目標快速新增
                          </div>
                        ) : (
                          boundKpis.map((row) => (
                            <KpiCard
                              key={row.id}
                              row={row}
                              stage={stage}
                              onChange={(p) => updateRow(row.id, p)}
                              onDelete={() => deleteRow(row.id)}
                            />
                          ))
                        )}
                      </div>
                    )
                  })}

                  {/* Orphan KPIs for this stage */}
                  {rows
                    .filter((r) =>
                      r.funnelStage === stage &&
                      (!r.channelRowId || !channelRows.find((c) => c.id === r.channelRowId))
                    )
                    .map((row) => (
                      <KpiCard
                        key={row.id}
                        row={row}
                        stage={stage}
                        onChange={(p) => updateRow(row.id, p)}
                        onDelete={() => deleteRow(row.id)}
                      />
                    ))}
                </div>
              </div>
            )
          })}

          {/* KPIs whose stage has no channel */}
          {rows.filter((r) => !activeStages.includes(r.funnelStage)).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">其他階段 KPI</div>
              {rows
                .filter((r) => !activeStages.includes(r.funnelStage))
                .map((row) => (
                  <KpiCard
                    key={row.id}
                    row={row}
                    stage={row.funnelStage}
                    onChange={(p) => updateRow(row.id, p)}
                    onDelete={() => deleteRow(row.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  row, stage, onChange, onDelete,
}: {
  row: KpiRow
  stage: string
  onChange: (p: Partial<KpiRow>) => void
  onDelete: () => void
}) {
  const filled = row.kpiValue !== '' || row.kpiCost !== ''
  const stageGoals = getGoalsForStage(stage)
  const otherGoals = CAMPAIGN_GOALS.filter((g) => !g.stages.includes(stage))
  const suggestedKpis = GOAL_KPI_MAP[row.campaignGoal] || STAGE_KPIS[stage] || []

  return (
    <div className={`rounded-xl p-4 mb-2 transition border-l-4 ${
      filled
        ? 'border border-gray-200 border-l-green-400 bg-white hover:shadow-sm'
        : 'border-2 border-dashed border-amber-300 border-l-amber-400 bg-amber-50/40'
    }`}>
      {!filled && (
        <div className="text-xs text-amber-600 mb-2.5 font-medium flex items-center gap-1">
          <span>✏️</span> 新增 KPI — 請設定目標值或成本目標
        </div>
      )}

      <div className="grid grid-cols-12 gap-3 items-end">
        {/* campaign_goal */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">campaign_goal</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.campaignGoal}
            onChange={(e) => onChange({ campaignGoal: e.target.value })}
          >
            {stageGoals.length > 0 && (
              <optgroup label={`建議（${FUNNEL_STAGE_ZH[stage]}）`}>
                {stageGoals.map((g) => (
                  <option key={g.value} value={g.value}>{g.label} ({g.value})</option>
                ))}
              </optgroup>
            )}
            {otherGoals.length > 0 && (
              <optgroup label="其他目標">
                {otherGoals.map((g) => (
                  <option key={g.value} value={g.value}>{g.label} ({g.value})</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* KPI type */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">KPI 類型</label>
          <input
            list={`kpi-list-${row.id}`}
            className="w-full border rounded px-2 py-1.5 text-xs font-mono"
            value={row.kpiType}
            onChange={(e) => onChange({ kpiType: e.target.value })}
            placeholder="e.g. ROAS, CPL..."
          />
          <datalist id={`kpi-list-${row.id}`}>
            {suggestedKpis.map((k) => <option key={k} value={k} />)}
          </datalist>
        </div>

        {/* KPI value */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">KPI 目標值</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.kpiValue}
            onChange={(e) => onChange({ kpiValue: e.target.value ? Number(e.target.value) : '' })}
            placeholder="例: 3.0"
          />
        </div>

        {/* Cost goal */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">成本目標 (NT$)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.kpiCost}
            onChange={(e) => onChange({ kpiCost: e.target.value ? Number(e.target.value) : '' })}
            placeholder="例: 500"
          />
        </div>

        {/* Delete */}
        <div className="col-span-2 flex justify-end items-end">
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
        </div>
      </div>

      {/* KPI suggestion chips */}
      {suggestedKpis.length > 0 && !row.kpiType && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400">建議 KPI：</span>
          {suggestedKpis.map((k) => (
            <button
              key={k}
              onClick={() => onChange({ kpiType: k })}
              className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded px-2 py-0.5 font-mono transition"
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mt-2">
        <input
          className="w-full border rounded px-2 py-1.5 text-xs text-gray-600"
          value={row.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="備註（選填）"
        />
      </div>
    </div>
  )
}
