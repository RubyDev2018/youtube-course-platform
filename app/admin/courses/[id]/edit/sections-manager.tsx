'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

export default function SectionsManager({
  courseId,
  sections: initialSections
}: {
  courseId: string
  sections: any[]
}) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [newSection, setNewSection] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleAddSection = async () => {
    if (!newSection.title.trim()) return

    setLoading(true)
    try {
      const supabase = createClient()

      const maxOrder = Math.max(...sections.map(s => s.order_index), 0)

      const { data, error } = await supabase
        .from('sections')
        .insert([{
          course_id: courseId,
          title: newSection.title,
          description: newSection.description || null,
          order_index: maxOrder + 1
        }])
        .select()
        .single()

      if (error) throw error

      setSections([...sections, { ...data, videos: [] }])
      setNewSection({ title: '', description: '' })
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('このセクションを削除してもよろしいですか？関連する動画も全て削除されます。')) {
      return
    }

    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">セクション管理</h2>

      {/* セクション一覧 */}
      <div className="space-y-4 mb-6">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    第{section.order_index}章: {section.title}
                  </div>
                  {section.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {section.description}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    動画数: {section.videos?.length || 0}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/sections/${section.id}/videos`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 動画リスト（展開時） */}
            {expandedSections.has(section.id) && (
              <div className="border-t px-4 py-3 bg-gray-50">
                {section.videos && section.videos.length > 0 ? (
                  <div className="space-y-2">
                    {section.videos.map((video: any, index: number) => (
                      <div key={video.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="flex-1 text-gray-700">{video.title}</span>
                        {video.is_free && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            無料
                          </span>
                        )}
                        <span className="text-gray-500">
                          {video.duration ? `${Math.floor(video.duration / 60)}分` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">動画がまだ追加されていません</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 新規セクション追加フォーム */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-3">新規セクション追加</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="セクションタイトル"
            value={newSection.title}
            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="説明（任意）"
            value={newSection.description}
            onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddSection}
            disabled={loading || !newSection.title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            セクションを追加
          </button>
        </div>
      </div>
    </div>
  )
}