"use client"

import { Check, Zap, Star, Crown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    id: 'lite',
    name: 'Lite',
    icon: Zap,
    description: 'For businesses getting started with review monitoring',
    pricePerProfile: 20,
    annualPricePerProfile: 16,
    defaultProfiles: 3,
    maxMembers: 2,
    channels: 1,
    automations: 1,
    features: [
      '3 review profiles included',
      'Access, search & export all past reviews',
      'Track & send new reviews to Slack, Email, MS Teams or Zapier',
      'Filter notifications by language, source, and keyword',
      'Build custom reports',
      '1 channel & automation flow per review profile',
      '2 team members',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    description: 'For growing teams that need full review management',
    pricePerProfile: 35,
    annualPricePerProfile: 28,
    defaultProfiles: 3,
    maxMembers: 5,
    channels: 2,
    automations: 2,
    features: [
      'Everything in Lite, plus:',
      'Advanced review monitoring: replies, updates & deletions',
      'Reply to reviews from ReviewFlow & Slack with AI suggestions',
      'Review widgets to showcase your best reviews',
      'Automate daily, weekly or monthly reports',
      'Magic review collection links & QR codes',
      '2 channels & automation flows per review profile',
      '5 team members',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    description: 'For teams that need AI-powered review management',
    pricePerProfile: 40,
    annualPricePerProfile: 32,
    defaultProfiles: 3,
    maxMembers: 15,
    channels: 5,
    automations: 5,
    features: [
      'Everything in Pro, plus:',
      'AI or Template Auto-replies',
      'Review collection forms',
      'AI Sentiment Analysis',
      'Language detection & automated translation',
      '5 channels & automation flows per review profile',
      '15 team members',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [profileCount, setProfileCount] = useState(3)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Pricing Plans</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, per-profile pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Pay only for the review profiles you need. Start with 3 and scale as you grow.
            14-day free trial, no credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              type="single"
              value={isYearly ? "yearly" : "monthly"}
              onValueChange={(value) => setIsYearly(value === "yearly")}
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Annually
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Save 20%</span> on annual billing
          </p>

          {/* Profile Count Selector */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-sm text-muted-foreground">Review profiles:</span>
            <div className="flex items-center gap-2">
              {[1, 3, 5, 10, 20].map(count => (
                <button
                  key={count}
                  onClick={() => setProfileCount(count)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    profileCount === count
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => {
                const pricePerProfile = isYearly ? plan.annualPricePerProfile : plan.pricePerProfile
                const totalPrice = pricePerProfile * profileCount
                const Icon = plan.icon

                return (
                  <div
                    key={index}
                    className={`p-8 grid grid-rows-subgrid row-span-5 gap-4 ${
                      plan.popular
                        ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                        : ''
                    }`}
                  >
                    {/* Plan Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`rounded-lg p-1.5 ${
                          plan.id === 'lite' ? 'bg-blue-100 text-blue-600' :
                          plan.id === 'pro' ? 'bg-primary/10 text-primary' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-medium tracking-tight">{plan.name}</div>
                        {plan.popular && <Badge className="text-xs">Most Popular</Badge>}
                      </div>
                      <div className="text-muted-foreground text-balance text-sm">{plan.description}</div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${pricePerProfile}</span>
                        <span className="text-muted-foreground text-sm">/ profile / month</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total: <span className="font-semibold text-foreground">${totalPrice}/mo</span>
                        {' '}for {profileCount} profile{profileCount !== 1 ? "s" : ""}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Users className="h-3 w-3" />
                          {plan.maxMembers} members
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {plan.channels} channel{plan.channels > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                      <Button
                        className={`w-full cursor-pointer my-2 gap-2 ${
                          plan.popular
                            ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                            : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                        }`}
                        variant={plan.popular ? 'default' : 'secondary'}
                        asChild
                      >
                        <Link href="/sign-up">
                          <Zap className="h-4 w-4" />
                          {plan.cta}
                        </Link>
                      </Button>
                    </div>

                    {/* Features */}
                    <div>
                      <ul role="list" className="space-y-2.5 text-sm">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className={`flex items-start gap-2.5 ${
                            feature.startsWith("Everything") ? "font-medium text-foreground" : "text-muted-foreground"
                          }`}>
                            {!feature.startsWith("Everything") && (
                              <Check className="text-green-500 size-4 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            )}
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            All plans include a <strong>14-day free trial</strong>. No credit card required.
          </p>
          <p className="text-muted-foreground text-sm">
            Need more than 20 profiles or custom enterprise features?{' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer text-sm" asChild>
              <a href="#contact">Contact us →</a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
