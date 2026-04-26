'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateSlug } from '@/lib/admin/slug'

type CourseFormInput = {
  id: string
  title: string
  description: string | null
  slug: string | null
  thumbnail_url: string | null
  is_published: boolean | null
}

export default function CourseEditForm({ course }: { course: CourseFormInput }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || '',
    slug: course.slug ?? '',
    thumbnail_url: course.thumbnail_url || '',
    is_published: course.is_published ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const slugError = validateSlug(formData.slug)
    if (slugError) {
      setError(slugError)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('courses')
        .update(formData)
        .eq('id', course.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
    } catch {
      setError('講座の更新に失敗しました。スラッグの重複や入力内容を確認してください')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleDelete = async () => {
    if (!confirm('この講座を削除してもよろしいですか？関連するセクションと動画も全て削除されます。')) {
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id)

      if (error) throw error

      router.push('/admin/courses')
    } catch {
      setError('講座の削除に失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">基本情報</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          講座を更新しました
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            タイトル *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            スラッグ（URL）*
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">
            サムネイル画像URL
          </label>
          <input
            type="url"
            id="thumbnail_url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
            公開する
          </label>
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            講座を削除
          </button>
        </div>
      </form>
    </div>
  )
}