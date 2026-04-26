'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type SiteSettings = {
  id: number
  site_title: string
  hero_title: string
  hero_description: string
  footer_text: string
  allow_signups: boolean
  updated_at: string | null
}

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )
  const [form, setForm] = useState({
    site_title: settings.site_title,
    hero_title: settings.hero_title,
    hero_description: settings.hero_description,
    footer_text: settings.footer_text,
    allow_signups: settings.allow_signups,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      setMessage(null)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('site_settings')
        .update({
          ...form,
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        })
        .eq('id', 1)

      if (error) {
        setMessage({ type: 'error', text: `保存失敗: ${error.message}` })
        return
      }

      setMessage({ type: 'success', text: '保存しました' })
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          サイトタイトル
        </label>
        <input
          type="text"
          value={form.site_title}
          onChange={(e) => setForm({ ...form, site_title: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ヒーロータイトル（ホーム上部の大見出し）
        </label>
        <input
          type="text"
          value={form.hero_title}
          onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ヒーロー説明文
        </label>
        <textarea
          value={form.hero_description}
          onChange={(e) => setForm({ ...form, hero_description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          フッターテキスト
        </label>
        <input
          type="text"
          value={form.footer_text}
          onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allow_signups"
          checked={form.allow_signups}
          onChange={(e) => setForm({ ...form, allow_signups: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <label htmlFor="allow_signups" className="text-sm text-gray-700">
          新規ユーザー登録を許可する
        </label>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
