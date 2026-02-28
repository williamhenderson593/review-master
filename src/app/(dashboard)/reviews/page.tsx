"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Star, Search, Filter, MessageSquare, Flag, Tag, ThumbsUp, ThumbsDown,
  Minus, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock,
  ChevronRight, Send, Sparkles, Globe, X
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "google", label: "Google" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "appstore", label: "App Store" },
  { value: "playstore", label: "Play Store" },
]

interface Review {
  id: string
  platform: string
  rating: number | null
  title: string | null
  body: string | null
  authorName: string | null
  authorAvatar: string | null
  reviewUrl: string | null
  reviewedAt: string | null
  sentiment: string | null
  topics: string[]
  tags: string[]
  language: string | null
  translatedBody: string | null
  needsAction: boolean
  actionNote: string | null
  replyText: string | null
  repliedAt: string | null
  isFlagged: boolean
  isVerified: boolean
  profileId: string
  profileName: string | null
  createdAt: string
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  )
}

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null
  const config = {
    positive: { icon: ThumbsUp, className: "bg-green-100 text-green-700 border-green-200" },
    neutral: { icon: Minus, className: "bg-gray-100 text-gray-600 border-gray-200" },
    negative: { icon: ThumbsDown, className: "bg-red-100 text-red-700 border-red-200" },
  }
  const c = config[sentiment as keyof typeof config]
  if (!c) return null
  const Icon = c.icon
  return (
    <Badge variant="outline" className={`gap-1 text-xs ${c.className}`}>
      <Icon className="h-3 w-3" />
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </Badge>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    google: "bg-blue-100 text-blue-700",
    tripadvisor: "bg-green-100 text-green-700",
    g2: "bg-orange-100 text-orange-700",
    capterra: "bg-blue-100 text-blue-700",
    trustpilot: "bg-green-100 text-green-700",
    appstore: "bg-blue-100 text-blue-700",
    playstore: "bg-green-100 text-green-700",
  }
  return (
    <Badge variant="secondary" className={`text-xs ${colors[platform] || "bg-gray-100 text-gray-700"}`}>
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </Badge>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({
    platform: "all",
    rating: "all",
    sentiment: "all",
    search: "",
  })

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.platform !== "all") params.set("platform", filters.platform)
      if (filters.rating !== "all") params.set("rating", filters.rating)
      if (filters.sentiment !== "all") params.set("sentiment", filters.sentiment)
      if (activeTab === "needs_action") params.set("needsAction", "true")

      const res = await fetch(`/api/v1/reviews?${params}`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }, [filters, activeTab])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  async function handleReply() {
    if (!selectedReview || !replyText.trim()) return
    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/v1/reviews/${selectedReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      })
      if (!res.ok) throw new Error("Failed to reply")
      const data = await res.json()
      setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, ...data.review } : r))
      setSelectedReview(prev => prev ? { ...prev, ...data.review } : null)
      setReplyText("")
      toast.success("Reply saved successfully")
    } catch {
      toast.error("Failed to save reply")
    } finally {
      setSubmittingReply(false)
    }
  }

  async function handleFlag(review: Review) {
    try {
      const res = await fetch(`/api/v1/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFlagged: !review.isFlagged }),
      })
      if (!res.ok) throw new Error("Failed to flag")
      const data = await res.json()
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, ...data.review } : r))
      if (selectedReview?.id === review.id) {
        setSelectedReview(prev => prev ? { ...prev, ...data.review } : null)
      }
      toast.success(review.isFlagged ? "Review unflagged" : "Review flagged")
    } catch {
      toast.error("Failed to update review")
    }
  }

  async function handleMarkAction(review: Review) {
    try {
      const res = await fetch(`/api/v1/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needsAction: !review.needsAction }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, ...data.review } : r))
      if (selectedReview?.id === review.id) {
        setSelectedReview(prev => prev ? { ...prev, ...data.review } : null)
      }
      toast.success(review.needsAction ? "Marked as resolved" : "Marked as needs action")
    } catch {
      toast.error("Failed to update review")
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        r.body?.toLowerCase().includes(search) ||
        r.authorName?.toLowerCase().includes(search) ||
        r.title?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const needsActionCount = reviews.filter(r => r.needsAction).length

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-0 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage and respond to all your reviews in one place</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-4 pb-4">
          <TabsList>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="needs_action" className="gap-2">
              Needs Action
              {needsActionCount > 0 && (
                <Badge variant="destructive" className="h-4 min-w-4 px-1 text-xs">{needsActionCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="replied">Replied</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-8 w-48"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <Select value={filters.platform} onValueChange={(v) => setFilters(f => ({ ...f, platform: v }))}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.rating} onValueChange={(v) => setFilters(f => ({ ...f, rating: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sentiment} onValueChange={(v) => setFilters(f => ({ ...f, sentiment: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="flex-1 min-h-0 mt-0">
          <div className="flex h-full gap-4">
            {/* Reviews List */}
            <div className="w-96 flex-shrink-0 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-4 h-28" />
                  </Card>
                ))
              ) : filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No reviews found</h3>
                  <p className="text-sm text-muted-foreground">
                    {reviews.length === 0
                      ? "Connect a review profile to start seeing reviews here."
                      : "Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                filteredReviews
                  .filter(r => {
                    if (activeTab === "replied") return !!r.repliedAt
                    if (activeTab === "flagged") return r.isFlagged
                    return true
                  })
                  .map(review => (
                    <Card
                      key={review.id}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedReview?.id === review.id ? "ring-2 ring-primary" : ""} ${review.needsAction ? "border-l-4 border-l-orange-400" : ""}`}
                      onClick={() => {
                        setSelectedReview(review)
                        setReplyText(review.replyText || "")
                      }}
                    >
                      <CardContent className="pt-4 pb-3 px-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={review.authorAvatar || ""} />
                              <AvatarFallback className="text-xs">
                                {review.authorName?.slice(0, 2).toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-none">{review.authorName || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {review.reviewedAt ? format(new Date(review.reviewedAt), "MMM d, yyyy") : "Unknown date"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <PlatformBadge platform={review.platform} />
                            {review.needsAction && (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            {review.isFlagged && (
                              <Flag className="h-4 w-4 text-red-500 fill-red-500" />
                            )}
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                        {review.title && (
                          <p className="text-sm font-medium mt-1.5 line-clamp-1">{review.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {review.body || "No review text"}
                        </p>
                        {review.repliedAt && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">Replied</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* Review Detail */}
            <div className="flex-1 overflow-y-auto">
              {selectedReview ? (
                <Card className="h-full">
                  <CardContent className="pt-6 space-y-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedReview.authorAvatar || ""} />
                          <AvatarFallback>
                            {selectedReview.authorName?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{selectedReview.authorName || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedReview.reviewedAt
                              ? format(new Date(selectedReview.reviewedAt), "MMMM d, yyyy")
                              : "Unknown date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlatformBadge platform={selectedReview.platform} />
                        <SentimentBadge sentiment={selectedReview.sentiment} />
                        {selectedReview.reviewUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={selectedReview.reviewUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <StarRating rating={selectedReview.rating} />

                    {selectedReview.title && (
                      <h3 className="text-lg font-semibold">{selectedReview.title}</h3>
                    )}

                    <p className="text-sm leading-relaxed">{selectedReview.body || "No review text"}</p>

                    {/* Topics & Tags */}
                    {(selectedReview.topics?.length > 0 || selectedReview.tags?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReview.topics?.map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                        {selectedReview.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs gap-1">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedReview.needsAction ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => handleMarkAction(selectedReview)}
                      >
                        {selectedReview.needsAction ? (
                          <><CheckCircle2 className="h-4 w-4" />Mark Resolved</>
                        ) : (
                          <><AlertCircle className="h-4 w-4" />Needs Action</>
                        )}
                      </Button>
                      <Button
                        variant={selectedReview.isFlagged ? "destructive" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => handleFlag(selectedReview)}
                      >
                        <Flag className="h-4 w-4" />
                        {selectedReview.isFlagged ? "Unflag" : "Flag"}
                      </Button>
                    </div>

                    <Separator />

                    {/* Reply Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {selectedReview.repliedAt ? "Your Reply" : "Write a Reply"}
                        </h4>
                        {selectedReview.repliedAt && (
                          <span className="text-xs text-muted-foreground">
                            Replied {format(new Date(selectedReview.repliedAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      {selectedReview.repliedAt && selectedReview.replyText && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm">{selectedReview.replyText}</p>
                        </div>
                      )}

                      <Textarea
                        placeholder="Write your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={handleReply}
                          disabled={submittingReply || !replyText.trim()}
                        >
                          <Send className="h-4 w-4" />
                          {submittingReply ? "Saving..." : selectedReview.repliedAt ? "Update Reply" : "Save Reply"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            // AI suggestion placeholder
                            const suggestions = [
                              "Thank you for your wonderful review! We're thrilled to hear you had a great experience. We look forward to welcoming you back soon!",
                              "We appreciate your feedback and are sorry to hear about your experience. We take all feedback seriously and will use this to improve our service.",
                              "Thank you for taking the time to share your experience with us. Your feedback means a lot to our team!",
                            ]
                            const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
                            setReplyText(suggestion)
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                          AI Suggest
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-1">Select a review</h3>
                    <p className="text-sm text-muted-foreground">Click on a review to view details and respond</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
