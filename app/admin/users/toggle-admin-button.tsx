'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
  isAdmin: boolean
  disabled?: boolean
}

export default function ToggleAdminButton({ userId, isAdmin, disabled }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    const confirmMsg = isAdmin
      ? 'このユーザーから管理者権限を剥奪しますか？'
      : 'このユーザーに管理者権限を付与しますか？'
    if (!window.confirm(confirmMsg)) return

    startTransition(async () => {
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.rpc('admin_toggle_admin', {
        target_user_id: userId,
      })
      if (error) {
        setError(error.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isAdmin
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        } disabled:opacity-50`}
      >
        {isPending ? '処理中...' : isAdmin ? '管理者を解除' : '管理者にする'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
