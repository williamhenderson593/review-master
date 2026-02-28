"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap
} from "recharts"
import {
  Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown,
  Minus, AlertCircle, Globe, Filter, RefreshCw, Download, BarChart3,
  PieChart as PieChartIcon, Activity, Users, Hash, Languages, CheckCircle2,
  Sparkles, ChevronDown, ChevronUp, Search
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface ReviewProfile {
  id: string
  name: string
  platform: string
}

interface InsightsData {
  summary: {
    total: number
    avgRating: string
    responseRate: number
    needsAction: number
  }
  sentimentData: Array<{ sentiment: string | null; count: number }>
  ratingData: Array<{ rating: number | null; count: number }>
  timeSeriesData: Array<{
    month: string
    count: number
    avgRating: string
    positive: number
    negative: number
    neutral: number
  }>
  topicData: Array<{ topic: string; count: number }>
  profileData: Array<{
    profileId: string
    profileName: string | null
    platform: string
    count: number
    avgRating: string | null
    positive: number
    negative: number
  }>
  languageData: Array<{ language: string | null; count: number }>
  recentReviews: Array<{
    id: string
    rating: number | null
    body: string | null
    authorName: string | null
    sentiment: string | null
    topics: string[]
    platform: string
    reviewedAt: string | null
    profileName: string | null
  }>
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
}

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1"]

function StatWidget({
  title, value, subtitle, icon: Icon, color, trend
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  trend?: { value: string; up: boolean }
}) {
  return (
    <Card>
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
}

export default function InsightsPage() {
  const [profiles, setProfiles] = useState<ReviewProfile[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([])
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeModules, setActiveModules] = useState({
    summary: true,
    sentiment: true,
    ratings: true,
    timeSeries: true,
    topics: true,
    profiles: true,
    languages: true,
    testimonials: true,
    radar: true,
  })

  useEffect(() => {
    fetch("/api/v1/review-profiles")
      .then(r => r.json())
      .then(d => {
        const profs = d.profiles || []
        setProfiles(profs)
        // Auto-select all profiles
        setSelectedProfiles(profs.map((p: ReviewProfile) => p.id))
      })
      .catch(() => {})
  }, [])

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProfiles.length > 0) params.set("profileIds", selectedProfiles.join(","))
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (selectedRatings.length > 0) params.set("ratings", selectedRatings.join(","))
      if (selectedSentiments.length > 0) params.set("sentiments", selectedSentiments.join(","))

      const res = await fetch(`/api/v1/reviews/insights?${params}`)
      const d = await res.json()
      setData(d)
    } catch {
      toast.error("Failed to load insights")
    } finally {
      setLoading(false)
    }
  }, [selectedProfiles, dateFrom, dateTo, selectedRatings, selectedSentiments])

  useEffect(() => {
    if (profiles.length > 0) {
      fetchInsights()
    }
  }, [fetchInsights, profiles.length])

  function toggleProfile(id: string) {
    setSelectedProfiles(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function toggleRating(r: number) {
    setSelectedRatings(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    )
  }

  function toggleSentiment(s: string) {
    setSelectedSentiments(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function toggleModule(key: keyof typeof activeModules) {
    setActiveModules(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Derived data
  const sentimentChartData = data?.sentimentData.map(s => ({
    name: s.sentiment ? s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1) : "Unknown",
    value: s.count,
    color: SENTIMENT_COLORS[s.sentiment as keyof typeof SENTIMENT_COLORS] || "#94a3b8",
  })) || []

  const ratingChartData = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r}★`,
    count: data?.ratingData.find(rd => rd.rating === r)?.count || 0,
    fill: r >= 4 ? "#22c55e" : r === 3 ? "#f59e0b" : "#ef4444",
  }))

  const positiveCount = data?.sentimentData.find(s => s.sentiment === "positive")?.count || 0
  const negativeCount = data?.sentimentData.find(s => s.sentiment === "negative")?.count || 0
  const neutralCount = data?.sentimentData.find(s => s.sentiment === "neutral")?.count || 0
  const total = data?.summary.total || 1

  // Radar data for profile comparison
  const radarData = data?.profileData.slice(0, 6).map(p => ({
    profile: p.profileName?.split(" - ")[0] || p.platform,
    reviews: p.count,
    rating: parseFloat(p.avgRating || "0") * 20, // scale to 100
    positive: p.count > 0 ? Math.round((p.positive / p.count) * 100) : 0,
    negative: p.count > 0 ? Math.round((p.negative / p.count) * 100) : 0,
  })) || []

  // Top testimonials (5-star positive reviews)
  const topTestimonials = data?.recentReviews
    .filter(r => r.rating === 5 && r.sentiment === "positive" && r.body)
    .slice(0, 6) || []

  // Negative reviews needing attention
  const negativeReviews = data?.recentReviews
    .filter(r => r.rating && r.rating <= 2 && r.body)
    .slice(0, 5) || []

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Insights</h1>
          <p className="text-muted-foreground">
            Deep-dive analytics across your review profiles with custom filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {filtersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={fetchInsights}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Profile Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Review Profiles
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {profiles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No profiles connected</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="all-profiles"
                          checked={selectedProfiles.length === profiles.length}
                          onCheckedChange={(v) => setSelectedProfiles(v ? profiles.map(p => p.id) : [])}
                        />
                        <label htmlFor="all-profiles" className="text-xs font-medium cursor-pointer">All Profiles</label>
                      </div>
                      {profiles.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                          <Checkbox
                            id={p.id}
                            checked={selectedProfiles.includes(p.id)}
                            onCheckedChange={() => toggleProfile(p.id)}
                          />
                          <label htmlFor={p.id} className="text-xs cursor-pointer line-clamp-1">{p.name}</label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { label: "7d", days: 7 },
                      { label: "30d", days: 30 },
                      { label: "90d", days: 90 },
                      { label: "1y", days: 365 },
                    ].map(({ label, days }) => (
                      <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          const from = new Date()
                          from.setDate(from.getDate() - days)
                          setDateFrom(from.toISOString().split("T")[0])
                          setDateTo(new Date().toISOString().split("T")[0])
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => { setDateFrom(""); setDateTo("") }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Star className="h-4 w-4" />
                  Star Rating
                </Label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(r => (
                    <div key={r} className="flex items-center gap-2">
                      <Checkbox
                        id={`rating-${r}`}
                        checked={selectedRatings.includes(r)}
                        onCheckedChange={() => toggleRating(r)}
                      />
                      <label htmlFor={`rating-${r}`} className="text-xs cursor-pointer flex items-center gap-1">
                        {Array.from({ length: r }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        {Array.from({ length: 5 - r }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-gray-200" />
                        ))}
                      </label>
                    </div>
                  ))}
                  {selectedRatings.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setSelectedRatings([])}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Sentiment Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Sentiment & Modules
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "positive", label: "Positive", icon: ThumbsUp, color: "text-green-600" },
                    { value: "neutral", label: "Neutral", icon: Minus, color: "text-gray-500" },
                    { value: "negative", label: "Negative", icon: ThumbsDown, color: "text-red-600" },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox
                        id={`sentiment-${value}`}
                        checked={selectedSentiments.includes(value)}
                        onCheckedChange={() => toggleSentiment(value)}
                      />
                      <label htmlFor={`sentiment-${value}`} className={`text-xs cursor-pointer flex items-center gap-1 ${color}`}>
                        <Icon className="h-3 w-3" />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Show Modules</p>
                  {Object.entries({
                    summary: "Summary Stats",
                    sentiment: "Sentiment Analysis",
                    ratings: "Rating Distribution",
                    timeSeries: "Trends Over Time",
                    topics: "Topic Analysis",
                    profiles: "Profile Comparison",
                    radar: "Radar Chart",
                    testimonials: "Top Testimonials",
                    languages: "Language Breakdown",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`module-${key}`}
                        checked={activeModules[key as keyof typeof activeModules]}
                        onCheckedChange={() => toggleModule(key as keyof typeof activeModules)}
                      />
                      <label htmlFor={`module-${key}`} className="text-xs cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && !data ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-5 h-28" />
            </Card>
          ))}
        </div>
      ) : !data ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No data yet</h3>
            <p className="text-sm text-muted-foreground">Connect review profiles and simulate reviews to see insights.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          {activeModules.summary && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatWidget
                title="Total Reviews"
                value={data.summary.total.toLocaleString()}
                subtitle={`${selectedProfiles.length} profile${selectedProfiles.length !== 1 ? "s" : ""} selected`}
                icon={MessageSquare}
                color="bg-blue-500"
              />
              <StatWidget
                title="Average Rating"
                value={`${data.summary.avgRating} ★`}
                subtitle={parseFloat(data.summary.avgRating) >= 4 ? "Above average" : "Below average"}
                icon={Star}
                color={parseFloat(data.summary.avgRating) >= 4 ? "bg-green-500" : "bg-orange-500"}
                trend={{
                  value: parseFloat(data.summary.avgRating) >= 4 ? "Good performance" : "Needs improvement",
                  up: parseFloat(data.summary.avgRating) >= 4
                }}
              />
              <StatWidget
                title="Response Rate"
                value={`${data.summary.responseRate}%`}
                subtitle="Reviews with replies"
                icon={CheckCircle2}
                color={data.summary.responseRate >= 50 ? "bg-green-500" : "bg-orange-500"}
              />
              <StatWidget
                title="Needs Action"
                value={data.summary.needsAction}
                subtitle="Unresolved reviews"
                icon={AlertCircle}
                color={data.summary.needsAction === 0 ? "bg-green-500" : "bg-red-500"}
              />
            </div>
          )}

          {/* Sentiment + Rating Row */}
          {(activeModules.sentiment || activeModules.ratings) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Sentiment Analysis */}
              {activeModules.sentiment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Sentiment Analysis
                    </CardTitle>
                    <CardDescription>How customers feel about your business</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={sentimentChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
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
                          { label: "Neutral", count: neutralCount, color: "bg-gray-400", icon: Minus },
                          { label: "Negative", count: negativeCount, color: "bg-red-500", icon: ThumbsDown },
                        ].map(({ label, count, color, icon: Icon }) => (
                          <div key={label} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                            <div className="flex-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium">{label}</span>
                                <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${color}`}
                                  style={{ width: `${Math.round((count / total) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rating Distribution */}
              {activeModules.ratings && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Rating Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of reviews by star rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={ratingChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="rating" type="category" className="text-xs" width={30} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {ratingChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Time Series */}
          {activeModules.timeSeries && data.timeSeriesData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Review Trends Over Time
                </CardTitle>
                <CardDescription>Monthly review volume, average rating, and sentiment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="volume">
                  <TabsList className="mb-4">
                    <TabsTrigger value="volume">Volume</TabsTrigger>
                    <TabsTrigger value="rating">Avg Rating</TabsTrigger>
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="volume">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={data.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} name="Reviews" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="rating">
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis domain={[1, 5]} className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={false} name="Avg Rating" />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="sentiment">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={data.timeSeriesData}>
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Topics + Languages Row */}
          {(activeModules.topics || activeModules.languages) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Topic Analysis */}
              {activeModules.topics && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      Topic Analysis
                    </CardTitle>
                    <CardDescription>Most frequently mentioned topics in reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.topicData.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No topic data available
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.topicData.slice(0, 12).map((t, i) => {
                          const maxCount = data.topicData[0]?.count || 1
                          const percent = Math.round((t.count / maxCount) * 100)
                          return (
                            <div key={t.topic} className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="text-xs w-24 justify-center flex-shrink-0"
                                style={{ backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`, color: CHART_COLORS[i % CHART_COLORS.length] }}
                              >
                                {t.topic}
                              </Badge>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{t.count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Language Breakdown */}
              {activeModules.languages && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      Languages
                    </CardTitle>
                    <CardDescription>Review language distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.languageData.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No language data
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.languageData.slice(0, 8).map((l, i) => {
                          const maxCount = Math.max(...data.languageData.map(x => x.count))
                          const percent = Math.round((l.count / maxCount) * 100)
                          const langNames: Record<string, string> = {
                            en: "English", fr: "French", de: "German", es: "Spanish",
                            nl: "Dutch", it: "Italian", pt: "Portuguese", ja: "Japanese",
                          }
                          return (
                            <div key={l.language || "unknown"} className="flex items-center gap-2">
                              <span className="text-xs w-16 flex-shrink-0 font-medium">
                                {langNames[l.language || ""] || l.language || "Unknown"}
                              </span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${percent}%`, opacity: 1 - i * 0.1 }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-6 text-right">{l.count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Profile Comparison + Radar */}
          {(activeModules.profiles || activeModules.radar) && data.profileData.length > 0 && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Profile Comparison */}
              {activeModules.profiles && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Profile Comparison
                    </CardTitle>
                    <CardDescription>Review performance across connected profiles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.profileData.map((p, i) => {
                        const positiveRate = p.count > 0 ? Math.round((p.positive / p.count) * 100) : 0
                        const negativeRate = p.count > 0 ? Math.round((p.negative / p.count) * 100) : 0
                        return (
                          <div key={p.profileId} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium line-clamp-1">{p.profileName || p.platform}</p>
                                <p className="text-xs text-muted-foreground capitalize">{p.platform}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{p.avgRating ? `${p.avgRating}★` : "—"}</p>
                                <p className="text-xs text-muted-foreground">{p.count} reviews</p>
                              </div>
                            </div>
                            <div className="flex gap-1 h-2">
                              <div className="bg-green-500 rounded-l-full" style={{ width: `${positiveRate}%` }} />
                              <div className="bg-gray-300" style={{ width: `${100 - positiveRate - negativeRate}%` }} />
                              <div className="bg-red-500 rounded-r-full" style={{ width: `${negativeRate}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span className="text-green-600">{positiveRate}% positive</span>
                              <span className="text-red-600">{negativeRate}% negative</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Radar Chart */}
              {activeModules.radar && radarData.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Profile Radar
                    </CardTitle>
                    <CardDescription>Multi-dimensional profile comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="profile" className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                        <Radar name="Rating (scaled)" dataKey="rating" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} />
                        <Radar name="Positive %" dataKey="positive" stroke="#22c55e" fill="#22c55e20" strokeWidth={2} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top Testimonials */}
          {activeModules.testimonials && topTestimonials.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  Top Testimonials
                </CardTitle>
                <CardDescription>Best 5-star reviews — use these in your marketing and sales materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {topTestimonials.map(review => (
                    <div key={review.id} className="rounded-lg border bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-4 italic">
                        "{review.body}"
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">{review.authorName || "Anonymous"}</p>
                        <Badge variant="secondary" className="text-xs capitalize">{review.platform}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Negative Reviews Needing Attention */}
          {negativeReviews.length > 0 && (
            <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Critical Reviews — Needs Attention
                </CardTitle>
                <CardDescription>Low-rated reviews that may need a response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {negativeReviews.map(review => (
                    <div key={review.id} className="rounded-lg border border-red-200 bg-background p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i <= (review.rating || 0) ? "fill-red-400 text-red-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium">{review.authorName || "Anonymous"}</span>
                            <Badge variant="secondary" className="text-xs capitalize">{review.platform}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{review.body}</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-shrink-0" asChild>
                          <a href="/reviews">
                            <MessageSquare className="h-3 w-3" />
                            Reply
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
