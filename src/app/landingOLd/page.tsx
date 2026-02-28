import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

// Metadata for the landing page
export const metadata: Metadata = {
  title: 'Telaven - Modern SaaS Business Platform',
  description: 'Streamline your business operations with Telaven. Manage teams, API integrations, billing, and more — all from one powerful dashboard.',
  keywords: ['saas platform', 'business management', 'team management', 'api keys', 'dashboard', 'telaven'],
  openGraph: {
    title: 'Telaven - Modern SaaS Business Platform',
    description: 'Streamline your business operations with Telaven. Manage teams, API integrations, billing, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telaven - Modern SaaS Business Platform',
    description: 'Streamline your business operations with Telaven. Manage teams, API integrations, billing, and more.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
