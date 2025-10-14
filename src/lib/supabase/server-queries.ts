import { createClient as createServerClient } from './server'
import { Database } from './types'
import { cookies } from 'next/headers'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Account = Tables['accounts']['Row']
type Tag = Tables['tags']['Row']
type Transaction = Tables['transactions']['Row']

// Server-side queries (same functions but using server client)
export const serverQueries = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createServerClient(cookies())
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

  // Account operations
  async getAccounts(userId: string): Promise<Account[]> {
    const supabase = await createServerClient(cookies())
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

  // Tag operations
  async getTags(userId: string): Promise<Tag[]> {
    const supabase = await createServerClient(cookies())
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

  // Transaction operations
  async getTransactions(userId: string, accountId?: string): Promise<Transaction[]> {
    const supabase = await createServerClient(cookies())
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
    const supabase = await createServerClient(cookies())
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
  }
}
