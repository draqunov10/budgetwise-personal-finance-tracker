
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

console.log('✅ Supabase client configuration:');
console.log('  - URL:', supabaseUrl);
console.log('  - Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

export const createClient = () => {
  console.log('🔗 Creating Supabase browser client...');
  const client = createBrowserClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase browser client created successfully');
  return client;
};
