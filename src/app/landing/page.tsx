import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

// Metadata for the landing page
export const metadata: Metadata = {
  title: 'Annalytick - Manage Web Scraping Projects at Scale',
  description: 'Organize Apify actors into projects, schedule or run them manually, and combine data from every run into one unified dataset. Export to Excel, CSV, JSON, or access via API.',
  keywords: ['web scraping', 'apify', 'data collection', 'actor management', 'run scheduling', 'unified dataset', 'data export', 'api access'],
  openGraph: {
    title: 'Annalytick - Manage Web Scraping Projects at Scale',
    description: 'Organize Apify actors into projects, schedule or run them manually, and combine data from every run into one unified dataset. Export to Excel, CSV, JSON, or access via API.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annalytick - Manage Web Scraping Projects at Scale',
    description: 'Organize Apify actors into projects, schedule or run them manually, and combine data from every run into one unified dataset. Export to Excel, CSV, JSON, or access via API.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
