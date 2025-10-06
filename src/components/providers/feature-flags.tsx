"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type FeatureFlags = {
  enableAnimations: boolean
  enableShimmer: boolean
  reducedMotion: boolean
}

const FeatureFlagsContext = createContext<FeatureFlags | null>(null)

function getEnvFlag(name: string, defaultValue: boolean) {
  const val = process.env[name]
  if (val === undefined) return defaultValue
  return ["1", "true", "TRUE", "on", "ON", "yes"].includes(val)
}

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
        const handler = () => setReducedMotion(!!mql.matches)
        handler()
        mql.addEventListener?.("change", handler)
        return () => mql.removeEventListener?.("change", handler)
      } catch {
        setReducedMotion(false)
      }
    }
  }, [])

  const value = useMemo<FeatureFlags>(() => ({
    enableAnimations: getEnvFlag("NEXT_PUBLIC_ENABLE_ANIMATIONS", true),
    enableShimmer: getEnvFlag("NEXT_PUBLIC_ENABLE_SHIMMER", true),
    reducedMotion,
  }), [reducedMotion])

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext)
  if (!ctx) {
    // Provide sensible defaults if not wrapped (should not happen in app)
    return { enableAnimations: true, enableShimmer: true, reducedMotion: false } as FeatureFlags
  }
  return ctx
}