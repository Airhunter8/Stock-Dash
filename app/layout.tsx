import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: 'StocFlow — Reinventing Stocks',
  description: 'Reinventing Stocks. Trade, track, and master the market with StocFlow.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>
          {/* Fixed chiaroscuro atmosphere layer — sits behind all page content */}
          <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse 60% 55% at 50% -5%, color-mix(in oklch, var(--primary) 30%, transparent) 0%, transparent 60%),
              radial-gradient(ellipse 90% 35% at 50% -2%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 52%),
              radial-gradient(ellipse 35% 45% at 8%  90%, color-mix(in oklch, var(--primary) 5%, transparent) 0%, transparent 55%),
              radial-gradient(ellipse 110% 110% at 50% 50%, transparent 38%, oklch(0.01 0.001 65 / 0.70) 100%)
            `,
          }} />
          {/* Subtle grid texture */}
          <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none opacity-[0.022]" style={{
            backgroundImage: `
              linear-gradient(var(--primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
