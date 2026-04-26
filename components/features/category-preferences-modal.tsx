'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/categories'

interface Props {
  userId: string
  initialSelected: string[]
  onClose: () => void
}

export default function CategoryPreferencesModal({
  userId,
  initialSelected,
  onClose,
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      setError(null)
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_categories: Array.from(selected),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        setError(error.message)
        return
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">興味のあるカテゴリー</h2>
          <p className="text-sm text-gray-600 mt-1">
            選んだカテゴリーに基づいて、ホームで「あなたへのおすすめ」を表示します。複数選択・後から変更可能。
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selected.has(cat.name)
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => toggle(cat.name)}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div
                    className={`text-sm font-medium ${
                      isSelected ? 'text-purple-700' : 'text-gray-800'
                    }`}
                  >
                    {cat.name}
                  </div>
                  {isSelected && (
                    <div className="mt-1 text-xs text-purple-600">✓ 選択中</div>
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selected.size} 件選択中
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              あとで
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded"
            >
              {isPending ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
