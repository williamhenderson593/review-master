"use client"

import { LandingNavbar } from '../components/navbar'
import { LandingFooter } from '../components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative">
      <CopyButton text={code} />
      <pre className="bg-muted/50 border rounded-lg p-4 pr-10 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function EndpointCard({
  method,
  path,
  description,
  params,
  curl,
  response,
}: {
  method: string
  path: string
  description: string
  params?: { name: string; type: string; description: string; required?: boolean }[]
  curl: string
  response: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 font-mono text-xs">
            {method}
          </Badge>
          <code className="text-sm font-mono">{path}</code>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {params && params.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Parameters</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                    <th className="text-left px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((param) => (
                    <tr key={param.name} className="border-t">
                      <td className="px-3 py-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{param.name}</code>
                        {param.required && <span className="text-red-500 ml-1 text-xs">*</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                      <td className="px-3 py-2 text-muted-foreground">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-2">Example Request</h4>
          <CodeBlock code={curl} />
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Example Response</h4>
          <CodeBlock code={response} language="json" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ApiDocsPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/landing"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-12">
            <Badge variant="outline" className="mb-4">Developer</Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">API Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Access your Annalytick project data programmatically using our REST API.
            </p>
          </div>

          {/* Authentication */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All API requests require authentication using an API key. You can generate API keys from your dashboard under <strong>Settings → Connections</strong>. Include your API key in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
            </p>
            <CodeBlock code={`curl -H "Authorization: Bearer annalytick_your_api_key_here" \\
  https://annalytick.com/api/public/v1/projects/:uuid/datastore`} />

            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Important:</strong> Keep your API keys secret. Do not expose them in client-side code, public repositories, or share them with unauthorized users. API keys can be configured with expiration dates for added security.
              </p>
            </div>
          </section>

          {/* Base URL */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
            <CodeBlock code="https://annalytick.com/api/public/v1" />
          </section>

          {/* Error Responses */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Error Responses</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The API returns standard HTTP status codes. Error responses include a JSON body with an <code className="bg-muted px-1.5 py-0.5 rounded text-sm">error</code> field.
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">200</code></td>
                    <td className="px-3 py-2 text-muted-foreground">Success</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">400</code></td>
                    <td className="px-3 py-2 text-muted-foreground">Bad request — invalid parameters</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">401</code></td>
                    <td className="px-3 py-2 text-muted-foreground">Unauthorized — missing, invalid, or expired API key</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">404</code></td>
                    <td className="px-3 py-2 text-muted-foreground">Not found — resource does not exist or access denied</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">500</code></td>
                    <td className="px-3 py-2 text-muted-foreground">Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <CodeBlock code={`{
  "error": "API key has expired. Please generate a new key from Settings → Connections."
}`} />
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

            <EndpointCard
              method="GET"
              path="/projects/:uuid/datastore"
              description="Retrieve all output data from all succeeded runs across all actors in a project. Data is combined from every run into a single response."
              params={[
                { name: "uuid", type: "string", description: "Project UUID (from your project URL)", required: true },
                { name: "limit", type: "integer", description: "Max items to return (default: 1000, max: 10000)" },
                { name: "offset", type: "integer", description: "Pagination offset (default: 0)" },
                { name: "actorId", type: "string", description: "Filter by specific Apify actor ID" },
                { name: "startDate", type: "string", description: "Filter runs started after this date (ISO 8601)" },
                { name: "endDate", type: "string", description: "Filter runs started before this date (ISO 8601)" },
              ]}
              curl={`curl -H "Authorization: Bearer annalytick_abc123..." \\
  "https://annalytick.com/api/public/v1/projects/129e348e-.../datastore?limit=100"`}
              response={`{
  "success": true,
  "data": [
    {
      "title": "Example Product",
      "price": "$29.99",
      "url": "https://example.com/product/1",
      "run_id": "abc123",
      "actor_id": "6yYhdxJIPJwQkJwfG",
      "started_at": "2026-02-17T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1542,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/projects/:uuid/actors/:actorId/datastore"
              description="Retrieve all output data from all succeeded runs for a specific actor in a project."
              params={[
                { name: "uuid", type: "string", description: "Project UUID", required: true },
                { name: "actorId", type: "string", description: "Apify actor ID", required: true },
                { name: "limit", type: "integer", description: "Max items to return (default: 1000, max: 10000)" },
                { name: "offset", type: "integer", description: "Pagination offset (default: 0)" },
                { name: "startDate", type: "string", description: "Filter runs started after this date (ISO 8601)" },
                { name: "endDate", type: "string", description: "Filter runs started before this date (ISO 8601)" },
              ]}
              curl={`curl -H "Authorization: Bearer annalytick_abc123..." \\
  "https://annalytick.com/api/public/v1/projects/129e348e-.../actors/6yYhdxJIPJwQkJwfG/datastore?limit=50"`}
              response={`{
  "success": true,
  "data": [
    {
      "title": "Example Product",
      "price": "$29.99",
      "url": "https://example.com/product/1",
      "run_id": "run_456",
      "started_at": "2026-02-17T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 823,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}`}
            />

            <EndpointCard
              method="GET"
              path="/projects/:uuid/runs/:runId/dataset"
              description="Retrieve the output dataset for a specific actor run. Supports JSON and CSV formats."
              params={[
                { name: "uuid", type: "string", description: "Project UUID", required: true },
                { name: "runId", type: "string", description: "Apify run ID", required: true },
                { name: "limit", type: "integer", description: "Max items to return (default: 1000, max: 10000)" },
                { name: "offset", type: "integer", description: "Pagination offset (default: 0)" },
                { name: "format", type: "string", description: "Response format: json or csv (default: json)" },
              ]}
              curl={`curl -H "Authorization: Bearer annalytick_abc123..." \\
  "https://annalytick.com/api/public/v1/projects/129e348e-.../runs/6ni0UeLL52g2M4hWc/dataset?format=json&limit=100"`}
              response={`{
  "success": true,
  "data": [
    {
      "title": "Example Product",
      "price": "$29.99",
      "url": "https://example.com/product/1"
    }
  ],
  "run": {
    "id": "6ni0UeLL52g2M4hWc",
    "actorId": "6yYhdxJIPJwQkJwfG",
    "status": "SUCCEEDED",
    "startedAt": "2026-02-17T10:00:00Z",
    "finishedAt": "2026-02-17T10:05:32Z"
  },
  "pagination": {
    "total": 256,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}`}
            />
          </section>

          {/* Rate Limits */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
            <p className="text-muted-foreground leading-relaxed">
              There are currently no strict rate limits enforced on the API. However, we reserve the right to throttle or limit requests that negatively impact service performance. We recommend keeping requests to a reasonable frequency and using pagination to retrieve large datasets efficiently.
            </p>
          </section>

          {/* SDKs & Libraries */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about the API or need assistance with integration, reach out through our <a href="/landing#contact" className="text-primary hover:underline">contact form</a> or email <a href="mailto:support@annalytick.com" className="text-primary hover:underline">support@annalytick.com</a>.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
