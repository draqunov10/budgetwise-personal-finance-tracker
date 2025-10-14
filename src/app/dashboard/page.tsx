import { getUser } from '@/app/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, CreditCard, PiggyBank } from 'lucide-react'

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">Start by adding your first transaction</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Track your spending against your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No budget set</p>
              <p className="text-sm">Create your first budget to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Add Income</h3>
              <p className="text-sm text-gray-500">Record new income</p>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-medium">Add Expense</h3>
              <p className="text-sm text-gray-500">Record new expense</p>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <PiggyBank className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Set Budget</h3>
              <p className="text-sm text-gray-500">Create spending limits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
