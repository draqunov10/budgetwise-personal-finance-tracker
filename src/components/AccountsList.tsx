"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccountDeleteModal } from './AccountDeleteModal'
import { 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  Banknote, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase/types'

type Account = Database['public']['Tables']['accounts']['Row']

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

interface AccountsListProps {
  accounts: Account[]
  userId: string
}

export function AccountsList({ accounts, userId }: AccountsListProps) {
  const router = useRouter()
  const [deletedAccountId, setDeletedAccountId] = useState<string | null>(null)

  const handleDeleteSuccess = () => {
    // Refresh the page to show updated accounts list
    router.refresh()
  }

  // Filter out deleted account from display
  const visibleAccounts = accounts.filter(account => account.id !== deletedAccountId)

  if (visibleAccounts.length === 0) {
    return (
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
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleAccounts.map((account) => {
        const IconComponent = accountTypeIcons[account.type]
        const isNegative = account.balance < 0
        
        return (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
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
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/accounts/${account.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
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
        )
      })}
    </div>
  )
}
