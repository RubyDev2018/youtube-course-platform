import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'
import {
  isSameOriginRequest,
  isValidUuid,
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

    const { data: video } = await supabase
      .from('videos')
      .select('id')
      .eq('id', videoId)
      .single()

    if (!video) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const { data: existing } = await supabase
      .from('user_progress')
      .select('id, completed')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    if (existing) {
      if (!existing.completed) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
        if (error) throw error
      }
    } else {
      const { error } = await supabase.from('user_progress').insert({
        user_id: user.id,
        video_id: videoId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('auto_complete_failed', {
      code: (error as { code?: string } | null)?.code,
    })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
