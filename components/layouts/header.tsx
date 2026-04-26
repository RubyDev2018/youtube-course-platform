'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Header() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // ユーザー名を取得（user_metadataから取得、なければemailから）
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'ユーザー'
  }

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="border-b border-gray-200">
        <div className="max-w-[1340px] mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">
            {/* Left Section */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group">
                <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.96-6.5-4.65-6.5-8.5V8.3l6.5-3.11 6.5 3.11V12c0 3.85-2.64 7.54-6.5 8.5z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="text-2xl font-bold text-gray-900">vibe coding platform</span>
              </Link>

              {/* Search Bar - Udemy style */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-[450px]">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="何を学びたいですか？"
                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-900 rounded-full focus:outline-none focus:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="検索"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <div className="hidden xl:flex items-center space-x-6">
                <Link href="/" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                  講座
                </Link>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {/* My Learning Link */}
                  <Link href="/dashboard" className="hidden lg:block text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                    マイ学習
                  </Link>

                  {/* User Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center"
                    >
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={getUserName()}
                          width={40}
                          height={40}
                          className="rounded-full hover:ring-2 hover:ring-purple-600 transition-all"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:ring-2 hover:ring-purple-600 transition-all">
                          <span className="text-sm font-semibold text-white">
                            {getUserName().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-64 bg-white rounded-sm shadow-xl border border-gray-200 overflow-hidden z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 truncate">{getUserName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            マイ学習
                          </Link>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false)
                              handleLogout()
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors"
                          >
                            ログアウト
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-100 border border-gray-900 transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
