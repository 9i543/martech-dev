import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import PlanList from '@/components/PlanList'
import TacticIntentSection from '@/components/TacticIntentSection'
import NavHeader from '@/components/NavHeader'

export default async function PlansPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.email ?? ''

  const plans = await query(
    `SELECT pm.*, COUNT(pr.id)::int AS row_count
     FROM "PlanMaster" pm
     LEFT JOIN "PlanRow" pr ON pr."planId" = pm.id
     WHERE pm."userId" = $1
     GROUP BY pm.id
     ORDER BY pm."updatedAt" DESC`,
    [userId]
  )

  const planData = plans.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    planName: p.planName as string,
    brandName: p.brandName as string | null,
    startDate: p.startDate as Date | null,
    endDate: p.endDate as Date | null,
    totalBudget: p.totalBudget as number | null,
    objectiveType: p.objectiveType as string | null,
    funnelConfigJson: p.funnelConfigJson as string | null,
    status: p.status as string,
    updatedAt: p.updatedAt as Date,
    _count: { rows: p.row_count as number },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader email={session?.user?.email ?? ''} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <TacticIntentSection />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">行銷計畫列表</h1>
        </div>

        <PlanList plans={planData} userId={userId} />
      </main>
    </div>
  )
}
