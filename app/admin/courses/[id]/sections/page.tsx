import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import SectionList from './section-list'

export default async function CourseSectionsPage({
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
        videos (*)
      )
    `)
    .eq('id', id)
    .single()

  if (!course) {
    notFound()
  }

  // セクション順でソート
  const sections = course.sections?.sort((a: any, b: any) => a.order_index - b.order_index) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white border-b px-8 py-4">
          <Link href="/admin/courses" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeftIcon className="w-4 h-4" />
            講座一覧に戻る
          </Link>
        </div>

        {/* コンテンツ */}
        <div className="px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">セクション管理</h1>
            <p className="text-sm text-gray-600">
              AI開発入門・ChatGPTを活用したアプリ開発 のセクションを管理します
            </p>
          </div>

          {/* 新規セクション追加ボタン */}
          <div className="mb-6">
            <Link
              href={`/admin/courses/${id}/sections/new`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              新規セクション追加
            </Link>
            <input
              type="text"
              placeholder="セクション名を入力"
              className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* セクション一覧 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">セクション一覧</h2>
            </div>

            <div className="px-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="py-3 w-16">順序</th>
                    <th className="py-3">セクション名</th>
                    <th className="py-3 w-24 text-center">動画数</th>
                    <th className="py-3 w-48 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <SectionList courseId={id} sections={sections} />
                </tbody>
              </table>

              {sections.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  セクションがまだありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}