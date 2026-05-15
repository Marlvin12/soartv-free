'use client'
import { useRef, useEffect } from 'react'

type State = 'idle' | 'listening' | 'thinking' | 'speaking'

function useFrame(cb: (t: number, dt: number) => void) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    try { cbRef.current(last / 1000, 0) } catch {}
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      cbRef.current(now / 1000, dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

function noise1(t: number) {
  return (Math.sin(t * 1.7) + Math.sin(t * 2.9 + 1.3) * 0.5 + Math.sin(t * 4.7 + 2.1) * 0.25) / 1.75
}

function useAmp(state: State) {
  const ampRef   = useRef(0)
  const spikeRef = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  useFrame((t, dt) => {
    const s = stateRef.current
    let target = 0.08, jitter = 0.02, speed = 1
    if (s === 'listening')     { target = 0.28; jitter = 0.12; speed = 2.2 }
    else if (s === 'thinking') { target = 0.45; jitter = 0.06; speed = 1.6 }
    else if (s === 'speaking') { target = 0.72; jitter = 0.22; speed = 3.4 }
    ampRef.current += (target - ampRef.current) * Math.min(1, dt * 5)
    const _wobble = (noise1(t * speed) * 0.5 + 0.5) * jitter
    void _wobble
    spikeRef.current = s === 'speaking'
      ? Math.max(0, Math.sin(t * 11) * Math.sin(t * 4.3)) * 0.8
      : s === 'listening' ? Math.max(0, Math.sin(t * 17) * 0.3) : 0
  })
  return { ampRef, spikeRef }
}

interface Props { state: State; size?: number }

export default function LiquidOrb({ state, size = 200 }: Props) {
  const { ampRef, spikeRef } = useAmp(state)
  const pathRef      = useRef<SVGPathElement>(null)
  const path2Ref     = useRef<SVGPathElement>(null)
  const innerRef     = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useFrame((t) => {
    const amp = ampRef.current
    const N = 64
    const cx = 120, cy = 120
    const baseR = 76
    const ampR  = 18 * amp + 8 * spikeRef.current
    const speed = state === 'speaking' ? 2.6 : state === 'thinking' ? 1.5 : state === 'listening' ? 1.8 : 0.7

    const makePath = (phase: number, freq: number, freq2: number) => {
      let d = ''
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * Math.PI * 2
        const r = baseR
          + Math.sin(a * freq  + t * speed + phase) * ampR
          + Math.sin(a * freq2 + t * speed * 0.7 + phase * 1.3) * ampR * 0.5
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '
      }
      return d + 'Z'
    }

    if (pathRef.current)  pathRef.current.setAttribute('d', makePath(0, 3, 5))
    if (path2Ref.current) path2Ref.current.setAttribute('d', makePath(1.7, 4, 6))
    if (innerRef.current) {
      const s = 1 + amp * 0.1
      innerRef.current.style.transform = `translate(${Math.sin(t * 0.7) * 4}px, ${Math.cos(t * 0.9) * 4}px) scale(${s})`
    }
    if (containerRef.current) {
      const glow = 30 + amp * 60
      containerRef.current.style.filter = `drop-shadow(0 0 ${glow}px rgba(120,170,255,${0.3 + amp * 0.4}))`
    }
  })

  return (
    <div ref={containerRef} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 240 240" width={size} height={size}>
        <defs>
          <radialGradient id="lo-bg" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.95"/>
            <stop offset="35%"  stopColor="#c5d5ff" stopOpacity="0.9"/>
            <stop offset="75%"  stopColor="#6d8ef0" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95"/>
          </radialGradient>
          <radialGradient id="lo-2" cx="60%" cy="60%">
            <stop offset="0%"   stopColor="#a5f3fc" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
          </radialGradient>
          <filter id="lo-blur"><feGaussianBlur stdDeviation="1"/></filter>
        </defs>
        <g ref={innerRef} style={{ transformOrigin: '120px 120px', transition: 'transform 0.2s ease' }}>
          <path ref={path2Ref} fill="url(#lo-2)" opacity="0.8"/>
          <path ref={pathRef}  fill="url(#lo-bg)" filter="url(#lo-blur)"/>
          <ellipse cx="95" cy="85" rx="22" ry="12" fill="#ffffff" opacity="0.55" transform="rotate(-20 95 85)"/>
          <ellipse cx="100" cy="80" rx="8"  ry="4"  fill="#ffffff" opacity="0.9"  transform="rotate(-20 100 80)"/>
        </g>
      </svg>
    </div>
  )
}
