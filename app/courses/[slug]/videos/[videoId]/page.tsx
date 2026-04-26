import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/session'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/layouts/header'
import Link from 'next/link'
import YouTubePlayer from '@/components/features/youtube-player'

interface VideoPageProps {
  params: Promise<{
    slug: string
    videoId: string
  }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug, videoId } = await params
  const supabase = await createClient()
  const user = await getUser()

  // 動画データを取得
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      description,
      youtube_video_id,
      duration,
      is_free,
      order_index,
      sections (
        id,
        title,
        order_index,
        courses (
          id,
          title,
          slug
        )
      )
    `)
    .eq('id', videoId)
    .single()

  if (videoError || !video) {
    notFound()
  }

  const section = Array.isArray(video.sections) ? video.sections[0] : video.sections
  const course = section && (Array.isArray(section.courses) ? section.courses[0] : section.courses)

  // 認証チェック: 無料動画でない場合はログインが必要
  if (!video.is_free && !user) {
    redirect(`/login?redirect=/courses/${slug}/videos/${videoId}`)
  }

  // 同じコースの全動画とユーザー進捗を並列取得
  const [sectionsRes, progressRes] = await Promise.all([
    supabase
      .from('sections')
      .select(`
        id,
        title,
        order_index,
        videos (
          id,
          title,
          order_index,
          is_free
        )
      `)
      .eq('course_id', course?.id)
      .order('order_index', { ascending: true }),
    user
      ? supabase
          .from('user_progress')
          .select('video_id, completed, completed_at')
          .eq('user_id', user.id)
      : Promise.resolve({ data: null as null }),
  ])

  const allSections = sectionsRes.data
  const allProgress = (progressRes && 'data' in progressRes ? progressRes.data : null) ?? []

  // O(1) lookup map
  const progressByVideoId = new Map<string, { completed: boolean; completed_at: string | null }>()
  for (const p of allProgress as Array<{ video_id: string; completed: boolean; completed_at: string | null }>) {
    progressByVideoId.set(p.video_id, { completed: p.completed, completed_at: p.completed_at })
  }

  const sortedSections = allSections?.map((section: any) => ({
    ...section,
    videos: section.videos?.sort((a: any, b: any) => a.order_index - b.order_index) || []
  })) || []

  // 現在の動画のインデックスを見つける
  let currentVideoIndex = 0
  let totalVideos = 0
  const allVideos: any[] = []

  sortedSections.forEach((sec: any) => {
    sec.videos.forEach((vid: any) => {
      allVideos.push({ ...vid, sectionTitle: sec.title })
      if (vid.id === videoId) {
        currentVideoIndex = totalVideos
      }
      totalVideos++
    })
  })

  const prevVideo = currentVideoIndex > 0 ? allVideos[currentVideoIndex - 1] : null
  const nextVideo = currentVideoIndex < totalVideos - 1 ? allVideos[currentVideoIndex + 1] : null

  // 現在の動画の進捗をマップから取得（追加フェッチ不要）
  const userProgress = progressByVideoId.get(videoId) ?? null

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Video Player Section */}
          <div className="lg:col-span-2 bg-black">
            <div className="aspect-video w-full">
              <YouTubePlayer
                youtubeVideoId={video.youtube_video_id ?? ''}
                videoId={video.id}
                nextVideoUrl={nextVideo ? `/courses/${slug}/videos/${nextVideo.id}` : null}
                isLoggedIn={!!user}
              />
            </div>

            {/* Video Info */}
            <div className="bg-white p-6">
              <div className="mb-4">
                <Link
                  href={`/courses/${slug}`}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← {course?.title}
                </Link>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>{section?.title}</span>
                {video.duration && (
                  <>
                    <span>•</span>
                    <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                  </>
                )}
                {userProgress?.completed && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      完了済み
                    </span>
                  </>
                )}
              </div>

              {video.description && (
                <p className="text-gray-700 leading-relaxed">{video.description}</p>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                {prevVideo ? (
                  <Link
                    href={`/courses/${slug}/videos/${prevVideo.id}`}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 border-2 border-gray-900 hover:bg-gray-100 transition-colors text-center"
                  >
                    ← 前の動画
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}

                {user && (
                  <form action={`/api/videos/${videoId}/complete`} method="POST" className="flex-shrink-0">
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      {userProgress?.completed ? '完了を解除' : '完了にする'}
                    </button>
                  </form>
                )}

                {nextVideo ? (
                  <Link
                    href={`/courses/${slug}/videos/${nextVideo.id}`}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors text-center"
                  >
                    次の動画 →
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="lg:col-span-1 bg-white max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
              <h2 className="font-bold text-gray-900">コースの内容</h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentVideoIndex + 1} / {totalVideos}
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {sortedSections.map((sec: any) => (
                <div key={sec.id}>
                  <div className="bg-gray-50 px-4 py-3">
                    <h3 className="text-sm font-bold text-gray-900">{sec.title}</h3>
                  </div>
                  <div>
                    {sec.videos.map((vid: any) => {
                      const isCurrentVideo = vid.id === videoId
                      const isLocked = !vid.is_free && !user
                      const isCompleted = progressByVideoId.get(vid.id)?.completed === true

                      return (
                        <Link
                          key={vid.id}
                          href={isLocked ? '/login' : `/courses/${slug}/videos/${vid.id}`}
                          className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                            isCurrentVideo ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {isLocked ? (
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              ) : isCurrentVideo ? (
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                </svg>
                              ) : isCompleted ? (
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                isCurrentVideo ? 'text-purple-600 font-medium' : 'text-gray-900'
                              } line-clamp-2`}>
                                {vid.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {vid.is_free && (
                                  <span className="text-xs font-bold text-purple-600">無料</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
