"use client"

import React from "react"
import { useFeatureFlags } from "@/components/providers/feature-flags"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: string
}

export function Skeleton({ className = "", rounded = "rounded-lg", ...props }: SkeletonProps) {
  const { enableShimmer } = useFeatureFlags()
  return (
    <div
      {...props}
      className={`skeleton bg-gray-200 dark:bg-gray-800 ${rounded} ${enableShimmer ? "" : "no-shimmer"} ${className}`}
    />
  )
}

export function SkeletonText({ lines = 2, className = "" }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" rounded="rounded" />
      ))}
    </div>
  )
}

export function SkeletonImage({ className = "" }: { className?: string }) {
  return <Skeleton className={`w-full h-full ${className}`} />
}

export function SequenceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      <div className="h-48">
        <SkeletonImage />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <SkeletonText lines={2} />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" rounded="rounded" />
          <Skeleton className="h-4 w-12" rounded="rounded" />
        </div>
        <Skeleton className="h-4 w-24" rounded="rounded" />
      </div>
    </div>
  )
}

export function ListRowSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16">
          <SkeletonImage />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-1/3" />
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-3 w-24" rounded="rounded" />
            <Skeleton className="h-3 w-32" rounded="rounded" />
          </div>
        </div>
        <div className="w-24">
          <Skeleton className="h-9" />
        </div>
      </div>
    </div>
  )
}