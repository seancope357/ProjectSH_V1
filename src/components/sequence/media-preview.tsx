'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Pause, Eye, Heart, Share2 } from 'lucide-react'
import { useAuth } from '@/components/providers/session-provider'

interface MediaPreviewProps {
  url: string | null
  thumbnailUrl: string | null
  title: string
  sequenceId: string
}

export function MediaPreview({ url, thumbnailUrl, title, sequenceId }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false) // Simplified local state for demo
  const { user } = useAuth()

  // Real implementation would check favorites status like in SequenceGrid

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-lg group">
      <div className="aspect-video relative">
        {url ? (
          <>
            {isPlaying && url.endsWith('.mp4') ? (
              <video
                src={url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                src={thumbnailUrl || url} // Fallback if thumb is missing
                alt={title}
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                unoptimized={url?.startsWith('data:')}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
            <Eye className="w-16 h-16" />
          </div>
        )}

        {/* Play Overlay */}
        {!isPlaying && url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 border border-white/30"
            >
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </button>
          </div>
        )}

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
             <Heart className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
             <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
