import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import PlanList from '@/components/PlanList'
import TacticIntentSection from '@/components/TacticIntentSection'

export default async function Home() {
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
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-gray-800 text-lg">MarTech 規劃平台</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session?.user?.email}</span>
            <a
              href="/api/auth/signout"
              className="text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1"
            >
              登出
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <TacticIntentSection />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">行銷計畫列表</h1>
        </div>

        <PlanList plans={planData} />
      </main>
    </div>
  )
}
