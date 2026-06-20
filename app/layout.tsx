import type { Metadata } from 'next'
import './globals.css'
import PublicShell from '@/components/layout/PublicShell'
import { BioModel } from '@/lib/models/BioModel'

export async function generateMetadata(): Promise<Metadata> {
  const bio = await BioModel.get().catch(() => null)
  const photo = bio?.photoUrl ?? ''
  const ogUrl = `/api/og${photo ? `?photo=${encodeURIComponent(photo)}` : ''}`

  return {
    metadataBase: new URL('https://francauvere.dev'),
    title: {
      default: 'Franca Uvere — Software & Automation Engineer',
      template: '%s | Franca Uvere',
    },
    description: 'Full-stack & backend engineer based in Lagos, Nigeria. Building scalable systems with Python, React, and Node.js.',
    keywords: ['software engineer', 'backend engineer', 'full-stack', 'Python', 'React', 'Node.js', 'Lagos', 'Nigeria', 'automation'],
    authors: [{ name: 'Franca Uvere' }],
    creator: 'Franca Uvere',
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      siteName: 'Franca Uvere',
      title: 'Franca Uvere — Software & Automation Engineer',
      description: 'Full-stack & backend engineer based in Lagos, Nigeria.',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: 'Franca Uvere' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Franca Uvere — Software & Automation Engineer',
      description: 'Full-stack & backend engineer based in Lagos, Nigeria.',
      images: [ogUrl],
    },
    robots: { index: true, follow: true },
  }
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
