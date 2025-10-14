import { createClient } from './client'
import { Database } from './types'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Account = Tables['accounts']['Row']
type Tag = Tables['tags']['Row']
type Transaction = Tables['transactions']['Row']
type TransactionTag = Tables['transaction_tags']['Row']

// Client-side queries
export const clientQueries = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    return data
  },

  // Account operations
  async getAccounts(userId: string): Promise<Account[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching accounts:', error)
      return []
    }
    return data || []
  },

  async createAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<Account | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating account:', error)
      return null
    }
    return data
  },

  async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating account:', error)
      return null
    }
    return data
  },

  async deleteAccount(accountId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
    
    if (error) {
      console.error('Error deleting account:', error)
      return false
    }
    return true
  },

  // Tag operations
  async getTags(userId: string): Promise<Tag[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    
    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }
    return data || []
  },

  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating tag:', error)
      return null
    }
    return data
  },

  async updateTag(tagId: string, updates: Partial<Tag>): Promise<Tag | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating tag:', error)
      return null
    }
    return data
  },

  async deleteTag(tagId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
    
    if (error) {
      console.error('Error deleting tag:', error)
      return false
    }
    return true
  },

  // Transaction operations
  async getTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
    const supabase = createClient()
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
    
    if (accountId) {
      query = query.eq('account_id', accountId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
    return data || []
  },

  async getTransactionsWithTags(userId: string, accountId?: string) {
    const supabase = createClient()
    let query = supabase
      .from('transactions')
      .select(`
        *,
        transaction_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
    
    if (accountId) {
      query = query.eq('account_id', accountId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching transactions with tags:', error)
      return []
    }
    return data || []
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating transaction:', error)
      return null
    }
    return data
  },

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating transaction:', error)
      return null
    }
    return data
  },

  async deleteTransaction(transactionId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
    
    if (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
    return true
  },

  // Transaction tag operations
  async addTagToTransaction(transactionId: string, tagId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('transaction_tags')
      .insert({ transaction_id: transactionId, tag_id: tagId })
    
    if (error) {
      console.error('Error adding tag to transaction:', error)
      return false
    }
    return true
  },

  async removeTagFromTransaction(transactionId: string, tagId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('transaction_tags')
      .delete()
      .eq('transaction_id', transactionId)
      .eq('tag_id', tagId)
    
    if (error) {
      console.error('Error removing tag from transaction:', error)
      return false
    }
    return true
  },

  // Sample data creation
  async createSampleData(userId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase.rpc('create_sample_data', {
      p_user_id: userId
    })
    
    if (error) {
      console.error('Error creating sample data:', error)
      return false
    }
    return true
  }
}
