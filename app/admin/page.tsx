import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 統計データの取得
  const [
    { count: coursesCount },
    { count: usersCount },
    { count: videosCount },
    { count: progressCount }
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
  ])

  // 最近の登録ユーザー
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">管理者ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">講座数</div>
          <div className="text-3xl font-bold text-gray-800">{coursesCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">ユーザー数</div>
          <div className="text-3xl font-bold text-gray-800">{usersCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">動画数</div>
          <div className="text-3xl font-bold text-gray-800">{videosCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">完了した動画</div>
          <div className="text-3xl font-bold text-gray-800">{progressCount || 0}</div>
        </div>
      </div>

      {/* 最近のユーザー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">最近登録したユーザー</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">名前</th>
                <th className="text-left py-2 px-4">登録日</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4">
                    {user.display_name || 'Unknown'}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}