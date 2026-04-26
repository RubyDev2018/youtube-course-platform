import { getUser, getUserProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layouts/header'
import Image from 'next/image'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)
  const supabase = await createClient()

  // ユーザーの進捗データを取得
  const { data: progressData, error } = await supabase
    .from('user_progress')
    .select(`
      id,
      completed,
      completed_at,
      videos (
        id,
        title,
        sections (
          id,
          title,
          courses (
            id,
            title
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching progress:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[1340px] mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            マイ学習
          </h1>
          <p className="text-gray-600">
            学習の進捗を確認して、次のステップに進みましょう
          </p>
        </div>

        {/* Learning Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            学習中の講座
          </h2>

          {progressData && progressData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.map((progress: any) => (
                <div
                  key={progress.id}
                  className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-video bg-gray-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    {progress.completed && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-bold">
                        完了
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 hover:text-purple-600 transition-colors">
                      {progress.videos?.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {progress.videos?.sections?.courses?.title}
                    </p>
                    {progress.completed_at && (
                      <p className="text-xs text-gray-500">
                        完了日: {new Date(progress.completed_at).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 border border-gray-200">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  学習を開始しましょう
                </h3>
                <p className="text-gray-600 mb-8">
                  興味のある講座を見つけて、学習を始めましょう
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  講座を探す
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
