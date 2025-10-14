"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AccountForm } from './AccountForm'
import { Database } from '@/lib/supabase/types'
import { Edit } from 'lucide-react'

type Account = Database['public']['Tables']['accounts']['Row']

interface AccountEditModalProps {
  account: Account
  userId: string
  onSuccess?: () => void
}

export function AccountEditModal({ account, userId, onSuccess }: AccountEditModalProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update your account information below.
          </DialogDescription>
        </DialogHeader>
        <AccountForm 
          account={account} 
          userId={userId} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
