import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;500;600&family=Poppins:wght@300;400;500&family=Inter:wght@300;400;500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
        <link href="/pasada.design/css/landing-mobile-fix.css" rel="stylesheet" type="text/css" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
