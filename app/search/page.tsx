import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layouts/header'
import Link from 'next/link'
import Image from 'next/image'
import { categoryNameToSlug } from '@/lib/categories'

type Section = { id: string; videos?: { id: string }[] }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()

  const supabase = await createClient()

  let courses: Array<{
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    slug: string | null
    category: string | null
    sections: Section[]
  }> = []

  if (query) {
    // title / description / category を ilike で OR 検索
    const pattern = `%${query}%`
    const { data } = await supabase
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        thumbnail_url,
        slug,
        category,
        sections (
          id,
          videos ( id )
        )
      `
      )
      .eq('is_published', true)
      .or(
        `title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`
      )
      .order('created_at', { ascending: false })

    courses = data ?? []
  }

  const list = courses.map((c) => ({
    ...c,
    videoCount:
      c.sections?.reduce((acc: number, s: Section) => acc + (s.videos?.length || 0), 0) ||
      0,
    sectionCount: c.sections?.length || 0,
  }))

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-[1340px] mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← ホームへ戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {query ? (
              <>
                「<span className="text-purple-600">{query}</span>」の検索結果
              </>
            ) : (
              '検索'
            )}
          </h1>
          {query && (
            <p className="text-sm text-gray-600 mt-1">{list.length} 件の講座が見つかりました</p>
          )}
        </div>

        {!query ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
            <p className="text-gray-600">検索キーワードを入力してください</p>
          </div>
        ) : list.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
            <p className="text-gray-600 mb-4">
              「{query}」に一致する講座はありませんでした
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              すべての講座を見る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group border border-gray-200 hover:shadow-lg transition-shadow"
              >
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
                      <svg
                        className="w-16 h-16 text-white opacity-50"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {course.category && (
                    <div className="mb-1">
                      <span className="inline-block text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span>{course.videoCount}本の動画</span>
                    <span>•</span>
                    <span>{course.sectionCount}セクション</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query && list.length > 0 && (
          <div className="mt-10 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">関連カテゴリー</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(list.map((c) => c.category).filter(Boolean))).map(
                (cat) => {
                  const slug = categoryNameToSlug(cat as string)
                  return slug ? (
                    <Link
                      key={cat as string}
                      href={`/categories/${slug}`}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 rounded-full transition"
                    >
                      {cat as string}
                    </Link>
                  ) : null
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
