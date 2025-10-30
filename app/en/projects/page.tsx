'use client'

import { useEffect } from 'react'

export default function ProjectsPage() {
  useEffect(() => {
    window.location.href = '/pasada.design/en/projects.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-white">
        <p className="text-lg">Loading Projects...</p>
      </div>
    </div>
  )
}
