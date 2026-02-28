"use client"

import { LegalPageLayout } from '../components/legal-page-layout'

export function PrivacyPageContent() {
  return (
    <LegalPageLayout
      badge="Legal"
      title="Privacy Policy"
      lastUpdated="February 17, 2026"
    >
      <section>
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Annalytick (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web scraping project management platform, including our website, dashboard, and API services (collectively, the &quot;Service&quot;).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <h3 className="text-lg font-medium mb-2 mt-4">2.1 Account Information</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          When you create an account, we collect your name, email address, and password. If you sign up using a third-party provider (Google, GitHub), we receive your profile information from that provider.
        </p>
        <h3 className="text-lg font-medium mb-2">2.2 Usage Data</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          We automatically collect information about how you interact with the Service, including pages visited, features used, actor runs initiated, API calls made, and timestamps of activity.
        </p>
        <h3 className="text-lg font-medium mb-2">2.3 Scraped Data</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Data collected by your Apify actors is stored in our databases as part of the Service. We do not access, analyze, or share your scraped data except as necessary to provide the Service or as required by law.
        </p>
        <h3 className="text-lg font-medium mb-2">2.4 Payment Information</h3>
        <p className="text-muted-foreground leading-relaxed">
          Payment processing is handled by our third-party payment provider (Polar). We do not store your full credit card number or payment credentials on our servers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>To provide, maintain, and improve the Service</li>
          <li>To authenticate your identity and manage your account</li>
          <li>To process transactions and send related information</li>
          <li>To send you technical notices, updates, and support messages</li>
          <li>To respond to your comments, questions, and customer service requests</li>
          <li>To monitor and analyze usage trends to improve user experience</li>
          <li>To detect, prevent, and address technical issues and security threats</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          We do not sell your personal information. We may share your information in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Service Providers:</strong> With third-party vendors who assist in operating the Service (hosting, email, analytics, payment processing)</li>
          <li><strong>Team Members:</strong> With other members of your organization who have been granted access to your workspace</li>
          <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your account information for as long as your account is active. Scraped data is retained according to your plan&apos;s storage limits and your configured retention policies. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or compliance purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures to protect your data, including encryption in transit (TLS), encryption at rest, secure API key management, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Depending on your jurisdiction, you may have the following rights:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
          <li><strong>Objection:</strong> Object to processing of your personal data</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-3">
          To exercise any of these rights, please contact us at <a href="mailto:privacy@annalytick.com" className="text-primary hover:underline">privacy@annalytick.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. For more details, see our <a href="/landing/cookies" className="text-primary hover:underline">Cookie Policy</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@annalytick.com" className="text-primary hover:underline">privacy@annalytick.com</a> or through our <a href="/landing#contact" className="text-primary hover:underline">contact form</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
