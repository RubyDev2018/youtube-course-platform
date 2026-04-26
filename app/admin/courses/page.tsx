import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon, PencilIcon } from 'lucide-react'
import DeleteCourseButton from './delete-course-button'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        id,
        videos (id)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white border-b px-8 py-4">
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            管理画面ホーム
          </Link>
        </div>

        {/* コンテンツ */}
        <div className="px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">講座管理</h1>
            <p className="text-sm text-gray-600">
              プラットフォーム上の全ての講座を管理します
            </p>
          </div>

          {/* 新規講座作成ボタン */}
          <div className="mb-6">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              新規講座追加
            </Link>
          </div>

          {/* 講座一覧 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">講座一覧</h2>
            </div>

            <div className="px-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="py-3 w-16">順序</th>
                    <th className="py-3">講座名</th>
                    <th className="py-3 w-24 text-center">セクション</th>
                    <th className="py-3 w-48 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses?.map((course, index) => {
                    const sectionCount = course.sections?.length || 0

                    return (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-gray-900">
                            {course.title}
                          </span>
                        </td>
                        <td className="py-4 text-center text-sm text-gray-500">
                          {sectionCount}
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/courses/${course.id}/sections`}
                              className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                            >
                              開く
                            </Link>
                            <Link
                              href={`/admin/courses/${course.id}/edit`}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              動画管理
                            </Link>
                            <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {(!courses || courses.length === 0) && (
                <div className="py-12 text-center text-gray-500">
                  講座がまだ登録されていません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}