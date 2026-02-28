"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Code2, Database, FileDown, Key, Layers } from 'lucide-react'
import Link from 'next/link'

const endpoints = [
  {
    icon: Database,
    title: 'Single Run Data',
    description: 'Fetch output data from a specific actor run by its run ID.',
    method: 'GET',
    path: '/api/v1/runs/{runId}/data',
    code: `curl -X GET \\
  "https://app.annalytick.com/api/v1/runs/6ni0UeLL52g2/data" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    response: `{
  "success": true,
  "data": {
    "run_id": "6ni0UeLL52g2",
    "items_count": 20,
    "items": [
      {
        "url": "https://example.com/job/123",
        "title": "Regional Executive Support Manager",
        "company": "IRC",
        "location": "Kenya",
        "scraped_at": "2026-02-09T13:14:51Z"
      }
    ]
  }
}`,
  },
  {
    icon: Layers,
    title: 'Combined Datastore',
    description: 'Access the unified dataset from all runs of an actor — merged automatically.',
    method: 'GET',
    path: '/api/v1/actors/{actorId}/datastore',
    code: `curl -X GET \\
  "https://app.annalytick.com/api/v1/actors/relief-web-jobs-scraper/datastore" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"format": "json", "limit": 100}'`,
    response: `{
  "success": true,
  "data": {
    "actor": "relief-web-jobs-scraper",
    "total_runs": 12,
    "total_items": 2450,
    "columns": 12,
    "items": [
      {
        "url": "https://example.com/job/456",
        "title": "Health & Psychosocial Advisor",
        "company": "CBM",
        "location": "Ethiopia",
        "scraped_at": "2026-02-09T13:14:51Z"
      }
    ]
  }
}`,
  },
]

const exportFormats = [
  { label: 'JSON', description: 'Structured data for APIs and applications' },
  { label: 'CSV', description: 'Spreadsheet-compatible flat files' },
  { label: 'Excel', description: 'Native .xlsx with formatted columns' },
]

export function ApiAccessSection() {
  return (
    <section id="api-access" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Code2 className="size-3 mr-2" />
            Developer API
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Access your data anywhere, anytime
          </h2>
          <p className="text-lg text-muted-foreground">
            Use your API key to fetch single run output or the combined datastore for any actor.
            Export to JSON, CSV, or Excel — programmatically or from the dashboard.
          </p>
        </div>

        {/* API Key Highlight */}
        <div className="mb-12">
          <Card className="border-dashed">
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
              <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 shrink-0">
                <Key className="size-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-medium">Authenticate with your API key</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate an API key from your account settings. Include it as a Bearer token in the
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Authorization</code>
                  header of every request.
                </p>
              </div>
              <div className="shrink-0">
                <code className="px-3 py-2 rounded-md bg-muted text-sm font-mono text-muted-foreground">
                  Bearer ak_live_••••••••
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="single-run" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single-run" className="cursor-pointer">
                <Database className="size-4 mr-2" />
                Single Run Data
              </TabsTrigger>
              <TabsTrigger value="combined" className="cursor-pointer">
                <Layers className="size-4 mr-2" />
                Combined Datastore
              </TabsTrigger>
            </TabsList>

            {endpoints.map((endpoint, index) => (
              <TabsContent
                key={index}
                value={index === 0 ? 'single-run' : 'combined'}
              >
                <Card>
                  <CardContent className="p-0">
                    {/* Endpoint Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-6 border-b">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-muted-foreground">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground sm:ml-auto">
                        {endpoint.description}
                      </p>
                    </div>

                    {/* Code Blocks */}
                    <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                      {/* Request */}
                      <div className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                          Request
                        </p>
                        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm font-mono text-foreground whitespace-pre">
                            {endpoint.code}
                          </code>
                        </pre>
                      </div>

                      {/* Response */}
                      <div className="p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                          Response
                        </p>
                        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm font-mono text-foreground whitespace-pre">
                            {endpoint.response}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Export Formats */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Export in any format</h3>
            <p className="text-sm text-muted-foreground">
              Download data directly from the dashboard or request it via API in your preferred format.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {exportFormats.map((format) => (
              <Card key={format.label} className="text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 mx-auto mb-3">
                    <FileDown className="size-5 text-primary" />
                  </div>
                  <p className="font-medium">{format.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="cursor-pointer" asChild>
                <Link href="/auth/sign-up">
                  Get Your API Key
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <Link href="/landing/api-docs">
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
