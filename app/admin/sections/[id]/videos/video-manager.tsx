'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlusIcon, PencilIcon, TrashIcon, GripVerticalIcon } from 'lucide-react'

interface Video {
  id: string
  title: string
  description?: string
  youtube_url: string
  youtube_video_id?: string
  duration?: number
  order_index: number
  is_free: boolean
}

export default function VideoManager({
  sectionId,
  videos: initialVideos
}: {
  sectionId: string
  videos: Video[]
}) {
  const router = useRouter()
  const [videos, setVideos] = useState(initialVideos.sort((a, b) => a.order_index - b.order_index))
  const [editingVideo, setEditingVideo] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Video>>({})
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    youtube_url: '',
    duration: 0,
    is_free: false
  })
  const [loading, setLoading] = useState(false)

  const extractYouTubeId = (url: string): string | null => {
    // The previous regex matched "youtube.com/watch?v=" anywhere in the
    // string, so https://attacker.example/youtube.com/watch?v=evilid would
    // pass. Parse as a URL and require a known YouTube host plus the canonical
    // 11-character video ID.
    const YT_HOSTS = new Set([
      'www.youtube.com',
      'youtube.com',
      'm.youtube.com',
      'youtu.be',
    ])
    const ID_RE = /^[A-Za-z0-9_-]{11}$/
    try {
      const u = new URL(url.trim())
      if (!YT_HOSTS.has(u.hostname)) return null
      const id =
        u.hostname === 'youtu.be'
          ? u.pathname.slice(1).split('/')[0]
          : u.searchParams.get('v')
      return id && ID_RE.test(id) ? id : null
    } catch {
      return null
    }
  }

  const handleAddVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.youtube_url.trim()) return

    const youtubeId = extractYouTubeId(newVideo.youtube_url)
    if (!youtubeId) {
      alert('有効なYouTube URLを入力してください')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const maxOrder = Math.max(...videos.map(v => v.order_index), 0)

      const { data, error } = await supabase
        .from('videos')
        .insert([{
          section_id: sectionId,
          title: newVideo.title,
          description: newVideo.description || null,
          youtube_url: newVideo.youtube_url,
          youtube_video_id: youtubeId,
          duration: newVideo.duration || null,
          order_index: maxOrder + 1,
          is_free: newVideo.is_free
        }])
        .select()
        .single()

      if (error) throw error

      setVideos([...videos, data])
      setNewVideo({
        title: '',
        description: '',
        youtube_url: '',
        duration: 0,
        is_free: false
      })
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateVideo = async (videoId: string) => {
    if (!editForm.title?.trim() || !editForm.youtube_url?.trim()) return

    const youtubeId = extractYouTubeId(editForm.youtube_url)
    if (!youtubeId) {
      alert('有効なYouTube URLを入力してください')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('videos')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          youtube_url: editForm.youtube_url,
          youtube_video_id: youtubeId,
          duration: editForm.duration || null,
          is_free: editForm.is_free
        })
        .eq('id', videoId)

      if (error) throw error

      setVideos(videos.map(v =>
        v.id === videoId
          ? { ...v, ...editForm, youtube_video_id: youtubeId }
          : v
      ))
      setEditingVideo(null)
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) {
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      setVideos(videos.filter(v => v.id !== videoId))
      router.refresh()
    } catch (err: any) {
      alert('エラー: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (video: Video) => {
    setEditingVideo(video.id)
    setEditForm(video)
  }

  const cancelEdit = () => {
    setEditingVideo(null)
    setEditForm({})
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">動画一覧</h2>

      {/* 動画リスト */}
      <div className="space-y-4 mb-6">
        {videos.map((video, index) => (
          <div key={video.id} className="border rounded-lg p-4">
            {editingVideo === video.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="説明（任意）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />
                <input
                  type="url"
                  value={editForm.youtube_url}
                  onChange={(e) => setEditForm({ ...editForm, youtube_url: e.target.value })}
                  placeholder="YouTube URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={editForm.duration || ''}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                    placeholder="動画時間（秒）"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.is_free}
                      onChange={(e) => setEditForm({ ...editForm, is_free: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">無料公開</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateVideo(video.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <GripVerticalIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {index + 1}. {video.title}
                  </div>
                  {video.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {video.description}
                    </div>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {video.duration ? `${Math.floor(video.duration / 60)}分${video.duration % 60}秒` : '時間未設定'}
                    </span>
                    {video.is_free && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        無料
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(video)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 新規動画追加フォーム */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-3">新規動画追加</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="動画タイトル"
            value={newVideo.title}
            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          />
          <input
            type="text"
            placeholder="説明（任意）"
            value={newVideo.description}
            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          />
          <input
            type="url"
            placeholder="YouTube URL（例：https://www.youtube.com/watch?v=xxx）"
            value={newVideo.youtube_url}
            onChange={(e) => setNewVideo({ ...newVideo, youtube_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          />
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="動画時間（秒）"
              value={newVideo.duration || ''}
              onChange={(e) => setNewVideo({ ...newVideo, duration: parseInt(e.target.value) || 0 })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newVideo.is_free}
                onChange={(e) => setNewVideo({ ...newVideo, is_free: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">無料公開</span>
            </label>
          </div>
          <button
            onClick={handleAddVideo}
            disabled={loading || !newVideo.title.trim() || !newVideo.youtube_url.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            動画を追加
          </button>
        </div>
      </div>
    </div>
  )
}