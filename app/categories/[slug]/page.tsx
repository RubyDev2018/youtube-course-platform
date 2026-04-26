import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layouts/header'
import Link from 'next/link'
import Image from 'next/image'
import { categorySlugToName, getCategoryMeta } from '@/lib/categories'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const categoryName = categorySlugToName(slug)
  if (!categoryName) notFound()

  const meta = getCategoryMeta(categoryName)

  const supabase = await createClient()
  const { data: courses } = await supabase
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
    .eq('category', categoryName)
    .order('created_at', { ascending: false })

  const list =
    courses?.map((c) => ({
      ...c,
      videoCount:
        c.sections?.reduce(
          (acc: number, s: { videos?: { id: string }[] }) => acc + (s.videos?.length || 0),
          0
        ) || 0,
      sectionCount: c.sections?.length || 0,
    })) || []

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-[1340px] mx-auto px-6 py-10">
        <div className="mb-2">
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            ← ホームへ戻る
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">{meta?.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
            <p className="text-sm text-gray-600 mt-1">{list.length} 件の講座</p>
          </div>
        </div>

        {list.length > 0 ? (
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
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
            <p className="text-gray-600">
              「{categoryName}」カテゴリーにはまだ講座がありません
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              他のカテゴリーを見る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
