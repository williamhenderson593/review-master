"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, Send, Mail, MessageSquare, QrCode, Link2, Copy, ExternalLink,
  Trash2, Play, Pause, BarChart3, Users, CheckCircle2, Clock, Edit
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const PLATFORMS = [
  { value: "google", label: "Google" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "appstore", label: "App Store" },
  { value: "playstore", label: "Play Store" },
]

const CAMPAIGN_TYPES = [
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "magic_link", label: "Magic Link", icon: Link2 },
  { value: "qr_code", label: "QR Code", icon: QrCode },
]

const TRIGGER_EVENTS = [
  { value: "manual", label: "Manual / On-demand" },
  { value: "post_onboarding", label: "After Onboarding" },
  { value: "post_nps", label: "After NPS Survey" },
  { value: "post_support", label: "After Support Ticket Closed" },
  { value: "post_purchase", label: "After Purchase" },
]

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  targetPlatforms: string[]
  subject: string | null
  messageTemplate: string | null
  magicLinkUrl: string | null
  triggerEvent: string | null
  isIncentivized: boolean
  reputationProtection: boolean
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalReviewed: number
  createdAt: string
}

function getStatusBadge(status: string) {
  const config = {
    draft: { label: "Draft", variant: "secondary" as const },
    active: { label: "Active", variant: "default" as const },
    paused: { label: "Paused", variant: "outline" as const },
    completed: { label: "Completed", variant: "secondary" as const },
  }
  const c = config[status as keyof typeof config] || { label: status, variant: "secondary" as const }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

function ConversionRate({ sent, reviewed }: { sent: number; reviewed: number }) {
  const rate = sent > 0 ? Math.round((reviewed / sent) * 100) : 0
  return (
    <div className="text-center">
      <p className="text-lg font-bold">{rate}%</p>
      <p className="text-xs text-muted-foreground">Conversion</p>
    </div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [form, setForm] = useState({
    name: "",
    type: "email",
    targetPlatforms: [] as string[],
    subject: "",
    messageTemplate: "",
    triggerEvent: "manual",
    isIncentivized: false,
    incentiveDetails: "",
    reputationProtection: false,
    reputationThreshold: "3",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const res = await fetch("/api/v1/campaigns")
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch {
      toast.error("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name) {
      toast.error("Campaign name is required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create")
      const data = await res.json()
      setCampaigns(prev => [data.campaign, ...prev])
      setDialogOpen(false)
      setForm({
        name: "", type: "email", targetPlatforms: [], subject: "",
        messageTemplate: "", triggerEvent: "manual", isIncentivized: false,
        incentiveDetails: "", reputationProtection: false, reputationThreshold: "3",
      })
      toast.success("Campaign created successfully")
    } catch {
      toast.error("Failed to create campaign")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(campaign: Campaign, newStatus: string) {
    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? data.campaign : c))
      toast.success(`Campaign ${newStatus}`)
    } catch {
      toast.error("Failed to update campaign")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this campaign?")) return
    try {
      const res = await fetch(`/api/v1/campaigns/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast.success("Campaign deleted")
    } catch {
      toast.error("Failed to delete campaign")
    }
  }

  function togglePlatform(platform: string) {
    setForm(f => ({
      ...f,
      targetPlatforms: f.targetPlatforms.includes(platform)
        ? f.targetPlatforms.filter(p => p !== platform)
        : [...f.targetPlatforms, platform],
    }))
  }

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === "all") return true
    return c.status === activeTab
  })

  const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0)
  const totalReviewed = campaigns.reduce((sum, c) => sum + c.totalReviewed, 0)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Generate more reviews by sending review requests to your customers.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Set up a review request campaign to collect more reviews from your customers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g. Post-Onboarding Review Request"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CAMPAIGN_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: type.value }))}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors ${
                        form.type === type.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <type.icon className="h-5 w-5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Platforms</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePlatform(p.value)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        form.targetPlatforms.includes(p.value)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select value={form.triggerEvent} onValueChange={(v) => setForm(f => ({ ...f, triggerEvent: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(form.type === "email" || form.type === "sms") && (
                <>
                  {form.type === "email" && (
                    <div className="space-y-2">
                      <Label>Email Subject</Label>
                      <Input
                        placeholder="We'd love your feedback!"
                        value={form.subject}
                        onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Message Template</Label>
                    <Textarea
                      placeholder="Hi {{name}}, thank you for using our service! We'd love to hear your feedback. Please take a moment to leave us a review: {{review_link}}"
                      value={form.messageTemplate}
                      onChange={(e) => setForm(f => ({ ...f, messageTemplate: e.target.value }))}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {"{{name}}"} for customer name and {"{{review_link}}"} for the review link
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Reputation Protection</p>
                    <p className="text-xs text-muted-foreground">
                      Route unhappy customers to private feedback before public review
                    </p>
                  </div>
                  <Switch
                    checked={form.reputationProtection}
                    onCheckedChange={(v) => setForm(f => ({ ...f, reputationProtection: v }))}
                  />
                </div>

                {form.reputationProtection && (
                  <div className="space-y-2">
                    <Label>Route to private feedback if satisfaction below</Label>
                    <Select
                      value={form.reputationThreshold}
                      onValueChange={(v) => setForm(f => ({ ...f, reputationThreshold: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(r => (
                          <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Incentivized Reviews</p>
                    <p className="text-xs text-muted-foreground">
                      Track reviews that were incentivized (gift cards, discounts, etc.)
                    </p>
                  </div>
                  <Switch
                    checked={form.isIncentivized}
                    onCheckedChange={(v) => setForm(f => ({ ...f, isIncentivized: v }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">Total Campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Requests Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalReviewed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Reviews Generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6 h-28" />
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Create your first campaign to start collecting reviews from your customers.
                </p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map(campaign => {
                const TypeIcon = CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.icon || Send
                const openRate = campaign.totalSent > 0 ? Math.round((campaign.totalOpened / campaign.totalSent) * 100) : 0
                const clickRate = campaign.totalSent > 0 ? Math.round((campaign.totalClicked / campaign.totalSent) * 100) : 0
                const convRate = campaign.totalSent > 0 ? Math.round((campaign.totalReviewed / campaign.totalSent) * 100) : 0

                return (
                  <Card key={campaign.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-muted p-2 flex-shrink-0">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            {getStatusBadge(campaign.status)}
                            {campaign.isIncentivized && (
                              <Badge variant="outline" className="text-xs">Incentivized</Badge>
                            )}
                            {campaign.reputationProtection && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200">Protected</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span>{CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.label}</span>
                            {campaign.targetPlatforms.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{campaign.targetPlatforms.join(", ")}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Created {format(new Date(campaign.createdAt), "MMM d, yyyy")}</span>
                          </div>

                          {/* Funnel Stats */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-sm font-semibold">{campaign.totalSent}</p>
                              <p className="text-xs text-muted-foreground">Sent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold">{openRate}%</p>
                              <p className="text-xs text-muted-foreground">Opened</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold">{clickRate}%</p>
                              <p className="text-xs text-muted-foreground">Clicked</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-green-600">{convRate}%</p>
                              <p className="text-xs text-muted-foreground">Reviewed</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {campaign.magicLinkUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(campaign.magicLinkUrl!)
                                toast.success("Magic link copied!")
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy Link
                            </Button>
                          )}
                          {campaign.status === "draft" && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => handleStatusChange(campaign, "active")}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Activate
                            </Button>
                          )}
                          {campaign.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => handleStatusChange(campaign, "paused")}
                            >
                              <Pause className="h-3.5 w-3.5" />
                              Pause
                            </Button>
                          )}
                          {campaign.status === "paused" && (
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => handleStatusChange(campaign, "active")}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
