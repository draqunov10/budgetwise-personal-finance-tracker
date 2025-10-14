import { getUser } from '@/app/actions/auth'
import { serverQueries } from '@/lib/supabase/server-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionEditModal } from '@/components/TransactionEditModal'
import { TransactionDeleteModal } from '@/components/TransactionDeleteModal'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Receipt,
  Tag,
  CreditCard,
  PiggyBank,
  Wallet,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

const accountTypeIcons = {
  checking: CreditCard,
  savings: PiggyBank,
  credit_card: CreditCard,
  cash: Banknote,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getAccountTypeLabel(type: string) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const { user } = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get all transactions to find the specific one
  const transactions = await serverQueries.getTransactionsWithTags(user.id)
  const transaction = transactions.find(t => t.id === params.id)

  if (!transaction) {
    notFound()
  }

  // Get all accounts to find the account details
  const accounts = await serverQueries.getAccounts(user.id)
  const account = accounts.find(acc => acc.id === transaction.account_id)

  if (!account) {
    notFound()
  }

  const isIncome = transaction.amount > 0
  const tags = transaction.transaction_tags?.map((tt: any) => tt.tags) || []
  const IconComponent = accountTypeIcons[account.type]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-600 mt-1">
              View and manage transaction information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <TransactionEditModal transaction={transaction} userId={user.id} />
          <TransactionDeleteModal transaction={transaction} userId={user.id} />
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {transaction.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <div className={`text-3xl font-bold mt-1 ${
                isIncome ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncome ? '+' : ''}{formatCurrency(transaction.amount)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`p-1 rounded-full ${
                  isIncome 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {isIncome ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {isIncome ? 'Income' : 'Expense'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Transaction Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(transaction.transaction_date)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900 mt-1">
                {new Date(transaction.created_at).toLocaleString('en-PH')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Account</label>
              <div className="flex items-center gap-2 mt-1">
                <Link 
                  href={`/dashboard/accounts/${account.id}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                >
                  {account.name}
                </Link>
                <Badge variant="secondary">
                  {getAccountTypeLabel(account.type)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Current Balance</label>
              <p className={`text-xl font-semibold mt-1 ${
                account.balance < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(account.balance)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Account Type</label>
              <p className="text-gray-900 mt-1">
                {getAccountTypeLabel(account.type)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-gray-900 mt-1">
                {new Date(account.created_at).toLocaleDateString('en-PH')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>
              Categories associated with this transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
                  {tags.map((tag: any) => (
                <Badge 
                  key={tag.id}
                  variant="secondary"
                  className="px-3 py-1"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Impact
          </CardTitle>
          <CardDescription>
            How this transaction affects your account balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Before Transaction</h4>
              <p className="text-lg font-semibold text-gray-700">
                {formatCurrency(account.balance - transaction.amount)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">After Transaction</h4>
              <p className={`text-lg font-semibold ${
                account.balance < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
