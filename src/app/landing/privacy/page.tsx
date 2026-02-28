import type { Metadata } from 'next'
import { PrivacyPageContent } from './privacy-content'

export const metadata: Metadata = {
  title: 'Privacy Policy - Annalytick',
  description: 'Learn how Annalytick collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return <PrivacyPageContent />
}
