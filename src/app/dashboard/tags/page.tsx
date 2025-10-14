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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { clientQueries } from '@/lib/supabase/queries'
import { Database } from '@/lib/supabase/types'
import { getUser } from '@/app/actions/auth'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag as TagIcon,
  Palette,
  Calendar
} from 'lucide-react'

type Tag = Database['public']['Tables']['tags']['Row']
type TagInsert = Database['public']['Tables']['tags']['Insert']

const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().min(1, 'Color is required'),
})

type TagFormData = z.infer<typeof tagSchema>

const predefinedColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
]

interface TagFormProps {
  tag?: Tag
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

function TagForm({ tag, userId, onSuccess, onCancel }: TagFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      color: tag?.color || '#3b82f6',
    },
  })

  const onSubmit = async (data: TagFormData) => {
    setIsLoading(true)
    
    try {
      const tagData: TagInsert = {
        user_id: userId,
        name: data.name,
        color: data.color,
      }

      if (tag) {
        // Update existing tag
        const updatedTag = await clientQueries.updateTag(tag.id, tagData)
        if (!updatedTag) {
          throw new Error('Failed to update tag')
        }
      } else {
        // Create new tag
        const newTag = await clientQueries.createTag(tagData)
        if (!newTag) {
          throw new Error('Failed to create tag')
        }
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving tag:', error)
      // You could add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Groceries, Food, Business" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          field.value === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <Input 
                    type="color"
                    {...field}
                    className="w-full h-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag')}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface TagItemProps {
  tag: Tag
  userId: string
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

function TagItem({ tag, userId, onEdit, onDelete }: TagItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const success = await clientQueries.deleteTag(tag.id)
      if (success) {
        onDelete(tag)
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <div>
              <h3 className="font-medium text-gray-900">{tag.name}</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(tag.created_at).toLocaleDateString('en-PH')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
            >
              {tag.name}
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(tag)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [userId, setUserId] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserId(user.id)
        await loadTags(user.id)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login')
      }
    }
    loadUser()
  }, [router])

  const loadTags = async (userId: string) => {
    try {
      const tagsData = await clientQueries.getTags(userId)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagCreated = () => {
    setIsCreateDialogOpen(false)
    loadTags(userId)
  }

  const handleTagUpdated = () => {
    setEditingTag(null)
    loadTags(userId)
  }

  const handleTagDeleted = () => {
    loadTags(userId)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
            <p className="text-gray-600 mt-1">Manage your transaction categories</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading tags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">Manage your transaction categories</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Create a new tag to categorize your transactions.
              </DialogDescription>
            </DialogHeader>
            <TagForm
              userId={userId}
              onSuccess={handleTagCreated}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags List */}
      {tags.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first tag to start categorizing transactions.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Tag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              userId={userId}
              onEdit={setEditingTag}
              onDelete={handleTagDeleted}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update your tag information.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <TagForm
              tag={editingTag}
              userId={userId}
              onSuccess={handleTagUpdated}
              onCancel={() => setEditingTag(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
