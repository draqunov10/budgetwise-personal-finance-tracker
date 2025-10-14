import { requireAuth } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // This will redirect to /login if user is not authenticated
    await requireAuth('/login')
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    )
  } catch (error) {
    // If there's an error (like redirect), let it propagate
    redirect('/login')
  }
}
