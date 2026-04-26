-- Aggregated stats per course for fast list rendering.
-- Avoids the N×M nested fetch on the homepage / categories / search.
CREATE OR REPLACE VIEW courses_with_stats AS
SELECT
  c.id,
  c.title,
  c.description,
  c.thumbnail_url,
  c.slug,
  c.category,
  c.is_published,
  c.created_at,
  c.updated_at,
  COALESCE(s.section_count, 0)::int AS section_count,
  COALESCE(v.video_count, 0)::int   AS video_count
FROM courses c
LEFT JOIN (
  SELECT course_id, COUNT(*)::int AS section_count
  FROM sections
  GROUP BY course_id
) s ON s.course_id = c.id
LEFT JOIN (
  SELECT s2.course_id, COUNT(v2.id)::int AS video_count
  FROM sections s2
  LEFT JOIN videos v2 ON v2.section_id = s2.id
  GROUP BY s2.course_id
) v ON v.course_id = c.id;

-- The view inherits RLS from the underlying tables. Grant select to
-- anon and authenticated roles so list pages can query it.
GRANT SELECT ON courses_with_stats TO anon, authenticated;
