"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    description: 'For small businesses getting started with review management',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 review profiles',
      '2 platforms connected',
      'Unified review inbox',
      'Basic analytics',
      '1 team member',
      '1 campaign',
      'Email notifications',
      'Community support'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Growth',
    description: 'For growing SaaS and B2B teams that need full review management',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '15 review profiles',
      'All 15+ platforms',
      'AI reply suggestions',
      'Sentiment analytics',
      'Up to 5 team members',
      'Unlimited campaigns',
      'Review widgets (3)',
      'Slack & email integrations',
      'Competitor tracking (3)',
      'Weekly digest emails',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    popular: true,
    includesPrevious: 'Everything in Starter, plus'
  },
  {
    name: 'Enterprise',
    description: 'For agencies and large organizations managing multiple brands',
    monthlyPrice: 149,
    yearlyPrice: 119,
    features: [
      'Unlimited review profiles',
      'Unlimited team members',
      'Multiple brand workspaces',
      'SSO / SAML authentication',
      'Custom AI agent profiles',
      'Advanced automations',
      'Unlimited widgets',
      'HubSpot & Salesforce sync',
      'Dedicated account manager',
      'SLA & uptime guarantee',
      'Custom API access'
    ],
    cta: 'Contact Sales',
    popular: false,
    includesPrevious: 'Everything in Growth, plus'
  }
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Pricing Plans</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free and scale as your review management needs grow. No hidden fees — just the tools you need to win more reviews and protect your reputation.
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
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    plan.popular
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                  }`}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg font-medium tracking-tight">{plan.name}</div>
                      {plan.popular && <Badge className="text-xs">Most Popular</Badge>}
                    </div>
                    <div className="text-muted-foreground text-balance text-sm">{plan.description}</div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-4xl font-bold mb-1">
                      {plan.name === 'Starter' ? (
                        '$0'
                      ) : (
                        `$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.name === 'Starter' ? 'Free forever' : plan.name === 'Enterprise' ? 'Per month, billed annually' : 'Per month'}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={`w-full cursor-pointer my-2 ${
                        plan.popular
                          ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                          : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                      }`}
                      variant={plan.popular ? 'default' : 'secondary'}
                      asChild
                    >
                      <Link href={plan.name === 'Enterprise' ? '#contact' : '/sign-up'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.includesPrevious && (
                        <li className="flex items-center gap-3 font-medium">
                          {plan.includesPrevious}:
                        </li>
                      )}
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="text-muted-foreground size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trial Note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            All paid plans include a <strong>14-day free trial</strong>. No credit card required.
            {' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer text-sm" asChild>
              <a href="#contact">Questions? Talk to us →</a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
