"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Star, Crown, Users } from "lucide-react"
import { cn } from '@/lib/utils'
import Link from "next/link"

export interface PricingPlan {
  id: string
  name: string
  description: string
  pricePerProfile: number
  defaultProfiles: number
  frequency: string
  features: string[]
  popular?: boolean
  current?: boolean
  maxMembers: number
  channels: number
  automations: number
  polarProductId?: string
}

interface PricingPlansProps {
  plans?: PricingPlan[]
  mode?: 'pricing' | 'billing'
  currentPlanId?: string
  onPlanSelect?: (planId: string) => void
  profileCount?: number
}

export const REVIEWFLOW_PLANS: PricingPlan[] = [
  {
    id: 'lite',
    name: 'Lite',
    description: 'For businesses getting started with review monitoring',
    pricePerProfile: 20,
    defaultProfiles: 3,
    frequency: '/ review profile / month',
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
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams that need full review management',
    pricePerProfile: 35,
    defaultProfiles: 3,
    frequency: '/ review profile / month',
    maxMembers: 5,
    channels: 2,
    automations: 2,
    popular: true,
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
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For teams that need AI-powered review management',
    pricePerProfile: 40,
    defaultProfiles: 3,
    frequency: '/ review profile / month',
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
  },
]

function getPlanIcon(planId: string) {
  switch (planId) {
    case 'lite': return Zap
    case 'pro': return Star
    case 'premium': return Crown
    default: return Zap
  }
}

export function PricingPlans({
  plans = REVIEWFLOW_PLANS,
  mode = 'pricing',
  currentPlanId,
  onPlanSelect,
  profileCount = 3,
}: PricingPlansProps) {
  const getButtonText = (plan: PricingPlan) => {
    if (mode === 'billing') {
      if (currentPlanId === plan.id) return 'Current Plan'
      const currentIndex = plans.findIndex(p => p.id === currentPlanId)
      const planIndex = plans.findIndex(p => p.id === plan.id)
      return planIndex > currentIndex ? 'Upgrade' : 'Downgrade'
    }
    return plan.popular ? 'Start Free Trial' : 'Get Started'
  }

  const isCurrentPlan = (plan: PricingPlan) => mode === 'billing' && currentPlanId === plan.id

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const Icon = getPlanIcon(plan.id)
        const totalPrice = plan.pricePerProfile * profileCount
        const isCurrent = isCurrentPlan(plan)

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col",
              plan.popular && "border-primary shadow-lg ring-1 ring-primary/20",
              isCurrent && "border-green-500 bg-green-50/30 dark:bg-green-950/10"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-3 py-1 text-xs font-semibold">Most Popular</Badge>
              </div>
            )}
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-green-500 text-green-600 bg-background">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "rounded-lg p-1.5",
                  plan.id === 'lite' ? "bg-blue-100 text-blue-600" :
                  plan.id === 'pro' ? "bg-primary/10 text-primary" :
                  "bg-yellow-100 text-yellow-600"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Pricing */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.pricePerProfile}</span>
                  <span className="text-sm text-muted-foreground">{plan.frequency}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">${totalPrice} / month</span>
                  {' '}for {profileCount} profiles
                </div>
              </div>

              {/* Key limits */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {plan.maxMembers} members
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {plan.channels} channel{plan.channels > 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {plan.automations} automation{plan.automations > 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className={cn(
                    "flex items-start gap-2 text-sm",
                    feature.startsWith("Everything") ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {!feature.startsWith("Everything") && (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              {mode === 'billing' ? (
                <Button
                  className={cn("w-full gap-2", isCurrent && "opacity-50 cursor-not-allowed")}
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && onPlanSelect?.(plan.id)}
                >
                  {isCurrent ? (
                    <><Check className="h-4 w-4" />{getButtonText(plan)}</>
                  ) : (
                    <><Zap className="h-4 w-4" />{getButtonText(plan)}</>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/sign-up">
                    <Zap className="h-4 w-4" />
                    {getButtonText(plan)}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
