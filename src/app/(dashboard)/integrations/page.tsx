"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plug, CheckCircle2, AlertCircle, ExternalLink, Settings, Trash2,
  Mail, MessageSquare, Zap, Database, Globe, Users
} from "lucide-react"
import { toast } from "sonner"

interface IntegrationConfig {
  id: string
  type: string
  name: string
  description: string
  category: string
  icon: React.ElementType
  color: string
  fields: Array<{
    key: string
    label: string
    type: string
    placeholder: string
    required?: boolean
  }>
  docsUrl?: string
}

const INTEGRATION_CONFIGS: IntegrationConfig[] = [
  {
    id: "slack",
    type: "slack",
    name: "Slack",
    description: "Post new reviews to Slack channels and get real-time notifications",
    category: "notifications",
    icon: MessageSquare,
    color: "bg-purple-500",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/...", required: true },
      { key: "channel", label: "Channel Name", type: "text", placeholder: "#reviews" },
    ],
    docsUrl: "https://api.slack.com/messaging/webhooks",
  },
  {
    id: "gmail",
    type: "gmail",
    name: "Gmail",
    description: "Send review request emails via your Gmail account",
    category: "email",
    icon: Mail,
    color: "bg-red-500",
    fields: [
      { key: "email", label: "Gmail Address", type: "email", placeholder: "you@gmail.com", required: true },
      { key: "appPassword", label: "App Password", type: "password", placeholder: "Gmail app password", required: true },
    ],
  },
  {
    id: "outlook",
    type: "outlook",
    name: "Outlook / Office 365",
    description: "Send review request emails via your Outlook account",
    category: "email",
    icon: Mail,
    color: "bg-blue-600",
    fields: [
      { key: "email", label: "Email Address", type: "email", placeholder: "you@company.com", required: true },
      { key: "clientId", label: "Azure App Client ID", type: "text", placeholder: "Azure AD App Client ID" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Azure AD App Secret" },
    ],
  },
  {
    id: "teams",
    type: "teams",
    name: "Microsoft Teams",
    description: "Post review notifications to Microsoft Teams channels",
    category: "notifications",
    icon: Users,
    color: "bg-blue-700",
    fields: [
      { key: "webhookUrl", label: "Incoming Webhook URL", type: "url", placeholder: "https://outlook.office.com/webhook/...", required: true },
      { key: "channel", label: "Channel Name", type: "text", placeholder: "General" },
    ],
  },
  {
    id: "live_agent",
    type: "live_agent",
    name: "Live Agent / Intercom",
    description: "Sync reviews with your customer support platform",
    category: "crm",
    icon: MessageSquare,
    color: "bg-blue-500",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Your Live Agent API key", required: true },
      { key: "subdomain", label: "Subdomain", type: "text", placeholder: "yourcompany" },
    ],
  },
  {
    id: "zapier",
    type: "zapier",
    name: "Zapier",
    description: "Connect to 5,000+ apps via Zapier webhooks",
    category: "automation",
    icon: Zap,
    color: "bg-orange-500",
    fields: [
      { key: "webhookUrl", label: "Zapier Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/hooks/catch/...", required: true },
    ],
  },
  {
    id: "hubspot",
    type: "hubspot",
    name: "HubSpot",
    description: "Sync contacts and reviews with HubSpot CRM",
    category: "crm",
    icon: Database,
    color: "bg-orange-600",
    fields: [
      { key: "apiKey", label: "HubSpot API Key", type: "password", placeholder: "Your HubSpot private app token", required: true },
      { key: "portalId", label: "Portal ID", type: "text", placeholder: "Your HubSpot portal ID" },
    ],
  },
  {
    id: "salesforce",
    type: "salesforce",
    name: "Salesforce",
    description: "Sync reviews and contacts with Salesforce CRM",
    category: "crm",
    icon: Database,
    color: "bg-blue-500",
    fields: [
      { key: "instanceUrl", label: "Instance URL", type: "url", placeholder: "https://yourorg.salesforce.com", required: true },
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "Salesforce access token", required: true },
    ],
  },
  {
    id: "webhook",
    type: "webhook",
    name: "Custom Webhook",
    description: "Send review data to any custom endpoint",
    category: "automation",
    icon: Globe,
    color: "bg-gray-600",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", placeholder: "https://your-server.com/webhook", required: true },
      { key: "secret", label: "Webhook Secret (optional)", type: "password", placeholder: "For signature verification" },
    ],
  },
]

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "notifications", label: "Notifications" },
  { value: "email", label: "Email" },
  { value: "crm", label: "CRM" },
  { value: "automation", label: "Automation" },
]

interface ConnectedIntegration {
  id: string
  type: string
  name: string
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
  config: Record<string, any> | null
}

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<ConnectedIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [configDialog, setConfigDialog] = useState<{ open: boolean; config: IntegrationConfig | null }>({
    open: false,
    config: null,
  })
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  async function fetchIntegrations() {
    try {
      const res = await fetch("/api/v1/integrations")
      const data = await res.json()
      setConnected(data.integrations || [])
    } catch {
      toast.error("Failed to load integrations")
    } finally {
      setLoading(false)
    }
  }

  function openConfig(config: IntegrationConfig) {
    setConfigDialog({ open: true, config })
    setFormValues({})
  }

  async function handleConnect() {
    if (!configDialog.config) return

    // Validate required fields
    const missingFields = configDialog.config.fields
      .filter(f => f.required && !formValues[f.key])
      .map(f => f.label)

    if (missingFields.length > 0) {
      toast.error(`Required fields: ${missingFields.join(", ")}`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: configDialog.config.type,
          name: configDialog.config.name,
          config: formValues,
        }),
      })
      if (!res.ok) throw new Error("Failed to connect")
      const data = await res.json()
      setConnected(prev => [data.integration, ...prev])
      setConfigDialog({ open: false, config: null })
      toast.success(`${configDialog.config.name} connected successfully`)
    } catch {
      toast.error("Failed to connect integration")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(integration: ConnectedIntegration) {
    try {
      const res = await fetch(`/api/v1/integrations/${integration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !integration.isActive }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const data = await res.json()
      setConnected(prev => prev.map(i => i.id === integration.id ? data.integration : i))
    } catch {
      toast.error("Failed to update integration")
    }
  }

  async function handleDisconnect(id: string, name: string) {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return
    try {
      const res = await fetch(`/api/v1/integrations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to disconnect")
      setConnected(prev => prev.filter(i => i.id !== id))
      toast.success("Integration disconnected")
    } catch {
      toast.error("Failed to disconnect integration")
    }
  }

  const filteredConfigs = INTEGRATION_CONFIGS.filter(c =>
    activeCategory === "all" || c.category === activeCategory
  )

  const connectedTypes = new Set(connected.map(c => c.type))

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your review management with your existing tools and workflows.
        </p>
      </div>

      {/* Connected Integrations */}
      {connected.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Connected ({connected.length})</h2>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {connected.map(integration => {
              const config = INTEGRATION_CONFIGS.find(c => c.type === integration.type)
              const Icon = config?.icon || Plug
              return (
                <Card key={integration.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config?.color || "bg-gray-500"} flex items-center justify-center text-white flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{integration.name}</p>
                          <Badge
                            variant={integration.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {integration.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        {integration.lastUsedAt && (
                          <p className="text-xs text-muted-foreground">
                            Last used {new Date(integration.lastUsedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Switch
                          checked={integration.isActive}
                          onCheckedChange={() => handleToggle(integration)}
                          className="scale-75"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(integration.id, integration.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Separator />
        </div>
      )}

      {/* Available Integrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Integrations</h2>
          <div className="flex gap-1">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="text-xs"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredConfigs.map(config => {
            const isConnected = connectedTypes.has(config.type)
            const Icon = config.icon
            return (
              <Card key={config.id} className={isConnected ? "border-green-200 bg-green-50/30 dark:bg-green-950/10" : ""}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{config.name}</h3>
                        {isConnected && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {config.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            Connected
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => openConfig(config)}
                          >
                            Connect
                          </Button>
                        )}
                        {config.docsUrl && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                            <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              Docs
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog
        open={configDialog.open}
        onOpenChange={(open) => setConfigDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[480px]">
          {configDialog.config && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg ${configDialog.config.color} flex items-center justify-center text-white`}>
                    <configDialog.config.icon className="h-5 w-5" />
                  </div>
                  <DialogTitle>Connect {configDialog.config.name}</DialogTitle>
                </div>
                <DialogDescription>{configDialog.config.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {configDialog.config.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formValues[field.key] || ""}
                      onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                ))}
                {configDialog.config.docsUrl && (
                  <p className="text-xs text-muted-foreground">
                    Need help?{" "}
                    <a
                      href={configDialog.config.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View documentation
                    </a>
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfigDialog({ open: false, config: null })}
                >
                  Cancel
                </Button>
                <Button onClick={handleConnect} disabled={submitting}>
                  {submitting ? "Connecting..." : "Connect"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
