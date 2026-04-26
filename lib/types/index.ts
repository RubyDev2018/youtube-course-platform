// Import database types into local scope
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// Re-export database types
export type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// Basic table types
export type Course = Tables<'courses'>
export type CourseInsert = TablesInsert<'courses'>
export type CourseUpdate = TablesUpdate<'courses'>

export type Section = Tables<'sections'>
export type SectionInsert = TablesInsert<'sections'>
export type SectionUpdate = TablesUpdate<'sections'>

export type Video = Tables<'videos'>
export type VideoInsert = TablesInsert<'videos'>
export type VideoUpdate = TablesUpdate<'videos'>

export type UserProgress = Tables<'user_progress'>
export type UserProgressInsert = TablesInsert<'user_progress'>
export type UserProgressUpdate = TablesUpdate<'user_progress'>

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// Extended types for nested data
export type VideoWithSection = Video & {
  sections: Section & {
    courses: Course
  }
}

export type SectionWithVideos = Section & {
  videos: Video[]
}

export type CourseWithSections = Course & {
  sections: SectionWithVideos[]
}

export type CourseWithStats = Course & {
  videoCount: number
  sectionCount: number
  totalDuration?: number
}

// Progress-related types
export type VideoWithProgress = Video & {
  user_progress?: UserProgress | null
}

export type CourseProgress = {
  courseId: string
  totalVideos: number
  completedVideos: number
  percentage: number
  lastWatchedAt?: string | null
}

// Auth-related types
export type AuthUser = {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
    name?: string
  }
}

