'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function WorkDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    // Redirect to the specific work detail HTML page
    window.location.href = `/pasada.design/works/${slug}.html`
  }, [slug])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-white">
        <p className="text-lg">Loading project: {slug}...</p>
      </div>
    </div>
  )
}
