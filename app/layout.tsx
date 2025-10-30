import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PASADA CRM - Interior Design Management',
  description: 'Professional quotation and project management system for interior designers',
  keywords: ['interior design', 'CRM', 'quotation', 'project management', 'PASADA'],
  authors: [{ name: 'PASADA Interior Design' }],
  openGraph: {
    title: 'PASADA CRM',
    description: 'Professional interior design management system',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;500;600&family=Poppins:wght@300;400;500&family=Inter:wght@300;400;500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
