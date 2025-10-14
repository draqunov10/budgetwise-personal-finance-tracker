# BudgetWise - Personal Finance Tracker

A modern, full-stack personal finance management application built with Next.js and Supabase. Track your accounts, transactions, and spending habits with an intuitive interface and robust data relationships.

## Project Overview

BudgetWise is a comprehensive personal finance tracker that helps users manage their financial life through organized account management, transaction tracking, and customizable tagging system. The application features a clean, modern interface built with shadcn/ui components and provides real-time data synchronization through Supabase.

![Landing Page](/public/landing-page.png)
![Dashboard Overview](/public/dashboard-page.png)

## Features

-  **Authentication** (Supabase Auth)
-  **Accounts Management** (1:N with transactions) - Multiple account types (checking, savings, credit card, cash)
-  **Transactions CRUD** - Full create, read, update, delete operations for financial transactions
-  **Tags with Many-to-Many Relationships** - Flexible categorization system for transactions
-  **User Profiles** (1:1 with auth)

## Data Model: Entity relationship diagram
![Database Schema](/public/supabase-schema.png)

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: shadcn/ui
- **Deployment**: Vercel
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Local Setup Guide

### Prerequisites

- Node.js 18+ 
- npm, or pnpm
- Supabase account

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup/Migration Steps

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key to the environment variables

2. **Run Database Schema**:
   - Navigate to your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `/database/schema.sql`
   - Execute the SQL to create all tables, indexes, and functions

3. **Optional: Add Sample Data**:
   - After creating your user account, you can run the `create_sample_data()` function
   - In the SQL Editor, run: `SELECT create_sample_data('your-user-id-here');`

### How to Run the Development Server

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Open Application**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account or log in
   - Start managing your finances!

## Database Schema

The application uses a well-structured PostgreSQL database with the following key relationships:

- **profiles** (1:1 with auth.users) - User profile information
- **accounts** (1:N with transactions) - Financial accounts (checking, savings, credit card, cash)
- **transactions** - Individual financial transactions linked to accounts
- **tags** - Categorization system for transactions
- **transaction_tags** (M:N junction table) - Many-to-many relationship between transactions and tags

See `/database/schema.sql` for the complete database schema with indexes, triggers, and sample data functions.

## AI Tools Used

- **Claude Sonnet** - Code generation, debugging, and architectural decisions
- **Cursor** - AI-powered code editor for enhanced development experience

## Getting Started (Quick)

```bash
# Clone the repository
git clone <repository-url>
cd budgetwise-personal-finance-tracker

# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Copy /database/schema.sql to your Supabase SQL editor and execute

# Start development server
pnpm run dev
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - understand Supabase features
- [shadcn/ui Documentation](https://ui.shadcn.com/) - explore UI components
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - styling framework