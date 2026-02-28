"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Search, Filter, MessageSquare, AlertCircle, ThumbsUp, ThumbsDown, Minus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface AdminReview {
  id: string
  platform: string
  rating: number | null
  title: string | null
  body: string | null
  authorName: string | null
  reviewedAt: string | null
  sentiment: string | null
  needsAction: boolean
  isFlagged: boolean
  repliedAt: string | null
  clientName: string | null
  profileName: string | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("all")
  const [sentiment, setSentiment] = useState("all")

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (platform !== "all") params.set("platform", platform)
      if (sentiment !== "all") params.set("sentiment", sentiment)
      params.set("limit", "50")

      const res = await fetch(`/api/v1/admin/reviews?${params}`)
      if (res.status === 403) {
        toast.error("Access denied")
        return
      }
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }, [platform, sentiment])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const filteredReviews = reviews.filter(r => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      r.body?.toLowerCase().includes(s) ||
      r.authorName?.toLowerCase().includes(s) ||
      r.clientName?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Reviews</h1>
          <p className="text-muted-foreground">Platform-wide review management</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews, authors, businesses..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
            <SelectItem value="g2">G2</SelectItem>
            <SelectItem value="capterra">Capterra</SelectItem>
            <SelectItem value="trustpilot">Trustpilot</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentiment} onValueChange={setSentiment}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-4 h-20" />
            </Card>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredReviews.map(review => (
                <div key={review.id} className="flex items-start gap-4 px-4 py-3 hover:bg-accent/30 transition-colors">
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                    <AvatarFallback className="text-xs">
                      {review.authorName?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium">{review.authorName || "Anonymous"}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{review.platform}</Badge>
                      {review.sentiment && (
                        <Badge variant="outline" className={`text-xs ${
                          review.sentiment === "positive" ? "text-green-600 border-green-200" :
                          review.sentiment === "negative" ? "text-red-600 border-red-200" :
                          "text-gray-600"
                        }`}>
                          {review.sentiment}
                        </Badge>
                      )}
                      {review.needsAction && <Badge variant="destructive" className="text-xs">Needs Action</Badge>}
                      {review.repliedAt && <Badge variant="outline" className="text-xs text-green-600 border-green-200">Replied</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.body || "No review text"}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{review.clientName || "Unknown Business"}</span>
                      {review.profileName && <span>· {review.profileName}</span>}
                      {review.reviewedAt && <span>· {format(new Date(review.reviewedAt), "MMM d, yyyy")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
