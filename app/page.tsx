import Header from '@/components/layouts/header'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { CATEGORIES, categoryNameToSlug } from '@/lib/categories'
import { getUser } from '@/lib/auth/session'
import PreferenceLauncher from '@/components/features/preference-launcher'

export default async function Home() {
  const supabase = await createClient()

  // ユーザー取得と講座一覧取得を並列化
  const [user, coursesRes] = await Promise.all([
    getUser(),
    supabase
      .from('courses_with_stats')
      .select('id, title, description, thumbnail_url, slug, category, section_count, video_count')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  const courses = coursesRes.data
  const error = coursesRes.error

  if (error) {
    console.error('Error fetching courses:', error)
  }

  // ログインユーザーの嗜好カテゴリーを取得
  let preferredCategories: string[] = []
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_categories')
      .eq('id', user.id)
      .single()
    preferredCategories = (profile?.preferred_categories as string[] | null) ?? []
  }

  // カテゴリー別の講座数をカウント（公開中のみ）
  const categoryCounts = new Map<string, number>()
  courses?.forEach((c) => {
    if (c.category) {
      categoryCounts.set(c.category, (categoryCounts.get(c.category) || 0) + 1)
    }
  })

  // 講座が1件以上あるカテゴリーを優先して表示。全体で最大12件
  const populated = CATEGORIES.filter((c) => (categoryCounts.get(c.name) || 0) > 0)
  const empty = CATEGORIES.filter((c) => (categoryCounts.get(c.name) || 0) === 0)
  const visibleCategories = [...populated, ...empty].slice(0, 12)

  const coursesList = courses ?? []

  // ホーム下部の統計セクション用：全体集計（公開中の講座ベース）
  const totalVideos = coursesList.reduce((acc, c) => acc + (c.video_count ?? 0), 0)
  const totalCourses = coursesList.length
  const totalSections = coursesList.reduce((acc, c) => acc + (c.section_count ?? 0), 0)

  // パーソナライズされたおすすめを作成
  const hasPreferences = preferredCategories.length > 0
  const personalized = hasPreferences
    ? coursesList.filter((c) => c.category && preferredCategories.includes(c.category))
    : coursesList
  const showingPersonalized = !!user && hasPreferences && personalized.length > 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Udemy style */}
      <section className="relative bg-gray-900 py-16">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="max-w-[480px]">
            <h1 className="text-4xl font-bold text-white mb-4">
              AIとプログラミングで
              <br />
              未来を創る
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {totalCourses}講座・{totalVideos}本の厳選動画で、プログラミング・健康・自己啓発・音楽などを実践的に学べます。
              初心者からエンジニアまで、誰でも学べるコンテンツをご用意しています。
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[1340px] mx-auto px-6 py-12">
        {/* Preference banner (logged-in & no preferences set) */}
        {user && !hasPreferences && (
          <PreferenceLauncher userId={user.id} initialSelected={[]} />
        )}

        {/* Featured Section */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {showingPersonalized ? 'あなたへのおすすめ' : 'おすすめの講座'}
              </h2>
              <p className="text-gray-600">
                {showingPersonalized
                  ? `${preferredCategories.join(' / ')} から厳選`
                  : '今すぐ学習を始めましょう'}
              </p>
            </div>
            {user && hasPreferences && (
              <PreferenceLauncher
                userId={user.id}
                initialSelected={preferredCategories}
                variant="button"
              />
            )}
          </div>

          {(showingPersonalized ? personalized : coursesList).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(showingPersonalized ? personalized : coursesList).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-3">
                      <span>{course.video_count}本の動画</span>
                      <span>•</span>
                      <span>{course.section_count}セクション</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  講座の準備中です
                </h3>
                <p className="text-gray-600 mb-6">
                  現在、講座データを準備しています。
                  <br />
                  まもなく公開予定ですので、しばらくお待ちください。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-block px-6 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    無料で始める
                  </Link>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-3 text-sm font-bold text-gray-900 border-2 border-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            学べるカテゴリー
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleCategories.map((category) => {
              const count = categoryCounts.get(category.name) || 0
              const slug = categoryNameToSlug(category.name)
              const inner = (
                <>
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {count > 0 ? `${count} 件の講座` : '準備中'}
                  </p>
                </>
              )
              return count > 0 && slug ? (
                <Link
                  key={category.name}
                  href={`/categories/${slug}`}
                  className="group p-6 border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={category.name}
                  className="group p-6 border border-gray-200 opacity-60"
                >
                  {inner}
                </div>
              )
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 py-12 -mx-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{totalCourses}</div>
              <div className="text-gray-600">公開中の講座</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{totalSections}</div>
              <div className="text-gray-600">学習セクション</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{totalVideos}</div>
              <div className="text-gray-600">学習動画</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">shincode</h3>
              <p className="text-sm text-gray-400">
                プログラミング学習を
                <br />
                もっと身近に
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">プラットフォーム</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">講座</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">マイ学習</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://www.youtube.com/@programming_tutorial_youtube" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">アカウント</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">ログイン</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">新規登録</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2025 shincode Course Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
