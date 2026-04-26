import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

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
    console.error('auto-complete error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
