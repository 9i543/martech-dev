'use client'
import { v4 as uuidv4 } from 'uuid'
import { PlanData, CreativeRow, ChannelRow } from '../PlanForm'

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

const CHANNEL_TYPES = [
  'paid_social', 'cpc', 'display', 'paid_video', 'video',
  'social', 'email', 'sms', 'push', 'blog', 'dm', 'qrcode',
  'referral', 'affiliate',
]

const CONTENT_PLACEMENTS: { value: string; label: string; desc: string; stages: string[] }[] = [
  { value: 'feed',        label: '動態消息素材位', desc: '社群動態消息、資訊流主素材位',           stages: ['Awareness', 'Interest', 'Action'] },
  { value: 'story',       label: '限時動態素材位', desc: '限時動態、全螢幕短版素材位',             stages: ['Awareness', 'Interest'] },
  { value: 'reel',        label: '短影音素材位',   desc: 'Reels / Shorts / 短影音素材位',          stages: ['Awareness', 'Interest'] },
  { value: 'search',      label: '搜尋結果素材位', desc: '搜尋廣告或搜尋結果素材位',               stages: ['Interest', 'Desire', 'Action'] },
  { value: 'banner',      label: '橫幅素材位',     desc: 'GDN/聯播網/網站橫幅素材位',              stages: ['Awareness', 'Interest', 'Desire'] },
  { value: 'carousel',    label: '輪播素材位',     desc: '多卡輪播商品/內容素材位',                stages: ['Interest', 'Desire', 'Action'] },
  { value: 'instream',    label: '插播影音素材位', desc: '插播影片、影音前中後貼素材位',            stages: ['Awareness', 'Interest'] },
  { value: 'native',      label: '原生內容素材位', desc: '原生廣告或內容流融合素材位',              stages: ['Awareness', 'Interest', 'Desire'] },
  { value: 'productcard', label: '商品卡素材位',   desc: '商品目錄、商品卡片導購素材位',            stages: ['Desire', 'Action'] },
  { value: 'leadform',    label: '表單素材位',     desc: '直接引導註冊/留單/表單蒐集素材位',        stages: ['Desire', 'Action'] },
  { value: 'emailbody',   label: 'Email 內文素材位', desc: 'Email 內文中的主素材或 CTA 位',         stages: ['Desire', 'Action'] },
  { value: 'smslink',     label: '簡訊連結素材位', desc: '簡訊中的導流連結素材位',                  stages: ['Desire', 'Action'] },
  { value: 'pushmsg',     label: '推播訊息素材位', desc: 'App/Web 推播訊息位',                     stages: ['Desire', 'Action'] },
  { value: 'linecard',    label: 'LINE 卡片素材位', desc: 'LINE 訊息卡片、圖文選單等素材位',        stages: ['Interest', 'Desire', 'Action'] },
  { value: 'qrcode',      label: 'QR 掃碼素材位',  desc: 'QR Code 掃碼入口素材位',                 stages: ['Awareness', 'Desire', 'Action'] },
  { value: 'dmprint',     label: '文宣入口素材位', desc: 'DM/海報/紙本入口素材位',                  stages: ['Awareness', 'Interest'] },
]

const CONTENT_VERSIONS: { value: string; label: string }[] = [
  { value: 'v01', label: '第1版' },
  { value: 'v02', label: '第2版' },
  { value: 'v03', label: '第3版' },
  { value: 'v04', label: '第4版' },
]

const CREATIVE_FORMATS: { value: string; label: string }[] = [
  { value: 'search',       label: '搜尋型' },
  { value: 'text',         label: '文字型' },
  { value: 'image',        label: '圖像型' },
  { value: 'carousel',     label: '輪播型' },
  { value: 'video',        label: '影音型' },
  { value: 'native',       label: '原生型' },
  { value: 'rich_media',   label: '多媒體互動型' },
  { value: 'product_feed', label: '商品型' },
  { value: 'lead_form',    label: '表單型' },
]

const MEDIUM_PLACEMENT_MAP: Record<string, string[]> = {
  paid_social: ['feed', 'story', 'reel', 'carousel'],
  cpc:         ['search'],
  display:     ['banner', 'native'],
  paid_video:  ['instream', 'reel'],
  video:       ['instream', 'reel'],
  social:      ['feed', 'story', 'reel'],
  email:       ['emailbody'],
  sms:         ['smslink'],
  push:        ['pushmsg', 'linecard'],
  blog:        ['native', 'banner'],
  dm:          ['dmprint', 'qrcode'],
  qrcode:      ['qrcode'],
  referral:    ['feed', 'story'],
  affiliate:   ['feed', 'banner'],
}

const MEDIUM_FORMAT_MAP: Record<string, string> = {
  paid_social: 'image',
  cpc:         'search',
  display:     'image',
  paid_video:  'video',
  video:       'video',
  social:      'image',
  email:       'text',
  sms:         'text',
  push:        'text',
  blog:        'native',
  dm:          'image',
  qrcode:      'image',
  referral:    'image',
  affiliate:   'image',
}

interface Props { plan: PlanData; update: (p: Partial<PlanData>) => void }

export default function Module5Creative({ plan, update }: Props) {
  const rows = plan.creativeRows
  const channelRows = plan.channelRows

  const addRow = (channelRow: ChannelRow) => {
    const mediumPlacements = MEDIUM_PLACEMENT_MAP[channelRow.utmMedium] || []
    // prefer placement that matches both medium AND funnel stage
    const stageFit = mediumPlacements.find((v) =>
      CONTENT_PLACEMENTS.find((p) => p.value === v)?.stages.includes(channelRow.funnelStage)
    )
    const defaultPlacement = stageFit || mediumPlacements[0] || 'feed'
    update({
      creativeRows: [
        ...rows,
        {
          id: uuidv4(),
          funnelStage: channelRow.funnelStage,
          channelType: channelRow.utmMedium,
          contentGroup: defaultPlacement,
          contentVariant: 'v01',
          utmCreativeFormat: MEDIUM_FORMAT_MAP[channelRow.utmMedium] || 'image',
          channelRowId: channelRow.id,
          creativeBrief: '',
        },
      ],
    })
  }

  const updateRow = (id: string, patch: Partial<CreativeRow>) => {
    update({ creativeRows: rows.map((r) => r.id === id ? { ...r, ...patch } : r) })
  }

  const deleteRow = (id: string) => {
    update({ creativeRows: rows.filter((r) => r.id !== id) })
  }

  const activeStages = FUNNEL_STAGES.filter((s) =>
    channelRows.some((r) => r.funnelStage === s)
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>🎨</span> 模組 6：素材規劃
      </h2>

      {/* utm_content formula */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm">
        <div className="font-semibold text-blue-800 mb-1">utm_content 組合規則</div>
        <code className="text-blue-700">[content_placement]_[content_version]</code>
        <span className="text-gray-500 ml-3">例：feed_v01 → utm_content=feed_v01</span>
      </div>

      {/* content_placement 對照表 */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">content_placement 素材版位對照</span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-[6rem_7rem_1fr_10rem] px-4 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-400">
            <span>中文名稱</span>
            <span>content_placement</span>
            <span>使用情境</span>
            <span>對應漏斗階段</span>
          </div>
          {CONTENT_PLACEMENTS.map((p) => (
            <div key={p.value} className="grid grid-cols-[6rem_7rem_1fr_10rem] px-4 py-2 text-xs hover:bg-gray-50">
              <span className="font-medium text-gray-800">{p.label.replace('素材位', '')}</span>
              <code className="font-mono text-blue-600">{p.value}</code>
              <span className="text-gray-500 leading-relaxed">{p.desc}</span>
              <span className="text-gray-400">{p.stages.map((s) => ({ Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員' }[s])).join('、')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage → Channel → Creative layout */}
      {channelRows.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          💡 請先在模組 4 配置渠道，素材設定將依各渠道項目分別規劃
        </div>
      ) : (
        <div className="space-y-6">
          {activeStages.map((stage) => {
            const stageChannels = channelRows.filter((r) => r.funnelStage === stage)
            const stageCreatives = rows.filter((r) => r.funnelStage === stage)
            const filledCount = stageCreatives.filter((r) => (r.creativeBrief ?? '') !== '').length

            return (
              <div key={stage}>
                {/* Stage header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <span className="font-bold text-gray-800 text-sm">{FUNNEL_STAGE_ZH[stage]}</span>
                  <span className="text-xs text-gray-400">({stage})</span>
                  {stageCreatives.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      filledCount === stageCreatives.length
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {filledCount}/{stageCreatives.length} 已填寫
                    </span>
                  )}
                </div>

                {/* Channel groups within this stage */}
                <div className="pl-4 space-y-4">
                  {stageChannels.map((ch) => {
                    const boundCreatives = rows.filter((r) => r.channelRowId === ch.id)
                    const pendingCount = boundCreatives.filter((r) => (r.creativeBrief ?? '') === '').length

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
                              + 新增素材
                            </button>
                          </div>
                        </div>

                        {/* Creative cards */}
                        {boundCreatives.length === 0 ? (
                          <div className="text-xs text-gray-300 border border-dashed rounded-xl px-4 py-3 text-center">
                            點擊「+ 新增素材」為此渠道規劃素材
                          </div>
                        ) : (
                          boundCreatives.map((row) => (
                            <CreativeCard
                              key={row.id}
                              row={row}
                              stage={ch.funnelStage}
                              onChange={(p) => updateRow(row.id, p)}
                              onDelete={() => deleteRow(row.id)}
                            />
                          ))
                        )}
                      </div>
                    )
                  })}

                  {/* Orphan creatives for this stage */}
                  {rows
                    .filter((r) =>
                      r.funnelStage === stage &&
                      (!r.channelRowId || !channelRows.find((c) => c.id === r.channelRowId))
                    )
                    .map((row) => (
                      <CreativeCard
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

          {/* Creatives from stages not in channelRows */}
          {rows.filter((r) => !activeStages.includes(r.funnelStage)).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">其他階段素材</div>
              {rows
                .filter((r) => !activeStages.includes(r.funnelStage))
                .map((row) => (
                  <CreativeCard
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

// ── Creative Card ─────────────────────────────────────────────────────────

function CreativeCard({
  row, stage, onChange, onDelete,
}: {
  row: CreativeRow
  stage: string
  onChange: (p: Partial<CreativeRow>) => void
  onDelete: () => void
}) {
  const filled = (row.creativeBrief ?? '') !== ''
  const mediumPlacements = new Set(MEDIUM_PLACEMENT_MAP[row.channelType] || [])
  // 建議：matches both medium AND stage
  const suggestedPlacements = CONTENT_PLACEMENTS.filter(
    (p) => mediumPlacements.has(p.value) && p.stages.includes(stage)
  )
  // medium-only (right medium, other stages)
  const mediumOtherPlacements = CONTENT_PLACEMENTS.filter(
    (p) => mediumPlacements.has(p.value) && !p.stages.includes(stage)
  )
  // everything else
  const otherPlacements = CONTENT_PLACEMENTS.filter((p) => !mediumPlacements.has(p.value))

  return (
    <div className={`rounded-xl p-4 mb-2 transition border-l-4 ${
      filled
        ? 'border border-gray-200 border-l-green-400 bg-white hover:shadow-sm'
        : 'border-2 border-dashed border-amber-300 border-l-amber-400 bg-amber-50/40'
    }`}>
      {!filled && (
        <div className="text-xs text-amber-600 mb-2.5 font-medium flex items-center gap-1">
          <span>✏️</span> 新增素材 — 請填寫素材說明以完成規劃
        </div>
      )}

      {/* Row 1: controls */}
      <div className="grid grid-cols-12 gap-3 items-end">
        {/* Channel medium */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">渠道媒介</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.channelType}
            onChange={(e) => {
              const m = e.target.value
              onChange({
                channelType: m,
                contentGroup: MEDIUM_PLACEMENT_MAP[m]?.[0] || row.contentGroup,
                utmCreativeFormat: MEDIUM_FORMAT_MAP[m] || row.utmCreativeFormat,
              })
            }}
          >
            {CHANNEL_TYPES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Placement */}
        <div className="col-span-3">
          <label className="block text-xs text-gray-500 mb-1">content_placement</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.contentGroup}
            onChange={(e) => onChange({ contentGroup: e.target.value })}
          >
            {suggestedPlacements.length > 0 && (
              <optgroup label={`建議（${({ Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員' } as Record<string,string>)[stage] ?? stage}）`}>
                {suggestedPlacements.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </optgroup>
            )}
            {mediumOtherPlacements.length > 0 && (
              <optgroup label="此媒介其他版位">
                {mediumOtherPlacements.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </optgroup>
            )}
            {otherPlacements.length > 0 && (
              <optgroup label="所有版位">
                {otherPlacements.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Version */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">content_version</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs font-mono"
            value={row.contentVariant}
            onChange={(e) => onChange({ contentVariant: e.target.value })}
          >
            {CONTENT_VERSIONS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">creative_format</label>
          <select
            className="w-full border rounded px-2 py-1.5 text-xs"
            value={row.utmCreativeFormat}
            onChange={(e) => onChange({ utmCreativeFormat: e.target.value })}
          >
            {CREATIVE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* utm_content preview */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">utm_content</label>
          <div className="bg-gray-50 border rounded px-2 py-1.5 text-xs font-mono text-blue-700">
            {[row.contentGroup, row.contentVariant].filter(Boolean).join('_')}
          </div>
        </div>

        {/* Delete */}
        <div className="col-span-1 flex justify-end items-end">
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
        </div>
      </div>

      {/* Row 2: creative brief */}
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">素材說明</label>
        <textarea
          className="w-full border rounded px-2 py-1.5 text-xs resize-none"
          rows={2}
          value={row.creativeBrief ?? ''}
          onChange={(e) => onChange({ creativeBrief: e.target.value })}
          placeholder="例：主打限時優惠，橫版圖 1200×628，文案聚焦痛點，色調暖橘色..."
        />
      </div>
    </div>
  )
}
