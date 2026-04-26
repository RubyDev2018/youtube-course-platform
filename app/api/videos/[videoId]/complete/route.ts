import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'
import {
  isSameOriginRequest,
  isValidUuid,
  safeRedirectPath,
} from '@/lib/security/request-validation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { videoId } = await params
    if (!isValidUuid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id, completed')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    if (existingProgress) {
      const { error } = await supabase
        .from('user_progress')
        .update({
          completed: !existingProgress.completed,
          completed_at: !existingProgress.completed
            ? new Date().toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('user_progress').insert({
        user_id: user.id,
        video_id: videoId,
        completed: true,
        completed_at: new Date().toISOString(),
      })

      if (error) throw error
    }

    const redirectTo = safeRedirectPath(request.headers.get('referer'), request)
    return NextResponse.redirect(new URL(redirectTo, request.url))
  } catch (error) {
    // Log a stable error code, not the raw Postgres message — avoids leaking
    // schema details to the platform log.
    console.error('progress_complete_failed', {
      code: (error as { code?: string } | null)?.code,
    })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
