-- ============================================
-- PERSONAL FINANCE APP DATABASE SCHEMA
-- ============================================

-- 1. PROFILES TABLE (1:1 with auth.users)
-- This creates one profile per authenticated user
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTS TABLE (1:N with transactions)
-- Each user can have multiple accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'cash')),
  balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TAGS TABLE
-- Reusable tags for categorizing transactions
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 4. TRANSACTIONS TABLE
-- Core financial transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSACTION_TAGS TABLE (M:N Junction Table)
-- Many-to-Many relationship between transactions and tags
CREATE TABLE transaction_tags (
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_transaction_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);

-- ============================================
-- SAMPLE DATA (Will use your actual user_id after signup)
-- ============================================

-- Note: You'll need to replace 'YOUR_USER_ID_HERE' with your actual user ID
-- after you sign up. For now, we'll create a function to help with this.

-- Function to insert sample data for a user
CREATE OR REPLACE FUNCTION create_sample_data(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_checking_id UUID;
  v_credit_id UUID;
  v_tag_groceries UUID;
  v_tag_food UUID;
  v_tag_transport UUID;
BEGIN
  -- Create profile
  INSERT INTO profiles (user_id, display_name)
  VALUES (p_user_id, 'Demo User')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create accounts separately
  INSERT INTO accounts (user_id, name, type, balance)
  VALUES (p_user_id, 'Main Checking', 'checking', 2500.00)
  RETURNING id INTO v_checking_id;

  INSERT INTO accounts (user_id, name, type, balance)
  VALUES (p_user_id, 'Credit Card', 'credit_card', -450.00)
  RETURNING id INTO v_credit_id;

  -- Create tags
  INSERT INTO tags (user_id, name, color)
  VALUES 
    (p_user_id, 'Groceries', '#10b981'),
    (p_user_id, 'Food & Dining', '#f59e0b'),
    (p_user_id, 'Transportation', '#3b82f6')
  ON CONFLICT (user_id, name) DO NOTHING;

  SELECT id INTO v_tag_groceries FROM tags WHERE user_id = p_user_id AND name = 'Groceries';
  SELECT id INTO v_tag_food FROM tags WHERE user_id = p_user_id AND name = 'Food & Dining';
  SELECT id INTO v_tag_transport FROM tags WHERE user_id = p_user_id AND name = 'Transportation';

  -- Create transactions
  INSERT INTO transactions (user_id, account_id, amount, description, transaction_date)
  VALUES 
    (p_user_id, v_checking_id, -85.50, 'Weekly groceries at Supermarket', CURRENT_DATE - 2),
    (p_user_id, v_checking_id, -45.00, 'Gas station fill-up', CURRENT_DATE - 1),
    (p_user_id, v_credit_id, -32.75, 'Lunch at restaurant', CURRENT_DATE),
    (p_user_id, v_checking_id, 2500.00, 'Monthly salary deposit', CURRENT_DATE - 5),
    (p_user_id, v_credit_id, -120.00, 'Online shopping', CURRENT_DATE - 3);

  -- Add tags to transactions
  INSERT INTO transaction_tags (transaction_id, tag_id)
  SELECT t.id, v_tag_groceries
  FROM transactions t
  WHERE t.user_id = p_user_id AND t.description LIKE '%groceries%';

  INSERT INTO transaction_tags (transaction_id, tag_id)
  SELECT t.id, v_tag_transport
  FROM transactions t
  WHERE t.user_id = p_user_id AND t.description LIKE '%Gas station%';

  INSERT INTO transaction_tags (transaction_id, tag_id)
  SELECT t.id, v_tag_food
  FROM transactions t
  WHERE t.user_id = p_user_id AND t.description LIKE '%restaurant%';

  INSERT INTO transaction_tags (transaction_id, tag_id)
  SELECT t.id, v_tag_food
  FROM transactions t
  WHERE t.user_id = p_user_id AND t.description LIKE '%Online shopping%';
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Optionally create sample data for new users
  -- PERFORM public.create_sample_data(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
