import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/admin-helpers'
import ToggleAdminButton from './toggle-admin-button'
import Image from 'next/image'

type AdminUser = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_admin: boolean
  display_name: string | null
  avatar_url: string | null
}

export default async function AdminUsersPage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_list_users')

  const users: AdminUser[] = (data as AdminUser[] | null) ?? []

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ユーザー管理</h1>
        <p className="text-gray-600 mt-2">登録ユーザーの一覧と管理者権限の設定</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          読み込みに失敗しました: {error.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            合計 <span className="font-bold text-gray-900">{users.length}</span> 名
          </div>
          <div className="text-sm text-gray-600">
            管理者:{' '}
            <span className="font-bold text-purple-600">
              {users.filter((u) => u.is_admin).length}
            </span>{' '}
            名
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メール
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終ログイン
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                権限
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  ユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name || user.email}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">
                            {(user.display_name || user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name || '(未設定)'}
                            {isSelf && (
                              <span className="ml-2 text-xs text-gray-500">(自分)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString('ja-JP')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          管理者
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          一般
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ToggleAdminButton
                        userId={user.id}
                        isAdmin={user.is_admin}
                        disabled={isSelf}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
