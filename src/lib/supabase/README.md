# Supabase Database Setup

This directory contains all the necessary code to connect to and interact with your Supabase database for the BudgetWise personal finance tracker.

## Files Overview

- **`client.ts`** - Browser/client-side Supabase client
- **`server.ts`** - Server-side Supabase client for API routes and server components
- **`middleware.ts`** - Middleware for handling authentication sessions
- **`types.ts`** - TypeScript types for your database schema
- **`queries.ts`** - Pre-built query functions for common database operations
- **`index.ts`** - Main export file for easy imports

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Database Schema

Your database includes the following tables:

- **`profiles`** - User profile information (1:1 with auth.users)
- **`accounts`** - Financial accounts (checking, savings, credit cards, cash)
- **`tags`** - Categorization tags for transactions
- **`transactions`** - Financial transactions
- **`transaction_tags`** - Many-to-many relationship between transactions and tags

## Usage Examples

### Client-side (React components)

```typescript
import { clientQueries } from '@/lib/supabase'

// Get user's accounts
const accounts = await clientQueries.getAccounts(userId)

// Create a new transaction
const transaction = await clientQueries.createTransaction({
  user_id: userId,
  account_id: accountId,
  amount: -50.00,
  description: 'Grocery shopping',
  transaction_date: '2024-01-15'
})

// Get transactions with tags
const transactionsWithTags = await clientQueries.getTransactionsWithTags(userId)
```

### Server-side (API routes, server components)

```typescript
import { serverQueries } from '@/lib/supabase'

// In an API route or server component
const accounts = await serverQueries.getAccounts(userId)
```

### Direct Supabase client usage

```typescript
import { createClient } from '@/lib/supabase'

// Client-side
const supabase = createClient()
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
```

## Available Query Functions

### Client Queries (`clientQueries`)

**Profile Operations:**
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, updates)` - Update user profile

**Account Operations:**
- `getAccounts(userId)` - Get all user accounts
- `createAccount(account)` - Create new account
- `updateAccount(accountId, updates)` - Update account
- `deleteAccount(accountId)` - Delete account

**Tag Operations:**
- `getTags(userId)` - Get all user tags
- `createTag(tag)` - Create new tag
- `updateTag(tagId, updates)` - Update tag
- `deleteTag(tagId)` - Delete tag

**Transaction Operations:**
- `getTransactions(userId, accountId?)` - Get transactions (optionally filtered by account)
- `getTransactionsWithTags(userId, accountId?)` - Get transactions with their tags
- `createTransaction(transaction)` - Create new transaction
- `updateTransaction(transactionId, updates)` - Update transaction
- `deleteTransaction(transactionId)` - Delete transaction

**Transaction Tag Operations:**
- `addTagToTransaction(transactionId, tagId)` - Add tag to transaction
- `removeTagFromTransaction(transactionId, tagId)` - Remove tag from transaction

**Utility:**
- `createSampleData(userId)` - Create sample data for new users

### Server Queries (`serverQueries`)

Same functions as client queries but optimized for server-side usage.

## Authentication

The middleware automatically handles session management. Make sure to set up your middleware in `middleware.ts` at the root of your project:

```typescript
import { updateSession } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Sample Data

The database includes a function to create sample data for new users. You can call it after user registration:

```typescript
import { clientQueries } from '@/lib/supabase'

// After user signs up
await clientQueries.createSampleData(userId)
```

This will create:
- A demo profile
- Sample accounts (checking and credit card)
- Sample tags (Groceries, Food & Dining, Transportation)
- Sample transactions with appropriate tags
