import { createClient } from '@/lib/supabase/server'

// Note: there is intentionally no server-side getSession() helper here.
// supabase.auth.getSession() trusts the cookie without verifying the JWT
// against the auth server, so it must not be used for authorization on the
// server. Always go through getUser() below.

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }

  return data
}
