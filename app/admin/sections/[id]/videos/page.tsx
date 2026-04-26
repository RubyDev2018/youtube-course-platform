import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import VideoManager from './video-manager'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

export default async function SectionVideosPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: section } = await supabase
    .from('sections')
    .select(`
      *,
      courses (
        id,
        title,
        slug
      ),
      videos (
        *
      )
    `)
    .eq('id', id)
    .single()

  if (!section) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/courses/${section.courses.id}/edit`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          講座編集に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">動画管理</h1>
        <p className="text-gray-600 mt-2">
          {section.courses.title} / 第{section.order_index}章: {section.title}
        </p>
      </div>

      <VideoManager
        sectionId={section.id}
        videos={section.videos || []}
      />
    </div>
  )
}