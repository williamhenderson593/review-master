"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Plus, Zap, Mail, Slack, Bell, Webhook, Tag, UserCheck,
  Trash2, Edit, Play, Pause, ChevronRight, AlertCircle, Star
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const TRIGGER_TYPES = [
  { value: "new_review", label: "New Review Received", description: "Triggers when any new review is posted" },
  { value: "rating_below", label: "Rating Below Threshold", description: "Triggers when a review rating is below a set value" },
  { value: "rating_above", label: "Rating Above Threshold", description: "Triggers when a review rating is above a set value" },
  { value: "sentiment_negative", label: "Negative Sentiment", description: "Triggers when a review has negative sentiment" },
  { value: "keyword_match", label: "Keyword Match", description: "Triggers when a review contains specific keywords" },
  { value: "no_reply_24h", label: "No Reply in 24 Hours", description: "Triggers when a review hasn't been replied to in 24 hours" },
]

const ACTION_TYPES = [
  { value: "email_alert", label: "Send Email Alert", icon: Mail, description: "Send an email notification" },
  { value: "slack_notification", label: "Slack Notification", icon: Slack, description: "Post to a Slack channel" },
  { value: "teams_notification", label: "Teams Notification", icon: Bell, description: "Post to Microsoft Teams" },
  { value: "webhook", label: "Webhook", icon: Webhook, description: "Send data to a webhook URL" },
  { value: "tag_review", label: "Tag Review", icon: Tag, description: "Automatically tag the review" },
  { value: "assign_review", label: "Assign Review", icon: UserCheck, description: "Assign review to a team member" },
]

interface Automation {
  id: string
  name: string
  description: string | null
  isActive: boolean
  triggerType: string
  triggerConditions: Record<string, any> | null
  actionType: string
  actionConfig: Record<string, any> | null
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string
}

function getTriggerLabel(type: string) {
  return TRIGGER_TYPES.find(t => t.value === type)?.label || type
}

function getActionLabel(type: string) {
  return ACTION_TYPES.find(a => a.value === type)?.label || type
}

function getActionIcon(type: string) {
  return ACTION_TYPES.find(a => a.value === type)?.icon || Bell
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    triggerType: "",
    triggerConditions: {
      platforms: [] as string[],
      minRating: "",
      maxRating: "",
      keywords: "",
    },
    actionType: "",
    actionConfig: {
      to: "",
      channel: "",
      webhookUrl: "",
      tag: "",
    },
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAutomations()
  }, [])

  async function fetchAutomations() {
    try {
      const res = await fetch("/api/v1/automations")
      const data = await res.json()
      setAutomations(data.automations || [])
    } catch {
      toast.error("Failed to load automations")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.triggerType || !form.actionType) {
      toast.error("Name, trigger, and action are required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          triggerType: form.triggerType,
          triggerConditions: form.triggerConditions,
          actionType: form.actionType,
          actionConfig: form.actionConfig,
        }),
      })
      if (!res.ok) throw new Error("Failed to create")
      const data = await res.json()
      setAutomations(prev => [data.automation, ...prev])
      setDialogOpen(false)
      setForm({
        name: "", description: "", triggerType: "",
        triggerConditions: { platforms: [], minRating: "", maxRating: "", keywords: "" },
        actionType: "",
        actionConfig: { to: "", channel: "", webhookUrl: "", tag: "" },
      })
      toast.success("Automation created successfully")
    } catch {
      toast.error("Failed to create automation")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(automation: Automation) {
    try {
      const res = await fetch(`/api/v1/automations/${automation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !automation.isActive }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setAutomations(prev => prev.map(a => a.id === automation.id ? data.automation : a))
      toast.success(automation.isActive ? "Automation paused" : "Automation activated")
    } catch {
      toast.error("Failed to update automation")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return
    try {
      const res = await fetch(`/api/v1/automations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setAutomations(prev => prev.filter(a => a.id !== id))
      toast.success("Automation deleted")
    } catch {
      toast.error("Failed to delete automation")
    }
  }

  const activeCount = automations.filter(a => a.isActive).length

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-muted-foreground">
            Set up automated actions when new reviews come in or specific conditions are met.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
              <DialogDescription>
                Define a trigger and action to automate your review workflow.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Automation Name *</Label>
                <Input
                  placeholder="e.g. Alert team on negative reviews"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What does this automation do?"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <Separator />
              <div className="space-y-2">
                <Label className="text-base font-semibold">When (Trigger) *</Label>
                <Select value={form.triggerType} onValueChange={(v) => setForm(f => ({ ...f, triggerType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div>
                          <div className="font-medium">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(form.triggerType === "rating_below" || form.triggerType === "rating_above") && (
                <div className="space-y-2">
                  <Label>Rating Threshold</Label>
                  <Select
                    value={form.triggerConditions.minRating}
                    onValueChange={(v) => setForm(f => ({
                      ...f,
                      triggerConditions: { ...f.triggerConditions, minRating: v }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(r => (
                        <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.triggerType === "keyword_match" && (
                <div className="space-y-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    placeholder="e.g. refund, broken, terrible"
                    value={form.triggerConditions.keywords}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      triggerConditions: { ...f.triggerConditions, keywords: e.target.value }
                    }))}
                  />
                </div>
              )}

              <Separator />
              <div className="space-y-2">
                <Label className="text-base font-semibold">Then (Action) *</Label>
                <Select value={form.actionType} onValueChange={(v) => setForm(f => ({ ...f, actionType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(a => (
                      <SelectItem key={a.value} value={a.value}>
                        <div className="flex items-center gap-2">
                          <a.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{a.label}</div>
                            <div className="text-xs text-muted-foreground">{a.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.actionType === "email_alert" && (
                <div className="space-y-2">
                  <Label>Send to (email addresses, comma-separated)</Label>
                  <Input
                    placeholder="team@company.com, manager@company.com"
                    value={form.actionConfig.to}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      actionConfig: { ...f.actionConfig, to: e.target.value }
                    }))}
                  />
                </div>
              )}

              {(form.actionType === "slack_notification" || form.actionType === "teams_notification") && (
                <div className="space-y-2">
                  <Label>Channel / Webhook URL</Label>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={form.actionConfig.channel}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      actionConfig: { ...f.actionConfig, channel: e.target.value }
                    }))}
                  />
                </div>
              )}

              {form.actionType === "webhook" && (
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-server.com/webhook"
                    value={form.actionConfig.webhookUrl}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      actionConfig: { ...f.actionConfig, webhookUrl: e.target.value }
                    }))}
                  />
                </div>
              )}

              {form.actionType === "tag_review" && (
                <div className="space-y-2">
                  <Label>Tag to Apply</Label>
                  <Input
                    placeholder="e.g. urgent, follow-up"
                    value={form.actionConfig.tag}
                    onChange={(e) => setForm(f => ({
                      ...f,
                      actionConfig: { ...f.actionConfig, tag: e.target.value }
                    }))}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating..." : "Create Automation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">Total Automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.triggerCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Triggers</p>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-24" />
            </Card>
          ))}
        </div>
      ) : automations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create automations to automatically respond to reviews, send alerts, or tag reviews based on conditions.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map(automation => {
            const ActionIcon = getActionIcon(automation.actionType)
            return (
              <Card key={automation.id} className={!automation.isActive ? "opacity-60" : ""}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{automation.name}</h3>
                        <Badge variant={automation.isActive ? "default" : "secondary"} className="text-xs">
                          {automation.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      {automation.description && (
                        <p className="text-sm text-muted-foreground mb-2">{automation.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
                          <Zap className="h-3.5 w-3.5 text-orange-500" />
                          <span className="text-xs">{getTriggerLabel(automation.triggerType)}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1">
                          <ActionIcon className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs">{getActionLabel(automation.actionType)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium">{automation.triggerCount}</p>
                        <p className="text-xs text-muted-foreground">triggers</p>
                      </div>
                      {automation.lastTriggeredAt && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">Last triggered</p>
                          <p className="text-xs">{format(new Date(automation.lastTriggeredAt), "MMM d")}</p>
                        </div>
                      )}
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => handleToggle(automation)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(automation.id)}
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

      {/* Templates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Automation Templates</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Alert on 1-2 Star Reviews",
              description: "Get an email alert whenever a low-rating review is posted",
              trigger: "rating_below",
              action: "email_alert",
              icon: AlertCircle,
              color: "text-red-500",
            },
            {
              name: "Slack New Review Notification",
              description: "Post all new reviews to your team's Slack channel",
              trigger: "new_review",
              action: "slack_notification",
              icon: Slack,
              color: "text-purple-500",
            },
            {
              name: "Tag Negative Reviews",
              description: "Automatically tag reviews with negative sentiment",
              trigger: "sentiment_negative",
              action: "tag_review",
              icon: Tag,
              color: "text-orange-500",
            },
            {
              name: "Celebrate 5-Star Reviews",
              description: "Post 5-star reviews to your team channel",
              trigger: "rating_above",
              action: "slack_notification",
              icon: Star,
              color: "text-yellow-500",
            },
          ].map(template => (
            <Card
              key={template.name}
              className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed"
              onClick={() => {
                setForm(f => ({
                  ...f,
                  name: template.name,
                  description: template.description,
                  triggerType: template.trigger,
                  actionType: template.action,
                }))
                setDialogOpen(true)
              }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <template.icon className={`h-5 w-5 ${template.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
