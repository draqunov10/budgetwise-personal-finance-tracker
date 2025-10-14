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

type Account = Database['public']['Tables']['accounts']['Row']

interface AccountDeleteModalProps {
  account: Account
  userId: string
  onSuccess?: () => void
}

export function AccountDeleteModal({ account, userId, onSuccess }: AccountDeleteModalProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const success = await clientQueries.deleteAccount(account.id)
      
      if (success) {
        setOpen(false)
        onSuccess?.()
        // Navigate back to accounts list
        router.push('/dashboard/accounts')
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      // You could add a toast notification here
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{account.name}"? This action cannot be undone.
            <br />
            <br />
            <strong className="text-red-600">
              Warning: All transactions associated with this account will also be deleted.
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
            {isDeleting ? 'Deleting...' : 'Delete Account'}
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
