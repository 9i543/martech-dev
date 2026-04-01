export type TacticIntent = { id: string; label: string; icon: string; desc?: string }
export type TacticAngle  = { id: string; label: string; desc?: string }
export type AidamRatio   = { Awareness: number; Interest: number; Desire: number; Action: number; Membership: number }
export type TacticConfig = { intents: TacticIntent[]; angleMap: Record<string, string[]> }

export const TACTIC_STORAGE_KEY = 'martech_tactic_config_v1'

export const ALL_ANGLES: TacticAngle[] = [
  { id: 'brand_image',           label: '品牌形象',   desc: '建立品牌感受、定位、質感' },
  { id: 'product_benefit',       label: '產品賣點',   desc: '強調功能、特色、核心利益' },
  { id: 'pain_point',            label: '痛點切入',   desc: '從問題、困擾、需求出發' },
  { id: 'solution',              label: '解決方案',   desc: '呈現解法、改善方式' },
  { id: 'social_proof',          label: '社會證明',   desc: '熱銷、人氣、使用人數、評價' },
  { id: 'rational_proof',        label: '理性說服',   desc: '規格、數據、比較、證據' },
  { id: 'emotional_appeal',      label: '情感共鳴',   desc: '情緒、價值觀、情境連結' },
  { id: 'scarcity',              label: '稀缺促購',   desc: '限時、限量、倒數、名額有限' },
  { id: 'offer',                 label: '優惠訴求',   desc: '折扣、贈品、免運、方案優惠' },
  { id: 'educational',           label: '教育內容',   desc: '知識、教學、觀念建立' },
  { id: 'first_impression',      label: '首次印象',   desc: '初體驗、開箱、第一次接觸' },
  { id: 'testimonial',           label: '口碑見證',   desc: '真人或客戶實際見證' },
  { id: 'use_case',              label: '使用情境',   desc: '呈現實際使用場景或使用方式' },
  { id: 'authority_endorsement', label: '專家背書',   desc: '專家、醫師、達人、機構背書' },
  { id: 'new_launch',            label: '新品新功能', desc: '新品上市、新功能、新版本主打' },
]

export const DEFAULT_INTENTS: TacticIntent[] = [
  { id: 'brand_awareness',     label: '品牌認知',   icon: '📢', desc: '擴大品牌觸及、曝光與首次認識' },
  { id: 'traffic_acquisition', label: '導流獲客',   icon: '🚦', desc: '以導流進站、提升網站流量為主' },
  { id: 'engagement',          label: '互動經營',   icon: '💬', desc: '以內容互動、瀏覽、觀看、點擊為主' },
  { id: 'lead_gen',            label: '留單蒐集',   icon: '📋', desc: '以表單留單、名單蒐集為主' },
  { id: 'registration',        label: '註冊導入',   icon: '📝', desc: '以註冊會員、帳號、建立名單為主' },
  { id: 'lead_nurture',        label: '名單培養',   icon: '🌱', desc: '針對高意圖名單持續培養與養成' },
  { id: 'remarketing',         label: '再行銷召回', icon: '🔁', desc: '對曾互動或高意圖對象再接觸召回' },
  { id: 'sales_conversion',    label: '銷售轉換',   icon: '🛒', desc: '以購買、下單、付費、成交為主' },
  { id: 'promo_conversion',    label: '檔期促購',   icon: '🏷️', desc: '以促銷活動、限時優惠帶動成交' },
  { id: 'member_get_member',   label: '會員導會員', icon: '🤝', desc: '透過會員推薦碼或分享帶新會員' },
]

export const DEFAULT_TACTIC_MAP: Record<string, string[]> = {
  brand_awareness:     ['brand_image', 'emotional_appeal', 'first_impression', 'educational', 'new_launch'],
  traffic_acquisition: ['pain_point', 'solution', 'product_benefit', 'educational', 'first_impression', 'use_case'],
  engagement:          ['emotional_appeal', 'educational', 'pain_point', 'first_impression', 'brand_image', 'use_case'],
  lead_gen:            ['pain_point', 'solution', 'social_proof', 'rational_proof', 'offer', 'use_case'],
  registration:        ['solution', 'social_proof', 'rational_proof', 'educational', 'offer', 'authority_endorsement'],
  lead_nurture:        ['educational', 'solution', 'social_proof', 'rational_proof', 'emotional_appeal', 'use_case'],
  remarketing:         ['social_proof', 'testimonial', 'offer', 'scarcity', 'solution', 'product_benefit'],
  sales_conversion:    ['product_benefit', 'social_proof', 'rational_proof', 'offer', 'scarcity', 'testimonial', 'authority_endorsement'],
  promo_conversion:    ['offer', 'scarcity', 'product_benefit', 'social_proof', 'testimonial', 'new_launch'],
  member_get_member:   ['social_proof', 'testimonial', 'offer', 'emotional_appeal', 'authority_endorsement'],
}

export const TACTIC_AIDAM_RATIOS: Record<string, Record<string, AidamRatio>> = {
  brand_awareness: {
    brand_image:       { Awareness: 50, Interest: 30, Desire: 20, Action: 0,  Membership: 0 },
    emotional_appeal:  { Awareness: 30, Interest: 50, Desire: 20, Action: 0,  Membership: 0 },
    first_impression:  { Awareness: 50, Interest: 20, Desire: 30, Action: 0,  Membership: 0 },
    educational:       { Awareness: 20, Interest: 60, Desire: 20, Action: 0,  Membership: 0 },
    new_launch:        { Awareness: 0,  Interest: 60, Desire: 30, Action: 10, Membership: 0 },
  },
  traffic_acquisition: {
    pain_point:        { Awareness: 20, Interest: 50, Desire: 20, Action: 10, Membership: 0 },
    solution:          { Awareness: 0,  Interest: 50, Desire: 30, Action: 20, Membership: 0 },
    product_benefit:   { Awareness: 10, Interest: 60, Desire: 20, Action: 10, Membership: 0 },
    educational:       { Awareness: 20, Interest: 60, Desire: 20, Action: 0,  Membership: 0 },
    first_impression:  { Awareness: 50, Interest: 30, Desire: 20, Action: 0,  Membership: 0 },
    use_case:          { Awareness: 10, Interest: 60, Desire: 30, Action: 0,  Membership: 0 },
  },
  engagement: {
    emotional_appeal:  { Awareness: 0,  Interest: 50, Desire: 30, Action: 20, Membership: 0 },
    educational:       { Awareness: 0,  Interest: 60, Desire: 20, Action: 20, Membership: 0 },
    pain_point:        { Awareness: 0,  Interest: 60, Desire: 30, Action: 10, Membership: 0 },
    first_impression:  { Awareness: 0,  Interest: 60, Desire: 30, Action: 10, Membership: 0 },
    brand_image:       { Awareness: 0,  Interest: 50, Desire: 40, Action: 10, Membership: 0 },
    use_case:          { Awareness: 0,  Interest: 60, Desire: 30, Action: 10, Membership: 0 },
  },
  lead_gen: {
    pain_point:        { Awareness: 0,  Interest: 60, Desire: 0,  Action: 40, Membership: 0 },
    solution:          { Awareness: 0,  Interest: 60, Desire: 0,  Action: 40, Membership: 0 },
    social_proof:      { Awareness: 0,  Interest: 50, Desire: 0,  Action: 50, Membership: 0 },
    rational_proof:    { Awareness: 0,  Interest: 50, Desire: 0,  Action: 50, Membership: 0 },
    offer:             { Awareness: 0,  Interest: 60, Desire: 0,  Action: 40, Membership: 0 },
    use_case:          { Awareness: 0,  Interest: 60, Desire: 0,  Action: 40, Membership: 0 },
  },
  registration: {
    solution:              { Awareness: 20, Interest: 30, Desire: 50, Action: 0, Membership: 0 },
    social_proof:          { Awareness: 20, Interest: 30, Desire: 50, Action: 0, Membership: 0 },
    rational_proof:        { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    educational:           { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    offer:                 { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    authority_endorsement: { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
  },
  lead_nurture: {
    educational:       { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    solution:          { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    social_proof:      { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    rational_proof:    { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    emotional_appeal:  { Awareness: 0,  Interest: 50, Desire: 50, Action: 0, Membership: 0 },
    use_case:          { Awareness: 20, Interest: 30, Desire: 50, Action: 0, Membership: 0 },
  },
  remarketing: {
    social_proof:      { Awareness: 0, Interest: 30, Desire: 20, Action: 50, Membership: 0 },
    testimonial:       { Awareness: 0, Interest: 20, Desire: 50, Action: 30, Membership: 0 },
    offer:             { Awareness: 0, Interest: 60, Desire: 30, Action: 10, Membership: 0 },
    scarcity:          { Awareness: 0, Interest: 60, Desire: 30, Action: 10, Membership: 0 },
    solution:          { Awareness: 0, Interest: 30, Desire: 20, Action: 50, Membership: 0 },
    product_benefit:   { Awareness: 0, Interest: 50, Desire: 30, Action: 20, Membership: 0 },
  },
  sales_conversion: {
    product_benefit:       { Awareness: 30, Interest: 30, Desire: 20, Action: 20, Membership: 0 },
    social_proof:          { Awareness: 20, Interest: 20, Desire: 40, Action: 20, Membership: 0 },
    rational_proof:        { Awareness: 20, Interest: 30, Desire: 30, Action: 20, Membership: 0 },
    offer:                 { Awareness: 20, Interest: 20, Desire: 30, Action: 30, Membership: 0 },
    scarcity:              { Awareness: 20, Interest: 20, Desire: 30, Action: 30, Membership: 0 },
    testimonial:           { Awareness: 20, Interest: 20, Desire: 30, Action: 30, Membership: 0 },
    authority_endorsement: { Awareness: 20, Interest: 20, Desire: 40, Action: 20, Membership: 0 },
  },
  promo_conversion: {
    offer:           { Awareness: 30, Interest: 50, Desire: 10, Action: 10, Membership: 0 },
    scarcity:        { Awareness: 30, Interest: 30, Desire: 40, Action: 0,  Membership: 0 },
    product_benefit: { Awareness: 20, Interest: 50, Desire: 30, Action: 0,  Membership: 0 },
    social_proof:    { Awareness: 20, Interest: 20, Desire: 30, Action: 30, Membership: 0 },
    testimonial:     { Awareness: 30, Interest: 20, Desire: 30, Action: 20, Membership: 0 },
    new_launch:      { Awareness: 20, Interest: 50, Desire: 10, Action: 20, Membership: 0 },
  },
  member_get_member: {
    social_proof:          { Awareness: 0, Interest: 0, Desire: 50, Action: 50, Membership: 0 },
    testimonial:           { Awareness: 0, Interest: 0, Desire: 50, Action: 50, Membership: 0 },
    offer:                 { Awareness: 0, Interest: 0, Desire: 70, Action: 30, Membership: 0 },
    emotional_appeal:      { Awareness: 0, Interest: 0, Desire: 50, Action: 50, Membership: 0 },
    authority_endorsement: { Awareness: 0, Interest: 0, Desire: 50, Action: 50, Membership: 0 },
  },
}

export function applyTacticToFunnelConfig(
  intent: string,
  angle: string,
  currentConfig: Record<string, { enabled: boolean; ratio: number; task: string }>
): Record<string, { enabled: boolean; ratio: number; task: string }> {
  const ratios = TACTIC_AIDAM_RATIOS[intent]?.[angle]
  if (!ratios) return currentConfig
  const STAGE_KEYS = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership'] as const
  const result: Record<string, { enabled: boolean; ratio: number; task: string }> = {}
  for (const stage of STAGE_KEYS) {
    const r = ratios[stage as keyof AidamRatio]
    result[stage] = { enabled: r > 0, ratio: r, task: currentConfig[stage]?.task ?? '' }
  }
  return result
}

export function getStoredTacticConfig(): TacticConfig {
  if (typeof window === 'undefined') return { intents: DEFAULT_INTENTS, angleMap: DEFAULT_TACTIC_MAP }
  try {
    const s = localStorage.getItem(TACTIC_STORAGE_KEY)
    if (s) return JSON.parse(s) as TacticConfig
  } catch {}
  return { intents: DEFAULT_INTENTS, angleMap: DEFAULT_TACTIC_MAP }
}

export function saveTacticConfig(cfg: TacticConfig) {
  if (typeof window !== 'undefined') localStorage.setItem(TACTIC_STORAGE_KEY, JSON.stringify(cfg))
}
