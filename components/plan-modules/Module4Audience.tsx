'use client'
import { v4 as uuidv4 } from 'uuid'
import { PlanData, AudienceRow } from '../PlanForm'

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

const UTM_TERMS: { value: string; label: string; desc: string; stages: string[] }[] = [
  { value: 'system_ai',   label: '系統AI',       desc: '平台以 AI / 自動學習 / 自動擴展方式找受眾',  stages: ['Awareness', 'Interest', 'Action'] },
  { value: 'broad',       label: '廣泛受眾',      desc: '未特別細分的大眾受眾、新客擴量',              stages: ['Awareness'] },
  { value: 'interest',    label: '興趣受眾',       desc: '依興趣、主題、內容偏好鎖定',                  stages: ['Awareness', 'Interest'] },
  { value: 'lookalike',   label: '相似受眾',       desc: '由既有名單或轉換族群擴展',                    stages: ['Awareness', 'Interest', 'Action'] },
  { value: 'engager',     label: '互動受眾',       desc: '曾看過內容、互動、點擊者',                    stages: ['Interest', 'Desire'] },
  { value: 'visitor',     label: '訪客受眾',       desc: '網站訪客、指定頁面訪客',                      stages: ['Interest', 'Desire', 'Action'] },
  { value: 'high_intent', label: '高意圖受眾',     desc: '商品瀏覽、加購、留單前高意圖族群',            stages: ['Desire', 'Action'] },
  { value: 'lead',        label: '名單受眾',       desc: '留單、註冊、潛在客戶名單',                    stages: ['Desire'] },
  { value: 'customer',    label: '客戶/會員受眾',  desc: '已購買、既有客戶、會員',                      stages: ['Action', 'Membership'] },
]

const CUSTOMER_TYPES = [
  { value: 'new',      label: '新客' },
  { value: 'existing', label: '舊客' },
  { value: 'member',   label: '會員' },
  { value: 'prospect', label: '潛客' },
]

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module4Audience({ plan, update }: Props) {
  const rows = plan.audienceRows
  const channelRows = plan.channelRows

  const addRow = (channelRowId: string, stage: string) => {
    const stageTerms = UTM_TERMS.filter((t) => t.stages.includes(stage))
    const suggestedTerm = stageTerms[0]?.value || 'visitor'
    update({
      audienceRows: [
        ...rows,
        {
          id: uuidv4(),
          funnelStage: stage,
          audienceType: suggestedTerm,
          utmTerm: suggestedTerm,
          audienceDesc: '',
          isNewCustomer:
            stage === 'Membership' ? 'member'
            : stage === 'Action' ? 'existing'
            : 'new',
          channelRowId,
        },
      ],
    })
  }

  const updateRow = (id: string, patch: Partial<AudienceRow>) => {
    update({ audienceRows: rows.map((r) => r.id === id ? { ...r, ...patch } : r) })
  }

  const deleteRow = (id: string) => {
    update({ audienceRows: rows.filter((r) => r.id !== id) })
  }

  const activeStages = FUNNEL_STAGES.filter((s) =>
    channelRows.some((r) => r.funnelStage === s)
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>👥</span> 模組 5：受眾 / 名單規劃
      </h2>

      {/* utm_term 對照表 */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">utm_term 受眾類型對照</span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-[5.5rem_7rem_1fr_10rem] px-4 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-400">
            <span>中文名稱</span>
            <span>utm_term</span>
            <span>使用情境</span>
            <span>對應漏斗階段</span>
          </div>
          {UTM_TERMS.map((t) => (
            <div key={t.value} className="grid grid-cols-[5.5rem_7rem_1fr_10rem] px-4 py-2 text-xs hover:bg-gray-50">
              <span className="font-medium text-gray-800">{t.label}</span>
              <code className="font-mono text-blue-600">{t.value}</code>
              <span className="text-gray-500 leading-relaxed">{t.desc}</span>
              <span className="text-gray-400">{t.stages.map((s) => ({ Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員' } as Record<string,string>)[s]).join('、')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Stage → Channel → Audience rows */}
      {channelRows.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          💡 請先在模組 4 配置渠道，受眾設定將依各渠道項目分別規劃
        </div>
      ) : (
        <div className="space-y-6">
          {activeStages.map((stage) => {
            const stageChannels = channelRows.filter((r) => r.funnelStage === stage)
            const stageAuds = rows.filter((r) => r.funnelStage === stage)
            const filledCount = stageAuds.filter((r) => r.audienceDesc !== '').length

            return (
              <div key={stage}>
                {/* Stage header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <span className="font-bold text-gray-800 text-sm">{FUNNEL_STAGE_ZH[stage]}</span>
                  <span className="text-xs text-gray-400">({stage})</span>
                  {stageAuds.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      filledCount === stageAuds.length
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {filledCount}/{stageAuds.length} 已填寫
                    </span>
                  )}
                </div>

                {/* Channel groups within this stage */}
                <div className="pl-4 space-y-4">
                  {stageChannels.map((ch) => {
                    const boundAuds = rows.filter((r) => r.channelRowId === ch.id)
                    const pendingCount = boundAuds.filter((r) => r.audienceDesc === '').length

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
                              onClick={() => addRow(ch.id, stage)}
                              className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-gray-500 px-3 py-1 rounded-lg transition"
                            >
                              + 新增受眾
                            </button>
                          </div>
                        </div>

                        {/* Audience cards */}
                        {boundAuds.length === 0 ? (
                          <div className="text-xs text-gray-300 border border-dashed rounded-xl px-4 py-3 text-center">
                            點擊「+ 新增受眾」為此渠道設定目標受眾
                          </div>
                        ) : (
                          boundAuds.map((row) => (
                            <AudienceRowEditor
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

                  {/* Unbound or orphan audiences for this stage */}
                  {rows
                    .filter((r) =>
                      r.funnelStage === stage &&
                      (!r.channelRowId || !channelRows.find((c) => c.id === r.channelRowId))
                    )
                    .map((row) => (
                      <AudienceRowEditor
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

          {/* Audiences whose stage has no channel (edge case) */}
          {rows.filter((r) => !activeStages.includes(r.funnelStage)).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">其他階段受眾</div>
              {rows
                .filter((r) => !activeStages.includes(r.funnelStage))
                .map((row) => (
                  <AudienceRowEditor
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

// ── Audience Row Editor Card ───────────────────────────────────────────────

function AudienceRowEditor({
  row, stage, onChange, onDelete,
}: {
  row: AudienceRow
  stage: string
  onChange: (p: Partial<AudienceRow>) => void
  onDelete: () => void
}) {
  const filled = row.audienceDesc !== ''
  const termDef = UTM_TERMS.find((t) => t.value === row.utmTerm)
  const stageTerms = UTM_TERMS.filter((t) => t.stages.includes(stage))
  const otherTerms = UTM_TERMS.filter((t) => !t.stages.includes(stage))

  return (
    <div className={`rounded-xl p-4 mb-2 transition border-l-4 ${
      filled
        ? 'border border-gray-200 border-l-green-400 bg-white hover:shadow-sm'
        : 'border-2 border-dashed border-amber-300 border-l-amber-400 bg-amber-50/40'
    }`}>
      {!filled && (
        <div className="text-xs text-amber-600 mb-2.5 font-medium flex items-center gap-1">
          <span>✏️</span> 新增受眾 — 請填寫受眾說明（自媒體可留空）
        </div>
      )}

      <div className="grid grid-cols-12 gap-3 items-end">
        {/* utm_term */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">utm_term 受眾類型</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.utmTerm}
            onChange={(e) => onChange({ audienceType: e.target.value, utmTerm: e.target.value })}
          >
            {stageTerms.length > 0 && (
              <optgroup label={`建議（${FUNNEL_STAGE_ZH[stage]}）`}>
                {stageTerms.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}（{t.value}）</option>
                ))}
              </optgroup>
            )}
            {otherTerms.length > 0 && (
              <optgroup label="其他受眾">
                {otherTerms.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}（{t.value}）</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Audience desc */}
        <div className="col-span-5">
          <label className="block text-xs text-gray-500 mb-1">受眾說明</label>
          <input
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.audienceDesc}
            onChange={(e) => onChange({ audienceDesc: e.target.value })}
            placeholder="例：7天瀏覽購物車未結帳、META自動..."
          />
        </div>

        {/* Customer type */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">客群</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.isNewCustomer}
            onChange={(e) => onChange({ isNewCustomer: e.target.value })}
          >
            {CUSTOMER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Delete */}
        <div className="col-span-2 flex justify-end items-end">
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
        </div>
      </div>

      {/* Term hint */}
      {termDef?.desc && (
        <div className="mt-2 text-xs text-gray-400 italic px-1">
          {termDef.desc}
        </div>
      )}
    </div>
  )
}
