export type AxisRatio = {
  Awareness: number
  Interest: number
  Desire: number
  Action: number
  Membership: number
}

export type CoreAxis = {
  id: string
  name: string
  icon: string
  description: string
  ratios: AxisRatio
}

export const STAGE_KEYS = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership'] as const
export type StageKey = typeof STAGE_KEYS[number]

export const STAGE_LABELS: Record<string, { zh: string; short: string }> = {
  Awareness:  { zh: '注意', short: 'A' },
  Interest:   { zh: '興趣', short: 'I' },
  Desire:     { zh: '慾望', short: 'D' },
  Action:     { zh: '行動', short: 'A' },
  Membership: { zh: '會員', short: 'M' },
}

export const DEFAULT_AXES: CoreAxis[] = [
  {
    id: 'brand_awareness',
    name: '品牌曝光',
    icon: '📢',
    description: '強化品牌認知與曝光觸及',
    ratios: { Awareness: 60, Interest: 40, Desire: 0, Action: 0, Membership: 0 },
  },
  {
    id: 'lead_gen',
    name: '名單蒐集',
    icon: '📋',
    description: '收集潛在客戶資料與名單',
    ratios: { Awareness: 0, Interest: 40, Desire: 30, Action: 30, Membership: 0 },
  },
  {
    id: 'ecommerce',
    name: '電商轉換',
    icon: '🛒',
    description: '提升網路購物轉換率',
    ratios: { Awareness: 0, Interest: 20, Desire: 30, Action: 50, Membership: 0 },
  },
  {
    id: 'membership',
    name: '會員經營',
    icon: '💎',
    description: '深化會員關係與提升回購率',
    ratios: { Awareness: 0, Interest: 10, Desire: 10, Action: 40, Membership: 40 },
  },
  {
    id: 'content',
    name: '內容導流',
    icon: '📝',
    description: '透過內容行銷吸引自然流量',
    ratios: { Awareness: 20, Interest: 50, Desire: 30, Action: 0, Membership: 0 },
  },
]

export const AXES_STORAGE_KEY = 'martech_core_axes_v1'

export function getStoredAxes(): CoreAxis[] {
  if (typeof window === 'undefined') return DEFAULT_AXES
  try {
    const stored = localStorage.getItem(AXES_STORAGE_KEY)
    if (stored) return JSON.parse(stored) as CoreAxis[]
  } catch {}
  return DEFAULT_AXES
}

export function saveAxesToStorage(axes: CoreAxis[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AXES_STORAGE_KEY, JSON.stringify(axes))
}
