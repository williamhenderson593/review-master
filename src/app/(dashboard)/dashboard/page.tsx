"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Star, MessageSquare, TrendingUp, TrendingDown, AlertCircle,
  ThumbsUp, ThumbsDown, Minus, Globe, ArrowRight, Plus,
  Zap, Send, BarChart3
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

interface ReviewStats {
  totalReviews: number
  averageRating: string
  needsAction: number
  recentReviews: number
  sentimentBreakdown: Array<{ sentiment: string | null; count: number }>
  platformBreakdown: Array<{ platform: string; count: number; avgRating: string | null }>
  ratingBreakdown: Array<{ rating: number | null; count: number }>
}

interface Review {
  id: string
  platform: string
  rating: number | null
  body: string | null
  authorName: string | null
  reviewedAt: string | null
  sentiment: string | null
  needsAction: boolean
  profileName: string | null
}

// Mock trend data
const trendData = Array.from({ length: 7 }, (_, i) => ({
  day: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), "EEE"),
  reviews: Math.floor(Math.random() * 15) + 2,
}))

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  )
}

function SentimentIcon({ sentiment }: { sentiment: string | null }) {
  if (sentiment === "positive") return <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
  if (sentiment === "negative") return <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
  return <Minus className="h-3.5 w-3.5 text-gray-400" />
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/reviews/stats").then(r => r.json()),
      fetch("/api/v1/reviews?limit=5").then(r => r.json()),
    ]).then(([statsData, reviewsData]) => {
      setStats(statsData)
      setRecentReviews(reviewsData.reviews || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const positiveCount = stats?.sentimentBreakdown.find(s => s.sentiment === "positive")?.count || 0
  const negativeCount = stats?.sentimentBreakdown.find(s => s.sentiment === "negative")?.count || 0
  const totalSentiment = stats?.totalReviews || 1
  const positivePercent = Math.round((positiveCount / totalSentiment) * 100)

  const topPlatform = stats?.platformBreakdown.sort((a, b) => b.count - a.count)[0]

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your review management overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/review-profiles" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Profile
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/reviews" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              View Reviews
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-28" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalReviews || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{stats?.recentReviews || 0} this month
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-3xl font-bold mt-1">{stats?.averageRating || "—"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i <= Math.round(parseFloat(stats?.averageRating || "0")) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-100 dark:bg-yellow-950 p-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Positive Sentiment</p>
                  <p className="text-3xl font-bold mt-1">{positivePercent}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {positiveCount} positive reviews
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 dark:bg-green-950 p-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={stats?.needsAction && stats.needsAction > 0 ? "border-orange-200 bg-orange-50/30 dark:bg-orange-950/10" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Action</p>
                  <p className="text-3xl font-bold mt-1">{stats?.needsAction || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.needsAction === 0 ? "All caught up!" : "Reviews to respond to"}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${stats?.needsAction && stats.needsAction > 0 ? "bg-orange-100 dark:bg-orange-950" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <AlertCircle className={`h-5 w-5 ${stats?.needsAction && stats.needsAction > 0 ? "text-orange-600" : "text-gray-500"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Review Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Review Activity</CardTitle>
                <CardDescription>Reviews received in the last 7 days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/analytics" className="gap-1 text-xs">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Full Analytics
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>By Platform</CardTitle>
            <CardDescription>Reviews per platform</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats || stats.platformBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No platforms connected</p>
                <Button variant="link" size="sm" asChild className="mt-1">
                  <Link href="/review-profiles">Connect a platform</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.platformBreakdown.slice(0, 5).map((p, i) => (
                  <div key={p.platform} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" style={{ opacity: 1 - i * 0.15 }} />
                    <span className="text-sm flex-1 capitalize">{p.platform}</span>
                    <span className="text-sm font-medium">{p.count}</span>
                    {p.avgRating && (
                      <span className="text-xs text-muted-foreground">
                        ★ {parseFloat(p.avgRating).toFixed(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest reviews across all platforms</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reviews" className="gap-1 text-xs">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-14 bg-muted rounded" />
                ))}
              </div>
            ) : recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No reviews yet</p>
                <Button variant="link" size="sm" asChild className="mt-1">
                  <Link href="/review-profiles">Connect a review profile</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map(review => (
                  <div key={review.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {review.authorName?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{review.authorName || "Anonymous"}</span>
                        <StarRating rating={review.rating} />
                        <SentimentIcon sentiment={review.sentiment} />
                        {review.needsAction && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 h-4 px-1">
                            Action needed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {review.body || "No review text"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {review.platform} • {review.reviewedAt ? format(new Date(review.reviewedAt), "MMM d") : "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                icon: Globe,
                title: "Connect Review Profile",
                description: "Add a new platform to monitor",
                href: "/review-profiles",
                color: "text-blue-500",
              },
              {
                icon: MessageSquare,
                title: "Respond to Reviews",
                description: `${stats?.needsAction || 0} reviews need attention`,
                href: "/reviews?needsAction=true",
                color: "text-orange-500",
                badge: stats?.needsAction && stats.needsAction > 0 ? stats.needsAction : undefined,
              },
              {
                icon: Send,
                title: "Create Campaign",
                description: "Send review requests to customers",
                href: "/campaigns",
                color: "text-green-500",
              },
              {
                icon: Zap,
                title: "Set Up Automation",
                description: "Auto-alert on new reviews",
                href: "/automations",
                color: "text-purple-500",
              },
              {
                icon: BarChart3,
                title: "View Analytics",
                description: "Detailed review insights",
                href: "/analytics",
                color: "text-indigo-500",
              },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent transition-colors"
              >
                <div className="rounded-lg bg-muted p-1.5 flex-shrink-0">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                {action.badge && (
                  <Badge variant="destructive" className="text-xs">{action.badge}</Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Overview */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Sentiment Overview</CardTitle>
            <CardDescription>How customers feel about your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-3">
              {[
                { label: "Positive", sentiment: "positive", icon: ThumbsUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" },
                { label: "Neutral", sentiment: "neutral", icon: Minus, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800" },
                { label: "Negative", sentiment: "negative", icon: ThumbsDown, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950" },
              ].map(({ label, sentiment, icon: Icon, color, bg }) => {
                const count = stats.sentimentBreakdown.find(s => s.sentiment === sentiment)?.count || 0
                const percent = Math.round((count / stats.totalReviews) * 100)
                return (
                  <div key={sentiment} className="text-center">
                    <div className={`inline-flex rounded-full p-3 ${bg} mb-2`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <p className="text-2xl font-bold">{percent}%</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{count} reviews</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
