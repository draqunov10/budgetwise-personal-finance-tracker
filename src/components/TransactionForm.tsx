"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { clientQueries } from '@/lib/supabase/queries'
import { Database } from '@/lib/supabase/types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type Account = Database['public']['Tables']['accounts']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

const transactionSchema = z.object({
  account_id: z.string().min(1, 'Please select an account'),
  amount: z.number().min(-999999.99, 'Amount cannot be less than -₱999,999.99').max(999999.99, 'Amount cannot exceed ₱999,999.99'),
  description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  tag_ids: z.array(z.string()).optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: Transaction
  userId: string
  preselectedAccountId?: string
  onSuccess?: () => void
}

export function TransactionForm({ transaction, userId, preselectedAccountId, onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const router = useRouter()
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: transaction?.account_id || preselectedAccountId || '',
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
      tag_ids: [],
    },
  })

  // Load accounts and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, tagsData] = await Promise.all([
          clientQueries.getAccounts(userId),
          clientQueries.getTags(userId)
        ])
        setAccounts(accountsData)
        setTags(tagsData)

        // If editing an existing transaction, load its tags
        if (transaction) {
          const transactionsWithTags = await clientQueries.getTransactionsWithTags(userId)
          const currentTransaction = transactionsWithTags.find(t => t.id === transaction.id)
          if (currentTransaction?.transaction_tags) {
            const existingTagIds = currentTransaction.transaction_tags.map((tt: any) => tt.tag_id)
            setSelectedTags(existingTagIds)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [userId, transaction])

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    
    try {
      const transactionData: TransactionInsert = {
        user_id: userId,
        account_id: data.account_id,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
      }

      let newTransaction: Transaction | null = null

      if (transaction) {
        // Update existing transaction
        const updateData = {
          ...transactionData,
          transaction_date: transactionData.transaction_date || transaction.transaction_date
        }
        newTransaction = await clientQueries.updateTransaction(transaction.id, updateData)
        if (!newTransaction) {
          throw new Error('Failed to update transaction')
        }
      } else {
        // Create new transaction
        const createData = {
          ...transactionData,
          transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0]
        }
        newTransaction = await clientQueries.createTransaction(createData)
        if (!newTransaction) {
          throw new Error('Failed to create transaction')
        }
      }

      // Handle tags if any are selected
      if (selectedTags.length > 0 && newTransaction) {
        // Remove existing tags first (for updates)
        if (transaction) {
          // Get existing transaction tags and remove them
          const existingTransaction = await clientQueries.getTransactionsWithTags(userId)
          const currentTransaction = existingTransaction.find(t => t.id === transaction.id)
          if (currentTransaction?.transaction_tags) {
            for (const tt of currentTransaction.transaction_tags) {
              await clientQueries.removeTagFromTransaction(transaction.id, (tt as any).tag_id)
            }
          }
        }

        // Add new tags
        for (const tagId of selectedTags) {
          await clientQueries.addTagToTransaction(newTransaction.id, tagId)
        }
      }

      onSuccess?.()
      router.push(`/dashboard/transactions/${newTransaction.id}`)
    } catch (error) {
      console.error('Error saving transaction:', error)
      // You could add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
        <CardDescription>
          {transaction 
            ? 'Update your transaction information below.'
            : 'Record a new financial transaction.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatCurrency(account.balance)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500">
                    Use positive numbers for income, negative for expenses
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Grocery shopping, Salary deposit" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Selection */}
            {tags.length > 0 && (
              <div className="space-y-3">
                <Label>Tags (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80"
                      style={selectedTags.includes(tag.id) ? { 
                        backgroundColor: tag.color, 
                        color: 'white' 
                      } : { 
                        borderColor: tag.color, 
                        color: tag.color 
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Click tags to select them for this transaction
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : (transaction ? 'Update Transaction' : 'Create Transaction')}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
