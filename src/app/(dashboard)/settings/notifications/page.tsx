"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell, Mail, Star, AlertCircle, ThumbsDown, Send, BarChart3,
  Plus, X, CheckCircle2, Zap, RefreshCw, MessageSquare
} from "lucide-react"
import { toast } from "sonner"

interface NotificationPreferences {
  // Review alerts
  newReviewEmail: boolean
  newReviewEmailMinRating: number
  lowRatingEmail: boolean
  lowRatingThreshold: number
  negativeReviewEmail: boolean
  // Campaign notifications
  campaignReviewEmail: boolean
  campaignCompletedEmail: boolean
  // Digest
  weeklyDigestEmail: boolean
  weeklyDigestDay: string
  // Frequency
  emailFrequency: string
  // Channels
  emailEnabled: boolean
  // Specific events
  reviewNeedsActionEmail: boolean
  reviewRepliedEmail: boolean
  newProfileSyncedEmail: boolean
  // Recipients
  additionalRecipients: string[]
}

const DEFAULT_PREFS: NotificationPreferences = {
  newReviewEmail: true,
  newReviewEmailMinRating: 1,
  lowRatingEmail: true,
  lowRatingThreshold: 3,
  negativeReviewEmail: true,
  campaignReviewEmail: true,
  campaignCompletedEmail: true,
  weeklyDigestEmail: true,
  weeklyDigestDay: "monday",
  emailFrequency: "instant",
  emailEnabled: true,
  reviewNeedsActionEmail: true,
  reviewRepliedEmail: false,
  newProfileSyncedEmail: true,
  additionalRecipients: [],
}

function NotificationRow({
  icon: Icon,
  iconColor,
  title,
  description,
  checked,
  onCheckedChange,
  children,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 mt-0.5 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-1 flex-shrink-0" />
    </div>
  )
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newRecipient, setNewRecipient] = useState("")
  const [testEmailSending, setTestEmailSending] = useState(false)

  useEffect(() => {
    fetch("/api/v1/notifications/preferences")
      .then(r => r.json())
      .then(data => {
        if (data.preferences) setPrefs({ ...DEFAULT_PREFS, ...data.preferences })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function update(key: keyof NotificationPreferences, value: any) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/v1/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Notification preferences saved!")
    } catch {
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  function addRecipient() {
    if (!newRecipient || !newRecipient.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    if (prefs.additionalRecipients.includes(newRecipient)) {
      toast.error("This email is already added")
      return
    }
    update("additionalRecipients", [...prefs.additionalRecipients, newRecipient])
    setNewRecipient("")
  }

  function removeRecipient(email: string) {
    update("additionalRecipients", prefs.additionalRecipients.filter(r => r !== email))
  }

  async function sendTestEmail() {
    setTestEmailSending(true)
    try {
      const res = await fetch("/api/v1/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "weekly_digest",
          recipients: ["me"], // will use current user's email
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Test email sent! Check your inbox.")
    } catch {
      toast.error("Failed to send test email")
    } finally {
      setTestEmailSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications & Alerts</h1>
          <p className="text-muted-foreground">
            Configure email alerts for review activity, campaigns, and weekly digests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={sendTestEmail}
            disabled={testEmailSending}
          >
            <Mail className="h-4 w-4" />
            {testEmailSending ? "Sending..." : "Send Test Email"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="review-alerts">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="review-alerts">Review Alerts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="digest">Weekly Digest</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Review Alerts Tab */}
        <TabsContent value="review-alerts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                New Review Alerts
              </CardTitle>
              <CardDescription>
                Get notified by email whenever a new review is posted on any connected platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <NotificationRow
                icon={Star}
                iconColor="bg-yellow-100 text-yellow-600"
                title="New Review Received"
                description="Send an email alert whenever a new review is posted"
                checked={prefs.newReviewEmail}
                onCheckedChange={(v) => update("newReviewEmail", v)}
              >
                {prefs.newReviewEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Only alert for reviews rated</span>
                    <Select
                      value={String(prefs.newReviewEmailMinRating)}
                      onValueChange={(v) => update("newReviewEmailMinRating", parseInt(v))}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1+ stars (all)</SelectItem>
                        <SelectItem value="2">2+ stars</SelectItem>
                        <SelectItem value="3">3+ stars</SelectItem>
                        <SelectItem value="4">4+ stars</SelectItem>
                        <SelectItem value="5">5 stars only</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">or above</span>
                  </div>
                )}
              </NotificationRow>

              <NotificationRow
                icon={AlertCircle}
                iconColor="bg-red-100 text-red-600"
                title="Low Rating Alert"
                description="Immediate alert when a low-star review is posted — so you can respond fast"
                checked={prefs.lowRatingEmail}
                onCheckedChange={(v) => update("lowRatingEmail", v)}
              >
                {prefs.lowRatingEmail && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Alert when rating is</span>
                    <Select
                      value={String(prefs.lowRatingThreshold)}
                      onValueChange={(v) => update("lowRatingThreshold", parseInt(v))}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">1-2 stars</SelectItem>
                        <SelectItem value="3">1-3 stars</SelectItem>
                        <SelectItem value="4">1-4 stars</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">or below</span>
                  </div>
                )}
              </NotificationRow>

              <NotificationRow
                icon={ThumbsDown}
                iconColor="bg-orange-100 text-orange-600"
                title="Negative Sentiment Alert"
                description="Alert when AI detects a review with negative sentiment, regardless of star rating"
                checked={prefs.negativeReviewEmail}
                onCheckedChange={(v) => update("negativeReviewEmail", v)}
              />

              <NotificationRow
                icon={AlertCircle}
                iconColor="bg-orange-100 text-orange-600"
                title="Review Needs Action"
                description="Alert when a review is flagged as needing a response or follow-up"
                checked={prefs.reviewNeedsActionEmail}
                onCheckedChange={(v) => update("reviewNeedsActionEmail", v)}
              />

              <NotificationRow
                icon={MessageSquare}
                iconColor="bg-green-100 text-green-600"
                title="Reply Confirmation"
                description="Receive a confirmation email when a reply is saved to a review"
                checked={prefs.reviewRepliedEmail}
                onCheckedChange={(v) => update("reviewRepliedEmail", v)}
              />

              <NotificationRow
                icon={RefreshCw}
                iconColor="bg-blue-100 text-blue-600"
                title="Profile Sync Completed"
                description="Alert when a review profile finishes syncing new reviews"
                checked={prefs.newProfileSyncedEmail}
                onCheckedChange={(v) => update("newProfileSyncedEmail", v)}
              />
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <Mail className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">What the email looks like</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review alert emails include: platform name, star rating, author name, review text, sentiment badge, and a direct link to respond in your dashboard.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-xs"
                    onClick={sendTestEmail}
                    disabled={testEmailSending}
                  >
                    Send me a test email →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-500" />
                Campaign Notifications
              </CardTitle>
              <CardDescription>
                Stay informed about review generation campaign activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <NotificationRow
                icon={Star}
                iconColor="bg-green-100 text-green-600"
                title="Campaign Review Received"
                description="Alert when a customer submits a review through one of your campaigns"
                checked={prefs.campaignReviewEmail}
                onCheckedChange={(v) => update("campaignReviewEmail", v)}
              />

              <NotificationRow
                icon={CheckCircle2}
                iconColor="bg-blue-100 text-blue-600"
                title="Campaign Completed"
                description="Alert when a campaign finishes sending all review requests"
                checked={prefs.campaignCompletedEmail}
                onCheckedChange={(v) => update("campaignCompletedEmail", v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Digest Tab */}
        <TabsContent value="digest" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Weekly Review Digest
              </CardTitle>
              <CardDescription>
                A weekly summary email with your review performance, sentiment breakdown, and action items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Enable Weekly Digest</p>
                  <p className="text-xs text-muted-foreground">Receive a weekly summary of your review activity</p>
                </div>
                <Switch
                  checked={prefs.weeklyDigestEmail}
                  onCheckedChange={(v) => update("weeklyDigestEmail", v)}
                />
              </div>

              {prefs.weeklyDigestEmail && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm">Send digest on</Label>
                    <Select
                      value={prefs.weeklyDigestDay}
                      onValueChange={(v) => update("weeklyDigestDay", v)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Separator />

              {/* Digest Preview */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Digest includes:</p>
                {[
                  "Total reviews received this week",
                  "Average star rating across all platforms",
                  "Positive / Negative / Neutral sentiment breakdown",
                  "Number of reviews needing action",
                  "Top performing platform",
                  "Direct link to your dashboard",
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery Settings</CardTitle>
              <CardDescription>Control how and when notification emails are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Master toggle for all email notifications</p>
                </div>
                <Switch
                  checked={prefs.emailEnabled}
                  onCheckedChange={(v) => update("emailEnabled", v)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Email Frequency</Label>
                <Select
                  value={prefs.emailFrequency}
                  onValueChange={(v) => update("emailFrequency", v)}
                  disabled={!prefs.emailEnabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant — send immediately when triggered</SelectItem>
                    <SelectItem value="hourly">Hourly digest — batch alerts every hour</SelectItem>
                    <SelectItem value="daily">Daily digest — one email per day</SelectItem>
                    <SelectItem value="never">Never — disable all email alerts</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Low-rating alerts are always sent instantly regardless of this setting.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Recipients</CardTitle>
              <CardDescription>
                Send review alerts to additional team members or email addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addRecipient} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {prefs.additionalRecipients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {prefs.additionalRecipients.map(email => (
                    <Badge key={email} variant="secondary" className="gap-1.5 pr-1">
                      <Mail className="h-3 w-3" />
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No additional recipients. Alerts will only be sent to your account email.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Automation Integration */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Advanced Alerts via Automations</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For more granular control — like alerting only for specific platforms, keywords, or rating ranges — use the Automations module to create custom trigger-based email alerts.
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs" asChild>
                    <a href="/automations">Set up automations →</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Preferences"}
        </Button>
      </div>
    </div>
  )
}
