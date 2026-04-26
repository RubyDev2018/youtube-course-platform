'use client'

import { useState } from 'react'
import CategoryPreferencesModal from './category-preferences-modal'

interface Props {
  userId: string
  initialSelected: string[]
  variant?: 'banner' | 'button'
}

export default function PreferenceLauncher({
  userId,
  initialSelected,
  variant = 'banner',
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {variant === 'banner' ? (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              あなた好みの講座だけを表示しませんか？
            </h3>
            <p className="text-sm text-gray-600">
              興味のあるカテゴリーを選ぶと、ホームの「あなたへのおすすめ」がパーソナライズされます。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 whitespace-nowrap"
          >
            カテゴリーを選ぶ
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
        >
          好みを編集
        </button>
      )}

      {open && (
        <CategoryPreferencesModal
          userId={userId}
          initialSelected={initialSelected}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
