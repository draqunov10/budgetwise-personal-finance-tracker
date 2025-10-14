import { getUser } from '@/app/actions/auth'
import { TransactionForm } from '@/components/TransactionForm'
import { redirect } from 'next/navigation'

interface NewTransactionPageProps {
  searchParams: {
    account?: string
  }
}

export default async function NewTransactionPage({ searchParams }: NewTransactionPageProps) {
  const { user } = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Add New Transaction</h1>
        <p className="text-gray-600 mt-2">
          Record a new financial transaction to track your money flow
        </p>
      </div>
      
      <TransactionForm 
        userId={user.id} 
        preselectedAccountId={searchParams.account}
      />
    </div>
  )
}
