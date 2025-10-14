"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { TransactionForm } from '@/components/TransactionForm'
import { Database } from '@/lib/supabase/types'
import { Edit } from 'lucide-react'

type Transaction = Database['public']['Tables']['transactions']['Row']

interface TransactionEditModalProps {
  transaction: Transaction
  userId: string
  onSuccess?: () => void
}

export function TransactionEditModal({ transaction, userId, onSuccess }: TransactionEditModalProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
    // Refresh the current page to show updated data
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          transaction={transaction}
          userId={userId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
