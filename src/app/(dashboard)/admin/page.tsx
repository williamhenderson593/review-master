"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2, Users, CreditCard, Key, Mail, Star, Globe, MessageSquare,
  Zap, Send, Plug, TrendingUp, TrendingDown, AlertCircle, ThumbsUp,
  ThumbsDown, Minus, ArrowRight, BarChart3, Activity, Shield
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

interface AdminStats {
  totalBusinesses: number
  totalUsers: number
  activeSubscriptions: number
  activeApiKeys: number
  pendingInvites: number
  newBusinessesThisMonth: number
  totalReviews: number
  totalProfiles: number
  avgRating: string
  needsAction: number
  newReviewsThisMonth: number
  totalCampaigns: number
  activeCampaigns: number
  totalAutomations: number
  activeAutomations: number
  totalIntegrations: number
}

interface AdminData {
  stats: AdminStats
  sentimentBreakdown: Array<{ sentiment: string | null; count: number }>
  platformBreakdown: Array<{ platform: string; count: number }>
  planBreakdown: Array<{ status: string; count: number }>
  topBusinessesByReviews: Array<{
    clientId: string
    clientName: string | null
    reviewCount: number
    avgRating: string | null
  }>
  monthlyGrowth: Array<{ month: string; count: number }>
  monthlyBusinessGrowth: Array<{ month: string; count: number }>
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
}

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6"]

function StatCard({
  title, value, subtitle, icon: Icon, color, href, trend
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  href?: string
  trend?: { value: string; up: boolean }
}) {
  const content = (
    <Card className={`hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.up ? "text-green-600" : "text-red-600"}`}>
                {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend.value}
              </div>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/admin/stats")
        if (res.status === 403) {
          toast.error("Access denied. Super admin privileges required.")
          return
        }
        if (!res.ok) throw new Error("Failed to fetch stats")
        const d = await res.json()
        setData(d)
      } catch {
        toast.error("Failed to load admin stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const stats = data?.stats

  // Derived
  const positiveCount = data?.sentimentBreakdown.find(s => s.sentiment === "positive")?.count || 0
  const negativeCount = data?.sentimentBreakdown.find(s => s.sentiment === "negative")?.count || 0
  const totalSentiment = stats?.totalReviews || 1
  const positivePercent = Math.round((positiveCount / totalSentiment) * 100)

  const sentimentChartData = data?.sentimentBreakdown.map(s => ({
    name: s.sentiment ? s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1) : "Unknown",
    value: s.count,
    color: SENTIMENT_COLORS[s.sentiment as keyof typeof SENTIMENT_COLORS] || "#94a3b8",
  })) || []

  // Estimated MRR (based on active subscriptions × avg plan price)
  const estimatedMRR = (stats?.activeSubscriptions || 0) * 35 * 3 // avg Pro plan × 3 profiles

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
          </div>
          <p className="text-muted-foreground">
            Platform-wide overview of all businesses, users, reviews, and revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/admin/businesses">
              <Building2 className="h-4 w-4" />
              Businesses
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/admin/users">
              <Users className="h-4 w-4" />
              Users
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-5 h-28" />
            </Card>
          ))}
        </div>
      ) : !stats ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Unable to load stats. Make sure you have super admin access.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Platform Stats */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Platform Overview</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Businesses"
                value={stats.totalBusinesses.toLocaleString()}
                subtitle={`+${stats.newBusinessesThisMonth} this month`}
                icon={Building2}
                color="bg-blue-500"
                href="/admin/businesses"
                trend={{ value: `${stats.newBusinessesThisMonth} new this month`, up: stats.newBusinessesThisMonth > 0 }}
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                subtitle={`${stats.pendingInvites} pending invites`}
                icon={Users}
                color="bg-purple-500"
                href="/admin/users"
              />
              <StatCard
                title="Active Subscriptions"
                value={stats.activeSubscriptions.toLocaleString()}
                subtitle="Paying customers"
                icon={CreditCard}
                color="bg-green-500"
              />
              <StatCard
                title="Est. MRR"
                value={`$${estimatedMRR.toLocaleString()}`}
                subtitle="Monthly recurring revenue"
                icon={TrendingUp}
                color="bg-yellow-500"
              />
            </div>
          </div>

          {/* Review Stats */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Review Platform</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Reviews"
                value={stats.totalReviews.toLocaleString()}
                subtitle={`+${stats.newReviewsThisMonth} this month`}
                icon={MessageSquare}
                color="bg-blue-500"
                trend={{ value: `${stats.newReviewsThisMonth} new this month`, up: stats.newReviewsThisMonth > 0 }}
              />
              <StatCard
                title="Review Profiles"
                value={stats.totalProfiles.toLocaleString()}
                subtitle="Connected platforms"
                icon={Globe}
                color="bg-indigo-500"
              />
              <StatCard
                title="Platform Avg Rating"
                value={`${stats.avgRating} ★`}
                subtitle={`${positivePercent}% positive sentiment`}
                icon={Star}
                color={parseFloat(stats.avgRating) >= 4 ? "bg-green-500" : "bg-orange-500"}
              />
              <StatCard
                title="Needs Action"
                value={stats.needsAction.toLocaleString()}
                subtitle="Reviews requiring response"
                icon={AlertCircle}
                color={stats.needsAction === 0 ? "bg-green-500" : "bg-red-500"}
              />
            </div>
          </div>

          {/* Automation Stats */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Automation & Campaigns</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Campaigns"
                value={stats.activeCampaigns}
                subtitle={`${stats.totalCampaigns} total`}
                icon={Send}
                color="bg-green-500"
              />
              <StatCard
                title="Active Automations"
                value={stats.activeAutomations}
                subtitle={`${stats.totalAutomations} total`}
                icon={Zap}
                color="bg-orange-500"
              />
              <StatCard
                title="Integrations"
                value={stats.totalIntegrations}
                subtitle="Connected tools"
                icon={Plug}
                color="bg-purple-500"
              />
              <StatCard
                title="API Keys"
                value={stats.activeApiKeys}
                subtitle="Active keys"
                icon={Key}
                color="bg-gray-600"
              />
            </div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="growth">
            <TabsList>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="businesses">Top Businesses</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>

            {/* Growth Tab */}
            <TabsContent value="growth" className="space-y-4 mt-4">
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Review Volume Growth</CardTitle>
                    <CardDescription>Monthly reviews across all businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data?.monthlyGrowth.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                        No data yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data?.monthlyGrowth || []}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} name="Reviews" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Business Growth</CardTitle>
                    <CardDescription>New businesses registered per month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data?.monthlyBusinessGrowth.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                        No data yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data?.monthlyBusinessGrowth || []}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="New Businesses" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4 mt-4">
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Sentiment Distribution</CardTitle>
                    <CardDescription>Platform-wide review sentiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentimentChartData.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={sentimentChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                              {sentimentChartData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col justify-center space-y-3">
                          {[
                            { label: "Positive", count: positiveCount, color: "bg-green-500", icon: ThumbsUp },
                            { label: "Neutral", count: data?.sentimentBreakdown.find(s => s.sentiment === "neutral")?.count || 0, color: "bg-gray-400", icon: Minus },
                            { label: "Negative", count: negativeCount, color: "bg-red-500", icon: ThumbsDown },
                          ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                              <div className="flex-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium">{label}</span>
                                  <span className="text-muted-foreground">{count} ({Math.round((count / totalSentiment) * 100)}%)</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                  <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round((count / totalSentiment) * 100)}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Reviews by Platform</CardTitle>
                    <CardDescription>Distribution across review platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!data?.platformBreakdown.length ? (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.platformBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis dataKey="platform" type="category" className="text-xs" width={80} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Top Businesses Tab */}
            <TabsContent value="businesses" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Businesses by Reviews</CardTitle>
                      <CardDescription>Businesses with the most reviews on the platform</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <Link href="/admin/businesses">
                        <ArrowRight className="h-4 w-4" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!data?.topBusinessesByReviews.length ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No data</div>
                  ) : (
                    <div className="space-y-3">
                      {data.topBusinessesByReviews.map((biz, i) => {
                        const maxCount = data.topBusinessesByReviews[0]?.reviewCount || 1
                        const percent = Math.round((biz.reviewCount / maxCount) * 100)
                        return (
                          <div key={biz.clientId} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Link href={`/admin/businesses/${biz.clientId}`} className="text-sm font-medium hover:text-primary truncate">
                                  {biz.clientName || "Unknown"}
                                </Link>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {biz.avgRating && (
                                    <span className="text-xs text-muted-foreground">★ {biz.avgRating}</span>
                                  )}
                                  <span className="text-xs font-medium">{biz.reviewCount}</span>
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${percent}%`, opacity: 1 - i * 0.08 }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="mt-4">
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>Breakdown of subscription statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!data?.planBreakdown.length ? (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No subscriptions yet</div>
                    ) : (
                      <div className="space-y-3">
                        {data.planBreakdown.map((plan, i) => {
                          const total = data.planBreakdown.reduce((sum, p) => sum + p.count, 0)
                          const percent = Math.round((plan.count / total) * 100)
                          const statusColors: Record<string, string> = {
                            active: "bg-green-500",
                            trialing: "bg-blue-500",
                            cancelled: "bg-red-500",
                            past_due: "bg-orange-500",
                          }
                          return (
                            <div key={plan.status} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[plan.status] || "bg-gray-400"}`} />
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium capitalize">{plan.status}</span>
                                  <span className="text-muted-foreground">{plan.count} ({percent}%)</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${statusColors[plan.status] || "bg-gray-400"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Revenue Estimate</CardTitle>
                    <CardDescription>Estimated monthly recurring revenue by plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { plan: "Lite", price: 20, profiles: 3, color: "bg-blue-500" },
                        { plan: "Pro", price: 35, profiles: 3, color: "bg-primary" },
                        { plan: "Premium", price: 40, profiles: 3, color: "bg-yellow-500" },
                      ].map(({ plan, price, profiles, color }) => {
                        const planRevenue = Math.round((stats.activeSubscriptions / 3)) * price * profiles
                        return (
                          <div key={plan} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color}`} />
                              <span className="text-sm font-medium">{plan}</span>
                              <span className="text-xs text-muted-foreground">${price}/profile/mo</span>
                            </div>
                            <span className="text-sm font-bold">${planRevenue.toLocaleString()}/mo</span>
                          </div>
                        )
                      })}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Est. MRR</span>
                        <span className="text-lg font-bold text-green-600">${estimatedMRR.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Admin Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                {[
                  { title: "All Businesses", href: "/admin/businesses", icon: Building2, desc: `${stats.totalBusinesses} total` },
                  { title: "All Users", href: "/admin/users", icon: Users, desc: `${stats.totalUsers} total` },
                  { title: "Review Profiles", href: "/review-profiles", icon: Globe, desc: `${stats.totalProfiles} connected` },
                  { title: "All Reviews", href: "/reviews", icon: MessageSquare, desc: `${stats.totalReviews} total` },
                ].map(item => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
