import { getUser } from '@/app/actions/auth'
import { serverQueries } from '@/lib/supabase/server-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  Tag, 
  Receipt, 
  Wallet,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Eye
} from 'lucide-react'
import Link from 'next/link'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default async function DashboardPage() {
  const { user } = await getUser()
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  // Fetch all data for the dashboard
  const [accounts, transactions, tags] = await Promise.all([
    serverQueries.getAccounts(user.id),
    serverQueries.getTransactionsWithTags(user.id),
    serverQueries.getTags(user.id)
  ])

  // Calculate financial summary
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netAmount = totalIncome - totalExpenses

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5)

  // Calculate tag usage
  const tagUsage = tags.map(tag => {
    const usageCount = transactions.filter(t => 
      t.transaction_tags?.some((tt: any) => tt.tags?.id === tag.id)
    ).length
    return { ...tag, usageCount }
  }).sort((a, b) => b.usageCount - a.usageCount)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your financial dashboard.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.amount > 0).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.amount < 0).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              netAmount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netAmount >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activity
                </CardDescription>
              </div>
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start by adding your first transaction</p>
                  <Link href="/dashboard/transactions/new" className="mt-4 inline-block">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const isIncome = transaction.amount > 0
                    const transactionTags = transaction.transaction_tags?.map((tt: any) => tt.tags) || []
                    
                    return (
                      <Link 
                        key={transaction.id}
                        href={`/dashboard/transactions/${transaction.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-full ${
                              isIncome 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {isIncome ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {transaction.description}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {formatDate(transaction.transaction_date)}
                                  </span>
                                </div>
                                {transactionTags.length > 0 && (
                                  <div className="flex gap-1">
                                    {transactionTags.slice(0, 2).map((tag: any) => (
                                      <Badge 
                                        key={tag.id}
                                        variant="secondary"
                                        className="text-xs"
                                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {transactionTags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{transactionTags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`text-lg font-semibold ${
                            isIncome ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isIncome ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>
                  Your account balances
                </CardDescription>
              </div>
              <Link href="/dashboard/accounts">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No accounts yet</p>
                  <p className="text-sm">Create your first account</p>
                  <Link href="/dashboard/accounts/new" className="mt-4 inline-block">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.slice(0, 4).map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-500">{account.type}</p>
                      </div>
                      <div className={`font-semibold ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.balance)}
                      </div>
                    </div>
                  ))}
                  {accounts.length > 4 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/accounts">
                        <Button variant="ghost" size="sm">
                          View {accounts.length - 4} more accounts
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tag Usage & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tag Usage</CardTitle>
              <CardDescription>
                Most used transaction categories
              </CardDescription>
            </div>
            <Link href="/dashboard/tags">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tagUsage.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tags yet</p>
                <p className="text-sm">Create tags to categorize transactions</p>
                <Link href="/dashboard/tags" className="mt-4 inline-block">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tags
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tagUsage.slice(0, 5).map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                    </div>
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.usageCount} uses
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/transactions/new">
                <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Add Transaction</h3>
                  <p className="text-sm text-gray-500">Record income or expense</p>
                </div>
              </Link>
              <Link href="/dashboard/accounts/new">
                <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Add Account</h3>
                  <p className="text-sm text-gray-500">Create new account</p>
                </div>
              </Link>
              <Link href="/dashboard/tags">
                <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">Manage Tags</h3>
                  <p className="text-sm text-gray-500">Organize transactions</p>
                </div>
              </Link>
              <Link href="/dashboard/transactions">
                <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-medium">View Transactions</h3>
                  <p className="text-sm text-gray-500">See all transactions</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-6 mt-8">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Created by Led Salazar
        </span>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm text-gray-600 dark:text-gray-400"
          href="https://github.com/draqunov10/budgetwise-personal-finance-tracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="GitHub icon"
            width={16}
            height={16}
          />
          GitHub
        </a>
      </footer>
    </div>
  )
}
