'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  youtubeVideoId: string
  videoId: string
  nextVideoUrl: string | null
  isLoggedIn: boolean
}

function withAutoplay(url: string): string {
  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
}

type YT = {
  Player: new (
    el: HTMLElement | string,
    options: {
      videoId: string
      playerVars?: Record<string, unknown>
      events?: { onStateChange?: (e: { data: number }) => void }
    }
  ) => { destroy: () => void }
  PlayerState: { ENDED: number }
}

declare global {
  interface Window {
    YT?: YT
    onYouTubeIframeAPIReady?: () => void
  }
}

const AUTO_ADVANCE_SECONDS = 5

export default function YouTubePlayer({
  youtubeVideoId,
  videoId,
  nextVideoUrl,
  isLoggedIn,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<{ destroy: () => void } | null>(null)
  const [ended, setEnded] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECONDS)
  const [cancelled, setCancelled] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoplay = searchParams?.get('autoplay') === '1'

  const handleEnded = useCallback(async () => {
    setEnded(true)
    setCountdown(AUTO_ADVANCE_SECONDS)
    setCancelled(false)
    if (isLoggedIn) {
      try {
        await fetch(`/api/videos/${videoId}/auto-complete`, { method: 'POST' })
        router.refresh()
      } catch (e) {
        console.error('auto-complete failed', e)
      }
    }
  }, [isLoggedIn, videoId, router])

  useEffect(() => {
    const scriptId = 'youtube-iframe-api'

    const initPlayer = () => {
      if (!containerRef.current || !window.YT) return
      const target = document.createElement('div')
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(target)

      playerRef.current = new window.YT.Player(target, {
        videoId: youtubeVideoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: autoplay ? 1 : 0,
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (window.YT && e.data === window.YT.PlayerState.ENDED) {
              handleEnded()
            }
          },
        },
      })
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy()
        } catch {
          // noop
        }
        playerRef.current = null
      }
    }
  }, [youtubeVideoId, handleEnded, autoplay])

  useEffect(() => {
    if (!ended || !nextVideoUrl || cancelled) return
    if (countdown <= 0) {
      router.push(withAutoplay(nextVideoUrl))
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [ended, countdown, nextVideoUrl, cancelled, router])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
      {ended && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center text-white px-6">
            <div className="inline-flex items-center gap-2 mb-4 text-green-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-2xl font-bold">視聴完了</span>
            </div>
            {nextVideoUrl && !cancelled ? (
              <>
                <p className="text-lg mb-6">
                  {countdown} 秒後に次の動画へ自動遷移します
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setCancelled(true)}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => router.push(withAutoplay(nextVideoUrl))}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition"
                  >
                    今すぐ次へ →
                  </button>
                </div>
              </>
            ) : nextVideoUrl ? (
              <button
                onClick={() => router.push(withAutoplay(nextVideoUrl))}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition"
              >
                次の動画へ →
              </button>
            ) : (
              <p className="text-lg">最後の動画まで視聴しました 🎉</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
