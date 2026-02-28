import type { Metadata } from 'next'
import { TermsPageContent } from './terms-content'

export const metadata: Metadata = {
  title: 'Terms of Service - Annalytick',
  description: 'Read the terms and conditions governing your use of the Annalytick platform.',
}

export default function TermsPage() {
  return <TermsPageContent />
}
