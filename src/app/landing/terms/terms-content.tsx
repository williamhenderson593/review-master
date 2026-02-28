"use client"

import { LegalPageLayout } from '../components/legal-page-layout'

export function TermsPageContent() {
  return (
    <LegalPageLayout
      badge="Legal"
      title="Terms of Service"
      lastUpdated="February 17, 2026"
    >
      <section>
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using Annalytick (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users, including visitors, registered users, and API consumers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
        <p className="text-muted-foreground leading-relaxed">
          Annalytick is a web scraping project management platform that enables users to organize Apify actors into projects, schedule and manage runs, combine data from multiple runs into unified datasets, and access data via export or API. The Service includes the web dashboard, REST API, and all related tools and documentation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          To use certain features of the Service, you must create an account. You agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Provide accurate and complete registration information</li>
          <li>Maintain the security of your account credentials and API keys</li>
          <li>Promptly notify us of any unauthorized use of your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Violate any applicable laws, regulations, or third-party rights</li>
          <li>Scrape websites in violation of their terms of service or robots.txt directives</li>
          <li>Collect personal data without proper legal basis or consent</li>
          <li>Distribute malware, spam, or other harmful content</li>
          <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">5. API Usage</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Access to the Annalytick API is governed by these terms and the following conditions:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>API keys are confidential and must not be shared publicly or embedded in client-side code</li>
          <li>You are responsible for all API calls made using your keys</li>
          <li>We reserve the right to rate-limit or suspend API access for abusive usage patterns</li>
          <li>API keys have configurable expiration dates; expired keys will be rejected</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. Data Ownership</h2>
        <p className="text-muted-foreground leading-relaxed">
          You retain ownership of all data you collect through the Service. Annalytick does not claim any intellectual property rights over your scraped data. We store and process your data solely to provide the Service. You are responsible for ensuring that your data collection activities comply with applicable laws and the terms of the websites you scrape.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">7. Subscription and Billing</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Certain features of the Service require a paid subscription. By subscribing, you agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Pay all fees associated with your chosen plan</li>
          <li>Provide valid payment information</li>
          <li>Accept that subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>Understand that refunds are handled on a case-by-case basis</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">8. Service Availability</h2>
        <p className="text-muted-foreground leading-relaxed">
          We strive to maintain high availability of the Service but do not guarantee uninterrupted access. We may perform scheduled maintenance, and the Service may be temporarily unavailable due to factors beyond our control. We will make reasonable efforts to notify users of planned downtime.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          To the maximum extent permitted by law, Annalytick shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may suspend or terminate your access to the Service at any time for violation of these terms, with or without notice. Upon termination, your right to use the Service ceases immediately. You may export your data before termination. We will retain your data for 30 days after account closure, after which it will be permanently deleted.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to modify these Terms of Service at any time. Material changes will be communicated via email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the revised terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or the Service shall be resolved through binding arbitration or in the courts of the applicable jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">13. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions about these Terms of Service, contact us at <a href="mailto:legal@annalytick.com" className="text-primary hover:underline">legal@annalytick.com</a> or through our <a href="/landing#contact" className="text-primary hover:underline">contact form</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
