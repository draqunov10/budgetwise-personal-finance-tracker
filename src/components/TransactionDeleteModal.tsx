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
import { clientQueries } from '@/lib/supabase/queries'
import { Database } from '@/lib/supabase/types'
import { Trash2, AlertTriangle } from 'lucide-react'

type Transaction = Database['public']['Tables']['transactions']['Row']

interface TransactionDeleteModalProps {
  transaction: Transaction
  userId: string
  onSuccess?: () => void
}

export function TransactionDeleteModal({ transaction, userId, onSuccess }: TransactionDeleteModalProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const success = await clientQueries.deleteTransaction(transaction.id)
      
      if (success) {
        setOpen(false)
        onSuccess?.()
        // Navigate back to transactions list
        router.push('/dashboard/transactions')
      } else {
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      // You could add a toast notification here
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Transaction
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction?
            <br />
            <br />
            <strong className="text-gray-900">
              "{transaction.description}"
            </strong>
            <br />
            <br />
            <strong className="text-red-600">
              This action cannot be undone.
            </strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
