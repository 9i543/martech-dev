import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NavHeader from '@/components/NavHeader'
import ConnectionsGrid from '@/components/ConnectionsGrid'

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader email={session?.user?.email ?? ''} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800">帳號連結</h1>
          <p className="text-sm text-gray-500 mt-1">選擇廣告平台，連結您的帳號以啟用成效數據同步</p>
        </div>
        <ConnectionsGrid />
      </main>
    </div>
  )
}
