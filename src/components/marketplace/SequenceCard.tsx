'use client'

import React from 'react'
import { Star, Play, Heart, ShoppingCart, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type Sequence = {
  id: string
  title: string
  price: number
  image: string
  badge?: string
  rating?: number
  seller: string
  downloads: number
  duration: string
  props: string[]
}

const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs leading-none bg-primary/20 text-primary border border-primary/30 font-medium shadow-sm ${className}`}
    {...props}
  >
    {children}
  </span>
)

const SequenceCard: React.FC<{ 
  sequence: Sequence
  onAddToCart?: (sequence: Sequence) => void
  onToggleFavorite?: (sequence: Sequence) => void
} & React.HTMLAttributes<HTMLDivElement>> = ({
  sequence,
  onAddToCart,
  onToggleFavorite,
  className = '',
  ...props
}) => {
  return (
    <Card className={`group overflow-hidden hover:shadow-xl hover:shadow-black/40 transition-all duration-300 ${className}`} {...props}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-surface to-background transition-transform duration-500 group-hover:scale-110"
          style={{ 
            backgroundImage: `url(${sequence.image})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 flex items-center justify-center">
          <div className="bg-primary/30 backdrop-blur-md rounded-full p-5 border border-primary/40 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Play className="w-10 h-10 text-white fill-white/90" />
          </div>
        </div>
        
        {sequence.badge && (
          <div className="absolute top-5 left-5">
            <Badge>{sequence.badge}</Badge>
          </div>
        )}
        
        <div className="absolute top-5 right-5">
          <button
            onClick={() => onToggleFavorite?.(sequence)}
            className="bg-black/50 backdrop-blur-md rounded-full p-3 border border-white/20 hover:border-secondary/60 transition-colors shadow-lg"
          >
            <Heart className="w-5 h-5 text-white hover:text-secondary transition-colors" />
          </button>
        </div>
        
        <div className="absolute bottom-5 left-5 text-xs text-white bg-black/50 backdrop-blur-md rounded-full px-4 py-2 font-medium shadow-lg">
          {sequence.duration}
        </div>
      </div>

      <CardContent className="space-y-5 p-6 sm:p-7">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {sequence.title}
            </h3>
            <p className="text-sm text-gray-400 mt-2">by <span className="text-gray-300 hover:text-primary transition-colors">{sequence.seller}</span></p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-accent">
              ${sequence.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rating and Downloads */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          {sequence.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < sequence.rating! 
                        ? 'text-accent fill-accent' 
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-accent font-medium">{sequence.rating.toFixed(1)}</span>
            </div>
          )}
          <span>{sequence.downloads.toLocaleString()} downloads</span>
        </div>

        {/* Props Tags */}
        {sequence.props.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sequence.props.slice(0, 3).map((prop, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-secondary/15 text-secondary/90 border border-secondary/30 font-medium"
              >
                {prop}
              </span>
            ))}
            {sequence.props.length > 3 && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-gray-800/80 text-gray-300 font-medium">
                +{sequence.props.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3">
          <Button 
            className="flex-1" 
            size="md"
            onClick={() => onAddToCart?.(sequence)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Button 
            variant="soft" 
            size="md" 
            className="px-5"
            accent="secondary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SequenceCard
export type { Sequence }
