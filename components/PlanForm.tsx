'use client'
import { useState } from 'react'
import Module1Basic from './plan-modules/Module1Basic'
import Module2Funnel from './plan-modules/Module2Funnel'
import Module3Channel from './plan-modules/Module3Channel'
import Module4Audience from './plan-modules/Module4Audience'
import Module5Creative from './plan-modules/Module5Creative'
import Module6KPI from './plan-modules/Module6KPI'
import Module7Landing from './plan-modules/Module7Landing'
import Module8Export from './plan-modules/Module8Export'
import Module2Strategy from './plan-modules/Module2Strategy'
import Module8Campaign from './plan-modules/Module8Campaign'
import { applyTacticToFunnelConfig } from '@/lib/tactic-config'

const MODULES = [
  { id: 1,  icon: '📋', label: '活動名稱' },
  { id: 2,  icon: '💡', label: '行銷策略' },
  { id: 3,  icon: '🎯', label: '漏斗配置' },
  { id: 4,  icon: '📡', label: '渠道規劃' },
  { id: 5,  icon: '👥', label: '受眾規劃' },
  { id: 6,  icon: '🎨', label: '素材規劃' },
  { id: 7,  icon: '📈', label: '目標與KPI' },
  { id: 8,  icon: '📣', label: '廣告活動' },
  { id: 9,  icon: '🔗', label: '活動網址' },
  { id: 10, icon: '⬇️', label: '輸出與串接' },
]

export type FunnelStageConfig = {
  enabled: boolean
  ratio: number
  task: string
}

export type PlanData = {
  // Module 1
  planName: string
  brandName: string
  startDate: string
  endDate: string
  totalBudget: number | ''
  objectiveType: string
  notes: string
  // Module 2 (行銷策略)
  tacticIntent: string
  tacticAngle: string
  // Module 8 (廣告活動 - 友善辨識名稱)
  mycampaignNameZh: string
  mycampaignNameEn: string
  // Module 3 (AIDA+M 漏斗配置)
  funnelConfig: Record<string, FunnelStageConfig>
  // Module 3 - rows
  channelRows: ChannelRow[]
  // Module 4
  audienceRows: AudienceRow[]
  // Module 5
  creativeRows: CreativeRow[]
  // Module 6
  kpiRows: KpiRow[]
  // Module 7
  landingRows: LandingRow[]
}

export type ChannelRow = {
  id: string
  funnelStage: string
  channelBucket: string
  channelType: string
  utmSource: string
  utmMedium: string
  channelRole: string
  plannedBudget: number | ''
  budgetRatio: number | ''
  notes: string
  landingUrl: string
  ctaType: string
  utmCampaign: string  // Module 8: 廣告活動
}

export type AudienceRow = {
  id: string
  funnelStage: string
  audienceType: string
  utmTerm: string
  audienceDesc: string
  isNewCustomer: string
  channelRowId?: string   // binds audience to a specific Module 3 channel row
}

export type CreativeRow = {
  id: string
  funnelStage: string
  channelType: string
  contentGroup: string
  contentVariant: string
  utmCreativeFormat: string
  channelRowId?: string   // binds to a Module 3 channel row; stored in trackingId column
  creativeBrief?: string  // 素材說明; filled indicator; stored in notes column
}

export type KpiRow = {
  id: string
  funnelStage: string
  campaignGoal: string
  kpiType: string
  kpiValue: number | ''
  kpiCost: number | ''
  notes: string
  channelRowId?: string   // binds to a Module 3 channel row; stored in trackingId column
  landingUrl?: string     // goal-specific landing URL (Module 7)
  ctaType?: string        // goal-specific CTA type (Module 7)
}

export type LandingRow = {
  id: string
  funnelStage: string
  utmSource: string
  utmMedium: string
  utmSourcePlatform: string
  utmCreativeFormat: string
  landingUrl: string
  ctaType: string
  conversionPoint: string
}

const defaultFunnelConfig: Record<string, FunnelStageConfig> = {
  Awareness:  { enabled: true,  ratio: 30, task: '導流' },
  Interest:   { enabled: true,  ratio: 20, task: '互動留言' },
  Desire:     { enabled: true,  ratio: 30, task: '導購' },
  Action:     { enabled: true,  ratio: 20, task: '成交' },
  Membership: { enabled: false, ratio: 0,  task: '留存/回購' },
}

const emptyPlan: PlanData = {
  planName: '',
  brandName: '',
  startDate: '',
  endDate: '',
  totalBudget: '',
  objectiveType: '',
  notes: '',
  tacticIntent: '',
  tacticAngle: '',
  mycampaignNameZh: '',
  mycampaignNameEn: '',
  funnelConfig: defaultFunnelConfig,
  channelRows: [],
  audienceRows: [],
  creativeRows: [],
  kpiRows: [],
  landingRows: [],
}

interface Props {
  initialData?: Partial<PlanData>
  planId?: string
}

// ── Validation per module ──────────────────────────────────────────────────
function validateModule(moduleId: number, plan: PlanData): string[] {
  switch (moduleId) {
    case 1: {
      const errs: string[] = []
      if (!plan.planName.trim()) errs.push('行銷活動名稱')
      if (!plan.startDate) errs.push('開始日期')
      if (!plan.endDate) errs.push('結束日期')
      if (!plan.totalBudget) errs.push('總預算')
      if (!plan.tacticIntent) errs.push('策略目的')
      return errs
    }
    case 2: {
      const errs: string[] = []
      if (!plan.tacticAngle) errs.push('請選擇訊息訴求')
      return errs
    }
    case 3: {
      const errs: string[] = []
      const enabled = Object.entries(plan.funnelConfig).filter(([, v]) => v.enabled)
      if (enabled.length === 0) errs.push('至少啟用一個漏斗階段')
      const totalRatio = enabled.reduce((s, [, v]) => s + v.ratio, 0)
      if (totalRatio !== 100) errs.push(`各階段預算比例總和須等於 100%（目前 ${totalRatio}%）`)
      return errs
    }
    case 4:
      return plan.channelRows.length === 0 ? ['至少新增一個渠道'] : []
    case 5:
      return plan.audienceRows.length === 0 ? ['至少新增一筆受眾設定'] : []
    case 6:
      return plan.creativeRows.length === 0 ? ['至少新增一筆素材設定'] : []
    case 7:
      return plan.kpiRows.length === 0 ? ['至少新增一筆 KPI 目標'] : []
    case 8:
      return []  // 廣告活動：utmCampaign auto-generated, no required fields
    case 9: {
      const missing = plan.channelRows.filter((r) => !r.landingUrl).length
      return missing > 0 ? [`尚有 ${missing} 個渠道未設定落地頁`] : []
    }
    default:
      return []
  }
}

// ── Next Step Bar ─────────────────────────────────────────────────────────
function NextStepBar({
  nextLabel,
  errors,
  showErrors,
  isValid,
  saving,
  onNext,
}: {
  nextLabel: string
  errors: string[]
  showErrors: boolean
  isValid: boolean
  saving: boolean
  onNext: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mt-2">
      {showErrors && errors.length > 0 && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-600 mb-1.5">請先完成以下必填欄位：</p>
          <ul className="space-y-1">
            {errors.map((e) => (
              <li key={e} className="text-xs text-red-500">• {e} 尚未完成本欄位資料</li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onNext}
        disabled={saving}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${
          isValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200'
        }`}
      >
        {saving ? '儲存中...' : `下一步：${nextLabel} →`}
      </button>
    </div>
  )
}

export default function PlanForm({ initialData, planId }: Props) {
  const [activeModule, setActiveModule] = useState(1)
  const [plan, setPlan] = useState<PlanData>({ ...emptyPlan, ...initialData })
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(planId ?? null)
  const [showNextErrors, setShowNextErrors] = useState(false)

  const updatePlan = (patch: Partial<PlanData>) => {
    setPlan((p) => ({ ...p, ...patch }))
  }

  const goToModule = (id: number) => {
    setActiveModule(id)
    setShowNextErrors(false)
  }

  const savePlan = async (options?: { status?: string; silent?: boolean; planOverride?: Partial<PlanData> }) => {
    setSaving(true)
    const planData = options?.planOverride ? { ...plan, ...options.planOverride } : plan
    try {
      const payload: Record<string, unknown> = {
        planName: planData.planName,
        brandName: planData.brandName,
        startDate: planData.startDate || null,
        endDate: planData.endDate || null,
        totalBudget: planData.totalBudget === '' ? null : planData.totalBudget,
        objectiveType: planData.objectiveType,
        notes: planData.notes,
        funnelConfigJson: JSON.stringify({
          ...(planData.tacticIntent       ? { _tacticIntent:       planData.tacticIntent       } : {}),
          ...(planData.tacticAngle        ? { _tacticAngle:        planData.tacticAngle        } : {}),
          ...(planData.mycampaignNameZh   ? { _mycampaignNameZh:   planData.mycampaignNameZh   } : {}),
          ...(planData.mycampaignNameEn   ? { _mycampaignNameEn:   planData.mycampaignNameEn   } : {}),
          ...planData.funnelConfig,
        }),
      }
      if (options?.status) payload.status = options.status

      let id = savedId
      if (!id) {
        const res = await fetch('/api/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        id = data.id
        setSavedId(id)
      } else {
        await fetch(`/api/plans/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      // Save all rows
      if (id) {
        const allRows = buildPlanRows(planData)
        await fetch(`/api/plans/${id}/rows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allRows),
        })
      }

      if (!options?.silent) alert('儲存成功！')
    } catch {
      if (!options?.silent) alert('儲存失敗')
    }
    setSaving(false)
  }

  const handleNextStep = async (moduleId: number) => {
    setShowNextErrors(true)
    const errors = validateModule(moduleId, plan)
    if (errors.length > 0) return

    if (moduleId === 2 && plan.tacticIntent && plan.tacticAngle) {
      // Apply tactic AIDAM ratios to funnelConfig before entering Module 3
      const newFunnelConfig = applyTacticToFunnelConfig(plan.tacticIntent, plan.tacticAngle, plan.funnelConfig)
      updatePlan({ funnelConfig: newFunnelConfig })
      await savePlan({ silent: true, planOverride: { funnelConfig: newFunnelConfig } })
    } else {
      // Module 9 → 10: mark plan as completed
      const status = moduleId === 9 ? 'completed' : undefined
      await savePlan({ status, silent: true })
    }
    setActiveModule(moduleId + 1)
    setShowNextErrors(false)
  }

  const currentErrors = validateModule(activeModule, plan)
  const isCurrentValid = currentErrors.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <span className="font-bold text-gray-800">行銷規劃介面</span>
              {plan.planName && (
                <span className="ml-2 text-sm text-gray-500">— {plan.planName}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">← 返回列表</a>
            <button
              onClick={() => savePlan()}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '儲存中...' : '儲存計畫'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <nav className="bg-white rounded-xl shadow-sm overflow-hidden">
            {MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => goToModule(m.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 text-sm border-b last:border-0 transition ${
                  activeModule === m.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-l-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-2">
          {activeModule === 1  && <Module1Basic plan={plan} update={updatePlan} />}
          {activeModule === 2  && <Module2Strategy plan={plan} update={updatePlan} />}
          {activeModule === 3  && <Module2Funnel plan={plan} update={updatePlan} />}
          {activeModule === 4  && <Module3Channel plan={plan} update={updatePlan} />}
          {activeModule === 5  && <Module4Audience plan={plan} update={updatePlan} />}
          {activeModule === 6  && <Module5Creative plan={plan} update={updatePlan} />}
          {activeModule === 7  && <Module6KPI plan={plan} update={updatePlan} />}
          {activeModule === 8  && <Module8Campaign plan={plan} update={updatePlan} />}
          {activeModule === 9  && <Module7Landing plan={plan} update={updatePlan} />}
          {activeModule === 10 && (
            <Module8Export plan={plan} planId={savedId} onSave={() => savePlan()} />
          )}

          {/* Next step bar — shown for modules 1–9 */}
          {activeModule < 10 && (
            <NextStepBar
              nextLabel={MODULES[activeModule].label}
              errors={currentErrors}
              showErrors={showNextErrors}
              isValid={isCurrentValid}
              saving={saving}
              onNext={() => handleNextStep(activeModule)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function buildPlanRows(planData: PlanData) {
  const plan = planData
  const rows: Record<string, unknown>[] = []

  // From channel rows — id MUST be included to keep dependent rows' trackingId stable
  plan.channelRows.forEach((r) => {
    rows.push({
      id: r.id,
      rowType: 'channel',
      funnelStage: r.funnelStage,
      channelBucket: r.channelBucket,
      channelType: r.channelType,
      utmSource: r.utmSource,
      utmMedium: r.utmMedium,
      channelRole: r.channelRole,
      plannedBudget: r.plannedBudget === '' ? null : r.plannedBudget,
      budgetRatio: r.budgetRatio === '' ? null : r.budgetRatio,
      notes: r.notes,
      landingUrl: r.landingUrl || null,
      ctaType: r.ctaType || null,
      utmMarketingTactic: (plan.tacticIntent && plan.tacticAngle)
        ? `${plan.tacticIntent}__${plan.tacticAngle}`
        : null,
      utmCampaign: r.utmCampaign || null,
    })
  })

  // From audience rows
  plan.audienceRows.forEach((r) => {
    rows.push({
      id: r.id,
      rowType: 'audience',
      funnelStage: r.funnelStage,
      audienceType: r.audienceType,
      utmTerm: r.utmTerm,
      audienceDesc: r.audienceDesc,
      isNewCustomer: r.isNewCustomer,
      trackingId: r.channelRowId || null,
    })
  })

  // From creative rows
  plan.creativeRows.forEach((r) => {
    rows.push({
      id: r.id,
      rowType: 'creative',
      funnelStage: r.funnelStage,
      channelType: r.channelType,
      contentPlacement: r.contentGroup,
      contentVersion: r.contentVariant,
      utmCreativeFormat: r.utmCreativeFormat,
      trackingId: r.channelRowId || null,
      notes: r.creativeBrief || null,
    })
  })

  // From KPI rows
  plan.kpiRows.forEach((r) => {
    rows.push({
      id: r.id,
      rowType: 'kpi',
      funnelStage: r.funnelStage,
      campaignGoal: r.campaignGoal,
      plannedKpiType: r.kpiType,
      plannedKpiValue: r.kpiValue === '' ? null : r.kpiValue,
      plannedKpiCost: r.kpiCost === '' ? null : r.kpiCost,
      notes: r.notes,
      trackingId: r.channelRowId || null,
      landingUrl: r.landingUrl || null,
      ctaType: r.ctaType || null,
    })
  })

  return rows
}
