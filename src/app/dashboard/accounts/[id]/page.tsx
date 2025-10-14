import { getUser } from '@/app/actions/auth'
import { serverQueries } from '@/lib/supabase/server-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccountEditModal } from '@/components/AccountEditModal'
import { AccountDeleteModal } from '@/components/AccountDeleteModal'
import { 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  Banknote, 
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

interface AccountDetailPageProps {
  params: {
    id: string
  }
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { user } = await getUser()
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your account details.</p>
        </div>
      </div>
    )
  }

  // Get all accounts to find the specific one
  const accounts = await serverQueries.getAccounts(user.id)
  const account = accounts.find(acc => acc.id === params.id)

  if (!account) {
    notFound()
  }

  // Get transactions for this account
  const transactions = await serverQueries.getTransactions(user.id, account.id)

  const IconComponent = accountTypeIcons[account.type]
  const isNegative = account.balance < 0

  // Calculate transaction stats
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/accounts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={accountTypeColors[account.type]}
              >
                {getAccountTypeLabel(account.type)}
              </Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(account.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <AccountEditModal account={account} userId={user.id} />
          <AccountDeleteModal account={account} userId={user.id} />
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              Current Balance
            </CardTitle>
            <CardDescription>
              Current account balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              isNegative ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(account.balance)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {isNegative ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Negative balance</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Positive balance</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Total Income
            </CardTitle>
            <CardDescription>
              Money received in this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {transactions.filter(t => t.amount > 0).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Total Expenses
            </CardTitle>
            <CardDescription>
              Money spent from this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {transactions.filter(t => t.amount < 0).length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest activity for this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">Start by adding your first transaction</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{transaction.description}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Transactions ({transactions.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
