"use client"

import { LandingNavbar } from './navbar'
import { LandingFooter } from './footer'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LegalPageLayoutProps {
  badge: string
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalPageLayout({ badge, title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/landing"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-12">
            <Badge variant="outline" className="mb-4">{badge}</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">{title}</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {children}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
