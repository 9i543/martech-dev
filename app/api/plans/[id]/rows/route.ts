import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getUserId } from '@/lib/get-user-id'
import { randomUUID } from 'crypto'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await query(
    `SELECT pr.* FROM "PlanRow" pr
     JOIN "PlanMaster" pm ON pm.id = pr."planId"
     WHERE pr."planId" = $1 AND pm."userId" = $2
     ORDER BY pr."createdAt" ASC`,
    [params.id, userId]
  )
  return NextResponse.json(rows)
}

// Helper: null-safe value — keeps 0 as 0, converts '' and undefined to null
function val(v: unknown): unknown {
  if (v === '' || v === undefined) return null
  return v ?? null
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await queryOne(
    `SELECT id FROM "PlanMaster" WHERE id = $1 AND "userId" = $2`,
    [params.id, userId]
  )
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const items = Array.isArray(body) ? body : [body]
  const now = new Date()

  // ── REPLACE: delete all existing rows for this plan, then insert fresh ──
  await query(`DELETE FROM "PlanRow" WHERE "planId" = $1`, [params.id])

  const results = []
  for (const item of items) {
    // Preserve client-provided id so dependent rows' trackingId stays valid across saves
    const id = (typeof item.id === 'string' && item.id) ? item.id : randomUUID()
    const row = await queryOne(
      `INSERT INTO "PlanRow" (id, "planId", "rowType", "funnelStage", "executionStage",
        "channelBucket", "channelType", "channelRole",
        "utmSource", "utmMedium", "utmSourcePlatform",
        "utmMarketingTactic", "utmCampaign", "utmTerm", "contentPlacement", "contentVersion",
        "utmCreativeFormat", "campaignGoal", "audienceType", "audienceDesc",
        "isNewCustomer", "plannedBudget", "budgetRatio",
        "plannedKpiType", "plannedKpiValue", "plannedKpiCost",
        "landingUrl", "ctaType", "conversionPoint", "trackingId", notes,
        "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$32)
       RETURNING *`,
      [id, params.id,
       val(item.rowType),
       val(item.funnelStage), val(item.executionStage),
       val(item.channelBucket), val(item.channelType), val(item.channelRole),
       val(item.utmSource), val(item.utmMedium), val(item.utmSourcePlatform),
       val(item.utmMarketingTactic), val(item.utmCampaign),
       val(item.utmTerm), val(item.contentPlacement), val(item.contentVersion),
       val(item.utmCreativeFormat), val(item.campaignGoal),
       val(item.audienceType), val(item.audienceDesc), val(item.isNewCustomer),
       val(item.plannedBudget), val(item.budgetRatio),
       val(item.plannedKpiType), val(item.plannedKpiValue), val(item.plannedKpiCost),
       val(item.landingUrl), val(item.ctaType), val(item.conversionPoint),
       val(item.trackingId), val(item.notes),
       now]
    )
    results.push(row)
  }

  return NextResponse.json(Array.isArray(body) ? results : results[0])
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { rowId, ...fields } = body
  const now = new Date()

  const sets = Object.keys(fields)
    .map((k, i) => `"${k}" = $${i + 3}`)
    .join(', ')
  const values = Object.values(fields)

  await queryOne(
    `UPDATE "PlanRow" SET ${sets}, "updatedAt" = $2 WHERE id = $1`,
    [rowId, now, ...values]
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rowId } = await req.json()
  await queryOne(`DELETE FROM "PlanRow" WHERE id = $1`, [rowId])
  return NextResponse.json({ ok: true })
}
