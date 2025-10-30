'use client'

import { useEffect } from 'react'

export default function EnPage() {
  useEffect(() => {
    // Redirect to the static PASADA website
    window.location.href = '/pasada.design/en/homepage.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-white">
        <p className="text-lg">Redirecting to PASADA Interior Design...</p>
      </div>
    </div>
  )
}
