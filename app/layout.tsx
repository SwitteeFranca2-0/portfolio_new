import type { Metadata } from 'next'
import './globals.css'
import PublicShell from '@/components/layout/PublicShell'
import { BioModel } from '@/lib/models/BioModel'

export const metadata: Metadata = {
  title: 'Franca Uvere — Software Engineer',
  description: 'Full-Stack & Backend Engineer based in Lagos, Nigeria. Building scalable systems with Python, React, and Node.js.',
}

const BIO_FALLBACK = { name: 'Franca Uvere', resumeUrl: null as string | null }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const bio = await BioModel.get().catch(() => null) ?? BIO_FALLBACK
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <PublicShell bio={bio}>
          {children}
        </PublicShell>
      </body>
    </html>
  )
}
