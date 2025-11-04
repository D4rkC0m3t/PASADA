'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PremiumStatCardProps {
  icon: LucideIcon
  value: number | string
  label: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  status?: string
  iconColor?: string
  delay?: number
}

export default function PremiumStatCard({
  icon: Icon,
  value,
  label,
  trend,
  status,
  iconColor = '#d4a574',
  delay = 0
}: PremiumStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Counter animation
  useEffect(() => {
    if (typeof value === 'number') {
      setIsAnimating(true)
      const duration = 1500
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
          setIsAnimating(false)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [value])

  const getTrendColor = () => {
    if (!trend) return ''
    switch (trend.direction) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay,
        type: 'spring',
        stiffness: 100
      }}
      className="glass-stat-card group relative overflow-hidden"
    >
      {/* Frosted overlay layer */}
      <div className="absolute top-0 left-0 right-0 bottom-0 rounded-[20px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08)_0%,transparent_50%)] pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4AF37] via-[#f5c542] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ zIndex: 1 }} />

      {/* Icon with glow */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 relative"
        style={{
          background: `${iconColor}14`,
          boxShadow: `0 0 20px ${iconColor}20`,
          zIndex: 2
        }}
      >
        <Icon
          className="w-6 h-6 transition-all duration-300 group-hover:brightness-125"
          style={{ color: iconColor }}
        />
      </motion.div>

      {/* Value with counter animation */}
      <motion.div
        className="hero-number text-5xl mb-2 tabular-nums leading-tight relative"
        style={{ zIndex: 2 }}
        animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {typeof value === 'number' ? displayValue.toLocaleString() : value}
      </motion.div>

      {/* Label */}
      <div className="label-text text-sm relative" style={{ zIndex: 2 }}>
        {label}
      </div>

      {/* Footer with trend and status */}
      {(trend || status) && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs relative" style={{ 
          borderColor: 'rgba(255, 255, 255, 0.06)',
          zIndex: 2
        }}>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getTrendColor()} bg-current bg-opacity-10 font-semibold glass-badge`}>
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
          {status && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(74,222,128,1)]" />
              <span className="meta-text font-medium">{status}</span>
            </div>
          )}
        </div>
      )}

      {/* Ambient glow on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ zIndex: 0 }} />
    </motion.div>
  )
}
