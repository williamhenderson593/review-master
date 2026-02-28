"use client"

import { LegalPageLayout } from '../components/legal-page-layout'

export function DpaPageContent() {
  return (
    <LegalPageLayout
      badge="Legal"
      title="Data Processing Agreement"
      lastUpdated="February 17, 2026"
    >
      <section>
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Data Processing Agreement (&quot;DPA&quot;) forms part of the agreement between you (&quot;Data Controller&quot; or &quot;Customer&quot;) and Annalytick (&quot;Data Processor&quot; or &quot;we&quot;) for the provision of the Annalytick platform services. This DPA applies to the extent that Annalytick processes personal data on behalf of the Customer in the course of providing the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable natural person, as defined by applicable data protection laws</li>
          <li><strong>Processing:</strong> Any operation performed on personal data, including collection, storage, retrieval, use, disclosure, and deletion</li>
          <li><strong>Sub-processor:</strong> Any third party engaged by Annalytick to process personal data on behalf of the Customer</li>
          <li><strong>Data Subject:</strong> An identified or identifiable natural person whose personal data is processed</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">3. Scope of Processing</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Annalytick processes personal data solely for the purpose of providing the Service as described in our Terms of Service. The types of personal data processed may include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Customer account information (name, email, organization details)</li>
          <li>Data collected by Customer&apos;s web scraping actors, which may contain personal data depending on the Customer&apos;s use case</li>
          <li>Usage logs and metadata related to the Service</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">4. Obligations of the Data Processor</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Annalytick shall:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Process personal data only on documented instructions from the Customer</li>
          <li>Ensure that persons authorized to process personal data are bound by confidentiality obligations</li>
          <li>Implement appropriate technical and organizational security measures</li>
          <li>Assist the Customer in responding to data subject requests (access, rectification, erasure, portability)</li>
          <li>Notify the Customer without undue delay (within 72 hours) upon becoming aware of a personal data breach</li>
          <li>Delete or return all personal data upon termination of the Service, at the Customer&apos;s choice</li>
          <li>Make available all information necessary to demonstrate compliance with this DPA</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">5. Sub-processors</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Annalytick uses the following categories of sub-processors:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Cloud Infrastructure:</strong> For hosting and data storage</li>
          <li><strong>Email Services:</strong> For transactional email delivery (Mailgun)</li>
          <li><strong>Payment Processing:</strong> For subscription billing (Polar)</li>
          <li><strong>Apify:</strong> For executing web scraping actors as directed by the Customer</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-3">
          We will notify the Customer before adding or replacing any sub-processor, giving the Customer the opportunity to object. All sub-processors are bound by data processing agreements with equivalent protections.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. Data Transfers</h2>
        <p className="text-muted-foreground leading-relaxed">
          If personal data is transferred outside the European Economic Area (EEA), Annalytick ensures that appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, or other legally recognized transfer mechanisms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">7. Security Measures</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Annalytick implements the following technical and organizational measures:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
          <li>Access controls and role-based permissions</li>
          <li>Regular security assessments and vulnerability scanning</li>
          <li>Secure API key management with encryption and expiration support</li>
          <li>Automated backups with point-in-time recovery</li>
          <li>Incident response procedures and breach notification processes</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-3">
          For more details, see our <a href="/landing/security" className="text-primary hover:underline">Security page</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">8. Audits</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Customer may request an audit of Annalytick&apos;s data processing practices, subject to reasonable notice and scope. Annalytick will cooperate with such audits and provide necessary documentation. Audits shall be conducted during normal business hours and shall not unreasonably disrupt Annalytick&apos;s operations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">9. Duration and Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          This DPA remains in effect for the duration of the Service agreement. Upon termination, Annalytick will delete all personal data within 30 days unless retention is required by applicable law. The Customer may request a copy of their data in a machine-readable format before deletion.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions about this DPA or to request a signed copy, contact us at <a href="mailto:dpa@annalytick.com" className="text-primary hover:underline">dpa@annalytick.com</a> or through our <a href="/landing#contact" className="text-primary hover:underline">contact form</a>.
        </p>
      </section>
    </LegalPageLayout>
  )
}
