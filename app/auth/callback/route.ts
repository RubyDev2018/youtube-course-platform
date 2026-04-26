import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/security/request-validation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  if (errorDescription) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', errorDescription)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(loginUrl)
  }

  // `next` is forced to a same-origin path. Anything cross-origin or malformed
  // resolves to '/' so a tampered ?next=https://attacker.example link cannot
  // turn this endpoint into an open redirect.
  const target = safeRedirectPath(next, request, '/')
  return NextResponse.redirect(new URL(target, origin))
}
