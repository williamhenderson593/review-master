"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  MessageSquare, CheckCircle2, AlertCircle, RefreshCw, Send,
  Shield, Zap, DollarSign, ExternalLink, Info
} from "lucide-react"
import { toast } from "sonner"

interface SMSStatus {
  configured: boolean
  senderId: string | null
  username: string | null
  isSandbox: boolean
  balance: string | null
  balanceError?: string
}

export default function AdminSMSPage() {
  const [status, setStatus] = useState<SMSStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("Hi! This is a test SMS from ReviewFlow. Your review request will look like this.")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    setLoading(true)
    try {
      const res = await fetch("/api/v1/sms/status")
      const data = await res.json()
      setStatus(data)
    } catch {
      toast.error("Failed to load SMS status")
    } finally {
      setLoading(false)
    }
  }

  async function sendTestSMS() {
    if (!testPhone) {
      toast.error("Please enter a phone number")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/v1/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "single",
          phone: testPhone,
          message: testMessage,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`SMS sent! Message ID: ${data.messageId || "N/A"}, Cost: ${data.cost || "N/A"}`)
      } else {
        toast.error(`SMS failed: ${data.error || "Unknown error"}`)
      }
    } catch {
      toast.error("Failed to send test SMS")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">SMS Configuration</h1>
          <Badge variant="secondary" className="text-xs">Super Admin</Badge>
        </div>
        <p className="text-muted-foreground">
          Configure Africa's Talking SMS for the entire platform. All businesses will use this single sender ID to send review request SMS messages.
        </p>
      </div>

      {/* Status Card */}
      {loading ? (
        <Card className="animate-pulse">
          <CardContent className="pt-6 h-32" />
        </Card>
      ) : (
        <Card className={status?.configured ? "border-green-200 bg-green-50/30 dark:bg-green-950/10" : "border-orange-200 bg-orange-50/30 dark:bg-orange-950/10"}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className={`rounded-xl p-3 ${status?.configured ? "bg-green-100 dark:bg-green-900" : "bg-orange-100 dark:bg-orange-900"}`}>
                {status?.configured ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">
                    {status?.configured ? "SMS is Active" : "SMS Not Configured"}
                  </h3>
                  {status?.isSandbox && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">Sandbox Mode</Badge>
                  )}
                </div>
                {status?.configured ? (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Sender ID: <span className="font-medium text-foreground">{status.senderId}</span></p>
                    <p>Username: <span className="font-medium text-foreground">{status.username}</span></p>
                    <p>Balance: <span className="font-medium text-foreground">{status.balance || "N/A"}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Set the environment variables below to enable SMS for all businesses on the platform.
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="gap-2 flex-shrink-0" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Africa's Talking Configuration
          </CardTitle>
          <CardDescription>
            Set these environment variables on your server to enable SMS. All businesses on the platform will share this configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <p className="text-sm font-semibold">Required Environment Variables</p>
            <div className="space-y-2">
              {[
                {
                  key: "AT_API_KEY",
                  description: "Your Africa's Talking API key",
                  example: "atsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                },
                {
                  key: "AT_USERNAME",
                  description: "Your Africa's Talking username (use 'sandbox' for testing)",
                  example: "your_username",
                },
                {
                  key: "AT_SENDER_ID",
                  description: "Sender ID shown to recipients (max 11 chars, alphanumeric)",
                  example: "ReviewFlow",
                },
              ].map(env => (
                <div key={env.key} className="rounded bg-background p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-primary">{env.key}</code>
                    <span className="text-xs text-muted-foreground">— {env.description}</span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">Example: {env.example}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <p className="font-medium">How to get your Africa's Talking credentials:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Sign up at <a href="https://africastalking.com" target="_blank" rel="noopener noreferrer" className="underline">africastalking.com</a></li>
                  <li>Go to Settings → API Key to get your API key</li>
                  <li>Your username is shown in your account dashboard</li>
                  <li>Register a Sender ID in the SMS section (or use a shortcode)</li>
                  <li>Use username "sandbox" for testing (free, no real SMS sent)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://africastalking.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Africa's Talking Dashboard
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://developers.africastalking.com/docs/sms/sending" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                API Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test SMS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Test SMS
          </CardTitle>
          <CardDescription>
            Test your SMS configuration by sending a test message to a phone number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.configured && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 p-3 text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              SMS is not configured. Set the environment variables above first.
            </div>
          )}

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="+254712345678 (include country code)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              disabled={!status?.configured}
            />
            <p className="text-xs text-muted-foreground">Include country code (e.g., +254 for Kenya, +1 for USA)</p>
          </div>

          <div className="space-y-2">
            <Label>Test Message</Label>
            <textarea
              className="w-full rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              disabled={!status?.configured}
            />
            <p className="text-xs text-muted-foreground">
              {testMessage.length} characters · {Math.ceil(testMessage.length / 160)} SMS segment(s)
            </p>
          </div>

          <Button
            className="gap-2"
            onClick={sendTestSMS}
            disabled={!status?.configured || sending || !testPhone}
          >
            {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : "Send Test SMS"}
          </Button>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How SMS Works in ReviewFlow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              icon: Shield,
              title: "Platform-level configuration",
              desc: "You configure Africa's Talking once here. All businesses on the platform use this same sender ID — they don't need their own AT accounts.",
            },
            {
              icon: MessageSquare,
              title: "Businesses create SMS campaigns",
              desc: "Businesses go to Campaigns → Create Campaign → select 'SMS' type. They write their message template and select contacts to send to.",
            },
            {
              icon: Send,
              title: "SMS is sent via Africa's Talking",
              desc: "When a campaign is activated, ReviewFlow sends SMS messages through Africa's Talking using your configured sender ID.",
            },
            {
              icon: DollarSign,
              title: "Billing",
              desc: "SMS costs are charged to your Africa's Talking account balance. Monitor your balance in the status card above.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
