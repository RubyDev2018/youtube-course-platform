import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin || false
}

/**
 * Require admin access or throw error
 */
export async function requireAdmin(): Promise<void> {
  const isUserAdmin = await isAdmin()

  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Get admin user data
 */
export async function getAdminUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .eq('is_admin', true)
    .single()

  if (!profile) return null

  return {
    ...user,
    profile
  }
}