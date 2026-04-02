'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── Stage tokens ───────────────────────────────────────────────────────────
const STAGE_ORDER = ['Awareness', 'Interest', 'Desire', 'Action', 'Membership']
const STAGE_ZH: Record<string, string> = {
  Awareness: '注意', Interest: '興趣', Desire: '慾望', Action: '行動', Membership: '會員',
}
const STAGE_BAR_COLOR: Record<string, string> = {
  Awareness:  '#7DD3FC',  // sky-300
  Interest:   '#60A5FA',  // blue-400
  Desire:     '#8B5CF6',  // violet-500
  Action:     '#22C55E',  // green-500
  Membership: '#F97316',  // orange-500
}
const STAGE_TEXT_COLOR: Record<string, string> = {
  Awareness:  'text-sky-600',
  Interest:   'text-blue-600',
  Desire:     'text-violet-600',
  Action:     'text-green-600',
  Membership: 'text-orange-600',
}

// ── Status tokens ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived:  'bg-orange-100 text-orange-700',
}
const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', active: '進行中', completed: '已完成計畫', archived: '已封存',
}

function formatDateTime(dt: Date | string): string {
  const d = new Date(dt)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${mo}/${day} ${h}:${min}`
}

// ── Parse funnel config from JSON blob ────────────────────────────────────
interface StageSlice { key: string; ratio: number; budget: number }
function parseFunnelSlices(json: string | null, totalBudget: number | null): StageSlice[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    return STAGE_ORDER
      .filter(k => {
        const s = parsed[k] as { enabled?: boolean; ratio?: number } | undefined
        return s?.enabled && (s?.ratio ?? 0) > 0
      })
      .map(k => {
        const s = parsed[k] as { ratio: number }
        return {
          key: k,
          ratio: s.ratio,
          budget: totalBudget ? Math.round(totalBudget * s.ratio / 100) : 0,
        }
      })
  } catch { return [] }
}

// ── Mini stacked funnel bar ────────────────────────────────────────────────
function MiniFunnelBar({ slices, totalBudget }: { slices: StageSlice[]; totalBudget: number | null }) {
  if (slices.length === 0) return null
  const totalRatio = slices.reduce((s, x) => s + x.ratio, 0)
  if (totalRatio === 0) return null

  return (
    <div className="mt-3">
      {/* Stacked bar */}
      <div className="flex h-5 rounded-lg overflow-hidden gap-px bg-gray-100">
        {slices.map(s => (
          <div
            key={s.key}
            title={`${STAGE_ZH[s.key]} ${s.ratio}%${totalBudget ? ` · NT$${s.budget.toLocaleString()}` : ''}`}
            style={{ width: `${(s.ratio / totalRatio) * 100}%`, backgroundColor: STAGE_BAR_COLOR[s.key] }}
            className="transition-all duration-300"
          />
        ))}
      </div>
      {/* Labels */}
      <div className="flex gap-3 mt-1.5 flex-wrap">
        {slices.map(s => (
          <div key={s.key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: STAGE_BAR_COLOR[s.key] }} />
            <span className={`text-xs ${STAGE_TEXT_COLOR[s.key]}`}>
              {STAGE_ZH[s.key]} {s.ratio}%
              {totalBudget ? ` · NT$${s.budget.toLocaleString()}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Plan interface ─────────────────────────────────────────────────────────
interface Plan {
  id: string
  planName: string
  brandName: string | null
  startDate: Date | null
  endDate: Date | null
  totalBudget: number | null
  objectiveType: string | null
  funnelConfigJson: string | null
  status: string
  updatedAt: Date
  _count: { rows: number }
}

// ── Default sort: drafts first (newest), then completed (newest), then others ─
function defaultSort(plans: Plan[]): Plan[] {
  const byUpdatedDesc = (a: Plan, b: Plan) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  const drafts    = plans.filter(p => p.status === 'draft').sort(byUpdatedDesc)
  const completed = plans.filter(p => p.status === 'completed').sort(byUpdatedDesc)
  const others    = plans.filter(p => p.status !== 'draft' && p.status !== 'completed').sort(byUpdatedDesc)
  return [...drafts, ...completed, ...others]
}

export default function PlanList({ plans, userId }: { plans: Plan[]; userId: string }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const storageKey = `planOrder_${userId}`

  // Initialise from defaultSort; localStorage is applied on mount via useEffect
  const [order, setOrder] = useState<string[]>(() => defaultSort(plans).map(p => p.id))

  // Load persisted order from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as string[]
      const currentIds = new Set(plans.map(p => p.id))
      const validIds = parsed.filter(id => currentIds.has(id))
      if (validIds.length === 0) return
      // Append any new plans not yet in saved order at the end
      const newIds = plans.filter(p => !parsed.includes(p.id)).map(p => p.id)
      setOrder([...validIds, ...newIds])
    } catch { /* ignore corrupt data */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Persist order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(order))
  }, [order, storageKey])

  // Rebuild sorted list whenever `plans` or `order` changes
  const sortedPlans = useMemo(() => {
    const map = new Map(plans.map(p => [p.id, p]))
    const ordered = order.map(id => map.get(id)).filter(Boolean) as Plan[]
    const extra = plans.filter(p => !order.includes(p.id))
    return [...ordered, ...extra]
  }, [plans, order])

  const moveUp = (idx: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (idx === 0) return
    setOrder(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const moveDown = (idx: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (idx === sortedPlans.length - 1) return
    setOrder(prev => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setConfirmId(id)
  }

  const confirmDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDeletingId(id)
    try {
      await fetch(`/api/plans/${id}`, { method: 'DELETE' })
      setOrder(prev => prev.filter(x => x !== id))
      router.refresh()
    } catch { alert('刪除失敗') }
    setDeletingId(null)
    setConfirmId(null)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setConfirmId(null)
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <div className="text-gray-500 font-medium">還沒有任何行銷計畫</div>
        <div className="text-gray-400 text-sm mt-1">點擊右上角「新建計畫」開始</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedPlans.map((plan, idx) => {
        const slices = parseFunnelSlices(plan.funnelConfigJson, plan.totalBudget)
        return (
          <div key={plan.id} className="relative group">
            {/* ── Plan card (full width, arrows inside on the right) ── */}
            <Link
              href={`/plans/${plan.id}`}
              className="block bg-white rounded-xl border hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-stretch gap-3">
                {/* Left: name + meta + funnel bar */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800">{plan.planName}</div>
                  <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    {plan.brandName && <span>{plan.brandName}</span>}
                    {plan.objectiveType && (
                      <>
                        <span>·</span>
                        <span>{plan.objectiveType}</span>
                      </>
                    )}
                    {(plan.startDate || plan.endDate) && (
                      <>
                        <span>·</span>
                        <span>
                          {plan.startDate ? new Date(plan.startDate).toLocaleDateString('zh-TW') : '?'}
                          {' ～ '}
                          {plan.endDate ? new Date(plan.endDate).toLocaleDateString('zh-TW') : '?'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Mini funnel bar — shown when data exists */}
                  <MiniFunnelBar slices={slices} totalBudget={plan.totalBudget} />
                </div>

                {/* Right: budget / rows / status / delete */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {plan.totalBudget && (
                    <div className="text-sm text-gray-700 font-semibold">
                      NT$ {plan.totalBudget.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">{plan._count.rows} rows</div>
                  {plan.status === 'completed' ? (
                    <>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS.completed}`}>
                        已完成計畫
                      </div>
                      <div className="text-xs text-gray-400">{formatDateTime(plan.updatedAt)}</div>
                    </>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[plan.status] || STATUS_COLORS.draft}`}>
                      {STATUS_LABELS[plan.status] || plan.status}
                    </span>
                  )}

                  {/* Delete */}
                  {confirmId === plan.id ? (
                    <div className="flex items-center gap-1 mt-1" onClick={(e) => e.preventDefault()}>
                      <span className="text-xs text-red-600 font-medium">確認刪除？</span>
                      <button
                        onClick={(e) => confirmDelete(plan.id, e)}
                        disabled={deletingId === plan.id}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === plan.id ? '刪除中...' : '確認'}
                      </button>
                      <button onClick={cancelDelete} className="text-xs border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100">
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDelete(plan.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 mt-1"
                      title="刪除計畫"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* ── Reorder arrows (inside card, far right) ── */}
                <div className="flex flex-col justify-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border-l border-gray-100 pl-2">
                  <button
                    onClick={(e) => moveUp(idx, e)}
                    disabled={idx === 0}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-default transition text-xs"
                    title="往上移"
                  >▲</button>
                  <button
                    onClick={(e) => moveDown(idx, e)}
                    disabled={idx === sortedPlans.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-default transition text-xs"
                    title="往下移"
                  >▼</button>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
