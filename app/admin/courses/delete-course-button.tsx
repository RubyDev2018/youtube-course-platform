'use client'

import { TrashIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteCourseButton({ courseId, courseTitle }: { courseId: string, courseTitle: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`「${courseTitle}」を削除してもよろしいですか？関連するセクションと動画も全て削除されます。`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
    >
      削除
    </button>
  )
}