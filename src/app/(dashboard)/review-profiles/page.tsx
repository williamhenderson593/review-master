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
import { Plus, Globe, RefreshCw, Trash2, ExternalLink, AlertCircle, CheckCircle2, Clock, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

const PLATFORMS = [
  { value: "google", label: "Google Business", color: "bg-blue-500" },
  { value: "tripadvisor", label: "TripAdvisor", color: "bg-green-600" },
  { value: "g2", label: "G2", color: "bg-orange-500" },
  { value: "capterra", label: "Capterra", color: "bg-blue-600" },
  { value: "trustpilot", label: "Trustpilot", color: "bg-green-500" },
  { value: "appstore", label: "App Store", color: "bg-blue-400" },
  { value: "playstore", label: "Play Store", color: "bg-green-400" },
  { value: "software_advice", label: "Software Advice", color: "bg-orange-400" },
  { value: "gartner", label: "Gartner Peer Insights", color: "bg-red-500" },
  { value: "trustradius", label: "TrustRadius", color: "bg-purple-500" },
  { value: "shopify", label: "Shopify App Store", color: "bg-green-700" },
  { value: "wordpress", label: "WordPress Plugin Directory", color: "bg-blue-700" },
  { value: "salesforce", label: "Salesforce AppExchange", color: "bg-blue-500" },
  { value: "hubspot", label: "HubSpot Marketplace", color: "bg-orange-600" },
  { value: "pipedrive", label: "Pipedrive Marketplace", color: "bg-green-600" },
]

interface ReviewProfile {
  id: string
  name: string
  platform: string
  platformProfileId: string | null
  profileUrl: string | null
  isActive: boolean
  isCompetitor: boolean
  syncStatus: string | null
  lastSyncedAt: string | null
  createdAt: string
}

function getPlatformLabel(value: string) {
  return PLATFORMS.find(p => p.value === value)?.label || value
}

function getPlatformColor(value: string) {
  return PLATFORMS.find(p => p.value === value)?.color || "bg-gray-500"
}

function SyncStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "pending") {
    return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
  }
  if (status === "syncing") {
    return <Badge variant="secondary" className="gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Syncing</Badge>
  }
  if (status === "synced") {
    return <Badge className="gap-1 bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3" />Synced</Badge>
  }
  if (status === "error") {
    return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>
  }
  return null
}

export default function ReviewProfilesPage() {
  const [profiles, setProfiles] = useState<ReviewProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    platform: "",
    platformProfileId: "",
    profileUrl: "",
    isCompetitor: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const res = await fetch("/api/v1/review-profiles")
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch {
      toast.error("Failed to load review profiles")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.platform) {
      toast.error("Name and platform are required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/review-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create")
      const data = await res.json()
      setProfiles(prev => [data.profile, ...prev])
      setDialogOpen(false)
      setForm({ name: "", platform: "", platformProfileId: "", profileUrl: "", isCompetitor: false })
      toast.success("Review profile created successfully")
    } catch {
      toast.error("Failed to create review profile")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSimulateReviews(profileId?: string) {
    setSimulating(profileId || "new")
    try {
      const res = await fetch("/api/v1/seed-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      })
      if (!res.ok) throw new Error("Failed to simulate")
      const data = await res.json()
      toast.success(`Simulated ${data.inserted} TripAdvisor reviews! (${data.skipped} already existed)`)
      fetchProfiles()
    } catch {
      toast.error("Failed to simulate reviews")
    } finally {
      setSimulating(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review profile? All associated reviews will also be deleted.")) return
    try {
      const res = await fetch(`/api/v1/review-profiles/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setProfiles(prev => prev.filter(p => p.id !== id))
      toast.success("Review profile deleted")
    } catch {
      toast.error("Failed to delete review profile")
    }
  }

  async function handleToggleActive(profile: ReviewProfile) {
    try {
      const res = await fetch(`/api/v1/review-profiles/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !profile.isActive }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setProfiles(prev => prev.map(p => p.id === profile.id ? data.profile : p))
    } catch {
      toast.error("Failed to update profile")
    }
  }

  const activeProfiles = profiles.filter(p => !p.isCompetitor)
  const competitorProfiles = profiles.filter(p => p.isCompetitor)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Profiles</h1>
          <p className="text-muted-foreground">
            Connect your business profiles from review platforms to start collecting and monitoring reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleSimulateReviews()}
            disabled={simulating !== null}
          >
            {simulating === "new" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Simulate TripAdvisor Reviews
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Profile
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Review Profile</DialogTitle>
              <DialogDescription>
                Connect a business profile from a review platform to start monitoring reviews.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select value={form.platform} onValueChange={(v) => setForm(f => ({ ...f, platform: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Ibis Styles Hotel - TripAdvisor"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileUrl">Profile URL</Label>
                <Input
                  id="profileUrl"
                  placeholder="https://www.tripadvisor.com/Hotel_Review-..."
                  value={form.profileUrl}
                  onChange={(e) => setForm(f => ({ ...f, profileUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformProfileId">Platform Profile ID (optional)</Label>
                <Input
                  id="platformProfileId"
                  placeholder="External ID on the platform"
                  value={form.platformProfileId}
                  onChange={(e) => setForm(f => ({ ...f, platformProfileId: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Competitor Profile</p>
                  <p className="text-xs text-muted-foreground">Track this as a competitor instead of your own profile</p>
                </div>
                <Switch
                  checked={form.isCompetitor}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isCompetitor: v }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting} className="gap-2">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? "Creating..." : "Add Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeProfiles.length}</div>
            <p className="text-xs text-muted-foreground">Connected Profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{competitorProfiles.length}</div>
            <p className="text-xs text-muted-foreground">Competitor Profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{profiles.filter(p => p.syncStatus === "synced").length}</div>
            <p className="text-xs text-muted-foreground">Synced Profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{new Set(profiles.map(p => p.platform)).size}</div>
            <p className="text-xs text-muted-foreground">Platforms Connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Profiles */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Profiles</h2>
        {loading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-32" />
              </Card>
            ))}
          </div>
        ) : activeProfiles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No profiles connected yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Connect your business profiles from review platforms like Google, TripAdvisor, G2, and more.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeProfiles.map(profile => (
              <Card key={profile.id} className={!profile.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getPlatformColor(profile.platform)} flex items-center justify-center text-white text-xs font-bold`}>
                        {getPlatformLabel(profile.platform).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{profile.name}</CardTitle>
                        <CardDescription className="text-xs">{getPlatformLabel(profile.platform)}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={profile.isActive}
                      onCheckedChange={() => handleToggleActive(profile)}
                      className="mt-1"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <SyncStatusBadge status={profile.syncStatus} />
                    {profile.lastSyncedAt && (
                      <span className="text-xs text-muted-foreground">
                        Last synced {new Date(profile.lastSyncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    {profile.profileUrl && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                        <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          View Profile
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Competitor Profiles */}
      {competitorProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Competitor Profiles</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {competitorProfiles.map(profile => (
              <Card key={profile.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getPlatformColor(profile.platform)} flex items-center justify-center text-white text-xs font-bold opacity-70`}>
                        {getPlatformLabel(profile.platform).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{profile.name}</CardTitle>
                        <CardDescription className="text-xs">{getPlatformLabel(profile.platform)}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Competitor</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {profile.profileUrl && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                        <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          View Profile
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Supported Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Platforms</CardTitle>
          <CardDescription>We support reviews from these platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <Badge key={p.value} variant="secondary" className="gap-1.5">
                <div className={`w-2 h-2 rounded-full ${p.color}`} />
                {p.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
