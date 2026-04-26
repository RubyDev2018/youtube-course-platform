'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Section {
  id: string
  title: string
  description?: string
  order_index: number
  videos?: any[]
}

export default function SectionList({
  courseId,
  sections: initialSections
}: {
  courseId: string
  sections: Section[]
}) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (section: Section) => {
    setEditingId(section.id)
    setEditTitle(section.title)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const saveEdit = async (sectionId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sections')
        .update({ title: editTitle })
        .eq('id', sectionId)

      if (error) throw error

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, title: editTitle } : s
      ))
      setEditingId(null)
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    }
  }

  const deleteSection = async (sectionId: string, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？関連する動画も全て削除されます。`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error

      setSections(sections.filter(s => s.id !== sectionId))
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    }
  }

  return (
    <>
      {sections.map((section) => (
        <tr key={section.id} className="hover:bg-gray-50">
          <td className="py-4 text-sm text-gray-500">
            {section.order_index}
          </td>
          <td className="py-4">
            {editingId === section.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-3 py-1 border border-purple-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(section.id)
                  if (e.key === 'Escape') cancelEdit()
                }}
              />
            ) : (
              <span className="text-sm text-gray-900">
                第{section.order_index}章: {section.title}
              </span>
            )}
          </td>
          <td className="py-4 text-center text-sm text-gray-500">
            {section.videos?.length || 0}
          </td>
          <td className="py-4">
            <div className="flex justify-end gap-2">
              {editingId === section.id ? (
                <>
                  <button
                    onClick={() => saveEdit(section.id)}
                    className="px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/admin/sections/${section.id}/videos`}
                    className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    開く
                  </Link>
                  <button
                    onClick={() => startEdit(section)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    動画管理
                  </button>
                  <button
                    onClick={() => deleteSection(section.id, section.title)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}