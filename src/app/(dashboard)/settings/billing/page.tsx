"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PricingPlans, REVIEWFLOW_PLANS } from "@/components/pricing-plans"
import { BillingHistoryCard } from "./components/billing-history-card"
import {
  Crown, AlertTriangle, CreditCard, ExternalLink, Zap, Users,
  Globe, CheckCircle2, RefreshCw, Plus, Minus
} from "lucide-react"
import { toast } from "sonner"
import billingHistoryData from "./data/billing-history.json"

export default function BillingSettings() {
  const [currentPlanId, setCurrentPlanId] = useState("lite")
  const [profileCount, setProfileCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const currentPlan = REVIEWFLOW_PLANS.find(p => p.id === currentPlanId) || REVIEWFLOW_PLANS[0]
  const totalPrice = currentPlan.pricePerProfile * profileCount

  async function handlePlanSelect(planId: string) {
    if (planId === currentPlanId) return
    setCheckoutLoading(planId)
    try {
      // Polar.sh checkout integration
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, profileCount }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.error) {
        toast.error(data.error)
      } else {
        // Simulate plan change for demo
        setCurrentPlanId(planId)
        toast.success(`Plan updated to ${REVIEWFLOW_PLANS.find(p => p.id === planId)?.name}!`)
      }
    } catch {
      toast.error("Failed to process plan change")
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handleManageBilling() {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/billing/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, "_blank")
      } else {
        toast.info("Billing portal not configured. Set POLAR_ACCESS_TOKEN to enable.")
      }
    } catch {
      toast.error("Failed to open billing portal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription, review profiles, and billing information.
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Current Plan
              </CardTitle>
              <Badge variant={currentPlanId === "premium" ? "default" : "secondary"} className="capitalize">
                {currentPlan.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">${totalPrice}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">${currentPlan.pricePerProfile} × {profileCount} review profiles</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next billing</p>
                <p className="text-sm font-medium">March 28, 2026</p>
              </div>
            </div>

            <Separator />

            {/* Plan limits */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold">{profileCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Review Profiles</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold">{currentPlan.maxMembers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold">{currentPlan.channels}</span>
                </div>
                <p className="text-xs text-muted-foreground">Channels / Profile</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleManageBilling}
                disabled={loading}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Manage Billing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Count Adjuster */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review Profiles</CardTitle>
            <CardDescription>Adjust the number of review profiles in your plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setProfileCount(Math.max(1, profileCount - 1))}
                disabled={profileCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-3xl font-bold">{profileCount}</p>
                <p className="text-xs text-muted-foreground">profiles</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setProfileCount(profileCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per profile</span>
                <span className="font-medium">${currentPlan.pricePerProfile}/mo</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>${currentPlan.pricePerProfile * profileCount}/mo</span>
              </div>
            </div>
            <Button className="w-full gap-2" size="sm" onClick={() => handlePlanSelect(currentPlanId)}>
              <CheckCircle2 className="h-4 w-4" />
              Update Profiles
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Change Plan</h2>
          <p className="text-sm text-muted-foreground">
            Pricing is per review profile per month. Adjust the number of profiles above.
          </p>
        </div>
        <PricingPlans
          mode="billing"
          currentPlanId={currentPlanId}
          onPlanSelect={handlePlanSelect}
          profileCount={profileCount}
        />
      </div>

      {/* Billing History */}
      <BillingHistoryCard history={billingHistoryData} />

      {/* Polar.sh Integration Note */}
      <Card className="border-dashed">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Powered by Polar.sh</p>
              <p className="text-xs text-muted-foreground mt-1">
                Billing is handled securely through Polar.sh. Set <code className="bg-muted px-1 rounded text-xs">POLAR_ACCESS_TOKEN</code> and <code className="bg-muted px-1 rounded text-xs">POLAR_ORGANIZATION_ID</code> in your environment to enable live checkout and billing portal.
              </p>
              <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs gap-1" asChild>
                <a href="https://polar.sh" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  Learn about Polar.sh
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
