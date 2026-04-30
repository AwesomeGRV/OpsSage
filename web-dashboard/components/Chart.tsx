'use client'

import { useEffect, useRef } from 'react'

interface ChartProps {
  data: number[]
  color?: string
  height?: number
}

export function LineChart({ data, color = '#3B82F6', height = 100 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = height * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, height)

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, color + '20')
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.offsetWidth, height)

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const stepX = canvas.offsetWidth / (data.length - 1)
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1

    data.forEach((value, index) => {
      const x = index * stepX
      const y = height - ((value - minValue) / range) * height * 0.8 - height * 0.1
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw area under line
    ctx.lineTo(canvas.offsetWidth, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height)
    areaGradient.addColorStop(0, color + '30')
    areaGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = areaGradient
    ctx.fill()

    // Draw points
    ctx.fillStyle = color
    data.forEach((value, index) => {
      const x = index * stepX
      const y = height - ((value - minValue) / range) * height * 0.8 - height * 0.1
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [data, color, height])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  )
}

export function BarChart({ data, color = '#3B82F6', height = 100 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = height * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, height)

    const barWidth = (canvas.offsetWidth / data.length) * 0.6
    const barSpacing = (canvas.offsetWidth / data.length) * 0.4
    const maxValue = Math.max(...data)

    data.forEach((value, index) => {
      const x = index * (barWidth + barSpacing) + barSpacing / 2
      const barHeight = (value / maxValue) * height * 0.8
      const y = height - barHeight

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color + '80')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }, [data, color, height])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  )
}

export function PieChart({ data, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], height = 100 }: ChartProps & { colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = height * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, height)

    const centerX = canvas.offsetWidth / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    const total = data.reduce((sum, value) => sum + value, 0)
    let currentAngle = -Math.PI / 2

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2
      
      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = colors[index % colors.length]
      ctx.fill()

      currentAngle += sliceAngle
    })
  }, [data, colors, height])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  )
}
