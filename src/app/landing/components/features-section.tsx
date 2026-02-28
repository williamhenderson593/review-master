"use client"

import {
  Star,
  BarChart3,
  Zap,
  Send,
  Code2,
  Plug,
  MessageSquare,
  Globe,
  Shield,
  Users,
  Bell,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const mainFeatures = [
  {
    icon: Globe,
    title: 'Review Aggregation',
    description: 'Connect Google, TripAdvisor, G2, Capterra, Trustpilot, App Store, Play Store, and 8 more platforms. All reviews in one unified inbox.'
  },
  {
    icon: MessageSquare,
    title: 'Respond & Manage',
    description: 'Reply to reviews directly from the dashboard. AI-powered reply suggestions based on rating, sentiment, and platform. Flag, tag, and track action items.'
  },
  {
    icon: BarChart3,
    title: 'Sentiment Analytics',
    description: 'AI-powered sentiment analysis, topic extraction, and trend charts. See what customers love and what needs improvement — across every platform.'
  },
  {
    icon: Send,
    title: 'Review Generation',
    description: 'Send review requests via email, SMS, or magic links. Reputation protection routes unhappy customers to private feedback before they post publicly.'
  }
]

const secondaryFeatures = [
  {
    icon: Zap,
    title: 'Smart Automations',
    description: 'Auto-alert your team on low ratings, tag negative reviews, post to Slack — all triggered automatically when new reviews arrive.'
  },
  {
    icon: Code2,
    title: 'Embeddable Widgets',
    description: 'Add a carousel, wall of love, or rating badge to your website. Auto-updates as new reviews come in. Zero performance impact.'
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect Slack, Gmail, Outlook, Microsoft Teams, HubSpot, Salesforce, Zapier, and more. Reviews flow into your existing workflow.'
  },
  {
    icon: Shield,
    title: 'Competitor Tracking',
    description: 'Monitor your competitors\' reviews across platforms. Benchmark your ratings and review volume against the competition.'
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Instant email alerts for new reviews, low ratings, and negative sentiment. Weekly digest with your review performance summary.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Role-based access for Admin, Editor, and Viewer. Assign reviews to team members. Audit log of all actions.'
  },
  {
    icon: TrendingUp,
    title: 'Review Campaigns',
    description: 'Create targeted campaigns to collect reviews from your customers. Track impressions, clicks, and conversions in a review funnel.'
  },
  {
    icon: Star,
    title: 'Testimonial Library',
    description: 'Searchable internal library of all reviews and quotes. Share with your sales and marketing team for proposals and decks.'
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
            Everything you need to win with reviews
          </h2>
          <p className="text-lg text-muted-foreground">
            From aggregation to generation, analytics to automation — ReviewFlow gives your team complete control over your online reputation.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryFeatures.map((feature, index) => (
            <div key={index} className="flex flex-col gap-3 p-4 rounded-xl border border-border/40 hover:border-primary/20 transition-colors bg-background/50">
              <div className="p-2 bg-primary/10 rounded-lg w-fit">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
