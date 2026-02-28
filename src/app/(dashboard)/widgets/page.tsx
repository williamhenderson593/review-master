"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, Code2, Copy, ExternalLink, Trash2, Eye, Settings,
  Star, LayoutGrid, Award, Quote, RefreshCw
} from "lucide-react"
import { toast } from "sonner"

const WIDGET_TYPES = [
  {
    value: "carousel",
    label: "Carousel",
    description: "Rotating slideshow of reviews",
    icon: RefreshCw,
    preview: "A beautiful rotating carousel of your best reviews",
  },
  {
    value: "wall_of_love",
    label: "Wall of Love",
    description: "Grid layout showing multiple reviews",
    icon: LayoutGrid,
    preview: "A masonry grid showcasing all your reviews",
  },
  {
    value: "badge",
    label: "Rating Badge",
    description: "Compact badge showing your average rating",
    icon: Award,
    preview: "A compact badge with your star rating",
  },
  {
    value: "single_review",
    label: "Single Review",
    description: "Display one featured review",
    icon: Quote,
    preview: "A single highlighted review with author info",
  },
]

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "google", label: "Google" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
  { value: "trustpilot", label: "Trustpilot" },
]

interface Widget {
  id: string
  name: string
  type: string
  isActive: boolean
  config: {
    minRating?: number
    platforms?: string[]
    tags?: string[]
    primaryColor?: string
    maxReviews?: number
  } | null
  embedCode: string | null
  viewCount: number
  createdAt: string
}

function generateEmbedCode(widgetId: string) {
  return `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://app.reviewflow.com"}/widget.js" data-widget-id="${widgetId}" async></script>`
}

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewWidget, setPreviewWidget] = useState<Widget | null>(null)
  const [form, setForm] = useState({
    name: "",
    type: "carousel",
    minRating: "4",
    platforms: "all",
    primaryColor: "#3b82f6",
    maxReviews: "10",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWidgets()
  }, [])

  async function fetchWidgets() {
    try {
      const res = await fetch("/api/v1/widgets")
      const data = await res.json()
      setWidgets(data.widgets || [])
    } catch {
      toast.error("Failed to load widgets")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.type) {
      toast.error("Name and type are required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          config: {
            minRating: parseInt(form.minRating),
            platforms: form.platforms === "all" ? [] : [form.platforms],
            primaryColor: form.primaryColor,
            maxReviews: parseInt(form.maxReviews),
          },
        }),
      })
      if (!res.ok) throw new Error("Failed to create")
      const data = await res.json()
      setWidgets(prev => [data.widget, ...prev])
      setDialogOpen(false)
      setForm({ name: "", type: "carousel", minRating: "4", platforms: "all", primaryColor: "#3b82f6", maxReviews: "10" })
      toast.success("Widget created successfully")
    } catch {
      toast.error("Failed to create widget")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(widget: Widget) {
    try {
      const res = await fetch(`/api/v1/widgets/${widget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !widget.isActive }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setWidgets(prev => prev.map(w => w.id === widget.id ? data.widget : w))
    } catch {
      toast.error("Failed to update widget")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this widget?")) return
    try {
      const res = await fetch(`/api/v1/widgets/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setWidgets(prev => prev.filter(w => w.id !== id))
      toast.success("Widget deleted")
    } catch {
      toast.error("Failed to delete widget")
    }
  }

  function copyEmbedCode(widget: Widget) {
    const code = widget.embedCode || generateEmbedCode(widget.id)
    navigator.clipboard.writeText(code)
    toast.success("Embed code copied to clipboard!")
  }

  const getWidgetTypeConfig = (type: string) => WIDGET_TYPES.find(t => t.value === type)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Widgets</h1>
          <p className="text-muted-foreground">
            Embed review widgets on your website to showcase customer feedback.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Create Widget</DialogTitle>
              <DialogDescription>
                Configure a review widget to embed on your website.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Widget Name *</Label>
                <Input
                  placeholder="e.g. Homepage Reviews Carousel"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Widget Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WIDGET_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: type.value }))}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        form.type === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <type.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${form.type === type.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select value={form.minRating} onValueChange={(v) => setForm(f => ({ ...f, minRating: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platform Filter</Label>
                  <Select value={form.platforms} onValueChange={(v) => setForm(f => ({ ...f, platforms: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Reviews to Show</Label>
                  <Select value={form.maxReviews} onValueChange={(v) => setForm(f => ({ ...f, maxReviews: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 reviews</SelectItem>
                      <SelectItem value="10">10 reviews</SelectItem>
                      <SelectItem value="20">20 reviews</SelectItem>
                      <SelectItem value="50">50 reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={form.primaryColor}
                      onChange={(e) => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating..." : "Create Widget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{widgets.length}</div>
            <p className="text-xs text-muted-foreground">Total Widgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{widgets.filter(w => w.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Active Widgets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{widgets.reduce((sum, w) => sum + w.viewCount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Widget Types Info */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {WIDGET_TYPES.map(type => (
          <Card key={type.value} className="border-dashed">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <type.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-sm">{type.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{type.preview}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets List */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-40" />
            </Card>
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create your first widget to embed reviews on your website and showcase customer feedback.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {widgets.map(widget => {
            const typeConfig = getWidgetTypeConfig(widget.type)
            const Icon = typeConfig?.icon || Code2
            return (
              <Card key={widget.id} className={!widget.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{widget.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {typeConfig?.label} • {widget.viewCount.toLocaleString()} views
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={widget.isActive}
                      onCheckedChange={() => handleToggle(widget)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Config Summary */}
                  <div className="flex flex-wrap gap-1.5">
                    {widget.config?.minRating && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="h-2.5 w-2.5" />
                        {widget.config.minRating}+ stars
                      </Badge>
                    )}
                    {widget.config?.platforms && widget.config.platforms.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {widget.config.platforms.join(", ")}
                      </Badge>
                    )}
                    {widget.config?.maxReviews && (
                      <Badge variant="secondary" className="text-xs">
                        Max {widget.config.maxReviews} reviews
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Embed Code */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Embed Code</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-2 py-1.5 text-xs font-mono truncate">
                        {widget.embedCode || generateEmbedCode(widget.id)}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyEmbedCode(widget)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(widget.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Guide</CardTitle>
          <CardDescription>How to add a widget to your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { step: "1", title: "Create a widget", description: "Configure your widget type, filters, and appearance above." },
              { step: "2", title: "Copy the embed code", description: "Click the copy button next to your widget's embed code." },
              { step: "3", title: "Paste on your website", description: "Add the script tag to your website's HTML, just before the closing </body> tag." },
              { step: "4", title: "Auto-updates", description: "Your widget will automatically update as new reviews come in." },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
