'use client'

import { useEffect, useRef } from 'react'

export default function GridCanvas() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width, height
    let offsetZ = 0
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const config = {
      gridColor: 'rgba(212, 175, 55, 0.15)',
      shimmerColor: '#F9F1D8',
      speed: 2,
      focalLength: 300,
      lineSpacing: 100,
      verticalLineCount: 30,
      verticalLineSpacing: 150,
      maxZ: 2000,
      yOffset: 200,
    }

    const resize = () => {
      width = canvas.parentElement.offsetWidth
      height = canvas.parentElement.offsetHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    const project = (x, y, z) => {
      const perspective = config.focalLength / (config.focalLength + z)
      const cx = width / 2
      const cy = height / 2
      return {
        x: cx + x * perspective,
        y: cy + y * perspective,
        scale: perspective,
      }
    }

    const animate = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      ctx.clearRect(0, 0, width, height)

      offsetZ = (offsetZ + config.speed) % config.lineSpacing

      const cx = width / 2
      const cy = height / 2
      const originX = cx - mouse.x * 200
      const originY = cy - mouse.y * 100
      const horizonY = cy + mouse.y * 50
      const floorY = config.yOffset

      ctx.strokeStyle = config.gridColor
      ctx.lineWidth = 1
      ctx.beginPath()

      for (let i = -config.verticalLineCount; i <= config.verticalLineCount; i++) {
        const x = i * config.verticalLineSpacing
        const p1 = project(x, floorY, -100)
        const p2 = project(x, floorY, config.maxZ)

        const scale1 = config.focalLength / (config.focalLength - 100)
        const screenX1 = cx + x * scale1 - mouse.x * 50
        const screenY1 = cy + floorY * scale1 + mouse.y * 50

        const scale2 = config.focalLength / (config.focalLength + config.maxZ)
        const screenX2 = originX + x * scale2 * 0.1
        const screenY2 = horizonY

        ctx.moveTo(screenX1, screenY1)
        ctx.lineTo(screenX2, screenY2)
      }
      ctx.stroke()

      for (let z = config.lineSpacing - offsetZ; z < config.maxZ; z += config.lineSpacing) {
        const opacity = 1 - z / config.maxZ
        if (opacity <= 0) continue

        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * 0.15})`
        const pLeft = project(-config.verticalLineCount * config.verticalLineSpacing * 2, floorY, z)
        const pRight = project(config.verticalLineCount * config.verticalLineSpacing * 2, floorY, z)
        const yAdjusted = pLeft.y + mouse.y * 50 * (1 - opacity)

        ctx.beginPath()
        ctx.moveTo(0, yAdjusted)
        ctx.lineTo(width, yAdjusted)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = ((e.clientX - rect.left) / width) * 2 - 1
      mouse.targetY = ((e.clientY - rect.top) / height) * 2 - 1
    }

    const handleMouseLeave = () => {
      mouse.targetX = 0
      mouse.targetY = 0
    }

    resize()
    animate()

    const parent = canvas.parentElement
    parent.addEventListener('mousemove', handleMouseMove)
    parent.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', resize)

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove)
      parent.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="z-0 absolute top-0 right-0 bottom-0 left-0 overflow-hidden">
      <canvas ref={canvasRef} className="block opacity-80 mix-blend-screen w-full h-full" id="grid-canvas-hero" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void pointer-events-none"></div>
    </div>
  )
}




