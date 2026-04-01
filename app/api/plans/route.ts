import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getUserId } from '@/lib/get-user-id'
import { randomUUID } from 'crypto'

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await query(
    `SELECT pm.*, COUNT(pr.id)::int AS row_count
     FROM "PlanMaster" pm
     LEFT JOIN "PlanRow" pr ON pr."planId" = pm.id
     WHERE pm."userId" = $1
     GROUP BY pm.id
     ORDER BY pm."updatedAt" DESC`,
    [userId]
  )
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = randomUUID()
  const now = new Date()

  const plan = await queryOne(
    `INSERT INTO "PlanMaster" (id, "userId", "planName", "brandName", "startDate", "endDate",
      "totalBudget", "objectiveType", notes, "funnelConfigJson", status, "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft',$11,$11)
     RETURNING *`,
    [id, userId, body.planName, body.brandName || null, body.startDate || null,
     body.endDate || null, body.totalBudget || null, body.objectiveType || null,
     body.notes || null, body.funnelConfigJson || null, now]
  )
  return NextResponse.json(plan)
}
