import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/admin-helpers'
import Link from 'next/link'
import Image from 'next/image'

type Summary = {
  total_users: number
  total_admins: number
  total_courses: number
  published_courses: number
  total_sections: number
  total_videos: number
  free_videos: number
  total_progress: number
  completed_progress: number
  new_users_7d: number
  new_users_30d: number
  active_users_7d: number
}

type CourseStat = {
  course_id: string
  course_title: string
  course_slug: string | null
  is_published: boolean
  section_count: number
  video_count: number
  learner_count: number
  completion_count: number
}

type RecentSignup = {
  id: string
  email: string
  created_at: string
  avatar_url: string | null
  display_name: string | null
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  const supabase = await createClient()

  const [summaryRes, coursesRes, signupsRes] = await Promise.all([
    supabase.rpc('admin_get_analytics_summary'),
    supabase.rpc('admin_get_course_analytics'),
    supabase.rpc('admin_get_recent_signups', { limit_count: 10 }),
  ])

  const summary: Summary | null = Array.isArray(summaryRes.data)
    ? (summaryRes.data[0] as Summary)
    : null
  const courses: CourseStat[] = (coursesRes.data as CourseStat[] | null) ?? []
  const signups: RecentSignup[] = (signupsRes.data as RecentSignup[] | null) ?? []

  const completionRate =
    summary && summary.total_progress > 0
      ? Math.round((summary.completed_progress / summary.total_progress) * 100)
      : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">統計・分析</h1>
        <p className="text-gray-600 mt-2">プラットフォーム全体の数値とトレンドを確認できます</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="総ユーザー"
          value={summary?.total_users ?? 0}
          sub={`管理者 ${summary?.total_admins ?? 0} 名`}
          accent="purple"
        />
        <StatCard
          label="新規ユーザー（7日間）"
          value={summary?.new_users_7d ?? 0}
          sub={`30日間では ${summary?.new_users_30d ?? 0} 名`}
          accent="blue"
        />
        <StatCard
          label="アクティブユーザー（7日間）"
          value={summary?.active_users_7d ?? 0}
          sub="直近ログイン基準"
          accent="green"
        />
        <StatCard
          label="公開中の講座"
          value={summary?.published_courses ?? 0}
          sub={`全 ${summary?.total_courses ?? 0} 講座中`}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="総セクション数"
          value={summary?.total_sections ?? 0}
          accent="gray"
        />
        <StatCard
          label="総動画数"
          value={summary?.total_videos ?? 0}
          sub={`うち無料 ${summary?.free_videos ?? 0} 本`}
          accent="gray"
        />
        <StatCard
          label="視聴ログ"
          value={summary?.total_progress ?? 0}
          sub={`完了 ${summary?.completed_progress ?? 0} 件`}
          accent="gray"
        />
        <StatCard
          label="完了率"
          value={`${completionRate}%`}
          sub="全視聴ログ中の完了割合"
          accent="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Ranking */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">講座別の視聴状況</h2>
            <p className="text-xs text-gray-500 mt-1">学習者数が多い順</p>
          </div>
          {courses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">講座がまだありません</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    講座
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    学習者
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    完了
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    動画
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((c) => (
                  <tr key={c.course_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/courses/${c.course_id}/edit`}
                          className="text-sm font-medium text-gray-900 hover:text-purple-600"
                        >
                          {c.course_title}
                        </Link>
                        {!c.is_published && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            非公開
                          </span>
                        )}
                      </div>
                      {c.course_slug && (
                        <div className="text-xs text-gray-500 mt-0.5">/{c.course_slug}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {c.learner_count}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {c.completion_count}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {c.video_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">最近の新規ユーザー</h2>
            <p className="text-xs text-gray-500 mt-1">直近10名</p>
          </div>
          {signups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">ユーザーがいません</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {signups.map((u) => (
                <li key={u.id} className="px-6 py-3 flex items-center gap-3">
                  {u.avatar_url ? (
                    <Image
                      src={u.avatar_url}
                      alt={u.display_name || u.email}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">
                      {(u.display_name || u.email)[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {u.display_name || u.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: number | string
  sub?: string
  accent: 'purple' | 'blue' | 'green' | 'orange' | 'gray'
}) {
  const accentClass = {
    purple: 'text-purple-600 bg-purple-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    gray: 'text-gray-700 bg-gray-50',
  }[accent]
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className={`inline-block text-xs font-medium px-2 py-1 rounded ${accentClass}`}>
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  )
}
