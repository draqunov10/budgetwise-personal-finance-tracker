"use server"

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

type SignInParams = {
  email: string
  password: string
  redirectPath?: string
}

type SignUpParams = {
  email: string
  password: string
  emailRedirectTo?: string
  redirectPath?: string
}

export async function getSession() {
  console.log('🔍 Getting user session...');
  const supabase = await createServerClient(cookies())
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('❌ Error getting session:', error.message);
    return { session: null, error }
  }
  console.log('✅ Session retrieved:', data.session ? 'User authenticated' : 'No session');
  return { session: data.session, error: null }
}

export async function getUser() {
  console.log('👤 Getting user data...');
  const supabase = await createServerClient(cookies())
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('❌ Error getting user:', error.message);
    return { user: null, error }
  }
  console.log('✅ User data retrieved:', data.user ? `User: ${data.user.email}` : 'No user');
  return { user: data.user, error: null }
}

export async function requireAuth(redirectTo: string = '/login') {
  const { session } = await getSession()
  if (!session) {
    redirect(redirectTo)
  }
  return session
}

export async function signInWithPassword({ email, password, redirectPath = '/' }: SignInParams) {
  console.log('🔐 Attempting to sign in user:', email);
  const supabase = await createServerClient(cookies())
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('❌ Sign in failed:', error.message);
    return { ok: false, error }
  }
  console.log('✅ Sign in successful for:', email);
  revalidatePath(redirectPath)
  redirect(redirectPath)
}

export async function signUp({ email, password, emailRedirectTo, redirectPath = '/login' }: SignUpParams) {
  console.log('📝 Attempting to sign up user:', email);
  const supabase = await createServerClient(cookies())
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: emailRedirectTo,
    },
  })

  if (error) {
    console.error('❌ Sign up failed:', error.message);
    return { ok: false, error }
  }

  console.log('✅ Sign up successful for:', email);
  console.log('📧 Confirmation email sent:', data.user?.email_confirmed_at ? 'Already confirmed' : 'Pending confirmation');
  
  // Most projects send users to login after email confirmation
  revalidatePath(redirectPath)
  redirect(redirectPath)
}

export async function signOut(redirectPath: string = '/login') {
  console.log('🚪 Attempting to sign out user...');
  const supabase = await createServerClient(cookies())
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Sign out failed:', error.message);
    return { ok: false, error }
  }
  console.log('✅ Sign out successful');
  revalidatePath('/')
  redirect(redirectPath)
}

// Form-action helpers (optional): enable usage as Next.js Server Actions bound to forms
export async function signInAction(_: unknown, formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  if (!email || !password) return { ok: false, error: new Error('Missing credentials') }
  return signInWithPassword({ email, password })
}

export async function signUpAction(_: unknown, formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  if (!email || !password) return { ok: false, error: new Error('Missing credentials') }
  return signUp({ email, password })
}


