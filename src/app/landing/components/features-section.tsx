"use client"

import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Database,
  FolderKanban,
  DollarSign,
  Calendar,
  Shield,
  Globe,
  FileDown,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: FolderKanban,
    title: 'Project-Based Management',
    description: 'Connect actors to projects that run for a defined period. Manage timelines, track progress, and close projects when complete.'
  },
  {
    icon: Calendar,
    title: 'Scheduling & Manual Runs',
    description: 'Schedule actors to run automatically on a cadence, or trigger them manually from the platform — no Apify console needed.'
  },
  {
    icon: DollarSign,
    title: 'Cost Tracking',
    description: 'Monitor Apify usage costs per actor, per project, and across your entire organization in real time.'
  },
  {
    icon: Globe,
    title: 'Public Actor Support',
    description: 'Sync and run any public Apify actor from the store alongside your own private actors — all from one dashboard.'
  }
]

const secondaryFeatures = [
  {
    icon: Layers,
    title: 'Combined Run Data',
    description: 'Data from multiple runs of the same actor is automatically merged into one unified dataset — a feature most platforms simply don\'t offer.'
  },
  {
    icon: FileDown,
    title: 'API & Export Access',
    description: 'Access your data anywhere via REST API, or export to Excel, CSV, and JSON with a single click.'
  },
  {
    icon: Users,
    title: 'Team Workspaces',
    description: 'Invite members, manage roles, and collaborate on scraping projects together across your organization.'
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'API keys encrypted, role-based access, and audit logs for every action.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to manage web scraping at scale
          </h2>
          <p className="text-lg text-muted-foreground">
            From actor orchestration to data collection and cost analytics — Annalytick gives your team complete visibility and control over every scraping workflow.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Project management dashboard"
            direction="left"
          />
          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Manage scraping as projects, not loose actors
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Connect actors to projects with defined timelines. Schedule runs or trigger them manually. Sync public Apify actors alongside your own — all from one dashboard.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <Link href="/auth/sign-up" className='flex items-center'>
                  Start Free Trial
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="#pricing">
                  View Plans
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                One dataset from every run — not scattered files
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Unlike other platforms, Annalytick combines data from multiple runs of the same actor into a single, queryable dataset. Access it via API or export to Excel, CSV, and JSON.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href="#about" className='flex items-center'>
                  Learn More
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="#contact">
                  Talk to Sales
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Data collection dashboard"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
