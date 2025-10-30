'use client'

import { useEffect } from 'react'

export default function ContactPage() {
  useEffect(() => {
    window.location.href = '/pasada.design/en/contant-us.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-white">
        <p className="text-lg">Loading Contact page...</p>
      </div>
    </div>
  )
}
