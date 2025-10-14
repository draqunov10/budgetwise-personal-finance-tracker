// Export all Supabase utilities
export { createClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
export { clientQueries } from './queries'
export { serverQueries } from './server-queries'
export type { Database } from './types'

// Re-export types for convenience
export type {
  Json,
} from './types'
