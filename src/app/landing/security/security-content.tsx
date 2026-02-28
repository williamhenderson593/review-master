"use client"

import { LegalPageLayout } from '../components/legal-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, Key, Eye, Server, AlertTriangle } from 'lucide-react'

export function SecurityPageContent() {
  return (
    <LegalPageLayout
      badge="Security"
      title="Security at Annalytick"
      lastUpdated="February 17, 2026"
    >
      <section>
        <p className="text-muted-foreground leading-relaxed text-lg">
          Security is foundational to everything we build at Annalytick. We understand that you trust us with your data and credentials, and we take that responsibility seriously. This page outlines the measures we implement to keep your data safe.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Encryption in Transit</h3>
                <p className="text-sm text-muted-foreground">All data transmitted between your browser and our servers is encrypted using TLS 1.2+ (HTTPS).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Encryption at Rest</h3>
                <p className="text-sm text-muted-foreground">All stored data, including scraped datasets and backups, is encrypted at rest using AES-256 encryption.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">API Key Security</h3>
                <p className="text-sm text-muted-foreground">API keys are encrypted before storage. Only a prefix is stored in plaintext for lookup. Keys support configurable expiration.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Authentication</h3>
                <p className="text-sm text-muted-foreground">We use secure session-based authentication with support for OAuth providers (Google, GitHub) and email verification.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Access Controls</h3>
                <p className="text-sm text-muted-foreground">Role-based access control ensures team members only see data they are authorized to access within their organization.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Incident Response</h3>
                <p className="text-sm text-muted-foreground">We maintain an incident response plan and will notify affected users within 72 hours of discovering a data breach.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Infrastructure Security</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Application hosted on secure, SOC 2 compliant cloud infrastructure</li>
          <li>Database connections are encrypted and restricted to application servers only</li>
          <li>Regular automated backups with point-in-time recovery capability</li>
          <li>Network-level firewalls and intrusion detection systems</li>
          <li>Automated vulnerability scanning and dependency auditing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Application Security</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Input validation and sanitization on all user inputs</li>
          <li>Protection against common web vulnerabilities (XSS, CSRF, SQL injection)</li>
          <li>Secure HTTP headers and Content Security Policy</li>
          <li>Rate limiting on authentication and API endpoints</li>
          <li>Passwords hashed using industry-standard algorithms (bcrypt)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Data Handling</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Scraped data is isolated per organization — no cross-tenant data access</li>
          <li>API keys are shown only once at creation time and cannot be retrieved afterward</li>
          <li>Revoked and expired API keys are immediately rejected</li>
          <li>Data deletion requests are processed within 30 days</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Responsible Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you discover a security vulnerability in Annalytick, we encourage you to report it responsibly. Please email <a href="mailto:security@annalytick.com" className="text-primary hover:underline">security@annalytick.com</a> with details of the vulnerability. We will acknowledge your report within 48 hours and work to resolve the issue promptly. We ask that you do not publicly disclose the vulnerability until we have had a chance to address it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For security-related questions or concerns, contact our security team at <a href="mailto:security@annalytick.com" className="text-primary hover:underline">security@annalytick.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
