import { createClient } from './client'
import type { AuthError } from '@supabase/supabase-js'

interface AuthResponse<T = any> {
  data?: T
  error?: AuthError | null
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { display_name?: string }
): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  return { error }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  return { user, error }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

/**
 * Refresh the session
 */
export async function refreshSession(): Promise<AuthResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.refreshSession()

  return { data, error }
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  return { session, error }
}