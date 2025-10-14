"use client"

import { useState } from 'react'
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
import { clientQueries } from '@/lib/supabase/queries'
import { Database } from '@/lib/supabase/types'

type Account = Database['public']['Tables']['accounts']['Row']
type AccountInsert = Database['public']['Tables']['accounts']['Insert']

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Account name is too long'),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash']),
  balance: z.coerce.number().min(-999999.99, 'Balance cannot be less than -₱999,999.99').max(999999.99, 'Balance cannot exceed ₱999,999.99'),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  account?: Account
  userId: string
  onSuccess?: () => void
}

export function AccountForm({ account, userId, onSuccess }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || undefined,
      balance: account?.balance || 0,
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true)
    
    try {
      const accountData: AccountInsert = {
        user_id: userId,
        name: data.name,
        type: data.type,
        balance: data.balance,
      }

      if (account) {
        // Update existing account
        const updatedAccount = await clientQueries.updateAccount(account.id, accountData)
        if (updatedAccount) {
          onSuccess?.()
          router.push(`/dashboard/accounts/${account.id}`)
        } else {
          throw new Error('Failed to update account')
        }
      } else {
        // Create new account
        const newAccount = await clientQueries.createAccount(accountData)
        if (newAccount) {
          onSuccess?.()
          router.push(`/dashboard/accounts/${newAccount.id}`)
        } else {
          throw new Error('Failed to create account')
        }
      }
    } catch (error) {
      console.error('Error saving account:', error)
      // You could add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const accountTypeOptions = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'cash', label: 'Cash' },
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {account ? 'Edit Account' : 'Add New Account'}
        </CardTitle>
        <CardDescription>
          {account 
            ? 'Update your account information below.'
            : 'Create a new account to start tracking your finances.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Main Checking, Emergency Savings" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : (account ? 'Update Account' : 'Create Account')}
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
