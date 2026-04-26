import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // 既存の進捗を確認
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id, completed')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    if (existingProgress) {
      // 既存の進捗がある場合は、完了状態をトグル
      const { error } = await supabase
        .from('user_progress')
        .update({
          completed: !existingProgress.completed,
          completed_at: !existingProgress.completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)

      if (error) throw error
    } else {
      // 新規の場合は作成
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          video_id: videoId,
          completed: true,
          completed_at: new Date().toISOString()
        })

      if (error) throw error
    }

    // リダイレクト先のURLを取得
    const referer = request.headers.get('referer') || '/'
    return NextResponse.redirect(referer)

  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
