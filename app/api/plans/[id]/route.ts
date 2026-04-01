import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getUserId } from '@/lib/get-user-id'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await queryOne(
    `SELECT * FROM "PlanMaster" WHERE id = $1 AND "userId" = $2`,
    [params.id, userId]
  )
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rows = await query(
    `SELECT * FROM "PlanRow" WHERE "planId" = $1 ORDER BY "createdAt" ASC`,
    [params.id]
  )
  return NextResponse.json({ ...plan, rows })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const now = new Date()

  await queryOne(
    `UPDATE "PlanMaster"
     SET "planName"=$1, "brandName"=$2, "startDate"=$3, "endDate"=$4,
         "totalBudget"=$5, "objectiveType"=$6, notes=$7, "funnelConfigJson"=$8,
         "updatedAt"=$9, status=COALESCE($12, status)
     WHERE id=$10 AND "userId"=$11`,
    [body.planName, body.brandName || null, body.startDate || null,
     body.endDate || null, body.totalBudget || null, body.objectiveType || null,
     body.notes || null, body.funnelConfigJson || null, now, params.id, userId,
     body.status || null]
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await queryOne(
    `DELETE FROM "PlanMaster" WHERE id = $1 AND "userId" = $2`,
    [params.id, userId]
  )
  return NextResponse.json({ ok: true })
}
