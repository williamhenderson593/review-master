"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, Minus, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ReviewStats {
  totalReviews: number
  averageRating: string
  needsAction: number
  recentReviews: number
  sentimentBreakdown: Array<{ sentiment: string | null; count: number }>
  platformBreakdown: Array<{ platform: string; count: number; avgRating: string | null }>
  ratingBreakdown: Array<{ rating: number | null; count: number }>
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
}

const PLATFORM_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f59e0b", "#6366f1", "#84cc16", "#06b6d4"
]

// Mock trend data for demonstration
const generateTrendData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.slice(0, 8).map((month, i) => ({
    month,
    reviews: Math.floor(Math.random() * 50) + 10,
    avgRating: (3.5 + Math.random() * 1.5).toFixed(1),
    positive: Math.floor(Math.random() * 30) + 10,
    neutral: Math.floor(Math.random() * 10) + 2,
    negative: Math.floor(Math.random() * 10) + 1,
  }))
}

const trendData = generateTrendData()

function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 mt-3 text-xs ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")

  useEffect(() => {
    fetchStats()
  }, [period])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/reviews/stats")
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const sentimentData = stats?.sentimentBreakdown.map(s => ({
    name: s.sentiment ? s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1) : "Unknown",
    value: s.count,
    color: SENTIMENT_COLORS[s.sentiment as keyof typeof SENTIMENT_COLORS] || "#94a3b8",
  })) || []

  const platformData = stats?.platformBreakdown.map((p, i) => ({
    platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    reviews: p.count,
    avgRating: parseFloat(p.avgRating || "0"),
    color: PLATFORM_COLORS[i % PLATFORM_COLORS.length],
  })) || []

  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r} ★`,
    count: stats?.ratingBreakdown.find(rb => rb.rating === r)?.count || 0,
  }))

  const positiveCount = stats?.sentimentBreakdown.find(s => s.sentiment === "positive")?.count || 0
  const negativeCount = stats?.sentimentBreakdown.find(s => s.sentiment === "negative")?.count || 0
  const totalSentiment = stats?.totalReviews || 1
  const positivePercent = Math.round((positiveCount / totalSentiment) * 100)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your review performance and sentiment trends</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
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
          <StatCard
            title="Total Reviews"
            value={stats?.totalReviews || 0}
            subtitle="Across all platforms"
            icon={MessageSquare}
            trend="up"
            trendValue={`${stats?.recentReviews || 0} in last 30 days`}
          />
          <StatCard
            title="Average Rating"
            value={`${stats?.averageRating || "0.0"} ★`}
            subtitle="Across all platforms"
            icon={Star}
            trend={parseFloat(stats?.averageRating || "0") >= 4 ? "up" : "down"}
            trendValue={parseFloat(stats?.averageRating || "0") >= 4 ? "Above average" : "Below average"}
          />
          <StatCard
            title="Positive Sentiment"
            value={`${positivePercent}%`}
            subtitle={`${positiveCount} positive reviews`}
            icon={ThumbsUp}
            trend={positivePercent >= 70 ? "up" : "down"}
            trendValue={positivePercent >= 70 ? "Good sentiment" : "Needs improvement"}
          />
          <StatCard
            title="Needs Action"
            value={stats?.needsAction || 0}
            subtitle="Reviews requiring response"
            icon={AlertCircle}
            trend={stats?.needsAction === 0 ? "up" : "down"}
            trendValue={stats?.needsAction === 0 ? "All caught up!" : "Requires attention"}
          />
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Review Volume Over Time</CardTitle>
                <CardDescription>Number of reviews received per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating Over Time</CardTitle>
                <CardDescription>Average star rating per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis domain={[1, 5]} className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
              <CardDescription>Positive, neutral, and negative reviews over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="positive" fill="#22c55e" name="Positive" stackId="a" />
                  <Bar dataKey="neutral" fill="#94a3b8" name="Neutral" stackId="a" />
                  <Bar dataKey="negative" fill="#ef4444" name="Negative" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Breakdown of review sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                {sentimentData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No sentiment data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
                <CardDescription>Detailed sentiment metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Positive", icon: ThumbsUp, color: "text-green-600", bgColor: "bg-green-100", sentiment: "positive" },
                  { label: "Neutral", icon: Minus, color: "text-gray-600", bgColor: "bg-gray-100", sentiment: "neutral" },
                  { label: "Negative", icon: ThumbsDown, color: "text-red-600", bgColor: "bg-red-100", sentiment: "negative" },
                ].map(({ label, icon: Icon, color, bgColor, sentiment }) => {
                  const count = stats?.sentimentBreakdown.find(s => s.sentiment === sentiment)?.count || 0
                  const percent = stats?.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0
                  return (
                    <div key={sentiment} className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${bgColor}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">{count} ({percent}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sentiment === "positive" ? "bg-green-500" :
                              sentiment === "negative" ? "bg-red-500" : "bg-gray-400"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reviews by Platform</CardTitle>
                <CardDescription>Number of reviews per platform</CardDescription>
              </CardHeader>
              <CardContent>
                {platformData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No platform data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={platformData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="platform" type="category" className="text-xs" width={80} />
                      <Tooltip />
                      <Bar dataKey="reviews" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Rating by Platform</CardTitle>
                <CardDescription>Star rating comparison across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                {platformData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No platform data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {platformData.map((p, i) => (
                      <div key={p.platform} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-sm w-24 flex-shrink-0">{p.platform}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{ width: `${(p.avgRating / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{p.avgRating.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Breakdown of reviews by star rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="rating" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = stats?.ratingBreakdown.find(r => r.rating === rating)?.count || 0
                    const percent = stats?.totalReviews ? Math.round((count / stats.totalReviews) * 100) : 0
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16 flex-shrink-0">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {count} ({percent}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
