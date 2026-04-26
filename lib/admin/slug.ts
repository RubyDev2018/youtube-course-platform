// Slug validation shared between new/edit course forms.
//
// Reserved names exist because course slugs are exposed at /courses/[slug],
// but a sibling slug like "login" or "admin" would shadow real first-class
// routes once a future refactor moves things around. Block them up front.

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'callback',
  'categories',
  'category',
  'courses',
  'dashboard',
  'login',
  'logout',
  'new',
  'profile',
  'search',
  'settings',
  'signup',
  'static',
  'video',
  'videos',
])

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
}

export function validateSlug(slug: string): string | null {
  if (!slug) return 'スラッグは必須です'
  if (!SLUG_RE.test(slug)) {
    return 'スラッグは英小文字・数字・ハイフンのみ、先頭は英数字、最大63文字です'
  }
  if (RESERVED_SLUGS.has(slug)) {
    return `"${slug}" は予約語のため使用できません`
  }
  return null
}
