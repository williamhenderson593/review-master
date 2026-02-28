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
    title: 'Unified Run Data',
    description: 'Data from multiple runs of the same actor is combined into one dataset — no manual merging, no scattered files. A feature most platforms don\'t offer.'
  },
  {
    icon: BarChart3,
    title: 'Project Lifecycle',
    description: 'Connect actors to projects with defined timelines. Run them on schedule or manually, and close projects when the work is done.'
  },
  {
    icon: Shield,
    title: 'Flexible Data Access',
    description: 'Access your data anywhere via REST API, or export to Excel, CSV, and JSON. Your data is always portable and ready for analysis.'
  },
  {
    icon: Users,
    title: 'Public & Private Actors',
    description: 'Sync and run public Apify actors from the store alongside your own private actors — all managed from one platform.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About Annalytick
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Built for data teams who move fast
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Annalytick was created to solve the chaos of managing web scraping at scale.
            We give your team a single source of truth for every actor, run, and data point — so you can focus on insights, not infrastructure.
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
