import PlanForm from '@/components/PlanForm'
import type { PlanData } from '@/components/PlanForm'

export default function NewPlanPage({
  searchParams,
}: {
  searchParams: { intent?: string }
}) {
  const intentId = searchParams.intent ?? ''

  const initialData: Partial<PlanData> = {}

  if (intentId) {
    initialData.tacticIntent = intentId
  }

  return <PlanForm initialData={initialData} />
}
