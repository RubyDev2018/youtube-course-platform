/**
 * Server-side request validation helpers.
 *
 * Used by API route handlers to defend against CSRF and open-redirect attacks
 * without depending on a CSRF token. These checks rely on browsers honoring
 * the standard Origin / Referer headers — both modern Chromium and Firefox
 * send Origin on cross-site form POSTs since 2020/2021.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value: string | undefined | null): boolean {
  return !!value && UUID_RE.test(value)
}

/**
 * Verify that a state-changing request originated from the same origin as the
 * server. Returns true when the Origin header (or, as a fallback, Referer)
 * matches the server's own origin. Requests with no Origin/Referer at all are
 * rejected — every modern browser sends at least one for fetch / form POST.
 */
export function isSameOriginRequest(request: Request): boolean {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin) {
    return origin === url.origin
  }
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      return new URL(referer).origin === url.origin
    } catch {
      return false
    }
  }
  return false
}

/**
 * Resolve a redirect target while ensuring it stays on the current origin.
 * Accepts either an absolute URL on the same origin or a path-only string.
 * Anything else (cross-origin URL, protocol-relative "//evil.example",
 * malformed input) falls back to `fallback`.
 */
export function safeRedirectPath(
  candidate: string | null | undefined,
  request: Request,
  fallback = '/',
): string {
  if (!candidate) return fallback
  // Reject protocol-relative and backslash tricks up front: "//evil",
  // "/\\evil", etc. resolve to a different origin in some parsers.
  if (
    candidate.startsWith('//') ||
    candidate.startsWith('/\\') ||
    candidate.startsWith('\\')
  ) {
    return fallback
  }
  try {
    const requestUrl = new URL(request.url)
    const target = new URL(candidate, requestUrl)
    if (target.origin !== requestUrl.origin) return fallback
    return target.pathname + target.search + target.hash
  } catch {
    return fallback
  }
}
