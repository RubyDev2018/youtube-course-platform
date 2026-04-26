import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layouts/header'
import Link from 'next/link'

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 講座データを取得
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      sections (
        id,
        title,
        description,
        order_index,
        videos (
          id,
          title,
          description,
          youtube_video_id,
          duration,
          order_index,
          is_free
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !course) {
    notFound()
  }

  // セクションをorder_indexでソート
  const sortedSections = course.sections
    ?.sort((a, b) => a.order_index - b.order_index)
    .map((section: any) => ({
      ...section,
      videos: section.videos?.sort((a: any, b: any) => a.order_index - b.order_index) || []
    })) || []

  // 統計情報
  const totalVideos = sortedSections.reduce((total: number, section: any) => {
    return total + (section.videos?.length || 0)
  }, 0)

  const totalDuration = sortedSections.reduce((total: number, section: any) => {
    return total + (section.videos?.reduce((sum: number, video: any) => sum + (video.duration || 0), 0) || 0)
  }, 0)

  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Course Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-gray-300 mb-6">{course.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                <span>{totalVideos}本の動画</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span>{sortedSections.length}セクション</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1340px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">コースの内容</h2>

            <div className="space-y-4">
              {sortedSections.map((section: any, sectionIndex: number) => (
                <div key={section.id} className="border border-gray-200">
                  {/* Section Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">
                        セクション {sectionIndex + 1}: {section.title}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {section.videos?.length || 0}本
                      </span>
                    </div>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>

                  {/* Videos List */}
                  <div>
                    {section.videos?.map((video: any, videoIndex: number) => (
                      <Link
                        key={video.id}
                        href={`/courses/${slug}/videos/${video.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                              <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                {videoIndex + 1}. {video.title}
                              </p>
                              {video.is_free && (
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5">
                                  無料
                                </span>
                              )}
                            </div>
                            {video.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {video.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {video.duration && (
                            <span className="text-xs text-gray-500">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">この講座を始める</h3>
                <Link
                  href={sortedSections[0]?.videos[0]?.id
                    ? `/courses/${slug}/videos/${sortedSections[0].videos[0].id}`
                    : '#'}
                  className="block w-full px-6 py-3 text-center text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors mb-4"
                >
                  最初の動画から始める
                </Link>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>完全無料で学習可能</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>自分のペースで学習</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>進捗を自動保存</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
