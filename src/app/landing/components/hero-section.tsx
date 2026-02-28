"use client"

import Link from 'next/link'
import { ArrowRight, Star, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DotPattern } from '@/components/dot-pattern'

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground gap-2">
              <Zap className="w-3 h-3 fill-current" />
              AI-powered reply suggestions now available
              <ArrowRight className="w-3 h-3" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            All Your Reviews.
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}One Dashboard.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            ReviewFlow aggregates reviews from Google, TripAdvisor, G2, Capterra, Trustpilot, and 10+ more platforms.
            Monitor, respond, analyze, and generate more reviews — all in one place.
          </p>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mb-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-500" />
              Setup in 5 minutes
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <a href="#features">
                See All Features
              </a>
            </Button>
          </div>
        </div>

        {/* Hero Visual — Review Cards */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="relative group">
            {/* Top background glow effect */}
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>

            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              {/* Dashboard preview */}
              <img
                src="/dash-1-light.jpeg"
                alt="ReviewFlow Dashboard"
                className="w-full rounded-xl object-cover block dark:hidden"
              />
              <img
                src="/dash-1-dark.png"
                alt="ReviewFlow Dashboard - Dark Mode"
                className="w-full rounded-xl object-cover hidden dark:block"
              />
              {/* Bottom fade effect */}
              <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 lg:h-48 bg-gradient-to-b from-background/0 via-background/70 to-background rounded-b-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
