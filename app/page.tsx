import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NavHeader from '@/components/NavHeader'
import DashboardPage from '@/components/DashboardPage'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader email={email} />
      <DashboardPage email={email} />
    </div>
  )
}
