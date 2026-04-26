export type CategoryMeta = {
  name: string
  icon: string
  slug: string
}

export const CATEGORIES: CategoryMeta[] = [
  { name: 'AI・プログラミング', icon: '🤖', slug: 'ai-programming' },
  { name: '健康・ライフスタイル', icon: '💪', slug: 'health-lifestyle' },
  { name: '自己啓発', icon: '🔥', slug: 'self-development' },
  { name: '音楽', icon: '🎵', slug: 'music' },
  { name: 'ビジネス', icon: '💼', slug: 'business' },
  { name: '投資・マネー', icon: '💰', slug: 'finance' },
  { name: 'デザイン', icon: '🎨', slug: 'design' },
  { name: '語学', icon: '🗣️', slug: 'language' },
  { name: '料理・グルメ', icon: '🍳', slug: 'cooking' },
  { name: '旅行', icon: '✈️', slug: 'travel' },
  { name: 'スポーツ', icon: '⚽', slug: 'sports' },
  { name: 'アート・写真', icon: '📸', slug: 'art-photo' },
  { name: 'ゲーム', icon: '🎮', slug: 'gaming' },
  { name: '教育・学習', icon: '📚', slug: 'education' },
  { name: '映画・エンタメ', icon: '🎬', slug: 'entertainment' },
  { name: 'その他', icon: '🌟', slug: 'other' },
]

export function categoryNameToSlug(name: string | null | undefined): string | null {
  if (!name) return null
  return CATEGORIES.find((c) => c.name === name)?.slug ?? null
}

export function categorySlugToName(slug: string): string | null {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? null
}

export function getCategoryMeta(name: string | null | undefined): CategoryMeta | null {
  if (!name) return null
  return CATEGORIES.find((c) => c.name === name) ?? null
}
