"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Star, ExternalLink, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MagicLinkData {
  campaign: {
    id: string
    name: string
    targetPlatforms: string[]
    reputationProtection: boolean
    reputationThreshold: number
    messageTemplate: string | null
  }
  business: {
    name: string
    logoUrl: string | null
  }
}

const PLATFORM_URLS: Record<string, { label: string; color: string; reviewUrl?: string }> = {
  google: { label: "Google", color: "bg-blue-500", reviewUrl: "https://search.google.com/local/writereview" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-600" },
  g2: { label: "G2", color: "bg-orange-500", reviewUrl: "https://www.g2.com/products" },
  capterra: { label: "Capterra", color: "bg-blue-600", reviewUrl: "https://www.capterra.com" },
  trustpilot: { label: "Trustpilot", color: "bg-green-500", reviewUrl: "https://www.trustpilot.com" },
  appstore: { label: "App Store", color: "bg-blue-400" },
  playstore: { label: "Play Store", color: "bg-green-400" },
}

export default function MagicLinkPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<MagicLinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [satisfaction, setSatisfaction] = useState<number | null>(null)
  const [step, setStep] = useState<"rating" | "platforms" | "feedback" | "done">("rating")
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    fetch(`/api/v1/magic-link/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [token])

  function handleSatisfactionSelect(rating: number) {
    setSatisfaction(rating)
    if (data?.campaign.reputationProtection && rating < (data.campaign.reputationThreshold || 3)) {
      setStep("feedback")
    } else {
      setStep("platforms")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground text-sm">
              This review link is invalid or has expired. Please contact the business for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const platforms = data.campaign.targetPlatforms.length > 0
    ? data.campaign.targetPlatforms
    : ["google", "tripadvisor"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          {data.business.logoUrl ? (
            <img src={data.business.logoUrl} alt={data.business.name} className="h-12 mx-auto mb-3 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{data.business.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{data.campaign.name}</p>
        </div>

        {/* Step: Rating */}
        {step === "rating" && (
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>How was your experience?</CardTitle>
              <CardDescription>
                {data.campaign.messageTemplate || "We'd love to hear your feedback!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleSatisfactionSelect(rating)}
                    className="group flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-accent transition-colors"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        satisfaction && rating <= satisfaction
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground group-hover:text-yellow-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">{rating}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Private Feedback (reputation protection) */}
        {step === "feedback" && (
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>We're sorry to hear that</CardTitle>
              <CardDescription>
                Please share your feedback so we can improve. Your response goes directly to our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={5}
                placeholder="Tell us what went wrong and how we can do better..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button
                className="w-full gap-2"
                onClick={() => setStep("done")}
                disabled={!feedback.trim()}
              >
                <CheckCircle2 className="h-4 w-4" />
                Submit Feedback
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setStep("platforms")}
              >
                Leave a public review instead
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Platform Selection */}
        {step === "platforms" && (
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>
                {satisfaction && satisfaction >= 4 ? "🎉 Great!" : "Thank you!"}
              </CardTitle>
              <CardDescription>
                Would you mind sharing your experience on one of these platforms?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {platforms.map(platform => {
                const config = PLATFORM_URLS[platform] || { label: platform, color: "bg-gray-500" }
                return (
                  <a
                    key={platform}
                    href={config.reviewUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors"
                    onClick={() => setTimeout(() => setStep("done"), 500)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {config.label.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Review on {config.label}</p>
                      <p className="text-xs text-muted-foreground">Takes about 2 minutes</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </a>
                )
              })}
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={() => setStep("done")}
              >
                Maybe later
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
              <p className="text-muted-foreground text-sm">
                {step === "done" && satisfaction && satisfaction < (data.campaign.reputationThreshold || 3)
                  ? "Your feedback has been sent to our team. We'll work on improving your experience."
                  : "Your review means a lot to us. Thank you for taking the time!"}
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold">ReviewFlow</span>
        </p>
      </div>
    </div>
  )
}
