'use client'

import React, { useId, useMemo, useRef, useState, useCallback } from 'react'

export type ChartGranularity = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export type TrendPoint = {
  date: string | Date
  value: number
}

export type TrendSeries = {
  points: TrendPoint[]
  label?: string
  color?: string // Tailwind-compatible hex or rgb string
}

export type RevenueChartProps = {
  primary: TrendSeries
  comparison?: TrendSeries
  granularity?: ChartGranularity
  currency?: string
  height?: number // default 140
  className?: string
  xLabel?: string
  yLabel?: string
}

// Utility: format currency
function formatCurrency(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

// Utility: parse date
function toDate(d: string | Date) {
  return d instanceof Date ? d : new Date(d)
}

export function RevenueChart({
  primary,
  comparison,
  granularity = 'daily',
  currency = 'USD',
  height = 140,
  className,
  xLabel = 'Date',
  yLabel = 'Revenue',
}: RevenueChartProps) {
  const padding = { top: 10, right: 10, bottom: 24, left: 40 }
  const width = 600 // SVG viewbox width; container scales responsively
  const vbHeight = height

  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const a11yId = useId()

  const series = useMemo(() => {
    const normalize = (s?: TrendSeries) => {
      if (!s) return undefined
      const pts = (s.points || [])
        .filter(p => typeof p.value === 'number' && !Number.isNaN(p.value))
        .map(p => ({ date: toDate(p.date), value: Number(p.value) }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
      return { points: pts, label: s.label, color: s.color }
    }
    return { primary: normalize(primary), comparison: normalize(comparison) }
  }, [primary, comparison])

  const allPoints = useMemo(() => {
    const pts: { date: Date; value: number }[] = []
    series.primary?.points.forEach(p => pts.push(p))
    series.comparison?.points.forEach(p => pts.push(p))
    return pts
  }, [series])

  const domain = useMemo(() => {
    if (allPoints.length === 0) {
      const now = new Date()
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { minX: past, maxX: now, minY: 0, maxY: 1 }
    }
    const minX = new Date(Math.min(...allPoints.map(p => p.date.getTime())))
    const maxX = new Date(Math.max(...allPoints.map(p => p.date.getTime())))
    const minY = 0
    const maxY = Math.max(...allPoints.map(p => p.value)) * 1.1 || 1
    return { minX, maxX, minY, maxY }
  }, [allPoints])

  const plotW = width - padding.left - padding.right
  const plotH = vbHeight - padding.top - padding.bottom

  // Scales
  const xScale = useCallback(
    (d: Date) => {
      const t =
        (d.getTime() - domain.minX.getTime()) /
        (domain.maxX.getTime() - domain.minX.getTime() || 1)
      return padding.left + t * plotW
    },
    [domain, padding.left, plotW]
  )
  const yScale = (v: number) =>
    padding.top +
    plotH -
    ((v - domain.minY) / (domain.maxY - domain.minY || 1)) * plotH

  // Axis ticks (x)
  const xTicks = useMemo(() => {
    const ticks: Date[] = []
    const start = new Date(domain.minX)
    const end = new Date(domain.maxX)
    const step = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
    }[granularity]
    const d = new Date(start)
    while (d <= end) {
      ticks.push(new Date(d))
      d.setDate(d.getDate() + step)
    }
    if (ticks.length < 2) ticks.push(end)
    return ticks
  }, [domain, granularity])

  const formatTick = (d: Date) => {
    const opts =
      granularity === 'daily'
        ? { month: 'short', day: 'numeric' }
        : granularity === 'weekly'
          ? { month: 'short', day: 'numeric' }
          : granularity === 'monthly'
            ? { month: 'short', year: '2-digit' }
            : { month: 'short', year: '2-digit' }
    return new Intl.DateTimeFormat('en-US', opts as any).format(d)
  }

  // Build paths
  const buildPath = (pts: { date: Date; value: number }[]) => {
    if (!pts || pts.length === 0) return ''
    return pts
      .map(
        (p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date)} ${yScale(p.value)}`
      )
      .join(' ')
  }

  const primaryColor = series.primary?.color || '#2563EB' // Tailwind blue-600
  const comparisonColor = series.comparison?.color || '#9CA3AF' // Tailwind gray-400

  // Hover logic: nearest x
  const nearest = useMemo(() => {
    if (hoverX == null || !series.primary?.points?.length) return null
    const distances = series.primary.points.map(p =>
      Math.abs(xScale(p.date) - hoverX)
    )
    const idx = distances.indexOf(Math.min(...distances))
    return { idx, point: series.primary.points[idx] }
  }, [hoverX, series, xScale])

  // Trend indicator: compare first vs last
  const trendDelta = useMemo(() => {
    const pts = series.primary?.points || []
    if (pts.length < 2) return 0
    const delta = pts[pts.length - 1].value - pts[0].value
    return delta
  }, [series])

  return (
    <div ref={containerRef} className={`w-full ${className ?? ''}`}>
      <div className="text-sm text-gray-700 flex items-center justify-between mb-2">
        <div className="font-medium">{series.primary?.label || 'Revenue'}</div>
        <div
          className={`text-xs ${trendDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {trendDelta >= 0 ? '▲' : '▼'}{' '}
          {formatCurrency(Math.abs(trendDelta), currency)}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${vbHeight}`}
        className="w-full h-auto"
        role="img"
        aria-labelledby={`${a11yId}-title`}
        aria-describedby={`${a11yId}-desc`}
      >
        <title id={`${a11yId}-title`}>
          {series.primary?.label
            ? `${series.primary.label} trend`
            : 'Revenue trend'}
        </title>
        <desc
          id={`${a11yId}-desc`}
        >{`Time series chart showing ${yLabel} over ${xLabel}. Use mouse to inspect values.`}</desc>
        {/* Background */}
        <rect x={0} y={0} width={width} height={vbHeight} fill="#ffffff" />

        {/* Axes */}
        {/* Y axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotH}
          stroke="#E5E7EB"
        />
        {/* X axis */}
        <line
          x1={padding.left}
          y1={padding.top + plotH}
          x2={padding.left + plotW}
          y2={padding.top + plotH}
          stroke="#E5E7EB"
        />

        {/* X ticks */}
        {xTicks.map((t, i) => (
          <g key={i} aria-hidden="true">
            <line
              x1={xScale(t)}
              y1={padding.top + plotH}
              x2={xScale(t)}
              y2={padding.top + plotH + 4}
              stroke="#9CA3AF"
            />
            <text
              x={xScale(t)}
              y={padding.top + plotH + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#6B7280"
            >
              {formatTick(t)}
            </text>
          </g>
        ))}

        {/* Y labels (min/max) */}
        <text
          x={padding.left - 6}
          y={padding.top + plotH}
          textAnchor="end"
          fontSize={10}
          fill="#6B7280"
          aria-hidden="true"
        >
          {formatCurrency(domain.minY, currency)}
        </text>
        <text
          x={padding.left - 6}
          y={padding.top}
          textAnchor="end"
          fontSize={10}
          fill="#6B7280"
          aria-hidden="true"
        >
          {formatCurrency(domain.maxY, currency)}
        </text>

        {/* Comparison series */}
        {series.comparison?.points?.length ? (
          <path
            d={buildPath(series.comparison.points)}
            stroke={comparisonColor}
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
        ) : null}

        {/* Primary series */}
        {series.primary?.points?.length ? (
          <>
            <path
              d={buildPath(series.primary.points)}
              stroke={primaryColor}
              strokeWidth={1.5}
              fill="none"
            />
            {/* Area fill for subtle emphasis */}
            <path
              d={`${buildPath(series.primary.points)} L ${xScale(series.primary.points[series.primary.points.length - 1].date)} ${padding.top + plotH} L ${xScale(series.primary.points[0].date)} ${padding.top + plotH} Z`}
              fill="#DBEAFE" // blue-100
              opacity={0.4}
            />
          </>
        ) : (
          <text
            x={padding.left + plotW / 2}
            y={padding.top + plotH / 2}
            textAnchor="middle"
            fontSize={12}
            fill="#9CA3AF"
          >
            No data
          </text>
        )}

        {/* Hover marker and tooltip */}
        {nearest ? (
          <g>
            <line
              x1={xScale(nearest.point.date)}
              y1={padding.top}
              x2={xScale(nearest.point.date)}
              y2={padding.top + plotH}
              stroke="#D1D5DB"
              strokeDasharray="4 2"
            />
            <circle
              cx={xScale(nearest.point.date)}
              cy={yScale(nearest.point.value)}
              r={3}
              fill={primaryColor}
            />
            <foreignObject
              x={xScale(nearest.point.date) - 60}
              y={yScale(nearest.point.value) - 50}
              width={120}
              height={38}
            >
              <div className="pointer-events-none select-none rounded bg-white shadow px-2 py-1 text-xs text-gray-800 border border-gray-200">
                <div className="font-medium">
                  {formatCurrency(nearest.point.value, currency)}
                </div>
                <div className="text-gray-600">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  }).format(nearest.point.date)}
                </div>
              </div>
            </foreignObject>
          </g>
        ) : null}

        {/* Interaction overlay */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onMouseMove={e => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect()
            setHoverX(e.clientX - rect.left)
          }}
          onMouseLeave={() => setHoverX(null)}
        />

        {/* Axis labels */}
        <text
          x={padding.left + plotW / 2}
          y={vbHeight - 2}
          textAnchor="middle"
          fontSize={11}
          fill="#374151"
          aria-hidden="true"
        >
          {xLabel}
        </text>
        <text
          x={2}
          y={padding.top + plotH / 2}
          transform={`rotate(-90 2 ${padding.top + plotH / 2})`}
          textAnchor="middle"
          fontSize={11}
          fill="#374151"
          aria-hidden="true"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  )
}

export default RevenueChart
