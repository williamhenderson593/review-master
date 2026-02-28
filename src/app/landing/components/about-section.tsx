"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { ArrowRight, Shield, Zap, BarChart3, Users } from 'lucide-react'

const values = [
  {
    icon: Zap,
    title: 'Unified Inbox',
    description: 'All reviews from all platforms in one place. No more checking 15 tabs every morning. Filter, search, and respond from a single dashboard.'
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    description: 'Sentiment analysis, topic extraction, and trend charts powered by AI. Know exactly what customers love and what needs fixing — across every platform.'
  },
  {
    icon: Shield,
    title: 'Reputation Protection',
    description: 'Smart campaigns route unhappy customers to private feedback before they post publicly. Protect your rating while still hearing honest feedback.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Assign reviews, share testimonials with sales, and celebrate 5-star reviews in Slack. Reviews become a team sport, not a solo chore.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About ReviewFlow
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Built for SaaS and B2B teams who care about reputation
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            ReviewFlow was created to solve the chaos of managing reviews across dozens of platforms.
            We give your team a single source of truth for every review, every platform, and every customer — so you can focus on growing your business, not chasing reviews.
          </p>
        </div>

        {/* Modern Values Grid with Enhanced Design */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <value.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">Trusted by data teams at startups and enterprises alike</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <a href="#pricing">
                View Pricing
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
