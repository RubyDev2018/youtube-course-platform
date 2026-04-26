import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/admin-helpers'
import SettingsForm from './settings-form'

type SiteSettings = {
  id: number
  site_title: string
  hero_title: string
  hero_description: string
  footer_text: string
  allow_signups: boolean
  updated_at: string | null
}

export default async function AdminSettingsPage() {
  await requireAdmin()

  const supabase = await createClient()

  const [settingsRes, usersCountRes, coursesCountRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).single(),
    supabase.rpc('admin_get_analytics_summary'),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
  ])

  const settings = settingsRes.data as SiteSettings | null
  const summary = Array.isArray(usersCountRes.data) ? usersCountRes.data[0] : null
  const totalCourses = coursesCountRes.count ?? 0

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '(未設定)'
  const supabaseProjectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || '不明'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">設定</h1>
        <p className="text-gray-600 mt-2">サイト全体の表示設定とシステム情報</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Site Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">サイト設定</h2>
              <p className="text-xs text-gray-500 mt-1">ホームページに表示される文言を変更できます</p>
            </div>
            <div className="p-6">
              {settings ? (
                <SettingsForm settings={settings} />
              ) : (
                <div className="text-sm text-red-600">設定の読み込みに失敗しました</div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">システム情報</h2>
            </div>
            <dl className="divide-y divide-gray-200">
              <InfoRow label="Supabase Project Ref" value={supabaseProjectRef} mono />
              <InfoRow label="Supabase URL" value={supabaseUrl} mono small />
              <InfoRow label="総ユーザー数" value={String(summary?.total_users ?? 0)} />
              <InfoRow label="管理者数" value={String(summary?.total_admins ?? 0)} />
              <InfoRow label="総講座数" value={String(totalCourses)} />
              <InfoRow label="総動画数" value={String(summary?.total_videos ?? 0)} />
              <InfoRow
                label="最終更新"
                value={
                  settings?.updated_at
                    ? new Date(settings.updated_at).toLocaleString('ja-JP')
                    : '—'
                }
                small
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
  small,
}: {
  label: string
  value: string
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="px-6 py-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd
        className={`mt-1 text-gray-900 break-all ${mono ? 'font-mono' : ''} ${
          small ? 'text-xs' : 'text-sm'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
