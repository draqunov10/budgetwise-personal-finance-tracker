import { getUser } from '@/app/actions/auth'
import { AccountForm } from '@/components/AccountForm'
import { redirect } from 'next/navigation'

export default async function NewAccountPage() {
  const { user } = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Account</h1>
        <p className="text-gray-600 mt-2">
          Create a new account to start tracking your finances
        </p>
      </div>

      {/* Form */}
      <AccountForm userId={user.id} />
    </div>
  )
}
