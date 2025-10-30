'use client'

import { useEffect } from 'react'

export default function AboutPage() {
  useEffect(() => {
    window.location.href = '/pasada.design/en/about.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-white">
        <p className="text-lg">Loading About page...</p>
      </div>
    </div>
  )
}
