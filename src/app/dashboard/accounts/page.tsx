import { getUser } from '@/app/actions/auth'
import { serverQueries } from '@/lib/supabase/server-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  Banknote, 
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'

const accountTypeIcons = {
  checking: CreditCard,
  savings: PiggyBank,
  credit_card: CreditCard,
  cash: Banknote,
}

const accountTypeColors = {
  checking: 'bg-blue-100 text-blue-800',
  savings: 'bg-green-100 text-green-800',
  credit_card: 'bg-red-100 text-red-800',
  cash: 'bg-yellow-100 text-yellow-800',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function getAccountTypeLabel(type: string) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export default async function AccountsPage() {
  const { user } = await getUser()
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your accounts.</p>
        </div>
      </div>
    )
  }

  const accounts = await serverQueries.getAccounts(user.id)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-2">
            Manage your financial accounts and track balances
          </p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </Link>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Total Balance
          </CardTitle>
          <CardDescription>
            Combined balance across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
          <div className="flex items-center gap-1 mt-2">
            {totalBalance >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Positive balance</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Negative balance</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first account to track your finances.
            </p>
            <Link href="/dashboard/accounts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const IconComponent = accountTypeIcons[account.type]
            const isNegative = account.balance < 0
            
            return (
              <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={accountTypeColors[account.type]}
                          >
                            {getAccountTypeLabel(account.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Balance</span>
                        <span className={`text-lg font-semibold ${
                          isNegative ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Created</span>
                        <span className="text-sm text-gray-600">
                          {new Date(account.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
