"use client"

import { LegalPageLayout } from '../components/legal-page-layout'

export function CookiesPageContent() {
  return (
    <LegalPageLayout
      badge="Legal"
      title="Cookie Policy"
      lastUpdated="February 17, 2026"
    >
      <section>
        <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide information to the site owners. Annalytick uses cookies and similar technologies to ensure the proper functioning of our platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">2. Cookies We Use</h2>

        <h3 className="text-lg font-medium mb-2 mt-4">2.1 Essential Cookies</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          These cookies are necessary for the Service to function and cannot be disabled. They include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Session cookies:</strong> Maintain your authenticated session so you stay logged in as you navigate the dashboard</li>
          <li><strong>CSRF tokens:</strong> Protect against cross-site request forgery attacks</li>
          <li><strong>Theme preference:</strong> Remember your selected theme (light/dark/system) across visits</li>
        </ul>

        <h3 className="text-lg font-medium mb-2 mt-4">2.2 Functional Cookies</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          These cookies enable enhanced functionality and personalization:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Sidebar preferences:</strong> Remember your dashboard sidebar configuration</li>
          <li><strong>Table settings:</strong> Remember column visibility and sort preferences in data tables</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">3. Cookies We Do Not Use</h2>
        <p className="text-muted-foreground leading-relaxed">
          Annalytick does <strong>not</strong> use third-party advertising cookies, tracking cookies, or social media cookies. We do not participate in ad networks or sell data to advertisers. Your browsing activity on our platform is not tracked for advertising purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Managing Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Most web browsers allow you to control cookies through their settings. You can typically find these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser. However, disabling essential cookies may prevent you from using certain features of the Service, such as staying logged in.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">5. Local Storage</h2>
        <p className="text-muted-foreground leading-relaxed">
          In addition to cookies, we use browser local storage to persist your theme preference and other UI settings. Local storage data remains on your device and is not transmitted to our servers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about our use of cookies, contact us at <a href="mailto:privacy@annalytick.com" className="text-primary hover:underline">privacy@annalytick.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
