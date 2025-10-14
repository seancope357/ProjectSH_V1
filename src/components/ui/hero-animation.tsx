'use client'

import { useEffect, useRef } from 'react'

interface HeroAnimationProps {
  className?: string
}

// A lightweight canvas animation that evokes common xLights preview motifs:
// - House outline nodes chaser
// - Mega tree radial color waves
// - Occasional starbursts
// - Beat-like pulsing via time-based amplitude
export function HeroAnimation({ className }: HeroAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return

    // Narrow to non-null, strongly typed locals for inner closures
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxEl

    // Precision rendering defaults
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))
    const ENHANCE = 10
    function resize() {
      const parent = canvas.parentElement
      const width = parent?.clientWidth || window.innerWidth
      const height =
        parent?.clientHeight || Math.max(420, window.innerHeight * 0.6)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Starburst particles
    type Star = { x: number; y: number; r: number; life: number; ttl: number }
    const stars: Star[] = []
    function spawnStar() {
      const ttl = 1200 + Math.random() * 1000
      stars.push({
        x: Math.random() * (canvas.width / dpr),
        y: Math.random() * (canvas.height / dpr),
        r: 0,
        life: 0,
        ttl,
      })
      // cap particle count
      if (stars.length > 24) stars.shift()
    }

    // House outline points (simple roof + facade)
    function housePath(w: number, h: number) {
      const margin = Math.min(40, w * 0.04)
      const baseY = h * 0.75
      const leftX = margin
      const rightX = w - margin
      const midX = w * 0.5
      const peakY = h * 0.45
      const doorW = Math.min(50, w * 0.06)
      const doorH = Math.min(80, h * 0.18)
      const doorX = midX - doorW / 2
      const doorY = baseY
      return {
        outline: [
          [leftX, baseY],
          [midX, peakY],
          [rightX, baseY],
          [leftX, baseY],
        ],
        facade: [
          [leftX, baseY],
          [rightX, baseY],
        ],
        door: [
          [doorX, doorY],
          [doorX, doorY - doorH],
          [doorX + doorW, doorY - doorH],
          [doorX + doorW, doorY],
        ],
        baseY,
      }
    }

    // Mega tree config
    function drawMegaTree(t: number, w: number, h: number) {
      const cx = w * 0.16
      const baseY = h * 0.8
      const height = h * 0.5
      const strings = 32
      const sway = Math.sin(t * 0.0009) * 0.08
      for (let i = 0; i < strings; i++) {
        const ang = (i / strings) * Math.PI + sway
        const topX = cx + Math.cos(ang) * (height * 0.08)
        const topY = baseY - height
        const bottomX = cx + Math.cos(ang) * (height * 0.35)
        const hue = (t * 0.04 + i * 8) % 360
        const color = `hsla(${hue}, 90%, 65%, 0.9)`
        ctx.strokeStyle = color
        ctx.lineWidth = 2 + ENHANCE * 0.2
        ctx.shadowColor = color
        ctx.shadowBlur = ENHANCE
        ctx.beginPath()
        ctx.moveTo(topX, topY)
        ctx.lineTo(bottomX, baseY)
        ctx.stroke()
      }
      // topper star
      const hue = (t * 0.06) % 360
      const starColor = `hsla(${hue}, 100%, 75%, 1)`
      ctx.fillStyle = starColor
      ctx.shadowColor = starColor
      ctx.shadowBlur = ENHANCE * 1.2
      drawStar(cx, baseY - height - 10, 6, 10, 4)
    }

    function drawStar(
      x: number,
      y: number,
      spikes: number,
      outerR: number,
      innerR: number
    ) {
      let rot = (Math.PI / 2) * 3
      let cx = x
      let cy = y
      const step = Math.PI / spikes
      ctx.beginPath()
      ctx.moveTo(cx, cy - outerR)
      for (let i = 0; i < spikes; i++) {
        cx = x + Math.cos(rot) * outerR
        cy = y + Math.sin(rot) * outerR
        ctx.lineTo(cx, cy)
        rot += step
        cx = x + Math.cos(rot) * innerR
        cy = y + Math.sin(rot) * innerR
        ctx.lineTo(cx, cy)
        rot += step
      }
      ctx.lineTo(x, y - outerR)
      ctx.closePath()
      ctx.fill()
    }

    function drawHouseNodes(t: number, w: number, h: number) {
      const hp = housePath(w, h)
      const paths = [hp.outline, hp.facade, hp.door]
      const speed = 0.18
      const offset = (t * speed) % 1
      for (const path of paths) {
        // place nodes along segments
        for (let s = 0; s < path.length - 1; s++) {
          const [x1, y1] = path[s]
          const [x2, y2] = path[s + 1]
          const segLen = Math.hypot(x2 - x1, y2 - y1)
          const count = Math.max(6, Math.floor(segLen / 28))
          for (let i = 0; i <= count; i++) {
            const tpos = i / count
            const x = x1 + (x2 - x1) * tpos
            const y = y1 + (y2 - y1) * tpos
            const hue = (i * 12 + t * 0.08) % 360
            const phase = (tpos + offset) % 1
            const amp = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2)
            ctx.fillStyle = `hsla(${hue}, 90%, ${60 + amp * 20}%, ${0.6 + amp * 0.3})`
            ctx.shadowColor = ctx.fillStyle
            ctx.shadowBlur = ENHANCE
            ctx.beginPath()
            const r = Math.min(12, (3 + amp * 2) * (1 + ENHANCE * 0.15))
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    function drawStars(t: number, w: number, h: number) {
      if (Math.random() < 0.02) spawnStar()
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i]
        s.life += 16
        const p = Math.min(1, s.life / s.ttl)
        s.r = Math.min(50, (1 + p * 18) * (1 + ENHANCE * 0.1))
        const alpha = 1 - p
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.shadowColor = 'rgba(255,255,255,1)'
        ctx.shadowBlur = ENHANCE * 0.8
        drawStar(s.x, s.y, 5, s.r, s.r * 0.5)
        if (s.life >= s.ttl) stars.splice(i, 1)
      }
    }

    function loop(now: number) {
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      // pure black background for maximum contrast
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
      ctx.filter = 'contrast(1.05) saturate(1.08)'
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, w, h)

      // additive blending for brighter, clearer lights
      ctx.globalCompositeOperation = 'lighter'

      drawMegaTree(now, w, h)
      drawHouseNodes(now, w, h)
      drawStars(now, w, h)

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
