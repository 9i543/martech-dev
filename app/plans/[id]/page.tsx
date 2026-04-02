import { query, queryOne } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import PlanForm from '@/components/PlanForm'
import type { PlanData, ChannelRow, AudienceRow, CreativeRow, KpiRow, FunnelStageConfig } from '@/components/PlanForm'
import { DEFAULT_AXES, STAGE_KEYS } from '@/lib/core-axes'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_FUNNEL_CONFIG: Record<string, FunnelStageConfig> = {
  Awareness:  { enabled: true,  ratio: 30, task: '導流' },
  Interest:   { enabled: true,  ratio: 20, task: '互動留言' },
  Desire:     { enabled: true,  ratio: 30, task: '導購' },
  Action:     { enabled: true,  ratio: 20, task: '成交' },
  Membership: { enabled: false, ratio: 0,  task: '留存/回購' },
}

const DEFAULT_TASKS: Record<string, string> = {
  Awareness: '導流', Interest: '互動留言', Desire: '導購', Action: '成交', Membership: '留存/回購',
}

function detectRowType(row: Record<string, unknown>): string {
  if (row.rowType) return row.rowType as string
  // Fallback detection for rows saved before rowType column was added
  if (row.channelBucket) return 'channel'
  if (row.audienceType) return 'audience'
  if (row.contentPlacement) return 'creative'
  if (row.plannedKpiType || row.campaignGoal) return 'kpi'
  return 'unknown'
}

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.email ?? ''

  const plan = await queryOne<Record<string, unknown>>(
    `SELECT * FROM "PlanMaster" WHERE id = $1 AND "userId" = $2`,
    [params.id, userId]
  )

  if (!plan) notFound()

  // Load all rows
  const dbRows = await query<Record<string, unknown>>(
    `SELECT * FROM "PlanRow" WHERE "planId" = $1 ORDER BY "createdAt" ASC`,
    [params.id]
  )

  // Reconstruct funnelConfig + tactic
  let funnelConfig = DEFAULT_FUNNEL_CONFIG
  let tacticIntent = ''
  let tacticAngle  = ''
  let mycampaignNameZh = ''
  let mycampaignNameEn = ''
  if (plan.funnelConfigJson) {
    try {
      const parsed = JSON.parse(plan.funnelConfigJson as string)
      tacticIntent       = (parsed._tacticIntent     as string) ?? ''
      tacticAngle        = (parsed._tacticAngle      as string) ?? ''
      mycampaignNameZh   = (parsed._mycampaignNameZh as string) ?? ''
      mycampaignNameEn   = (parsed._mycampaignNameEn as string) ?? ''
      const { _tacticIntent: _ti, _tacticAngle: _ta, _mycampaignNameZh: _mzh, _mycampaignNameEn: _men, ...funnelOnly } = parsed
      void _ti; void _ta; void _mzh; void _men
      if (Object.keys(funnelOnly).length > 0) funnelConfig = funnelOnly
    } catch {}
  } else if (plan.objectiveType) {
    const axis = DEFAULT_AXES.find((a) => a.id === plan.objectiveType)
    if (axis) {
      funnelConfig = {}
      for (const stage of STAGE_KEYS) {
        funnelConfig[stage] = {
          enabled: axis.ratios[stage] > 0,
          ratio: axis.ratios[stage],
          task: DEFAULT_TASKS[stage],
        }
      }
    }
  }

  // Reconstruct module rows from PlanRows
  const channelRows: ChannelRow[] = dbRows
    .filter((r) => detectRowType(r) === 'channel')
    .map((r) => ({
      id: (r.id as string) || uuidv4(),
      funnelStage: (r.funnelStage as string) || 'Awareness',
      channelBucket: (r.channelBucket as string) || 'paid',
      channelType: (r.channelType as string) || '',
      utmSource: (r.utmSource as string) || '',
      utmMedium: (r.utmMedium as string) || '',
      channelRole: (r.channelRole as string) || '主力',
      plannedBudget: r.plannedBudget != null ? (r.plannedBudget as number) : '',
      budgetRatio: r.budgetRatio != null ? (r.budgetRatio as number) : '',
      notes: (r.notes as string) || '',
      landingUrl: (r.landingUrl as string) || '',
      ctaType: (r.ctaType as string) || '了解更多',
      utmCampaign: (r.utmCampaign as string) || '',
    }))

  const audienceRows: AudienceRow[] = dbRows
    .filter((r) => detectRowType(r) === 'audience')
    .map((r) => ({
      id: (r.id as string) || uuidv4(),
      funnelStage: (r.funnelStage as string) || 'Desire',
      audienceType: (r.audienceType as string) || '',
      utmTerm: (r.utmTerm as string) || '',
      audienceDesc: (r.audienceDesc as string) || '',
      isNewCustomer: (r.isNewCustomer as string) || 'new',
      channelRowId: (r.trackingId as string) || '',
    }))

  const creativeRows: CreativeRow[] = dbRows
    .filter((r) => detectRowType(r) === 'creative')
    .map((r) => ({
      id: (r.id as string) || uuidv4(),
      funnelStage: (r.funnelStage as string) || 'Awareness',
      channelType: (r.channelType as string) || 'paid_social',
      contentGroup: (r.contentPlacement as string) || 'feed',
      contentVariant: (r.contentVersion as string) || 'v01',
      utmCreativeFormat: (r.utmCreativeFormat as string) || 'image',
      channelRowId: (r.trackingId as string) || '',
      creativeBrief: (r.notes as string) || '',
    }))

  const kpiRows: KpiRow[] = dbRows
    .filter((r) => detectRowType(r) === 'kpi')
    .map((r) => ({
      id: (r.id as string) || uuidv4(),
      funnelStage: (r.funnelStage as string) || 'Awareness',
      campaignGoal: (r.campaignGoal as string) || 'page_view',
      kpiType: (r.plannedKpiType as string) || '',
      kpiValue: r.plannedKpiValue != null ? (r.plannedKpiValue as number) : '',
      kpiCost: r.plannedKpiCost != null ? (r.plannedKpiCost as number) : '',
      notes: (r.notes as string) || '',
      channelRowId: (r.trackingId as string) || '',
      landingUrl: (r.landingUrl as string) || '',
      ctaType: (r.ctaType as string) || '',
    }))

  const startDate = plan.startDate ? new Date(plan.startDate as string).toISOString().split('T')[0] : ''
  const endDate = plan.endDate ? new Date(plan.endDate as string).toISOString().split('T')[0] : ''

  const initialData: Partial<PlanData> = {
    planName: plan.planName as string,
    brandName: (plan.brandName as string) ?? '',
    startDate,
    endDate,
    totalBudget: (plan.totalBudget as number) ?? '',
    objectiveType: (plan.objectiveType as string) ?? '',
    notes: (plan.notes as string) ?? '',
    tacticIntent,
    tacticAngle,
    mycampaignNameZh,
    mycampaignNameEn,
    funnelConfig,
    channelRows,
    audienceRows,
    creativeRows,
    kpiRows,
    landingRows: [], // Module 7 now uses channelRows directly
  }

  return <PlanForm planId={plan.id as string} initialData={initialData} />
}
