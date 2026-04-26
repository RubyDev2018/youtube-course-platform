import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import CourseEditForm from './course-edit-form'
import SectionsManager from './sections-manager'

export default async function EditCoursePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        *,
        videos (
          *
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!course) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">講座編集</h1>
        <p className="text-gray-600 mt-2">{course.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Course Edit Form */}
          <CourseEditForm course={course} />

          {/* Sections Manager */}
          <div className="mt-8">
            <SectionsManager courseId={course.id} sections={course.sections || []} />
          </div>
        </div>

        <div>
          {/* Course Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-800 mb-4">プレビュー</h3>
            {course.thumbnail_url && (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                width={480}
                height={270}
                className="w-full h-auto rounded-lg mb-4"
              />
            )}
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">セクション数:</span>{' '}
                {course.sections?.length || 0}
              </div>
              <div>
                <span className="font-medium">動画数:</span>{' '}
                {course.sections?.reduce(
                  (acc: number, section: any) => acc + (section.videos?.length || 0),
                  0
                ) || 0}
              </div>
              <div>
                <span className="font-medium">公開状態:</span>{' '}
                <span className={course.is_published ? 'text-green-600' : 'text-gray-500'}>
                  {course.is_published ? '公開中' : '非公開'}
                </span>
              </div>
              <div>
                <span className="font-medium">URL:</span>{' '}
                <a
                  href={`/courses/${course.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  /courses/{course.slug}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}